// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CornDEX.sol";

/**
 * @notice 该合约充当一个巨鲸账户，任何人调用它时都会推动 CORN 的价格上涨或下跌
 */
contract MovePrice {
    CornDEX cornDex;

    constructor(address _cornDex, address _cornToken) {
        cornDex = CornDEX(_cornDex);
        // 授权 cornDEX 使用 cornToken
        IERC20(_cornToken).approve(address(cornDex), type(uint256).max);
    }

    function movePrice(int256 size) public {
        if (size > 0) {
            cornDex.swap{ value: uint256(size) }(uint256(size));
        } else {
            cornDex.swap(uint256(-size));
        }
    }

    receive() external payable {}

    fallback() external payable {}
}
