const { ethers } = require("ethers");

const mnemonic = "test test test test test test test test test test test junk";

const wallet0 = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");
console.log("Account 0:", wallet0.address);

const wallet1 = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/1");
console.log("Account 1:", wallet1.address);
