const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('RevShare Behavior', function () {
    let token, staking;
    let owner, alice, bob;
    const DURATION = 100;
    const RATE = ethers.parseUnits("10", 18);
    const REV_BP = 500n;               // 5%

    beforeEach(async function () {
        [owner, alice, bob] = await ethers.getSigners();

        // Deploy CGFY
        const TokenFactory = await ethers.getContractFactory("CognifyToken");
        token = await TokenFactory.deploy();
        await token.waitForDeployment();
        const tokenAddr = await token.getAddress();

        // Deploy StakingRewards
        const start = (await ethers.provider.getBlockNumber()) + 1;
        const end = start + DURATION;
        const StkFactory = await ethers.getContractFactory("StakingRewards");
        staking = await StkFactory.deploy(tokenAddr, tokenAddr, start, end, RATE);
        await staking.waitForDeployment();
        const stakingAddr = await staking.getAddress();       // ← grab the real address

        // Fund reward pool and top up Alice/Bob
        await token.transfer(stakingAddr, RATE * BigInt(DURATION));
        await token.transfer(alice.address, ethers.parseUnits("100", 18));
        await token.transfer(bob.address, ethers.parseUnits("100", 18));

        // Deploy Marketplace
        const MktFactory = await ethers.getContractFactory("LoraMarketplace");
        marketplace = await MktFactory.deploy(REV_BP, stakingAddr);
        await marketplace.waitForDeployment();

    })

    it("buys a model", async function () {
        const price = ethers.parseEther("1");
        const stakeAmount = ethers.parseUnits("1", 18);

        await token.connect(alice).approve(staking.getAddress(), stakeAmount);
        await staking.connect(alice).stake(stakeAmount);

        // — Alice uploads —
        await expect(
            marketplace.connect(alice).uploadModel("Test Model", "http://url", price)
        )
            .to.emit(marketplace, "ModelUploaded")
            .withArgs(1, "Test Model", alice.address, price);


        // verify initial on‐chain model state
        let mdl = await marketplace.getModel(1);
        expect(mdl.id).to.equal(1);
        expect(mdl.creator).to.equal(alice.address);
        expect(mdl.price).to.equal(price);
        expect(mdl.purchases).to.equal(0);

        // compute expected revShare & seller amount
        const revShare = price * REV_BP / 10_000n;
        const sellerAmount = price - revShare;

        // record Alice's ETH balance *before* the purchase
        const balBefore = await ethers.provider.getBalance(alice.address);

        // — Bob buys —
        await expect(
            marketplace.connect(bob).buyModel(1, { value: price })
        )
            .to.emit(marketplace, "ModelPurchased")
            .withArgs(1, bob.address, revShare);

        // verify model.purchases incremented
        mdl = await marketplace.getModel(1);
        expect(mdl.purchases).to.equal(1);

        // check that Alice (the creator) received the seller amount
        // since she started at ~0 ETH, her balance should jump by sellerAmount
        const balAfter = await ethers.provider.getBalance(alice.address);
        const delta = balAfter - balBefore;

        expect(delta).to.equal(sellerAmount);
    })

    it("updates pendingRevShare after a purchase", async function () {
        const price = ethers.parseEther("1");
        const stakeAmount = ethers.parseUnits("10", 18);

        // Alice stakes
        await token.connect(alice).approve(staking.getAddress(), stakeAmount);
        await staking.connect(alice).stake(stakeAmount);

        // Alice uploads & Bob buys
        await marketplace.connect(alice).uploadModel("M", "url", price);
        const revShare = price * REV_BP / 10_000n;
        await marketplace.connect(bob).buyModel(1, { value: price });

        // pendingRevShare should equal revShare
        const pending = await staking.pendingRevShare(alice.address);
        expect(pending).to.equal(revShare);
    });

    it("splits revShare among multiple stakers", async function () {
        const price = ethers.parseEther("1");
        // Alice stakes 10, Bob stakes 30 → total 40
        await token.connect(alice).approve(staking.getAddress(), ethers.parseUnits("10", 18));
        await staking.connect(alice).stake(ethers.parseUnits("10", 18));
        await token.connect(bob).approve(staking.getAddress(), ethers.parseUnits("30", 18));
        await staking.connect(bob).stake(ethers.parseUnits("30", 18));

        await marketplace.connect(alice).uploadModel("M", "url", price);
        const revShare = price * REV_BP / 10_000n;  // 0.05 ETH

        await marketplace.connect(bob).buyModel(1, { value: price });

        // Alice should get 10/40 * revShare = 0.0125 ETH
        // Bob   should get 30/40 * revShare = 0.0375 ETH
        const alicePending = await staking.pendingRevShare(alice.address);
        const bobPending = await staking.pendingRevShare(bob.address);
        expect(alicePending).to.equal(revShare * 10n / 40n);
        expect(bobPending).to.equal(revShare * 30n / 40n);
    });

    it("does not give past revShare to new stakers", async function () {
        const price = ethers.parseEther("1");

        // Alice stakes 20 before sale
        await token.connect(alice).approve(staking.getAddress(), ethers.parseUnits("20", 18));
        await staking.connect(alice).stake(ethers.parseUnits("20", 18));

        await marketplace.connect(alice).uploadModel("M", "url", price);
        const revShare = price * REV_BP / 10_000n;

        // Bob buys → Alice gets full revShare
        await marketplace.connect(bob).buyModel(1, { value: price });
        expect(await staking.pendingRevShare(alice.address)).to.equal(revShare);

        // Now Carol stakes 20
        const [_, __, ___, carol] = await ethers.getSigners();
        await token.transfer(carol.address, ethers.parseUnits("100", 18));
        await token.connect(carol).approve(staking.getAddress(), ethers.parseUnits("20", 18));
        await staking.connect(carol).stake(ethers.parseUnits("20", 18));

        // Bob buys again → revShare split 20/40=50% each
        await marketplace.connect(bob).buyModel(1, { value: price });
        const secondShare = revShare;
        expect(await staking.pendingRevShare(alice.address)).to.equal(revShare + secondShare / 2n);
        expect(await staking.pendingRevShare(carol.address)).to.equal(secondShare / 2n);
    });

    it("claimRewards emits both RewardPaid and RevSharePaid and zeroes out pendings", async function () {
        const price = ethers.parseEther("1");     // bigint
        const stakeAmount = ethers.parseUnits("5", 18); // bigint

        // 1) Stake so totalStaked > 0
        await token.connect(alice).approve(staking.getAddress(), stakeAmount);
        await staking.connect(alice).stake(stakeAmount);

        // 2) Mine a few blocks for the ERC-20 drip
        await ethers.provider.send("hardhat_mine", ["0x5"]);

        // 3) Upload + buy to generate both streams
        await marketplace.connect(alice).uploadModel("M", "url", price);
        await marketplace.connect(bob).buyModel(1, { value: price });

        // 4) Snapshot exactly what the contract thinks is pending right now
        const pendingToken = await staking.pendingReward(alice.address);
        const pendingEth = await staking.pendingRevShare(alice.address);

        // sanity‐check
        expect(pendingToken).to.be.gt(0n);
        expect(pendingEth).to.be.gt(0n);

        // 5) Compute what the RewardPaid event WILL emit:
        //    `claimRewards()` mines one extra block before its updatePool(),
        //    so it pays out (pendingToken + rewardPerBlock)
        const expectedRewardPaid = pendingToken + RATE;

        // 6) Fire claimRewards() and assert both events
        await expect(staking.connect(alice).claimRewards())
            .to.emit(staking, "RewardPaid")
            .withArgs(alice.address, expectedRewardPaid)
            .and.to.emit(staking, "RevSharePaid")
            .withArgs(alice.address, pendingEth);

        // 7) Finally, both pending getters must be zero
        expect(await staking.pendingReward(alice.address)).to.equal(0n);
        expect(await staking.pendingRevShare(alice.address)).to.equal(0n);
    });








})