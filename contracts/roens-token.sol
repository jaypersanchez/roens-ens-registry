// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Roens Token
/// @notice A fundraising token with pause, blacklist, anti-bot, anti-whale, tax, vesting, lock, and disable functionality.
contract RoensToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    
    mapping(address => bool) private _blacklist;
    uint256 public maxTxAmount = 500_000 * 10 ** decimals(); // Max transaction limit
    mapping(address => bool) private _isExcludedFromLimits;
    bool private _disabled;
    
    uint256 public transactionTax = 3; // 3% transaction tax
    address public taxWallet;
    
    struct VestingSchedule {
        uint256 amount;
        uint256 releaseTime;
    }
    
    mapping(address => VestingSchedule) private _vesting;
    mapping(address => uint256) private _lockedBalances;
    
    /// @notice Constructor initializes the token with a name, symbol, and initial supply.
    constructor(address _taxWallet) ERC20("Roens", "ROENS") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
        taxWallet = _taxWallet;
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

    /// @notice Allows the owner to set the transaction tax percentage.
    function setTransactionTax(uint256 tax) external onlyOwner {
        require(tax <= 10, "Tax too high");
        transactionTax = tax;
    }

    /// @notice Allows the owner to set a vesting schedule for an address.
    function setVesting(address account, uint256 amount, uint256 releaseTime) external onlyOwner {
        require(releaseTime > block.timestamp, "Release time must be in the future");
        _vesting[account] = VestingSchedule(amount, releaseTime);
    }

    /// @notice Allows users to claim vested tokens after the release time.
    function claimVestedTokens() external {
        VestingSchedule storage schedule = _vesting[msg.sender];
        require(block.timestamp >= schedule.releaseTime, "Tokens are still vested");
        require(schedule.amount > 0, "No vested tokens to claim");
        
        uint256 amount = schedule.amount;
        schedule.amount = 0;
        _transfer(address(this), msg.sender, amount);
    }

    /// @notice Locks tokens for an address until a specified time.
    function lockTokens(address account, uint256 amount, uint256 unlockTime) external onlyOwner {
        require(unlockTime > block.timestamp, "Unlock time must be in the future");
        _lockedBalances[account] += amount;
    }

    /// @notice Checks if an address has locked tokens.
    function getLockedBalance(address account) public view returns (uint256) {
        return _lockedBalances[account];
    }

    /// @dev Overrides transfer functions to enforce tax, blacklist, vesting, and limits.
    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Pausable) {
        require(!_disabled, "Token contract is disabled");
        require(!_blacklist[from], "Sender is blacklisted");
        require(!_blacklist[to], "Recipient is blacklisted");
        require(amount <= maxTxAmount || _isExcludedFromLimits[from], "Transfer exceeds maxTxAmount");
        require(balanceOf(from) - _lockedBalances[from] >= amount, "Amount exceeds unlocked balance");
        
        uint256 taxAmount = (amount * transactionTax) / 100;
        uint256 transferAmount = amount - taxAmount;
        
        super._update(from, taxWallet, taxAmount);
        super._update(from, to, transferAmount);
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
