// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./MyUSDStaking.sol";

error Engine__InvalidBorrowRate();

contract RateController {
    IMyUSDEngine private i_myUSD;
    MyUSDStaking private i_staking;

    constructor(address _myUSD, address _staking) {
        i_myUSD = IMyUSDEngine(_myUSD);
        i_staking = MyUSDStaking(_staking);
    }

    /**
     * @notice 设置 MyUSD 引擎的借款利率
     * @param newRate 要设置的新借款利率
     */
    function setBorrowRate(uint256 newRate) external {
        try i_myUSD.setBorrowRate(newRate) {} catch {
            revert Engine__InvalidBorrowRate();
        }
    }

    /**
     * @notice 设置 MyUSD 质押合约的储蓄利率
     * @param newRate 要设置的新储蓄利率
     */
    function setSavingsRate(uint256 newRate) external {
        try i_staking.setSavingsRate(newRate) {} catch {
            revert Staking__InvalidSavingsRate();
        }
    }
}
