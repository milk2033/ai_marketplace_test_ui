// scripts/export-abis.js
const fs = require("fs");
const path = require("path");

async function main() {
    // list your contracts here: [ sourceFilename, contractName, outputFilename ]
    const contracts = [
        ["LoraMarket.sol", "LoraMarketplace", "LoraMarketplace.json"],
        ["CognifyToken.sol", "CognifyToken", "CognifyToken.json"],
        ["StakingRewards.sol", "StakingRewards", "StakingRewards.json"],
    ];

    const abiDir = path.join(__dirname, "../abi");
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir);
    }

    for (const [src, name, out] of contracts) {
        const artifactPath = path.join(
            __dirname,
            "../artifacts/contracts",
            src,
            `${name}.json`
        );
        if (!fs.existsSync(artifactPath)) {
            console.error(`❌  Artifact not found: ${artifactPath}`);
            continue;
        }
        const { abi } = require(artifactPath);
        fs.writeFileSync(
            path.join(abiDir, out),
            JSON.stringify(abi, null, 2)
        );
        console.log(`✅  ABI for ${name} written to abi/${out}`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
