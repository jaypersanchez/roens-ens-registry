const hre = require("hardhat");

async function main() {
    // Get the Contract Factory for RoensToken
    const RoensToken = await hre.ethers.getContractFactory("RoensToken");

    console.log("Deploying RoensToken...");

    // Deploy the contract
    const roensToken = await RoensToken.deploy();
    await roensToken.waitForDeployment(); // For the latest Hardhat versions

    // Get the contract address
    const contractAddress = await roensToken.getAddress();

    console.log(`✅ RoensToken deployed at: ${contractAddress}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
