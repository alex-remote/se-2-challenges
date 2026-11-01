// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Decider {
    address public owner;
    IOptimisticOracle public oracle;

    event DisputeSettled(uint256 indexed assertionId, bool resolvedValue);

    constructor(address _oracle) {
        owner = msg.sender;
        oracle = IOptimisticOracle(_oracle);
    }

    /**
     * @notice 通过判定 true/false 结果来结算争议
     * @param assertionId 要结算的断言 ID
     * @param resolvedValue 由裁决者判定的 true/false 结果
     */
    function settleDispute(uint256 assertionId, bool resolvedValue) external {
        require(assertionId >= 1, "Invalid assertion ID");

        // 调用预言机的 settleAssertion 函数
        oracle.settleAssertion(assertionId, resolvedValue);

        emit DisputeSettled(assertionId, resolvedValue);
    }

    function setOracle(address newOracle) external {
        require(msg.sender == owner, "Only owner can set oracle");
        oracle = IOptimisticOracle(newOracle);
    }

    /**
     * @notice 允许合约接收 ETH
     */
    receive() external payable {}
}

interface IOptimisticOracle {
    function settleAssertion(uint256, bool) external;
}
