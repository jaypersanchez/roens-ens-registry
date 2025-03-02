require("@nomicfoundation/hardhat-toolbox");
require ("@nomicfoundation/hardhat-ethers"); // ✅ Ensure this is included
require("dotenv").config();
require ("hardhat-deploy");


async function main() {
    const fs = require("fs")
    const path = require("path")
    const hre = require("hardhat")
    const { ethers } = hre;
    console.log("Deploying RoensToken")

    // Get the Contract Factory
    const RoensToken = await hre.ethers.getContractFactory("RoensToken");

    console.log("Deploying RoensToken...");

    // Deploy the contract
    const roensToken = await RoensToken.deploy();
    await roensToken.waitForDeployment(); // For Hardhat's latest version

    // Get the deployed contract address
    const contractAddress = await roensToken.getAddress();

    console.log(`✅ RoensToken deployed at: ${contractAddress}`);

    // Load existing addresses.json
    let addresses = {};
    const filePath = "addresses.json"; // Ensure this file exists in the project root

    if (fs.existsSync(filePath)) {
        addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Update the RoensToken address
    addresses["RoensToken"] = contractAddress;

    // Write back to addresses.json
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

    console.log(`📌 Updated addresses.json with RoensToken: ${contractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
