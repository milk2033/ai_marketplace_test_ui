const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingRewards Behavior", function () {
    let token, staking;
    let owner, alice;
    const DURATION = 100;                     // short test window
    const RATE = ethers.parseUnits("10", 18); // 10 CGFY per block

    beforeEach(async function () {
        [owner, alice] = await ethers.getSigners();

        // Deploy CGFY token
        const TokenFactory = await ethers.getContractFactory("CognifyToken");
        token = await TokenFactory.deploy();
        await token.waitForDeployment();
        const tokenAddr = await token.getAddress();
        // const owner_amount = await token.balanceOf(owner.address);

        // Deploy StakingRewards
        const start = (await ethers.provider.getBlockNumber()) + 1;
        const end = start + DURATION;
        const StkFactory = await ethers.getContractFactory("StakingRewards");
        staking = await StkFactory.deploy(tokenAddr, tokenAddr, start, end, RATE);
        await staking.waitForDeployment();

        // Fund reward pool and top up Alice
        await token.transfer(staking.target, RATE * BigInt(DURATION));
        await token.transfer(alice.address, ethers.parseUnits("100", 18));
    });

    it("lets you stake and records your stake", async function () {
        await token.connect(alice).approve(staking.target, ethers.parseUnits("50", 18));
        await staking.connect(alice).stake(ethers.parseUnits("50", 18));

        const info = await staking.userInfo(alice.address);
        expect(info.amount).to.equal(ethers.parseUnits("50", 18));
        expect(await staking.pendingReward(alice.address)).to.equal(0);
    });


    it("accrues exactly RATE × blocks in pendingReward", async function () {
        // approve token    
        await token.connect(alice).approve(staking.target, ethers.parseUnits("10", 18));
        // get user info
        const user_amount = await staking.userInfo(alice.address);
        console.log('user_amount', user_amount)
        // stake token
        await staking.connect(alice).stake(ethers.parseUnits("10", 18));
        // get user info after stake
        const owed_before_mine = await staking.pendingReward(alice.address);
        console.log('owed_before_mine', owed_before_mine)

        // mine 5 blocks
        for (let i = 0; i < 5; i++) {
            await ethers.provider.send("evm_mine");

        }

        const owed_after_mine = await staking.pendingReward(alice.address);
        console.log('owed_after_mine', owed_after_mine)

        expect(await staking.pendingReward(alice.address))
            .to.equal(RATE * BigInt(5));
    });

    it("withdraw returns stake + accrued rewards", async function () {
        await token.connect(alice).approve(staking.target, ethers.parseUnits("100", 18));
        await staking.connect(alice).stake(ethers.parseUnits("100", 18));
        // mine 5 blocks + 1 block for withdrawal tx below → 60 CGFY
        for (let i = 0; i < 5; i++) {
            await ethers.provider.send("evm_mine");
        }


        // snapshot alice balance, then withdraw
        const before = await token.balanceOf(alice.address);
        await staking.connect(alice).withdraw(ethers.parseUnits("100", 18));
        const after = await token.balanceOf(alice.address);
        // she should gain exactly 3 CGFY net
        expect(after)
            .to.equal(ethers.parseUnits("160", 18));
    });

    it("allows owner to rescue leftover after endBlock", async function () {
        // 1) Before endBlock, rescueTokens should revert
        await expect(
            staking.connect(owner).rescueTokens(owner.address)
        ).to.be.revertedWith("Rewards not ended");

        // 2) Fast-forward DURATION+1 blocks
        await ethers.provider.send("hardhat_mine", [
            ethers.toQuantity(DURATION + 1),
        ]);

        // 3) Staking contract should hold exactly RATE × DURATION tokens
        const totalRewards = RATE * BigInt(DURATION);
        const stakingBalance = await token.balanceOf(staking.target);
        expect(stakingBalance).to.equal(totalRewards);

        // 4) Owner rescues them
        const ownerBefore = await token.balanceOf(owner.address);
        await staking.connect(owner).rescueTokens(owner.address);

        //    a) staking contract is drained
        expect(await token.balanceOf(staking.target)).to.equal(0);

        //    b) owner received exactly totalRewards
        const ownerAfter = await token.balanceOf(owner.address);
        expect(ownerAfter - ownerBefore).to.equal(totalRewards);
    });


});
