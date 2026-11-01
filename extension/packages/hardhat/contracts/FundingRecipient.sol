// SPDX-License-Identifier: MIT
pragma solidity 0.8.20; // 不要修改 solidity 版本，否则会影响提交评分

contract FundingRecipient {
    bool public completed;

    function complete() public payable {
        completed = true;
    }
}
