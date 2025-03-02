// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./roens-token.sol";

contract ReentrancyAttacker {
    RoensToken public token;
    address public owner;

    constructor(address _tokenAddress) {
        token = RoensToken(_tokenAddress);
        owner = msg.sender;
    }

    function attack() public {
        token.transfer(owner, 1);
        token.transfer(owner, 1); // Reentrant call to exploit possible flaws
    }
}
