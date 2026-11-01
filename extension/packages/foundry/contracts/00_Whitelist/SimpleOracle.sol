//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SimpleOracle {
    /////////////////
    /// 错误 //////
    /////////////////

    error OnlyOwner();

    //////////////////////
    /// 状态变量 //
    //////////////////////

    uint256 public price;
    uint256 public timestamp;
    address public owner;

    ////////////////
    /// 事件 /////
    ////////////////

    event PriceUpdated(uint256 newPrice);

    ///////////////////
    /// 构造函数 ///
    ///////////////////

    constructor(address _owner) {
        owner = _owner;
    }

    ///////////////////
    /// 修饰器 /////
    ///////////////////

    /**
     * @notice 将函数访问权限限制为合约所有者的修饰器
     * @dev 目前已禁用，方便你冒充所有者
     */
    modifier onlyOwner() {
        // 有意去掉了所有者检查，方便你冒充所有者
        // if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    ///////////////////
    /// 函数 /////
    ///////////////////

    /**
     * @notice 用新值更新预言机价格（仅限合约所有者）
     * @dev 设置价格并记录当前区块时间戳，用于追踪数据新鲜度。
     *      更新成功后触发 PriceUpdated 事件。
     * @param _newPrice 要为该预言机设置的新价格
     */
    function setPrice(uint256 _newPrice) public onlyOwner {
        price = _newPrice;
        timestamp = block.timestamp;
        emit PriceUpdated(_newPrice);
    }

    /**
     * @notice 返回当前价格及其时间戳
     * @dev 同时提供存储的价格值及其最近一次更新的时间。
     *      聚合器用它来判断价格是否新鲜。
     * @return price 该预言机中存储的当前价格
     * @return timestamp 价格最近一次更新时的区块时间戳
     */
    function getPrice() public view returns (uint256, uint256) {
        return (price, timestamp);
    }
}
