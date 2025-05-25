// scripts/deploy.js

const fs = require("fs");
const path = require("path");

async function main() {
    console.log("deploying...")
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;

    const LoraMarketplace_contract = await ethers.getContractFactory("LoraMarketplace");
    const CognifyToken_contract = await ethers.getContractFactory("CognifyToken");
    const StakingRewards_contract = await ethers.getContractFactory("StakingRewards");

    console.log('deploying CognifyToken...  ')
    const cognifyToken = await CognifyToken_contract.deploy();
    await cognifyToken.waitForDeployment();

    console.log('deploying LoraMarketplace...  ')
    const LoraMarketplace = await LoraMarketplace_contract.deploy(500, cognifyToken.target);
    await LoraMarketplace.waitForDeployment();

    const currentBlock = await ethers.provider.getBlockNumber();
    const startBlock = currentBlock + 1;
    const secondsPerYear = 365 * 24 * 3600;
    const avgBlockTimeSec = 12;
    const blocksPerYear = Math.floor(secondsPerYear / avgBlockTimeSec);
    const durationBlocks = blocksPerYear * 5;
    const endBlock = startBlock + durationBlocks;
    const rewardPerBlock = ethers.parseUnits('22.5', 18)

    console.log('deploying StakingRewards...  ')
    const stakingRewards = await StakingRewards_contract.deploy(cognifyToken.target, cognifyToken.target, startBlock, endBlock, rewardPerBlock);
    await stakingRewards.waitForDeployment();

    console.log("LoraMarketplace deployed to:", LoraMarketplace.target);
    console.log("CognifyToken deployed to:", cognifyToken.target);
    console.log("StakingRewards deployed to:", stakingRewards.target);

    const totalSupply = await cognifyToken.totalSupply();
    const stakingAmount = totalSupply * 30n / 100n;

    console.log(
        `Transferring ${ethers.formatUnits(stakingAmount, 18)} CGFY (30%) → staking…`
    );
    const transfer_staking_rewards = await cognifyToken.transfer(stakingRewards.target, stakingAmount);
    console.log(`transferred staking rewards, tx hash ${transfer_staking_rewards.hash}`);


    const outDir = path.resolve(__dirname, "../../frontend/src/contracts");
    fs.mkdirSync(outDir, { recursive: true });

    const deployments = [
        { name: "LoraMarketplace", instance: LoraMarketplace },
        { name: "CognifyToken", instance: cognifyToken },
        { name: "StakingRewards", instance: stakingRewards }
    ];

    for (const { name, instance } of deployments) {
        // Load the compiled artifact to get its ABI
        const artifactPath = path.join(
            __dirname,
            "../artifacts/contracts",
            `${name}.sol`,
            `${name}.json`
        );
        const { abi } = require(artifactPath);

        // Combine address + abi
        const combo = {
            address: instance.target,
            abi: abi
        };

        // Write to ai_marketplace/frontend/src/contracts/<name>.json
        const filePath = path.join(outDir, `${name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(combo, null, 2));
        console.log(`✅ Wrote ${name} → ${filePath}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 
