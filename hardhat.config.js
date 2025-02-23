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
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
      // You can add further customizations here (e.g., chainId, gas settings, etc.)
    },
    roen: {
      url: "http://127.0.0.1:8545", // Replace with your private Ethereum node URL
      accounts: [process.env.PRIVATE_KEY] // Load from .env file
    }
  }
};
