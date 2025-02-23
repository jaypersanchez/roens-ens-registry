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

  it("should allow the owner to mint tokens", async function () {
    const mintAmount = parseUnits("1000"); // 1,000 tokens
    await token.mint(addr1.address, mintAmount);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance.toString()).to.equal(mintAmount);
  });

  it("should not allow non-owners to mint tokens", async function () {
    const mintAmount = parseUnits("1000");
    // Check that the transaction simply reverts without matching a specific string.
    await expect(token.connect(addr1).mint(addr1.address, mintAmount))
      .to.be.reverted;
  });

  it("should allow token holders to burn their tokens", async function () {
    const burnAmount = parseUnits("500");
    // Owner burns some tokens
    await token.burn(burnAmount);
    const ownerBalanceAfterBurn = await token.balanceOf(owner.address);
    const initialSupply = parseUnits("100000000");
    const expectedBalance = (BigInt(initialSupply) - BigInt(burnAmount)).toString();
    expect(ownerBalanceAfterBurn.toString()).to.equal(expectedBalance);
  });

  it("should allow transfers between accounts", async function () {
    const transferAmount = parseUnits("1000");
    await token.transfer(addr1.address, transferAmount);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance.toString()).to.equal(transferAmount);
  });
});
