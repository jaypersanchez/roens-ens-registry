// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ReentrancyAttacker {
    IERC20 public token;
    address public owner;

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        token = IERC20(_tokenAddress); // Use IERC20 interface instead of casting
        owner = msg.sender;
    }

    function attack(uint256 amount) external {
        token.transfer(owner, amount);
        token.transfer(owner, amount); // Attempt reentrancy
    }
}
