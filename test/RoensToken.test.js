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
    await expect(token.connect(addr1).mint(addr1.address, mintAmount))
      .to.be.reverted;
  });

  it("should allow token holders to burn their tokens", async function () {
    const burnAmount = parseUnits("500");
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

  it("should display the owner, transfer 100 tokens to account 19, and verify balances", async function () {
    // Validate and display the owner of the contract.
    const contractOwner = await token.owner();
    console.log("Owner of the contract:", contractOwner);
    expect(contractOwner).to.equal(owner.address);

    // Retrieve all available signers.
    const allSigners = await ethers.getSigners();
    expect(allSigners.length).to.be.at.least(19);
    const account19 = allSigners[18]; // account 19 (0-indexed)
    console.log("Account 19 address:", account19.address);

    // Get the owner's balance before the transfer.
    const ownerInitialBalance = await token.balanceOf(owner.address);
    console.log("Owner initial balance:", ownerInitialBalance.toString());

    // Transfer 100 tokens from the owner to account 19.
    const transferAmount = parseUnits("100");
    const tx = await token.transfer(account19.address, transferAmount);
    await tx.wait();

    // Get the owner's and account 19's balance after the transfer.
    const ownerFinalBalance = await token.balanceOf(owner.address);
    const account19Balance = await token.balanceOf(account19.address);
    console.log("Owner final balance:", ownerFinalBalance.toString());
    console.log("Account 19 token balance:", account19Balance.toString());

    // Verify that the owner's balance decreased by 100 tokens.
    expect(ownerFinalBalance.toString()).to.equal(
      (BigInt(ownerInitialBalance.toString()) - BigInt(transferAmount)).toString()
    );
    // Verify that account 19 received exactly 100 tokens.
    expect(account19Balance.toString()).to.equal(transferAmount);
  });
});
