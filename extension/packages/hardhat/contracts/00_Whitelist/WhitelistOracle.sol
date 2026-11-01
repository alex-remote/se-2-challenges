//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./SimpleOracle.sol";
import { StatisticsUtils } from "../utils/StatisticsUtils.sol";

contract WhitelistOracle {
    using StatisticsUtils for uint256[];

    /////////////////
    /// 错误 //////
    /////////////////

    error OnlyOwner();
    error IndexOutOfBounds();
    error NoOraclesAvailable();

    //////////////////////
    /// 状态变量 //
    //////////////////////

    address public owner;
    SimpleOracle[] public oracles;
    uint256 public constant STALE_DATA_WINDOW = 24 seconds;

    ////////////////
    /// 事件 /////
    ////////////////

    event OracleAdded(address oracleAddress, address oracleOwner);
    event OracleRemoved(address oracleAddress);

    ///////////////////
    /// 修饰器 /////
    ///////////////////

    /**
     * @notice 将函数访问权限限制为合约所有者的修饰器
     * @dev 目前已禁用，方便你冒充所有者
     */
    modifier onlyOwner() {
        // if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    ///////////////////
    /// 构造函数 ///
    ///////////////////

    constructor() {
        owner = msg.sender;
    }

    ///////////////////
    /// 函数 /////
    ///////////////////

    /**
     * @notice 通过部署一个 SimpleOracle 合约，将新的预言机加入白名单（仅限合约所有者）
     * @dev 创建一个新的 SimpleOracle 实例，并将其加入 oracles 数组。
     * @param _owner 将拥有新建预言机并可更新其价格的地址
     */
    function addOracle(address _owner) public onlyOwner {}

    /**
     * @notice 按数组索引将预言机从白名单中移除（仅限合约所有者）
     * @dev 使用 swap-and-pop（交换后弹出）模式移除，以节省 gas。不保证顺序不变。
     *      如果传入的索引 >= oracles.length，则以 IndexOutOfBounds 回滚（revert）。
     * @param index 要从 oracles 数组中移除的预言机的索引
     */
    function removeOracle(uint256 index) public onlyOwner {}

    /**
     * @notice 通过计算中位数，返回所有活跃预言机的聚合价格
     * @dev 过滤掉时间戳早于 STALE_DATA_WINDOW 时间窗口的预言机，然后计算其余有效价格的
     *      中位数。使用 StatisticsUtils 进行排序和中位数计算。
     * @return 所有活跃预言机价格的中位数
     */
    function getPrice() public view returns (uint256) {}

    /**
     * @notice 返回在最近 STALE_DATA_WINDOW 时间内更新过价格的所有预言机的地址
     * @dev 遍历所有预言机，筛选出时间戳较新（在 STALE_DATA_WINDOW 内）的预言机。
     *      先用临时数组收集活跃节点，再创建一个大小恰好合适的返回数组，
     *      以优化 gas。
     * @return 当前活跃的预言机合约地址数组
     */
    function getActiveOracleNodes() public view returns (address[] memory) {}
}
