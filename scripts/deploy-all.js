require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers"); // ✅ Ensure this is included
require("dotenv").config();
require("hardhat-deploy");


async function main() {
  const fs = require("fs")
  const path = require("path")

  
  // Deploy ENSRegistry
  const ENSRegistry = await hre.ethers.getContractFactory("ENSRegistry");
  console.log("Deploying ENSRegistry...");
  const ensRegistry = await ENSRegistry.deploy();
  await ensRegistry.waitForDeployment();
  const ensRegistryAddress = await ensRegistry.getAddress();

  // Deploy RoensToken
  const RoensToken = await hre.ethers.getContractFactory("RoensToken");
  console.log("Deploying RoensToken...");
  const roensToken = await RoensToken.deploy();
  await roensToken.waitForDeployment();
  const roensTokenAddress = await roensToken.getAddress();

  console.log(`✅ ENSRegistry deployed at: ${ensRegistryAddress}`);
  console.log(`✅ RoensToken deployed at: ${roensTokenAddress}`);

  // Save the addresses to a JSON file in the root directory.
  const addresses = {
    ENSRegistry: ensRegistryAddress,
    RoensToken: roensTokenAddress
  };

  const outputPath = path.join(__dirname, "..", "addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`Addresses saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
