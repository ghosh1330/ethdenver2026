// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OracleAdapter is Ownable {
    mapping(bytes32 => uint256) public rates;
    mapping(bytes32 => uint256) public lastUpdated;

    event RateUpdated(bytes32 indexed currency, uint256 rateADIperFiat_1e18, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setRate(bytes32 currency, uint256 rateADIperFiat_1e18) external onlyOwner {
        require(rateADIperFiat_1e18 > 0, "OracleAdapter: rate must be > 0");
        rates[currency] = rateADIperFiat_1e18;
        lastUpdated[currency] = block.timestamp;
        emit RateUpdated(currency, rateADIperFiat_1e18, block.timestamp);
    }

    function getQuote(uint256 fiatAmountMinor, bytes32 currency)
        external
        view
        returns (uint256 adiAmount)
    {
        uint256 rate = rates[currency];
        require(rate > 0, "OracleAdapter: rate not set for currency");
        adiAmount = (fiatAmountMinor * rate) / 1e18;
    }

    function getRate(bytes32 currency) external view returns (uint256) {
        return rates[currency];
    }
}
