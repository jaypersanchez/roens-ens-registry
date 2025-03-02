const { expect } = require("chai");
const { ethers } = require("hardhat");

// Custom helper to convert a whole number string into an 18-decimal value as a string.
function parseUnits(amountStr, decimals = 18) {
  const amount = BigInt(amountStr);
  const multiplier = BigInt(10) ** BigInt(decimals);
  return (amount * multiplier).toString();
}

describe("RoensToken", function () {
  let token, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const RoensToken = await ethers.getContractFactory("RoensToken");
    token = await RoensToken.deploy();
    await token.waitForDeployment();
  });

  it("should assign the initial supply of 100 million tokens to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    const initialSupply = parseUnits("100000000"); // 100 million tokens
    expect(ownerBalance.toString()).to.equal(initialSupply);
  });

  it("should not allow a wallet to hold more than maxWalletHolding", async function () {
    const maxWalletHolding = await token.maxWalletHolding();
    const excessiveAmount = (BigInt(maxWalletHolding) + BigInt(parseUnits("1"))).toString();
    
    await expect(token.transfer(addr1.address, excessiveAmount)).to.be.revertedWith("Exceeds max wallet holding");
  });

  it("should allow transfers within maxWalletHolding", async function () {
    const allowedAmount = (await token.maxWalletHolding()).toString();
    await token.transfer(addr1.address, allowedAmount);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance.toString()).to.equal(allowedAmount);
  });
});
