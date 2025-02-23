const { ethers } = require("ethers");

// Connect to your Geth node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Replace with your wallet address
const walletAddress = "0xd4F44D8Aa248fC442772F3F3C715CEdc321b5d61";

async function checkBalance() {
    try {
        const balance = await provider.getBalance(walletAddress);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

checkBalance();
