// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, Vm } from "forge-std/Test.sol";
import { IMyUSDEngine } from "../contracts/IMyUSDEngine.sol";
import { MyUSD } from "../contracts/MyUSD.sol";
import { MyUSDEngine } from "../contracts/MyUSDEngine.sol";
import { MyUSDStaking } from "../contracts/MyUSDStaking.sol";
import { DEX } from "../contracts/DEX.sol";
import { Oracle } from "../contracts/Oracle.sol";
import { RateController } from "../contracts/RateController.sol";

contract MyUSDEngineTest is Test {
    MyUSD public myUSD;
    IMyUSDEngine public engine;
    MyUSDStaking public staking;
    DEX public dex;
    Oracle public oracle;
    RateController public rateController;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant ETH_PRICE = 2000 ether; // 每个 ETH 价值 $2000
    uint256 constant COLLATERAL_AMOUNT = 10 ether;
    uint256 constant BORROW_AMOUNT = 5000 ether;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(owner, 100_000_000 ether);

        // 预先计算地址，以解决合约之间的循环依赖
        uint64 nonce = vm.getNonce(owner);
        address futureStakingAddress = vm.computeCreateAddress(owner, nonce + 4);
        address futureEngineAddress = vm.computeCreateAddress(owner, nonce + 5);

        // 按顺序部署：RateController、MyUSD、DEX、Oracle、MyUSDStaking、MyUSDEngine
        rateController = new RateController(futureEngineAddress, futureStakingAddress);
        myUSD = new MyUSD(futureEngineAddress, futureStakingAddress);
        dex = new DEX(address(myUSD));
        oracle = new Oracle(address(dex), ETH_PRICE);
        staking = new MyUSDStaking(address(myUSD), futureEngineAddress, address(rateController));
        engine = IMyUSDEngine(
            address(new MyUSDEngine(address(oracle), address(myUSD), address(staking), address(rateController)))
        );

        // 验证地址与预测结果一致
        assertEq(address(staking), futureStakingAddress, "Staking address mismatch");
        assertEq(address(engine), futureEngineAddress, "Engine address mismatch");

        // 为 DEX 注入初始流动性：存入抵押品、铸造 MyUSD、初始化 DEX
        uint256 ethDEXAmount = 1000 ether;
        uint256 myUSDAmount = ETH_PRICE / 1e18 * ethDEXAmount; // 2000 * 1000 = 2_000_000 ether

        engine.addCollateral{ value: 10_000_000 ether }();
        engine.mintMyUSD(myUSDAmount);

        myUSD.approve(address(dex), myUSDAmount);
        dex.init{ value: ethDEXAmount }(myUSDAmount);
    }

    // ============================================================
    // 部署
    // ============================================================

    function test_DeployWithCorrectInitialState() public view {
        assertEq(myUSD.owner(), owner);
        assertTrue(dex.totalLiquidity() > 0);
        assertTrue(oracle.getETHMyUSDPrice() > 0);
        assertEq(engine.borrowRate(), 0);
        assertEq(staking.savingsRate(), 0);
    }

    // ============================================================
    // Checkpoint 1: 抵押品、利息系统与铸造
    // ============================================================

    function test_Checkpoint1_AllowAddingCollateral() public {
        vm.prank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();
        assertEq(engine.s_userCollateral(user1), COLLATERAL_AMOUNT);
    }

    function test_Checkpoint1_EmitCollateralAddedEvent() public {
        vm.prank(user1);
        vm.recordLogs();
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("CollateralAdded(address,uint256,uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "CollateralAdded event should be emitted");
    }

    function test_Checkpoint3_AllowWithdrawingWhenNoDebt() public {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();
        engine.withdrawCollateral(COLLATERAL_AMOUNT);
        assertEq(engine.s_userCollateral(user1), 0);
        vm.stopPrank();
    }

    function test_Checkpoint3_PreventWithdrawingMoreThanDeposited() public {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();

        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Engine__InsufficientCollateral()"))));
        engine.withdrawCollateral(COLLATERAL_AMOUNT * 2);
        vm.stopPrank();
    }

    // （Checkpoint 1 续：借款）

    function test_Checkpoint1_AllowWhenSufficientlyCollateralized() public {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();

        assertEq(myUSD.balanceOf(user1), 0);
        engine.mintMyUSD(BORROW_AMOUNT);
        assertEq(engine.s_userDebtShares(user1), BORROW_AMOUNT);
        assertEq(myUSD.balanceOf(user1), BORROW_AMOUNT);
        vm.stopPrank();
    }

    function test_Checkpoint1_PreventWhenInsufficientlyCollateralized() public {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();

        // 尝试借入抵押品价值的 100%（超过 150% 抵押率的限制）
        uint256 tooMuchBorrow = (oracle.getETHMyUSDPrice() * COLLATERAL_AMOUNT) / 1e18;
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Engine__UnsafePositionRatio()"))));
        engine.mintMyUSD(tooMuchBorrow);
        vm.stopPrank();
    }

    function test_Checkpoint1_EmitDebtSharesMintedEvent() public {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();

        vm.recordLogs();
        engine.mintMyUSD(BORROW_AMOUNT);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("DebtSharesMinted(address,uint256,uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "DebtSharesMinted event should be emitted");
        vm.stopPrank();
    }

    // ============================================================
    // Checkpoint 3: 偿还债务与提取抵押品
    // ============================================================

    function _setupBorrower() internal {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();
        engine.mintMyUSD(BORROW_AMOUNT);
        vm.stopPrank();
    }

    function test_Checkpoint3_AllowRepayingFullAmount() public {
        _setupBorrower();
        assertTrue(engine.s_userDebtShares(user1) > 0);

        vm.startPrank(user1);
        myUSD.approve(address(engine), BORROW_AMOUNT);
        engine.repayUpTo(BORROW_AMOUNT);
        assertEq(engine.s_userDebtShares(user1), 0);
        vm.stopPrank();
    }

    function test_Checkpoint3_AllowPartialRepayment() public {
        _setupBorrower();

        vm.startPrank(user1);
        myUSD.approve(address(engine), BORROW_AMOUNT / 2);
        engine.repayUpTo(BORROW_AMOUNT / 2);
        assertEq(engine.s_userDebtShares(user1), BORROW_AMOUNT / 2);
        vm.stopPrank();
    }

    function test_Checkpoint3_AllowRepayingMoreThanBorrowed() public {
        _setupBorrower();

        vm.startPrank(user1);
        myUSD.approve(address(engine), BORROW_AMOUNT * 2);
        // 通过用 ETH 兑换来获取更多 MyUSD
        dex.swap{ value: 10 ether }(10 ether);
        engine.repayUpTo(BORROW_AMOUNT * 2);
        assertEq(engine.s_userDebtShares(user1), 0);
        vm.stopPrank();
    }

    function test_Checkpoint3_EmitDebtSharesBurnedEvent() public {
        _setupBorrower();

        vm.startPrank(user1);
        myUSD.approve(address(engine), BORROW_AMOUNT);
        vm.recordLogs();
        engine.repayUpTo(BORROW_AMOUNT);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("DebtSharesBurned(address,uint256,uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "DebtSharesBurned event should be emitted");
        vm.stopPrank();
    }

    // ============================================================
    // Checkpoint 4: 清算
    // ============================================================

    function _setupLiquidation() internal returns (uint256 borrowedAmount) {
        // user1 存入 1 ETH 并借入接近上限的金额
        uint256 ethPrice = oracle.getETHMyUSDPrice();
        borrowedAmount = (ethPrice * 1000) / 1505; // 约为抵押品价值的 66%

        vm.prank(user1);
        engine.addCollateral{ value: 1 ether }();
        vm.prank(user1);
        engine.mintMyUSD(borrowedAmount);

        // 给 user2 足够的 MyUSD 用于清算
        uint256 liquidatorAmount = borrowedAmount * 10;
        engine.addCollateral{ value: 100 ether }();
        engine.mintMyUSD(liquidatorAmount);
        myUSD.transfer(user2, liquidatorAmount);

        vm.prank(user2);
        myUSD.approve(address(engine), liquidatorAmount);
    }

    function test_Checkpoint4_AllowWhenPositionUnsafe() public {
        _setupLiquidation();

        // 通过用 ETH 兑换 MyUSD 来压低 ETH 价格
        dex.swap{ value: 10 ether }(10 ether);

        assertTrue(engine.isLiquidatable(user1));

        uint256 beforeBalance = user2.balance;
        vm.prank(user2);
        engine.liquidate(user1);

        assertEq(engine.s_userDebtShares(user1), 0);
        assertTrue(user2.balance > beforeBalance);
    }

    function test_Checkpoint4_PreventOnSafePositions() public {
        _setupLiquidation();

        assertFalse(engine.isLiquidatable(user1));

        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Engine__NotLiquidatable()"))));
        engine.liquidate(user1);
    }

    function test_Checkpoint4_EmitEvent() public {
        _setupLiquidation();

        // 压低 ETH 价格
        dex.swap{ value: 10 ether }(10 ether);

        vm.prank(user2);
        vm.recordLogs();
        engine.liquidate(user1);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("Liquidation(address,address,uint256,uint256,uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "Liquidation event should be emitted");
    }

    // ============================================================
    // Checkpoint 5: 借款利率管理
    // ============================================================

    function test_Checkpoint5_AllowRateControllerToSet() public {
        rateController.setBorrowRate(500);
        assertEq(engine.borrowRate(), 500);
    }

    function test_Checkpoint5_EmitBorrowRateUpdatedEvent() public {
        vm.recordLogs();
        rateController.setBorrowRate(300);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("BorrowRateUpdated(uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "BorrowRateUpdated event should be emitted");
    }

    function test_Checkpoint5_PreventNonRateController() public {
        rateController.setBorrowRate(500);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Engine__NotRateController()"))));
        engine.setBorrowRate(500);
    }

    function test_Checkpoint5_PreventSettingBelowSavingsRate() public {
        rateController.setBorrowRate(400);
        rateController.setSavingsRate(300);

        vm.expectRevert();
        rateController.setBorrowRate(200);
    }

    function test_Checkpoint5_AllowSettingEqualToSavingsRate() public {
        rateController.setBorrowRate(400);
        rateController.setSavingsRate(300);
        rateController.setBorrowRate(300);
        assertEq(engine.borrowRate(), 300);
    }

    function test_Checkpoint5_AllowSettingAboveSavingsRate() public {
        rateController.setBorrowRate(300);
        rateController.setSavingsRate(300);
        rateController.setBorrowRate(500);
        assertEq(engine.borrowRate(), 500);
    }

    // ============================================================
    // Checkpoint 2: 利息累积与借款利率
    // ============================================================

    function test_Checkpoint2_NoAccrualWithZeroBorrowRate() public {
        _setupBorrower();
        uint256 initialDebt = engine.getCurrentDebtValue(user1);
        assertTrue(initialDebt > 0);

        vm.warp(block.timestamp + 365 days);
        uint256 finalDebt = engine.getCurrentDebtValue(user1);
        assertEq(finalDebt, initialDebt);
    }

    function test_Checkpoint2_AccrueCorrectlyOverOneYear() public {
        _setupBorrower();
        rateController.setBorrowRate(1000); // 10%
        uint256 initialDebt = engine.getCurrentDebtValue(user1);

        vm.warp(block.timestamp + 365 days);
        uint256 finalDebt = engine.getCurrentDebtValue(user1);
        uint256 expectedDebt = initialDebt + (initialDebt * 1000) / 10000;
        assertApproxEqAbs(finalDebt, expectedDebt, 0.001 ether);
    }

    function test_Checkpoint2_AccrueProportionallyOverPartialPeriod() public {
        _setupBorrower();
        rateController.setBorrowRate(1200); // 12%
        uint256 initialDebt = engine.getCurrentDebtValue(user1);

        vm.warp(block.timestamp + 182 days); // 约 6 个月
        uint256 finalDebt = engine.getCurrentDebtValue(user1);
        uint256 expectedDebt = initialDebt + (initialDebt * 1200 * 182) / (365 * 10000);
        assertApproxEqAbs(finalDebt, expectedDebt, 0.001 ether);
    }

    function test_Checkpoint2_HandleMultipleAccrualPeriods() public {
        _setupBorrower();
        rateController.setBorrowRate(500); // 5%
        uint256 initialDebt = engine.getCurrentDebtValue(user1);

        // 第一阶段：以 5% 计息 91 天
        vm.warp(block.timestamp + 91 days);
        uint256 midDebt = engine.getCurrentDebtValue(user1);
        uint256 expectedMid = initialDebt + (initialDebt * 500 * 91) / (365 * 10000);
        assertApproxEqAbs(midDebt, expectedMid, 0.001 ether);

        // 将利率改为 8%
        rateController.setBorrowRate(800);
        uint256 debtAfterRateChange = engine.getCurrentDebtValue(user1);

        // 第二阶段：再以 8% 计息 91 天
        vm.warp(block.timestamp + 91 days);
        uint256 finalDebt = engine.getCurrentDebtValue(user1);
        uint256 expectedFinal = debtAfterRateChange + (debtAfterRateChange * 800 * 91) / (365 * 10000);
        assertApproxEqAbs(finalDebt, expectedFinal, 0.001 ether);
    }

    // ============================================================
    // 储蓄利率管理
    // ============================================================

    function test_SavingsRate_AllowRateControllerToSet() public {
        rateController.setBorrowRate(400);
        rateController.setSavingsRate(300);
        assertEq(staking.savingsRate(), 300);
    }

    function test_SavingsRate_EmitSavingsRateUpdatedEvent() public {
        rateController.setBorrowRate(400);

        vm.recordLogs();
        rateController.setSavingsRate(250);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("SavingsRateUpdated(uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "SavingsRateUpdated event should be emitted");
    }

    function test_SavingsRate_PreventNonRateController() public {
        rateController.setBorrowRate(400);
        rateController.setSavingsRate(300);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Staking__NotRateController()"))));
        staking.setSavingsRate(300);
    }

    function test_SavingsRate_PreventSettingAboveBorrowRate() public {
        rateController.setBorrowRate(400);

        vm.expectRevert();
        rateController.setSavingsRate(500);
    }

    function test_SavingsRate_AllowSettingEqualToBorrowRate() public {
        rateController.setBorrowRate(400);
        rateController.setSavingsRate(400);
        assertEq(staking.savingsRate(), 400);
    }

    // ============================================================
    // 质押操作
    // ============================================================

    function _setupStaker() internal {
        vm.startPrank(user1);
        engine.addCollateral{ value: COLLATERAL_AMOUNT }();
        engine.mintMyUSD(BORROW_AMOUNT);
        vm.stopPrank();
        assertTrue(myUSD.balanceOf(user1) > 0);
    }

    function test_Staking_AllowStakingMyUSD() public {
        _setupStaker();

        vm.startPrank(user1);
        myUSD.approve(address(staking), 1000 ether);
        staking.stake(1000 ether);
        assertTrue(staking.userShares(user1) > 0);
        assertEq(staking.getBalance(user1), 1000 ether);
        vm.stopPrank();
    }

    function test_Staking_EmitStakedEvent() public {
        _setupStaker();

        vm.startPrank(user1);
        myUSD.approve(address(staking), 1000 ether);
        vm.recordLogs();
        staking.stake(1000 ether);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("Staked(address,uint256,uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "Staked event should be emitted");
        vm.stopPrank();
    }

    function test_Staking_PreventZeroAmount() public {
        _setupStaker();

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Staking__InvalidAmount()"))));
        staking.stake(0);
    }

    function test_Staking_PreventWithoutSufficientBalance() public {
        _setupStaker();

        vm.startPrank(user1);
        myUSD.approve(address(staking), 100_000 ether);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("MyUSD__InsufficientBalance()"))));
        staking.stake(100_000 ether);
        vm.stopPrank();
    }

    function test_Staking_PreventWithoutSufficientAllowance() public {
        _setupStaker();

        vm.startPrank(user1);
        myUSD.approve(address(staking), 500 ether);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("MyUSD__InsufficientAllowance()"))));
        staking.stake(1000 ether);
        vm.stopPrank();
    }

    function test_Staking_HandleMultipleStakes() public {
        _setupStaker();

        vm.startPrank(user1);
        myUSD.approve(address(staking), 1500 ether);
        staking.stake(1000 ether);
        assertEq(staking.getBalance(user1), 1000 ether);

        staking.stake(500 ether);
        assertEq(staking.getBalance(user1), 1500 ether);
        vm.stopPrank();
    }

    // ============================================================
    // 提取操作
    // ============================================================

    function _setupStakerWithStake() internal {
        _setupStaker();
        vm.startPrank(user1);
        myUSD.approve(address(staking), 1000 ether);
        staking.stake(1000 ether);
        vm.stopPrank();
    }

    function test_Withdrawal_AllowWithdrawingStakedTokens() public {
        _setupStakerWithStake();
        uint256 initialBalance = myUSD.balanceOf(user1);

        vm.prank(user1);
        staking.withdraw();

        assertEq(staking.userShares(user1), 0);
        assertTrue(myUSD.balanceOf(user1) > initialBalance);
    }

    function test_Withdrawal_EmitWithdrawnEvent() public {
        _setupStakerWithStake();

        vm.prank(user1);
        vm.recordLogs();
        staking.withdraw();

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("Withdrawn(address,uint256,uint256)")) {
                found = true;
            }
        }
        assertTrue(found, "Withdrawn event should be emitted");
    }

    function test_Withdrawal_PreventWithNoBalance() public {
        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("Staking__InsufficientBalance()"))));
        staking.withdraw();
    }

    function test_Withdrawal_HandlePartialTimeNoInterest() public {
        _setupStakerWithStake();

        vm.warp(block.timestamp + 30 days);
        assertEq(staking.getBalance(user1), 1000 ether); // 利率为 0% 时不产生利息

        vm.prank(user1);
        staking.withdraw();
        assertEq(staking.userShares(user1), 0);
    }

    // ============================================================
    // 储蓄利息累积
    // ============================================================

    function test_SavingsInterest_NoAccrualWithZeroRate() public {
        _setupStakerWithStake();
        uint256 initialBalance = staking.getBalance(user1);

        vm.warp(block.timestamp + 365 days);
        assertEq(staking.getBalance(user1), initialBalance);
    }

    function test_SavingsInterest_AccrueCorrectlyOverOneYear() public {
        _setupStakerWithStake();
        rateController.setBorrowRate(1000);
        rateController.setSavingsRate(800); // 8%
        uint256 initialBalance = staking.getBalance(user1);

        vm.warp(block.timestamp + 365 days);
        uint256 finalBalance = staking.getBalance(user1);
        uint256 expectedBalance = initialBalance + (initialBalance * 800) / 10000;
        assertApproxEqAbs(finalBalance, expectedBalance, 0.001 ether);
    }

    function test_SavingsInterest_AccrueProportionallyOverPartialPeriod() public {
        _setupStakerWithStake();
        rateController.setBorrowRate(1200);
        rateController.setSavingsRate(900); // 9%
        uint256 initialBalance = staking.getBalance(user1);

        vm.warp(block.timestamp + 182 days);
        uint256 finalBalance = staking.getBalance(user1);
        uint256 expectedBalance = initialBalance + (initialBalance * 900 * 182) / (365 * 10000);
        assertApproxEqAbs(finalBalance, expectedBalance, 0.001 ether);
    }

    function test_SavingsInterest_HandleMultipleAccrualPeriods() public {
        _setupStakerWithStake();
        rateController.setBorrowRate(600);
        rateController.setSavingsRate(400); // 4%
        uint256 initialBalance = staking.getBalance(user1);

        // 第一阶段：以 4% 计息 91 天
        vm.warp(block.timestamp + 91 days);
        uint256 midBalance = staking.getBalance(user1);
        uint256 expectedMid = initialBalance + (initialBalance * 400 * 91) / (365 * 10000);
        assertApproxEqAbs(midBalance, expectedMid, 0.001 ether);

        // 修改利率
        rateController.setBorrowRate(1000);
        rateController.setSavingsRate(700); // 7%
        uint256 balanceAfterRateChange = staking.getBalance(user1);

        // 第二阶段：再以 7% 计息 91 天
        vm.warp(block.timestamp + 91 days);
        uint256 finalBalance = staking.getBalance(user1);
        uint256 expectedFinal = balanceAfterRateChange + (balanceAfterRateChange * 700 * 91) / (365 * 10000);
        assertApproxEqAbs(finalBalance, expectedFinal, 0.001 ether);
    }

    receive() external payable { }
}
