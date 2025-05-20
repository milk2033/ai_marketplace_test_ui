require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 84532,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

// BASE_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/YOUR_KEY_HERE
