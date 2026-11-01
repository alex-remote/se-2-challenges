// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { ORA } from "./OracleToken.sol";
import { StatisticsUtils } from "../utils/StatisticsUtils.sol";

contract StakingOracle {
    using StatisticsUtils for uint256[];

    /////////////////
    /// 错误 //////
    /////////////////

    error NodeNotRegistered();
    error InsufficientStake();
    error NodeAlreadyRegistered();
    error NoRewardsAvailable();
    error OnlyPastBucketsAllowed();
    error NodeAlreadySlashed();
    error AlreadyReportedInCurrentBucket();
    error NotDeviated();
    error WaitingPeriodNotOver();
    error InvalidPrice();
    error IndexOutOfBounds();
    error NodeNotAtGivenIndex();
    error TransferFailed();
    error MedianNotRecorded();
    error BucketMedianAlreadyRecorded();
    error NodeDidNotReport();

    //////////////////////
    /// 状态变量 //
    //////////////////////

    ORA public oracleToken;

    struct OracleNode {
        uint256 stakedAmount;
        uint256 lastReportedBucket;
        uint256 reportCount;
        uint256 claimedReportCount;
        uint256 firstBucket; // 节点注册时的区块
        bool active;
    }

    struct BlockBucket {
        mapping(address => bool) slashedOffenses;
        address[] reporters;
        uint256[] prices;
        uint256 medianPrice;
    }

    mapping(address => OracleNode) public nodes;
    mapping(uint256 => BlockBucket) public blockBuckets; // 每 24 个区块为一个桶（bucket）
    address[] public nodeAddresses;

    uint256 public constant MINIMUM_STAKE = 100 ether;
    uint256 public constant BUCKET_WINDOW = 24; // 24 个区块
    uint256 public constant SLASHER_REWARD_PERCENTAGE = 10;
    uint256 public constant REWARD_PER_REPORT = 1 ether; // 每次上报奖励的 ORA 代币数量
    uint256 public constant INACTIVITY_PENALTY = 1 ether;
    uint256 public constant MISREPORT_PENALTY = 100 ether;
    uint256 public constant MAX_DEVIATION_BPS = 1000; // 默认阈值 10%
    uint256 public constant WAITING_PERIOD = 2; // 最后一次上报后需再经过 2 个桶才允许退出

    ////////////////
    /// 事件 /////
    ////////////////

    event NodeRegistered(address indexed node, uint256 stakedAmount);
    event PriceReported(address indexed node, uint256 price, uint256 bucketNumber);
    event BucketMedianRecorded(uint256 indexed bucketNumber, uint256 medianPrice);
    event NodeSlashed(address indexed node, uint256 amount);
    event NodeRewarded(address indexed node, uint256 amount);
    event StakeAdded(address indexed node, uint256 amount);
    event NodeExited(address indexed node, uint256 amount);

    ///////////////////
    /// 修饰器 /////
    ///////////////////

    /**
     * @notice 将函数访问权限限制为已注册预言机节点的修饰器
     * @dev 检查调用者在映射中是否有已注册的节点
     */
    modifier onlyNode() {
        if (nodes[msg.sender].active == false) revert NodeNotRegistered();
        _;
    }

    ///////////////////
    /// 构造函数 ///
    ///////////////////

    constructor(address oraTokenAddress) {
        oracleToken = ORA(payable(oraTokenAddress));
    }

    ///////////////////
    /// 函数 /////
    ///////////////////

    /**
     * @notice 以初始 ORA 代币质押注册一个新的预言机节点
     * @dev 创建新的 OracleNode 结构体，并将调用者加入 nodeAddresses 数组。
     *      要求达到最低质押数量，并防止重复注册。
     */
    function registerNode(uint256 amount) public {}

    /**
     * @notice 更新预言机节点上报的价格（仅限已注册节点）
     * @dev 更新节点的 lastReportedBucket 以及它在该桶中的价格。要求有足够的质押。
     *      强制要求上一次上报所在桶的中位数已被记录，才允许提交新的上报。
     *      这样就形成了一条由已最终确定的桶组成的链，确保所有过去的上报都可被追责。
     * @param price 要上报的新价格
     */
    function reportPrice(uint256 price) public onlyNode {}

    /**
     * @notice 允许活跃和非活跃节点领取累积的 ORA 代币奖励
     * @dev 根据自上次领取以来经过的时间计算奖励。
     */
    function claimReward() public {}

    /**
     * @notice 允许已注册节点增加其 ORA 代币质押
     */
    function addStake(uint256 amount) public onlyNode {}

    /**
     * @notice 当上报数量足够时，记录某个桶的中位数价格
     * @dev 任何使用该预言机喂价的人都可以调用此函数来记录某个桶的中位数价格。
     * @param bucketNumber 要最终确定的桶编号
     */
    function recordBucketMedian(uint256 bucketNumber) public {}

    /**
     * @notice 罚没（slash）上报价格偏离平均值过远的节点
     * @param nodeToSlash 要罚没的节点地址
     * @param bucketNumber 罚没该节点所依据的桶编号
     * @param reportIndex 该节点在 prices 和 reporters 数组中的索引
     * @param nodeAddressesIndex 要罚没的节点在 nodeAddresses 数组中的索引
     */
    function slashNode(
        address nodeToSlash,
        uint256 bucketNumber,
        uint256 reportIndex,
        uint256 nodeAddressesIndex
    ) public {}

    /**
     * @notice 允许已注册节点退出系统并提取其质押
     * @dev 将节点从系统中移除，并把质押发送给该节点。
     *      要求初始等待期已经过去，以确保在允许节点退出之前，
     *      如果它上报过错误价格，就已经被罚没。
     * @param index 要移除的节点在 nodeAddresses 中的索引
     */
    function exitNode(uint256 index) public onlyNode {}

    ////////////////////////
    /// 视图函数 /////
    ////////////////////////

    /**
     * @notice 返回当前桶编号
     * @dev 根据区块号返回当前桶编号
     * @return 当前桶编号
     */
    function getCurrentBucketNumber() public view returns (uint256) {
        return (block.number / BUCKET_WINDOW) + 1;
    }

    /**
     * @notice 返回已注册预言机节点的地址列表
     * @return 已注册预言机节点的地址数组
     */
    function getNodeAddresses() public view returns (address[] memory) {}

    /**
     * @notice 返回最近一个已完成的桶中存储的中位数价格
     * @dev 要求该桶的中位数已通过 recordBucketMedian 记录
     * @return 最后一个已最终确定的桶的中位数价格
     */
    function getLatestPrice() public view returns (uint256) {}

    /**
     * @notice 返回指定桶中存储的中位数价格
     * @param bucketNumber 要读取中位数价格的桶编号
     * @return 该桶存储的中位数价格
     */
    function getPastPrice(uint256 bucketNumber) public view returns (uint256) {}

    /**
     * @notice 返回节点在指定桶中的价格及罚没状态
     * @param nodeAddress 要查询数据的节点地址
     * @param bucketNumber 要查询数据的桶编号
     * @return price 该节点在指定桶中的价格
     * @return slashed 该节点在指定桶中的罚没状态
     */
    function getSlashedStatus(
        address nodeAddress,
        uint256 bucketNumber
    ) public view returns (uint256 price, bool slashed) {}

    /**
     * @notice 返回扣除因错过桶而产生的不活跃惩罚后的有效质押
     * @dev 有效质押 = stakedAmount - (missedBuckets * INACTIVITY_PENALTY)，最低为 0
     */
    function getEffectiveStake(address nodeAddress) public view returns (uint256) {}

    /**
     * @notice 返回某个桶中上报价格偏离超过阈值的节点地址
     * @param bucketNumber 要从中找出离群节点的桶编号
     * @return 被视为离群值的节点地址数组
     */
    function getOutlierNodes(uint256 bucketNumber) public view returns (address[] memory) {}

    //////////////////////////
    /// 内部函数 ///
    //////////////////////////

    /**
     * @notice 从 nodeAddresses 数组中移除一个节点
     * @param nodeAddress 要移除的节点地址
     * @param index 要移除的节点的索引
     */
    function _removeNode(address nodeAddress, uint256 index) internal {}

    /**
     * @notice 检查价格偏差是否大于阈值
     * @param reportedPrice 节点上报的价格
     * @param medianPrice 该桶的平均价格
     * @return 价格偏差大于阈值时返回 true，否则返回 false
     */
    function _checkPriceDeviated(uint256 reportedPrice, uint256 medianPrice) internal pure returns (bool) {}
}
