const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper function to convert numbers to token decimals.
function parseUnits(amountStr, decimals = 18) {
  return ethers.parseUnits(amountStr, decimals);
}

describe("RoensToken - Security Tests", function () {
  let token, owner, addr1, addr2, taxWallet;

  beforeEach(async function () {
    [owner, addr1, addr2, taxWallet] = await ethers.getSigners();
    const RoensToken = await ethers.getContractFactory("RoensToken");
    token = await RoensToken.deploy(taxWallet.address);
    await token.waitForDeployment();
  });

  it("should prevent reentrancy attacks", async function () {
    const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
    
    // Ensure token is deployed before passing its address
    await token.waitForDeployment();
    
    // Deploy attacker contract with the correct token address
    const attacker = await ReentrancyAttacker.deploy(await token.getAddress());
    await attacker.waitForDeployment();
    
    // Fund attacker with tokens
    await token.transfer(await attacker.getAddress(), parseUnits("1000"));

    // Attempt the attack, expecting it to fail
    await expect(attacker.attack(parseUnits("100"))).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });


  it("should prevent blacklisted addresses from transferring tokens", async function () {
    await token.blacklistAddress(addr1.address, true);
    await expect(token.connect(addr1).transfer(addr2.address, parseUnits("100"))).to.be.revertedWith("Sender is blacklisted");
  });

  it("should deduct the correct tax amount from transactions", async function () {
    const transferAmount = parseUnits("1000");
    const taxRate = 3;
    const taxAmount = transferAmount * BigInt(taxRate) / BigInt(100);
    const expectedReceived = transferAmount - taxAmount;

    await token.transfer(addr1.address, transferAmount);
    const addr1Balance = await token.balanceOf(addr1.address);
    const taxWalletBalance = await token.balanceOf(taxWallet.address);

    expect(addr1Balance.toString()).to.equal(expectedReceived.toString());
    expect(taxWalletBalance.toString()).to.equal(taxAmount.toString());
  });

  it("should prevent transactions exceeding maxTxAmount", async function () {
    const exceededAmount = parseUnits("500001");
    await expect(token.transfer(addr1.address, exceededAmount)).to.be.revertedWith("Transfer exceeds maxTxAmount");
  });

  it("should prevent token transfers when paused", async function () {
    await token.pause();
    await expect(token.transfer(addr1.address, parseUnits("1000"))).to.be.revertedWith("Pausable: paused");
  });

  it("should prevent any token transfer after disabling the contract", async function () {
    await token.disableContract();
    await expect(token.transfer(addr1.address, parseUnits("100"))).to.be.revertedWith("Token contract is disabled");
  });

  it("should not allow transfers causing underflows", async function () {
    await expect(token.connect(addr1).transfer(addr2.address, parseUnits("1000000"))).to.be.reverted;
  });

  it("should measure gas cost of a simple transfer", async function () {
    const transferTx = await token.transfer(addr1.address, parseUnits("100"));
    const receipt = await transferTx.wait();
    console.log("Gas used:", receipt.gasUsed.toString());
  });
});
