// SPDX-License-Identifier: MIT
pragma solidity 0.8.20; // 不要修改 solidity 版本，否则会影响提交评分

import "./FundingRecipient.sol";

contract CrowdFund {
    /////////////////
    /// 错误 ////////
    /////////////////

    // 在这里定义错误...

    //////////////////////
    /// 状态变量 /////////
    //////////////////////

    FundingRecipient public fundingRecipient;

    ////////////////
    /// 事件 ///////
    ////////////////

    // 在这里定义事件...

    ///////////////////
    /// 修饰器 ////////
    ///////////////////

    modifier notCompleted() {
        _;
    }

    ///////////////////
    /// 构造函数 //////
    ///////////////////

    constructor(address fundingRecipientAddress) {
        fundingRecipient = FundingRecipient(fundingRecipientAddress);
    }

    ///////////////////
    /// 函数 //////////
    ///////////////////

    function contribute() public payable {

    }

    function withdraw() public {

    }

    function execute() public {

    }

    receive() external payable {

    }

    ////////////////////////
    /// 视图函数 ///////////
    ////////////////////////

    function timeLeft() public view returns (uint256) {
        return 0;
    }
}
