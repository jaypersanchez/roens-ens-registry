// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Context.sol";

/// @title Pausable
/// @notice Allows an authorized owner to pause and unpause contract functions.
abstract contract Pausable is Context {
    bool private _paused;
    address private _pauser;

    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    constructor() {
        _pauser = _msgSender();
    }

    function pause() external whenNotPaused {
        require(_msgSender() == _pauser, "Pausable: caller is not the pauser");
        _paused = true;
        emit Paused(_msgSender());
    }

    function unpause() external whenPaused {
        require(_msgSender() == _pauser, "Pausable: caller is not the pauser");
        _paused = false;
        emit Unpaused(_msgSender());
    }

    function isPaused() external view returns (bool) {
        return _paused;
    }
}
