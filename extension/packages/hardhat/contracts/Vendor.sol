pragma solidity 0.8.20; //请勿更改 solidity 版本，否则会对提交评分产生不利影响
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
    /////////////////
    /// 错误 ////////
    /////////////////
 
    // 在这里定义错误...

    //////////////////////
    /// 状态变量 /////////
    //////////////////////

    YourToken public immutable yourToken;

    ////////////////
    /// 事件 ///////
    ////////////////

    // 在这里定义事件...

    ///////////////////
    /// 构造函数 //////
    ///////////////////

    constructor(address tokenAddress) Ownable(msg.sender) {
        yourToken = YourToken(tokenAddress);
    }

    ///////////////////
    /// 函数 //////////
    ///////////////////

    function buyTokens() external payable {

    }

    function withdraw() public onlyOwner {

    }

    function sellTokens(uint256 amount) public {

    }
}
