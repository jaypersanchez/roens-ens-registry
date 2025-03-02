require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true, // enable the optimizer
        runs: 200      // adjust this value to optimize for deployment cost vs. runtime efficiency
      }
    }
  },
  networks: {
    // Hardhat local development network
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      },
      gas: "auto", // or specify a number like 8000000
      gasPrice: "auto", // or a specific value in wei
    },
    // Connecting to a local blockchain node
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    // Connecting to your forked Roens network
    roens: {
      url: "http://localhost:8545", // Ensure this matches the forked chain's actual URL
      chainId: 1337 // Change this to match your custom fork's Chain ID
    }
  }
};
