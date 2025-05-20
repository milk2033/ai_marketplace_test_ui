const fs = require("fs");
const path = require("path");

async function main() {
    const artifactPath = path.join(__dirname, "../artifacts/contracts/LoraMarket.sol/LoraMarketplace.json");
    const artifact = require(artifactPath);

    const abiDir = path.join(__dirname, "../abi");
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir);
    }

    fs.writeFileSync(path.join(abiDir, "LoraMarketplace.json"), JSON.stringify(artifact.abi, null, 2));
    console.log("✅ ABI exported to abi/LoraMarketplace.json");
}

main();
