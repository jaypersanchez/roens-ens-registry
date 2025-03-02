const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

// ✅ Correctly Import Ethers.js from Hardhat
const { ethers } = hre;

async function main() {
    // Get the path to addresses.json (one directory above scripts/)
    const filePath = path.join(__dirname, "..", "addresses.json");

    // Check if addresses.json exists
    if (!fs.existsSync(filePath)) {
        console.error("⚠️ Error: addresses.json not found.");
        process.exit(1);
    }

    // Read and parse addresses.json
    const addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Check if RoensToken is present in addresses.json
    if (!addresses.RoensToken) {
        console.error("⚠️ Error: RoensToken address not found in addresses.json.");
        process.exit(1);
    }

    // Use the RoensToken address from addresses.json
    const contractAddress = addresses.RoensToken;
    console.log(`🔹 Using RoensToken address: ${contractAddress}`);

    // Contract ABI (only owner function)
    const abi = ["function owner() view returns (address)"];

    // ✅ Fix: Correctly Initialize Ethers Provider
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

    // Load the contract
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Fetch and log owner address
    try {
        const owner = await contract.owner();
        console.log(`✅ Owner Address: ${owner}`);
    } catch (error) {
        console.error("❌ Error fetching owner address:", error);
    }
}

// Run the script
main().catch((error) => {
    console.error("❌ Script error:", error);
    process.exit(1);
});
