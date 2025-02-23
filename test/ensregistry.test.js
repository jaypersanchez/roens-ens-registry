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
    // Get the available signers.
    [owner, addr1, addr2] = await ethers.getSigners();
    // Get the contract factory and deploy the ENSRegistry contract.
    const ENSRegistryFactory = await ethers.getContractFactory("ENSRegistry");
    ensRegistry = await ENSRegistryFactory.deploy();
    // Wait for the deployment to complete (ethers v6 method).
    await ensRegistry.waitForDeployment();
  });

  it("should allow anyone to register a new node", async function () {
    const node = toBytes32("example");

    // Initially, the node's owner should be the zero address.
    expect(await ensRegistry.getOwner(node)).to.equal(ZERO_ADDRESS);

    // Set the owner and expect the event to be emitted with the correct arguments.
    await expect(ensRegistry.connect(owner).setOwner(node, owner.address))
      .to.emit(ensRegistry, "NameRegistered")
      .withArgs(node, owner.address);

    // Verify that the owner is correctly set.
    expect(await ensRegistry.getOwner(node)).to.equal(owner.address);
  });

  it("should allow the current owner to update the node", async function () {
    const node = toBytes32("example");

    // Register the node.
    await ensRegistry.connect(owner).setOwner(node, owner.address);
    // Update the node's owner to addr1.
    await ensRegistry.connect(owner).setOwner(node, addr1.address);
    // Confirm that the update is reflected.
    expect(await ensRegistry.getOwner(node)).to.equal(addr1.address);
  });

  it("should prevent non-owners from updating a node", async function () {
    const node = toBytes32("another");

    // Register the node with the owner account.
    await ensRegistry.connect(owner).setOwner(node, owner.address);
    // Attempting to update the node from addr2 (not the owner) should revert.
    await expect(
      ensRegistry.connect(addr2).setOwner(node, addr2.address)
    ).to.be.revertedWith("Unauthorized");
  });
});
