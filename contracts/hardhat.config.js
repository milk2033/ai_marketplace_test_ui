require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
require("dotenv").config();

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});


module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      // Local development network
    },
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 84532,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

// BASE_RPC_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/YOUR_KEY_HERE
