const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
    // Get the Contract Factory
    const ENSRegistry = await hre.ethers.getContractFactory("ENSRegistry");

    console.log("Deploying ENSRegistry...");

    // Deploy the contract
    const ensRegistry = await ENSRegistry.deploy();
    await ensRegistry.waitForDeployment(); // Fix for latest Hardhat versions

    // Get contract address
    const contractAddress = await ensRegistry.getAddress();

    console.log(`✅ ENSRegistry deployed at: ${contractAddress}`);

    // Path for addresses.json
    const outputPath = path.join(__dirname, "..", "addresses.json");

    // Load existing addresses.json if it exists
    let addresses = {};
    if (fs.existsSync(outputPath)) {
        try {
            addresses = JSON.parse(fs.readFileSync(outputPath, "utf8"));
        } catch (error) {
            console.error("⚠️ Error reading addresses.json, resetting file.");
        }
    }

    // Update the ENSRegistry address
    addresses["ENSRegistry"] = contractAddress;

    // Write back to addresses.json
    fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
    console.log(`📌 Updated addresses.json with ENSRegistry: ${contractAddress}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
