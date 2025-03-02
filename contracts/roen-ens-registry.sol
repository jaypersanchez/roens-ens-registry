// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ENSRegistry {
    mapping(bytes32 => address) public records;

    event NameRegistered(bytes32 indexed node, address owner);

    function setOwner(bytes32 node, address owner) external {
        require(msg.sender == records[node] || records[node] == address(0), "Unauthorized");
        records[node] = owner;
        emit NameRegistered(node, owner);
    }

    function getOwner(bytes32 node) external view returns (address) {
        return records[node];
    }
}
