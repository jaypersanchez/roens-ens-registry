require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
    // Explicitly configure the Hardhat network with a known mnemonic to guarantee deterministic addresses
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      },
      gas: "auto", // or specify a number like 8000000 if you prefer
      gasPrice: "auto" // or a specific value in wei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    roen: {
      url: "http://127.0.0.1:8545", // Replace with your private Ethereum node URL
      accounts: [process.env.PRIVATE_KEY] // Load from .env file
    }
  }
};
