// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Roens Token
/// @notice This token can be minted, burned, and transferred. It is designed for fundraising, including pre-seed and public sales.
contract RoensToken is ERC20, ERC20Burnable, Ownable {
    
    /// @notice Constructor initializes the token with a name and symbol and mints an initial supply of 100 million tokens.
    constructor() ERC20("Roens", "ROENS") Ownable(msg.sender) {
        // Mint 100 million tokens to the deployer (with 18 decimals)
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }
    
    /// @notice Mint new tokens to a specified address. Only the owner can call this.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to mint (including decimals).
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
