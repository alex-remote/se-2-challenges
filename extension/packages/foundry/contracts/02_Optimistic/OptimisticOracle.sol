// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract OptimisticOracle {
    ////////////////
    /// 枚举 //////
    ////////////////

    enum State {
        Invalid,
        Asserted,
        Proposed,
        Disputed,
        Settled,
        Expired
    }

    /////////////////
    /// 错误 //////
    /////////////////

    error AssertionNotFound();
    error AssertionProposed();
    error InvalidValue();
    error InvalidTime();
    error ProposalDisputed();
    error NotProposedAssertion();
    error AlreadyClaimed();
    error AlreadySettled();
    error AwaitingDecider();
    error NotDisputedAssertion();
    error OnlyDecider();
    error OnlyOwner();
    error TransferFailed();

    //////////////////////
    /// 状态变量 //
    //////////////////////

    struct EventAssertion {
        address asserter;
        address proposer;
        address disputer;
        bool proposedOutcome;
        bool resolvedOutcome;
        uint256 reward;
        uint256 bond;
        uint256 startTime;
        uint256 endTime;
        bool claimed;
        address winner;
        string description;
    }

    uint256 public constant MINIMUM_ASSERTION_WINDOW = 3 minutes;
    uint256 public constant DISPUTE_WINDOW = 3 minutes;
    address public decider;
    address public owner;
    uint256 public nextAssertionId = 1;
    mapping(uint256 => EventAssertion) public assertions;

    ////////////////
    /// 事件 /////
    ////////////////

    event EventAsserted(uint256 assertionId, address asserter, string description, uint256 reward);
    event OutcomeProposed(uint256 assertionId, address proposer, bool outcome);
    event OutcomeDisputed(uint256 assertionId, address disputer);
    event AssertionSettled(uint256 assertionId, bool outcome, address winner);
    event DeciderUpdated(address oldDecider, address newDecider);
    event RewardClaimed(uint256 assertionId, address winner, uint256 amount);
    event RefundClaimed(uint256 assertionId, address asserter, uint256 amount);

    ///////////////////
    /// 修饰器 /////
    ///////////////////

    /**
     * @notice 将函数访问权限限制为指定裁决者的修饰器
     * @dev 确保只有裁决者才能结算有争议的断言
     */
    modifier onlyDecider() {
        if (msg.sender != decider) revert OnlyDecider();
        _;
    }

    /**
     * @notice 将函数访问权限限制为合约所有者的修饰器
     * @dev 确保只有所有者才能更新关键的合约参数
     */
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    ///////////////////
    /// 构造函数 ///
    ///////////////////

    constructor(address _decider) {
        decider = _decider;
        owner = msg.sender;
    }

    ///////////////////
    /// 函数 /////
    ///////////////////

    /**
     * @notice 更新裁决者地址（仅限合约所有者）
     * @dev 更改有权结算争议断言的地址。
     *      触发包含新旧地址的 DeciderUpdated 事件。
     * @param _decider 将作为争议断言裁决者的新地址
     */
    function setDecider(address _decider) external onlyOwner {
        address oldDecider = address(decider);
        decider = _decider;
        emit DeciderUpdated(oldDecider, _decider);
    }

    /**
     * @notice 返回给定断言 ID 的完整断言详情
     * @dev 提供对 EventAssertion 结构体所有字段的访问
     * @param assertionId 要获取的断言的唯一标识符
     * @return 包含全部断言数据的完整 EventAssertion 结构体
     */
    function getAssertion(uint256 assertionId) external view returns (EventAssertion memory) {
        return assertions[assertionId];
    }

    /**
     * @notice 针对一个结果为 true/false 的事件创建新的断言
     * @dev 需要支付 ETH，作为给正确提议者的奖励。所需保证金（bond）为奖励的 2 倍。
     *      未提供时间戳时设置默认值，并校验时间要求。
     * @param description 事件的人类可读描述（例如“X 是否在时间 Y 之前发生？”）
     * @param startTime 可以开始提议的时间（传 0 表示当前区块时间戳）
     * @param endTime 断言的过期时间（传 0 表示 startTime + 最短窗口）
     * @return 新建断言的唯一断言 ID
     */
    function assertEvent(
        string memory description,
        uint256 startTime,
        uint256 endTime
    ) external payable returns (uint256) {}

    /**
     * @notice 为已断言的事件提议结果（true 或 false）
     * @dev 需要缴纳相当于原始奖励 2 倍的 ETH 作为保证金。设置争议窗口的截止时间。
     *      每个断言只能调用一次，且必须在断言的时间窗口内调用。
     * @param assertionId 要为其提议结果的断言的唯一标识符
     * @param outcome 为该事件提议的布尔结果（true 或 false）
     */
    function proposeOutcome(uint256 assertionId, bool outcome) external payable {}

    /**
     * @notice 通过缴纳 ETH 保证金，对提议的结果发起争议
     * @dev 需要缴纳与保证金数额相等的 ETH。每个断言只能被争议一次，
     *      且必须在提议后的争议窗口内发起。
     * @param assertionId 要发起争议的断言的唯一标识符
     */
    function disputeOutcome(uint256 assertionId) external payable {}

    /**
     * @notice 争议窗口到期后，为无争议的断言领取奖励
     * @dev 任何人都可以触发此函数。将奖励 + 保证金转给提议者。
     *      只能在争议窗口结束且无人发起争议后调用。
     * @param assertionId 要领取奖励的断言的唯一标识符
     */
    function claimUndisputedReward(uint256 assertionId) external {}

    /**
     * @notice 裁决者结算后，为有争议的断言领取奖励
     * @dev 任何人都可以触发此函数。支付裁决者费用，并将剩余奖励转给胜方。
     *      只能在裁决者结算争议后调用。
     * @param assertionId 要领取奖励的争议断言的唯一标识符
     */
    function claimDisputedReward(uint256 assertionId) external {}

    /**
     * @notice 为截止时间前没有收到任何提议的断言申领退款
     * @dev 任何人都可以触发此函数。将原始奖励退还给断言者。
     *      只能在断言截止时间已过且没有任何提议时调用。
     * @param assertionId 要申领退款的过期断言的唯一标识符
     */
    function claimRefund(uint256 assertionId) external {}

    /**
     * @notice 通过判定正确结果来解决有争议的断言（仅限裁决者）
     * @dev 设置裁定结果，并根据提议是否正确来确定胜方。
     * @param assertionId 要结算的争议断言的唯一标识符
     * @param resolvedOutcome 裁决者判定的真实结果
     */
    function settleAssertion(uint256 assertionId, bool resolvedOutcome) external onlyDecider {}

    /**
     * @notice 根据断言所处的生命周期阶段返回其当前状态
     * @dev 依据以下状态评估断言进度：Invalid、Asserted、Proposed、Disputed、Settled、Expired
     * @param assertionId 要查询状态的断言的唯一标识符
     * @return 表示断言状态的当前 State 枚举值
     */
    function getState(uint256 assertionId) external view returns (State) {}

    /**
     * @notice 返回已结算断言的最终结果
     * @dev 对于无争议的断言，在争议窗口结束后返回提议的结果。
     *      对于有争议的断言，返回裁决者裁定的结果。
     * @param assertionId 要获取最终结果的断言的唯一标识符
     * @return 断言的最终布尔结果
     */
    function getResolution(uint256 assertionId) external view returns (bool) {}
}
