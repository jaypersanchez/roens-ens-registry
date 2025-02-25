// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Roens Token
/// @notice A fundraising token with pause, blacklist, anti-bot, anti-whale, and disable functionality.
contract RoensToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    
    mapping(address => bool) private _blacklist;
    uint256 public maxTxAmount = 500_000 * 10 ** decimals(); // Max transaction limit
    mapping(address => bool) private _isExcludedFromLimits;
    bool private _disabled;

    /// @notice Constructor initializes the token with a name, symbol, and initial supply.
    constructor() ERC20("Roens", "ROENS") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }

    /// @notice Allows the owner to pause all token transfers.
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Allows the owner to unpause token transfers.
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Adds or removes an address from the blacklist.
    function blacklistAddress(address account, bool value) external onlyOwner {
        _blacklist[account] = value;
    }

    /// @notice Checks if an address is blacklisted.
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    /// @notice Allows the owner to set the maximum transaction amount.
    function setMaxTxAmount(uint256 amount) external onlyOwner {
        maxTxAmount = amount;
    }

    /// @notice Allows the owner to exclude an address from transaction limits.
    function excludeFromLimits(address account, bool excluded) external onlyOwner {
        _isExcludedFromLimits[account] = excluded;
    }

    /// @dev Overrides transfer functions to block blacklisted addresses, enforce pause, and prevent large transfers.
    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Pausable) {
        require(!_disabled, "Token contract is disabled");
        require(!_blacklist[from], "Sender is blacklisted");
        require(!_blacklist[to], "Recipient is blacklisted");
        require(amount <= maxTxAmount || _isExcludedFromLimits[from], "Transfer exceeds maxTxAmount");

        super._update(from, to, amount);
    }

    /// @notice Disable the contract instead of self-destructing.
    function disableContract() external onlyOwner {
        _disabled = true;
    }

    /// @notice Withdraws any Ether stored in the contract.
    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /// @notice Allows the contract to receive Ether.
    receive() external payable {}
}
