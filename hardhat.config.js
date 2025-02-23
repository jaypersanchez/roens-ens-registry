require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // You can add custom configuration options here if needed
    },
    roen: {
      url: "http://127.0.0.1:8545", // Replace with your private Ethereum node URL
      accounts: [process.env.PRIVATE_KEY] // Load from .env file
    }
  }
};
