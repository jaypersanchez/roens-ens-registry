const hre = require("hardhat");

async function main() {
    // Get the Contract Factory
    const ENSRegistry = await hre.ethers.getContractFactory("ENSRegistry");

    console.log("Deploying ENSRegistry...");

    // Deploy the contract
    const ensRegistry = await ENSRegistry.deploy();
    await ensRegistry.waitForDeployment(); // Fix for the latest Hardhat versions

    // Get contract address
    const contractAddress = await ensRegistry.getAddress();

    console.log(`✅ ENSRegistry deployed at: ${contractAddress}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
