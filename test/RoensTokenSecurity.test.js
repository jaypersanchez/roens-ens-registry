const { expect } = require("chai");
const { ethers } = require("hardhat");

// Custom helper to convert a whole number string into an 18-decimal value as a string.
function parseUnits(amountStr, decimals = 18) {
  const amount = BigInt(amountStr);
  const multiplier = BigInt(10) ** BigInt(decimals);
  return (amount * multiplier).toString();
}

describe("RoensToken - Security Tests", function () {
  let token, owner, attacker, addr1, addr2, taxWallet;

  beforeEach(async function () {
    [owner, attacker, addr1, addr2, taxWallet] = await ethers.getSigners();
    const RoensToken = await ethers.getContractFactory("RoensToken");
    token = await RoensToken.deploy(taxWallet.address);
    await token.waitForDeployment();
  });

  it("should prevent reentrancy attacks", async function () {
    const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
    const attackerContract = await ReentrancyAttacker.deploy(token.address);
    await attackerContract.waitForDeployment();
    
    await expect(attackerContract.attack()).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });

  it("should prevent blacklisted addresses from transferring tokens", async function () {
    await token.blacklistAddress(attacker.address, true);
    expect(await token.isBlacklisted(attacker.address)).to.be.true;
    await expect(token.connect(attacker).transfer(addr1.address, parseUnits("100")))
      .to.be.revertedWith("Sender is blacklisted");
  });

  it("should prevent transactions exceeding max supply", async function () {
    const excessiveAmount = parseUnits("1000000000"); // Excessive amount
    await expect(token.transfer(addr1.address, excessiveAmount)).to.be.reverted;
  });

  it("should prevent token transfers when paused", async function () {
    await token.pause();
    await expect(token.transfer(addr1.address, parseUnits("100")))
      .to.be.revertedWith("Pausable: paused");
  });

  it("should prevent integer underflows", async function () {
    await expect(token.connect(attacker).transfer(owner.address, parseUnits("100")))
      .to.be.reverted; // Attacker has no balance, should fail
  });

  it("should prevent integer overflows", async function () {
    const largeAmount = parseUnits("1000000000000000"); // Excessively large amount
    await expect(token.transfer(addr1.address, largeAmount)).to.be.reverted;
  });

  it("should prevent contract self-destruct from unauthorized users", async function () {
    await expect(token.connect(attacker).disableContract()).to.be.reverted;
  });

  it("should not allow unauthorized minting", async function () {
    const mintAmount = parseUnits("1000");
    await expect(token.connect(attacker).mint(attacker.address, mintAmount)).to.be.reverted;
  });

  it("should measure gas cost of a simple transfer", async function () {
    const transferAmount = parseUnits("100");
    const tx = await token.transfer(addr1.address, transferAmount);
    const receipt = await tx.wait();
    console.log("Gas used:", receipt.gasUsed.toString());
  });
});
