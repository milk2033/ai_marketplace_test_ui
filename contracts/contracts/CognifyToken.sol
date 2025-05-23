// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/** 

@title Cognify Token (CGFY)

@dev ERC20 with fixed total supply of 1 billion and 18 decimals
*/
contract CognifyToken is ERC20, Ownable {
    uint8 public constant DECIMALS = 18;
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * (10 ** DECIMALS);

    /** 

@dev Sets the token name, symbol, and mints the total supply to the deployer.
*/
    constructor() ERC20("Cognify", "CGFY") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**

@notice Returns the token decimals (overrides default of 18).
*/
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**

@notice Burns a specified amount of tokens from the caller's balance.

@param amount The number of tokens to burn (in smallest units).
*/
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**

@notice Allows the contract owner to mint new tokens.

@param to The address to receive the newly minted tokens.

@param amount The number of tokens to mint (in smallest units).
*/
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
