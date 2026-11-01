pragma solidity 0.8.20; //请勿更改 solidity 版本，否则会对提交评分产生不利影响
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// 了解更多：https://docs.openzeppelin.com/contracts/5.x/erc20

contract YourToken is ERC20 {
    constructor() ERC20("Gold", "GLD") {

    }
}
