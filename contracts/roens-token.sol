// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Roens Token
/// @notice Implements anti-whale and anti-pump-and-dump measures.
contract RoensToken is ERC20, ERC20Burnable, Ownable {
    uint256 public maxTxAmount; // Maximum transaction limit
    uint256 public maxWalletHolding; // Maximum holding per wallet
    mapping(address => bool) public blacklisted; // Blacklisted addresses
    mapping(address => bool) public isExemptFromLimits; // Exemptions (Owner, CEX, etc.)
    
    event Blacklisted(address indexed account, bool status);

    constructor() ERC20("Roens", "ROENS") Ownable(msg.sender) {
        uint256 totalSupply = 100_000_000 * 10 ** decimals();
        _mint(msg.sender, totalSupply);
        
        maxTxAmount = totalSupply / 100; // 1% of total supply per transaction
        maxWalletHolding = totalSupply / 50; // 2% of total supply per wallet
        
        isExemptFromLimits[msg.sender] = true; // Exempt owner
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
    require(to != address(0), "Cannot mint to zero address");
    emit Transfer(address(0), to, amount);
        _mint(to, amount);
    }
    
    function blacklist(address account, bool status) external onlyOwner {
        blacklisted[account] = status;
        emit Blacklisted(account, status);
    }
    
    function setMaxTxAmount(uint256 amount) external onlyOwner {
        maxTxAmount = amount;
    }
    
    function setMaxWalletHolding(uint256 amount) external onlyOwner {
        maxWalletHolding = amount;
    }
    
    function setExemptFromLimits(address account, bool status) external onlyOwner {
    require(account != address(0), "Cannot set exemption for zero address");
        isExemptFromLimits[account] = status;
    }
    
    function _update(address from, address to, uint256 amount) internal override {
    if (from == address(0)) { // Allow minting to bypass limits
        super._update(from, to, amount);
        return;
    }
        require(!blacklisted[from] && !blacklisted[to], "Address is blacklisted");
        
        if (from != address(0) && !isExemptFromLimits[from] && !isExemptFromLimits[to]) {
            require(amount <= maxTxAmount, "Exceeds max transaction amount");
            require(balanceOf(to) + amount <= maxWalletHolding, "Exceeds max wallet holding");
        }
        super._update(from, to, amount);
    }
}
