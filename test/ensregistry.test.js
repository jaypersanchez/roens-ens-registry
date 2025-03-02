const { expect } = require("chai");
const { ethers } = require("hardhat");

// Define the zero address explicitly.
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Custom helper function to convert a string to a bytes32 hex string.
// This function uses the native TextEncoder to get UTF-8 bytes, then pads to 32 bytes.
function toBytes32(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  if (bytes.length > 31) {
    throw new Error("String too long");
  }
  const padded = new Uint8Array(32);
  padded.set(bytes);
  let hex = "0x";
  for (let i = 0; i < padded.length; i++) {
    hex += padded[i].toString(16).padStart(2, "0");
  }
  return hex;
}

describe("ENSRegistry", function () {
  let ensRegistry;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // Get available signers.
    [owner, addr1, addr2] = await ethers.getSigners();
    // Deploy the ENSRegistry contract.
    const ENSRegistryFactory = await ethers.getContractFactory("ENSRegistry");
    ensRegistry = await ENSRegistryFactory.deploy();
    await ensRegistry.waitForDeployment();
  });

  it("should allow anyone to register a new node", async function () {
    const node = toBytes32("example");

    // Initially, the node's owner should be the zero address.
    expect(await ensRegistry.getOwner(node)).to.equal(ZERO_ADDRESS);

    // Set the owner and expect the event to be emitted.
    await expect(ensRegistry.connect(owner).setOwner(node, owner.address))
      .to.emit(ensRegistry, "NameRegistered")
      .withArgs(node, owner.address);

    // Verify the owner is correctly set.
    expect(await ensRegistry.getOwner(node)).to.equal(owner.address);
  });

  it("should allow the current owner to update the node", async function () {
    const node = toBytes32("example");

    await ensRegistry.connect(owner).setOwner(node, owner.address);
    await ensRegistry.connect(owner).setOwner(node, addr1.address);
    expect(await ensRegistry.getOwner(node)).to.equal(addr1.address);
  });

  it("should prevent non-owners from updating a node", async function () {
    const node = toBytes32("another");

    await ensRegistry.connect(owner).setOwner(node, owner.address);
    await expect(
      ensRegistry.connect(addr2).setOwner(node, addr2.address)
    ).to.be.revertedWith("Unauthorized");
  });

  it("should match the deployed contract address with addresses.json", async function () {
    // Load the deployed addresses from the root-level addresses.json.
    const deployedAddresses = require("../addresses.json");
    const addressFromJSON = deployedAddresses.ENSRegistry;
    const testAddress = await ensRegistry.getAddress();

    console.log("ENSRegistry deployed address (test):", testAddress);
    console.log("ENSRegistry address from addresses.json:", addressFromJSON);

    expect(testAddress).to.equal(addressFromJSON);
  });

  // NEW TEST: Register a domain and then query for it.
  it("should register a domain and allow querying for that domain", async function () {
    const domain = "mydomain";
    const node = toBytes32(domain);

    // Verify that before registration the domain is unregistered.
    const initialOwner = await ensRegistry.getOwner(node);
    console.log(`Initial owner for domain "${domain}":`, initialOwner);
    expect(initialOwner).to.equal(ZERO_ADDRESS);

    // Register the domain by setting the owner.
    await ensRegistry.connect(owner).setOwner(node, owner.address);

    // Query the domain after registration.
    const queriedOwner = await ensRegistry.getOwner(node);
    console.log(`Owner for domain "${domain}" after registration:`, queriedOwner);

    // Verify that the queried owner now equals the deployer's address.
    expect(queriedOwner).to.equal(owner.address);
  });
});
