// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyUSD.sol";
import "./Oracle.sol";
import "./MyUSDStaking.sol";

error Engine__InvalidAmount();
error Engine__UnsafePositionRatio();
error Engine__NotLiquidatable();
error Engine__InvalidBorrowRate();
error Engine__NotRateController();
error Engine__InsufficientCollateral();
error Engine__TransferFailed();

contract MyUSDEngine is Ownable {
    uint256 private constant COLLATERAL_RATIO = 150; // 要求 150% 的抵押率
    uint256 private constant LIQUIDATOR_REWARD = 10; // 清算人可获得 10% 的奖励
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant PRECISION = 1e18;

    MyUSD private i_myUSD;
    Oracle private i_oracle;
    MyUSDStaking private i_staking;
    address private i_rateController;

    uint256 public borrowRate; // 借款人的年利率，以基点表示（1% = 100）

    // 池中的债务份额总量
    uint256 public totalDebtShares;

    // 债务份额与 MyUSD 之间的兑换率（1e18 精度）
    uint256 public debtExchangeRate;
    uint256 public lastUpdateTime;

    mapping(address => uint256) public s_userCollateral;
    mapping(address => uint256) public s_userDebtShares;

    event CollateralAdded(address indexed user, uint256 indexed amount, uint256 price);
    event CollateralWithdrawn(address indexed withdrawer, uint256 indexed amount, uint256 price);
    event BorrowRateUpdated(uint256 newRate);
    event DebtSharesMinted(address indexed user, uint256 amount, uint256 shares);
    event DebtSharesBurned(address indexed user, uint256 amount, uint256 shares);
    event Liquidation(
        address indexed user,
        address indexed liquidator,
        uint256 amountForLiquidator,
        uint256 liquidatedUserDebt,
        uint256 price
    );

    modifier onlyRateController() {
        if (msg.sender != i_rateController) revert Engine__NotRateController();
        _;
    }

    constructor(
        address _oracle,
        address _myUSDAddress,
        address _stakingAddress,
        address _rateController
    ) Ownable(msg.sender) {
        i_oracle = Oracle(_oracle);
        i_myUSD = MyUSD(_myUSDAddress);
        i_staking = MyUSDStaking(_stakingAddress);
        i_rateController = _rateController;
        lastUpdateTime = block.timestamp;
        debtExchangeRate = PRECISION; // 初始为 1:1
    }

    // Checkpoint 2: 存入抵押品与理解价值
    function addCollateral() public payable {
        
    }

    function calculateCollateralValue(address user) public view returns (uint256) {
        
    }

    // Checkpoint 3: 利息计算系统
    function _getCurrentExchangeRate() internal view returns (uint256) {
        
    }

    function _accrueInterest() internal {
        
    }

    function _getMyUSDToShares(uint256 amount) internal view returns (uint256) {
        
    }

    // Checkpoint 4: 铸造 MyUSD 与仓位健康度
    function getCurrentDebtValue(address user) public view returns (uint256) {
        
    }

    function calculatePositionRatio(address user) public view returns (uint256) {
        
    }

    function _validatePosition(address user) internal view {
        
    }

    function mintMyUSD(uint256 mintAmount) public {
        
    }

    // Checkpoint 5: 累积利息与管理借款利率
    function setBorrowRate(uint256 newRate) external onlyRateController {
        
    }

    // Checkpoint 6: 偿还债务与提取抵押品
    function repayUpTo(uint256 amount) public {
        
    }

    function withdrawCollateral(uint256 amount) external {
        
    }

    // Checkpoint 7: 清算——维护系统稳定
    function isLiquidatable(address user) public view returns (bool) {
        
    }

    function liquidate(address user) external {
        
    }
}
