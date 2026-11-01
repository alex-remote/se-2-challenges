// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DEX.sol";

contract Oracle {
    /* ========== 状态变量 ========== */

    DEX public dexAddress;
    uint256 public defaultPrice;
    /* ========== 构造函数 ========== */

    constructor(address _dexAddress, uint256 _defaultPrice) {
        dexAddress = DEX(_dexAddress);
        defaultPrice = _defaultPrice;
    }

    /* ========== 公共函数 ========== */

    function getETHMyUSDPrice() public view returns (uint256) {
        // 预言机直接返回 DEX 的价格，除非没有可用的流动性
        uint256 _price = dexAddress.currentPrice();
        if (_price == 0) {
            _price = defaultPrice;
        }
        return _price;
    }

    function getETHUSDPrice() public view returns (uint256) {
        return defaultPrice;
    }
}
