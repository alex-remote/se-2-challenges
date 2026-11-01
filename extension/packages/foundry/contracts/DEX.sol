// SPDX-License-Identifier: MIT
pragma solidity 0.8.20; //不要修改 solidity 版本，否则会对提交评分产生负面影响

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    /////////////////
    /// 错误 ////////
    /////////////////

    // 在这里定义错误

    //////////////////////
    /// 状态变量 /////////
    //////////////////////

    IERC20 public immutable token;

    ////////////////
    /// 事件 ///////
    ////////////////

    // 在这里定义事件……

    ///////////////////
    /// 构造函数 //////
    ///////////////////

    constructor(address tokenAddr) {
        token = IERC20(tokenAddr);
    }

    ///////////////////
    /// 函数 //////////
    ///////////////////

    function init(uint256 tokens) public payable returns (uint256 initialLiquidity) {
        // 在这里编写你的代码……
    }

    function price(uint256 xInput, uint256 xReserves, uint256 yReserves) public pure returns (uint256 yOutput) {
        // 在这里编写你的代码……
    }

    function getLiquidity(address lp) public view returns (uint256 lpLiquidity) {
        // 在这里编写你的代码……
    }

    function ethToToken() public payable returns (uint256 tokenOutput) {
        // 在这里编写你的代码……
    }

    function tokenToEth(uint256 tokenInput) public returns (uint256 ethOutput) {
        // 在这里编写你的代码……
    }

    function deposit() public payable returns (uint256 tokensDeposited) {
        // 在这里编写你的代码……
    }

    function withdraw(uint256 amount) public returns (uint256 ethAmount, uint256 tokenAmount) {
        // 在这里编写你的代码……
    }
}
