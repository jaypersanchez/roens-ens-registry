const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper function to convert numbers to token decimals.
function parseUnits(amountStr, decimals = 18) {
  return ethers.parseUnits(amountStr, decimals);
}

describe("RoensToken", function () {
  let token, owner, addr1, addr2, taxWallet;

  beforeEach(async function () {
    [owner, addr1, addr2, taxWallet] = await ethers.getSigners();
    const RoensToken = await ethers.getContractFactory("RoensToken");
    token = await RoensToken.deploy(taxWallet.address);
    await token.waitForDeployment();
    await token.setMaxTxAmount(parseUnits("100000000")); // Allow large transfers for tests
  });

  it("should allow transfers up to the maxTxAmount", async function () {
    const maxTxAmount = parseUnits("500000"); // 500,000 tokens
    const taxAmount = maxTxAmount * BigInt(3) / BigInt(100); // 3% tax
    const expectedReceived = maxTxAmount - taxAmount;

    await token.transfer(addr1.address, maxTxAmount);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance.toString()).to.equal(expectedReceived.toString());
  });

  it("should fail when transfer exceeds maxTxAmount", async function () {
    const exceededAmount = parseUnits("500001"); // 500,001 tokens (just over the limit)
    await expect(token.transfer(addr1.address, exceededAmount)).to.be.revertedWith("Transfer exceeds maxTxAmount");
  });

  it("should prevent transfers of vested tokens before release time", async function () {
    const vestingAmount = parseUnits("5000");
    const futureTime = (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour from now

    await token.setVesting(addr1.address, vestingAmount, futureTime);
    await expect(token.connect(addr1).transfer(addr2.address, vestingAmount))
      .to.be.revertedWith("Tokens are still vested");
  });

  it("should allow claiming vested tokens after release time", async function () {
    const vestingAmount = parseUnits("5000");
    const futureTime = (await ethers.provider.getBlock("latest")).timestamp + 2; // 2 seconds from now

    await token.setVesting(addr1.address, vestingAmount, futureTime);
    await ethers.provider.send("evm_increaseTime", [3]); // Fast-forward time
    await ethers.provider.send("evm_mine"); // Mine next block

    await token.connect(addr1).claimVestedTokens();
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance.toString()).to.equal(vestingAmount.toString());
  });

  it("should prevent transfers of locked tokens", async function () {
    const lockAmount = parseUnits("2000");
    const unlockTime = (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 hour from now

    await token.lockTokens(addr1.address, lockAmount, unlockTime);
    await token.transfer(addr1.address, lockAmount);
    await expect(token.connect(addr1).transfer(addr2.address, lockAmount))
      .to.be.revertedWith("Amount exceeds unlocked balance");
  });

  it("should allow transfers after tokens are unlocked", async function () {
    const lockAmount = parseUnits("2000");
    const unlockTime = (await ethers.provider.getBlock("latest")).timestamp + 2; // 2 seconds from now

    await token.lockTokens(addr1.address, lockAmount, unlockTime);
    await token.transfer(addr1.address, lockAmount);
    await ethers.provider.send("evm_increaseTime", [3]); // Fast-forward time
    await ethers.provider.send("evm_mine"); // Mine next block

    await token.connect(addr1).transfer(addr2.address, lockAmount);
    const addr2Balance = await token.balanceOf(addr2.address);
    expect(addr2Balance.toString()).to.equal(lockAmount.toString());
  });
});
