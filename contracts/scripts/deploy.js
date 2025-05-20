// scripts/deploy.js
async function main() {
    const LoraMarketplace = await ethers.getContractFactory("LoraMarketplace");
    console.log('lora marketplace contract factory....')
    console.log(LoraMarketplace)

    const contract = await LoraMarketplace.deploy();
    console.log('deploying...  ')
    console.log(contract)

    console.log("LoraMarketplace deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
