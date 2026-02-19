// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockAdiToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("ADI Token (Mock)", "ADI")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1_000_000 * 1e18);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
