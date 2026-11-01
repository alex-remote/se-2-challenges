// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Corn.sol";
import "./CornDEX.sol";

error Lending__InvalidAmount();
error Lending__TransferFailed();
error Lending__UnsafePositionRatio();
error Lending__BorrowingFailed();
error Lending__RepayingFailed();
error Lending__PositionSafe();
error Lending__NotLiquidatable();
error Lending__InsufficientLiquidatorCorn();

contract Lending is Ownable {
    uint256 private constant COLLATERAL_RATIO = 120; // 要求 120% 的抵押率
    uint256 private constant LIQUIDATOR_REWARD = 10; // 清算人可获得 10% 的奖励

    Corn private i_corn;
    CornDEX private i_cornDEX;

    mapping(address => uint256) public s_userCollateral; // 用户的抵押品余额
    mapping(address => uint256) public s_userBorrowed; // 用户借入的 corn 余额

    event CollateralAdded(address indexed user, uint256 indexed amount, uint256 price);
    event CollateralWithdrawn(address indexed user, uint256 indexed amount, uint256 price);
    event AssetBorrowed(address indexed user, uint256 indexed amount, uint256 price);
    event AssetRepaid(address indexed user, uint256 indexed amount, uint256 price);
    event Liquidation(
        address indexed user,
        address indexed liquidator,
        uint256 amountForLiquidator,
        uint256 liquidatedUserDebt,
        uint256 price
    );

    constructor(address _cornDEX, address _corn) Ownable(msg.sender) {
        i_cornDEX = CornDEX(_cornDEX);
        i_corn = Corn(_corn);
        i_corn.approve(address(this), type(uint256).max);
    }

    /**
     * @notice 允许用户向其账户添加抵押品
     */
    function addCollateral() public payable {}

    /**
     * @notice 允许用户提取抵押品，前提是提取后不会使其进入可被清算状态
     * @param amount 要提取的抵押品数量
     */
    function withdrawCollateral(uint256 amount) public {}

    /**
     * @notice 根据用户的抵押品余额计算其抵押品总价值
     * @param user 要计算抵押品价值的用户地址
     * @return uint256 抵押品价值
     */
    function calculateCollateralValue(address user) public view returns (uint256) {}

    /**
     * @notice 计算用户的仓位比率，以确保其处于安全范围内
     * @param user 要计算仓位比率的用户地址
     * @return uint256 仓位比率
     */
    function _calculatePositionRatio(address user) internal view returns (uint256) {}

    /**
     * @notice 检查用户的仓位是否可以被清算
     * @param user 要检查的用户地址
     * @return bool 如果仓位可被清算则返回 true，否则返回 false
     */
    function isLiquidatable(address user) public view returns (bool) {}

    /**
     * @notice 内部 view 方法，若用户的仓位不安全则回滚（revert）
     * @param user 要验证的用户地址
     */
    function _validatePosition(address user) internal view {}

    /**
     * @notice 允许用户根据其抵押品借入 corn
     * @param borrowAmount 要借入的 corn 数量
     */
    function borrowCorn(uint256 borrowAmount) public {}

    /**
     * @notice 允许用户偿还 corn 以减少其债务
     * @param repayAmount 要偿还的 corn 数量
     */
    function repayCorn(uint256 repayAmount) public {}

    /**
     * @notice 允许清算人清算不安全的仓位
     * @param user 要清算的用户地址
     * @dev 调用者必须持有足够的 CORN 来偿还该用户的债务
     * @dev 调用者必须已授权本合约转移用于偿还债务的代币
     */
    function liquidate(address user) public {}
}

