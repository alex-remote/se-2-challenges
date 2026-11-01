// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/PredictionMarket.sol";
import "../contracts/IPredictionMarket.sol";
import "../contracts/PredictionMarketToken.sol";

contract PredictionMarketTest is Test {
    IPredictionMarket public predictionMarket;
    PredictionMarketToken public yesToken;
    PredictionMarketToken public noToken;

    address public owner;
    address public oracle;
    address public buyer;
    address public seller;
    address public redeemer;

    uint256 constant PRECISION = 1e18;
    uint256 constant INITIAL_LIQUIDITY = 10 ether;
    uint256 constant INITIAL_TOKEN_VALUE = 1 ether;
    uint8 constant INITIAL_PROBABILITY = 50;
    uint8 constant PERCENTAGE_LOCKED = 20;

    function setUp() public {
        owner = makeAddr("owner");
        oracle = makeAddr("oracle");
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        redeemer = makeAddr("redeemer");

        vm.deal(owner, 100 ether);
        vm.deal(buyer, 100 ether);
        vm.deal(seller, 100 ether);
        vm.deal(redeemer, 100 ether);

        vm.prank(owner);
        predictionMarket = IPredictionMarket(address(new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner,
            oracle,
            "Test Question",
            INITIAL_TOKEN_VALUE,
            INITIAL_PROBABILITY,
            PERCENTAGE_LOCKED
        )));

        // 允许 i_yesToken/i_noToken 选择器不存在，这样在学习者实现 Checkpoint 3 之前，
        // Checkpoint 2 的测试也能运行。
        (bool yesOk, bytes memory yesData) =
            address(predictionMarket).staticcall(abi.encodeWithSignature("i_yesToken()"));
        (bool noOk, bytes memory noData) =
            address(predictionMarket).staticcall(abi.encodeWithSignature("i_noToken()"));
        if (yesOk && yesData.length == 32) yesToken = PredictionMarketToken(abi.decode(yesData, (address)));
        if (noOk && noData.length == 32) noToken = PredictionMarketToken(abi.decode(noData, (address)));
    }

    // ============================================================
    // CHECKPOINT 2: 构造函数校验
    // ============================================================

    function test_Checkpoint2_RevertWhenNoETHProvided() public {
        vm.expectRevert(IPredictionMarket.PredictionMarket__MustProvideETHForInitialLiquidity.selector);
        vm.prank(owner);
        new PredictionMarket{value: 0}(
            owner, oracle, "Test Question", INITIAL_TOKEN_VALUE, INITIAL_PROBABILITY, PERCENTAGE_LOCKED
        );
    }

    function test_Checkpoint2_RevertWhenInvalidProbability() public {
        // 概率为 0
        vm.expectRevert(IPredictionMarket.PredictionMarket__InvalidProbability.selector);
        vm.prank(owner);
        new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner, oracle, "Test Question", INITIAL_TOKEN_VALUE, 0, PERCENTAGE_LOCKED
        );

        // 概率为 100
        vm.expectRevert(IPredictionMarket.PredictionMarket__InvalidProbability.selector);
        vm.prank(owner);
        new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner, oracle, "Test Question", INITIAL_TOKEN_VALUE, 100, PERCENTAGE_LOCKED
        );
    }

    function test_Checkpoint2_RevertWhenInvalidPercentageToLock() public {
        // percentageToLock 为 0
        vm.expectRevert(IPredictionMarket.PredictionMarket__InvalidPercentageToLock.selector);
        vm.prank(owner);
        new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner, oracle, "Test Question", INITIAL_TOKEN_VALUE, INITIAL_PROBABILITY, 0
        );

        // percentageToLock 为 100
        vm.expectRevert(IPredictionMarket.PredictionMarket__InvalidPercentageToLock.selector);
        vm.prank(owner);
        new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner, oracle, "Test Question", INITIAL_TOKEN_VALUE, INITIAL_PROBABILITY, 100
        );
    }

    function test_Checkpoint2_SetsCorrectStateVariables() public {
        string memory question = "Will the green car win the race?";
        uint256 tokenValue = 0.01 ether;
        uint8 probability = 60;
        uint8 pctLocked = 10;
        uint256 liquidity = 1 ether;

        vm.prank(owner);
        IPredictionMarket pm = IPredictionMarket(address(new PredictionMarket{value: liquidity}(
            owner, oracle, question, tokenValue, probability, pctLocked
        )));

        assertEq(pm.i_oracle(), oracle);
        assertEq(pm.s_question(), question);
        assertEq(pm.i_initialTokenValue(), tokenValue);
        assertEq(pm.i_initialYesProbability(), probability);
        assertEq(pm.i_percentageLocked(), pctLocked);
        assertEq(pm.s_ethCollateral(), liquidity);
    }

    // ============================================================
    // CHECKPOINT 3: 代币部署与锁定
    // ============================================================

    function test_Checkpoint3_CorrectInitialTokenAmounts() public {
        string memory question = "Will the green car win the race?";
        uint256 tokenValue = 0.01 ether;
        uint8 probability = 60;
        uint8 pctLocked = 10;
        uint256 liquidity = 1 ether;

        vm.prank(owner);
        IPredictionMarket pm = IPredictionMarket(address(new PredictionMarket{value: liquidity}(
            owner, oracle, question, tokenValue, probability, pctLocked
        )));

        PredictionMarketToken yt = PredictionMarketToken(pm.i_yesToken());
        PredictionMarketToken nt = PredictionMarketToken(pm.i_noToken());

        uint256 initialTokenAmount = (liquidity * PRECISION) / tokenValue; // 100 个代币

        assertEq(yt.totalSupply(), initialTokenAmount);
        assertEq(nt.totalSupply(), initialTokenAmount);
    }

    function test_Checkpoint3_CorrectLockedTokenTransfers() public {
        string memory question = "Will the green car win the race?";
        uint256 tokenValue = 0.01 ether;
        uint8 probability = 60;
        uint8 pctLocked = 10;
        uint256 liquidity = 1 ether;

        vm.prank(owner);
        IPredictionMarket pm = IPredictionMarket(address(new PredictionMarket{value: liquidity}(
            owner, oracle, question, tokenValue, probability, pctLocked
        )));

        PredictionMarketToken yt = PredictionMarketToken(pm.i_yesToken());
        PredictionMarketToken nt = PredictionMarketToken(pm.i_noToken());

        uint256 initialTokenAmount = (liquidity * PRECISION) / tokenValue;
        uint256 initialYesAmountLocked = (initialTokenAmount * uint256(probability) * uint256(pctLocked) * 2) / 10000;
        uint256 initialNoAmountLocked = (initialTokenAmount * uint256(100 - probability) * uint256(pctLocked) * 2) / 10000;

        assertEq(yt.balanceOf(owner), initialYesAmountLocked);
        assertEq(nt.balanceOf(owner), initialNoAmountLocked);
    }

    // ============================================================
    // CHECKPOINT 4: 流动性管理
    // ============================================================

    function test_Checkpoint4_AddLiquidity() public {
        uint256 initialEthCollateral = predictionMarket.s_ethCollateral();
        uint256 liquidityToAdd = 5 ether;
        uint256 expectedTokenAmount = (liquidityToAdd * PRECISION) / INITIAL_TOKEN_VALUE;

        uint256 initialYesBalance = yesToken.balanceOf(address(predictionMarket));
        uint256 initialNoBalance = noToken.balanceOf(address(predictionMarket));

        vm.prank(owner);
        predictionMarket.addLiquidity{value: liquidityToAdd}();

        assertEq(predictionMarket.s_ethCollateral(), initialEthCollateral + liquidityToAdd);
        assertEq(yesToken.balanceOf(address(predictionMarket)), initialYesBalance + expectedTokenAmount);
        assertEq(noToken.balanceOf(address(predictionMarket)), initialNoBalance + expectedTokenAmount);
    }

    function test_Checkpoint4_RevertRemoveTooMuchLiquidity() public {
        uint256 ethToRemove = 11 ether; // 超过可用的 10 ETH

        vm.prank(owner);
        vm.expectRevert();
        predictionMarket.removeLiquidity(ethToRemove);
    }

    function test_Checkpoint4_RemoveLiquidity() public {
        uint256 initialEthCollateral = predictionMarket.s_ethCollateral();
        uint256 ethToRemove = 5 ether;
        uint256 expectedTokenAmount = (ethToRemove * PRECISION) / INITIAL_TOKEN_VALUE;

        uint256 initialYesBalance = yesToken.balanceOf(address(predictionMarket));
        uint256 initialNoBalance = noToken.balanceOf(address(predictionMarket));

        vm.prank(owner);
        predictionMarket.removeLiquidity(ethToRemove);

        assertEq(predictionMarket.s_ethCollateral(), initialEthCollateral - ethToRemove);
        assertEq(yesToken.balanceOf(address(predictionMarket)), initialYesBalance - expectedTokenAmount);
        assertEq(noToken.balanceOf(address(predictionMarket)), initialNoBalance - expectedTokenAmount);
    }

    function test_Checkpoint4_EmitsLiquidityEvents() public {
        uint256 liquidityToAdd = 5 ether;
        uint256 expectedTokenAmount = (liquidityToAdd * PRECISION) / INITIAL_TOKEN_VALUE;

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.LiquidityAdded(owner, liquidityToAdd, expectedTokenAmount);
        predictionMarket.addLiquidity{value: liquidityToAdd}();

        uint256 ethToRemove = 3 ether;
        uint256 expectedRemoveTokenAmount = (ethToRemove * PRECISION) / INITIAL_TOKEN_VALUE;

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.LiquidityRemoved(owner, ethToRemove, expectedRemoveTokenAmount);
        predictionMarket.removeLiquidity(ethToRemove);
    }

    // ============================================================
    // CHECKPOINT 5: 预言机报告
    // ============================================================

    function test_Checkpoint5_RevertAddLiquidityAfterReport() public {
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(owner);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionAlreadyReported.selector);
        predictionMarket.addLiquidity{value: 1 ether}();
    }

    function test_Checkpoint5_RevertRemoveLiquidityAfterReport() public {
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(owner);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionAlreadyReported.selector);
        predictionMarket.removeLiquidity(1 ether);
    }

    function test_Checkpoint5_RevertDoubleReport() public {
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(oracle);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionAlreadyReported.selector);
        predictionMarket.report(IPredictionMarket.Outcome.YES);
    }

    function test_Checkpoint5_RevertNonOracleReport() public {
        address nonOracle = makeAddr("nonOracle");

        vm.prank(nonOracle);
        vm.expectRevert(IPredictionMarket.PredictionMarket__OnlyOracleCanReport.selector);
        predictionMarket.report(IPredictionMarket.Outcome.YES);
    }

    function test_Checkpoint5_SetsWinningTokenAndIsReported() public {
        assertEq(predictionMarket.s_isReported(), false);

        // 报告 YES
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        assertEq(predictionMarket.s_isReported(), true);
        assertEq(predictionMarket.s_winningToken(), address(yesToken));

        // 为 NO 的测试部署新实例
        vm.prank(owner);
        IPredictionMarket pm2 = IPredictionMarket(address(new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner, oracle, "Test Question 2", INITIAL_TOKEN_VALUE, INITIAL_PROBABILITY, PERCENTAGE_LOCKED
        )));

        assertEq(pm2.s_isReported(), false);

        vm.prank(oracle);
        pm2.report(IPredictionMarket.Outcome.NO);

        assertEq(pm2.s_isReported(), true);
        assertEq(pm2.s_winningToken(), pm2.i_noToken());
    }

    function test_Checkpoint5_EmitsMarketReportedEvent() public {
        vm.prank(oracle);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.MarketReported(oracle, IPredictionMarket.Outcome.YES, address(yesToken));
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        // 为 NO 的事件测试部署新实例
        vm.prank(owner);
        IPredictionMarket pm2 = IPredictionMarket(address(new PredictionMarket{value: INITIAL_LIQUIDITY}(
            owner, oracle, "Test Question 2", INITIAL_TOKEN_VALUE, INITIAL_PROBABILITY, PERCENTAGE_LOCKED
        )));

        // 把代币读取提前到 vm.prank 之前——如果内联调用 pm2.i_noToken()，会消耗掉这次 prank。
        address pm2NoToken = pm2.i_noToken();
        vm.prank(oracle);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.MarketReported(oracle, IPredictionMarket.Outcome.NO, pm2NoToken);
        pm2.report(IPredictionMarket.Outcome.NO);
    }

    // ============================================================
    // CHECKPOINT 6: 市场结算
    // ============================================================

    function test_Checkpoint6_RevertResolveBeforeReport() public {
        vm.prank(owner);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionNotReported.selector);
        predictionMarket.resolveMarketAndWithdraw();
    }

    function test_Checkpoint6_ResolveMarketAndWithdraw() public {
        uint256 initialOwnerBalance = owner.balance;
        uint256 initialContractBalance = address(predictionMarket).balance;

        // 报告 YES
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        // 计算预期金额
        uint256 contractWinningTokens = yesToken.balanceOf(address(predictionMarket));
        uint256 lpTradingRevenue = predictionMarket.s_lpTradingRevenue();
        uint256 ethFromTokens = (contractWinningTokens * INITIAL_TOKEN_VALUE) / PRECISION;
        uint256 expectedTotalEth = ethFromTokens + lpTradingRevenue;

        // 非所有者不能结算
        address nonOwner = makeAddr("nonOwner");
        vm.prank(nonOwner);
        vm.expectRevert();
        predictionMarket.resolveMarketAndWithdraw();

        // 所有者结算
        vm.prank(owner);
        predictionMarket.resolveMarketAndWithdraw();

        // 验证获胜代币已被销毁
        assertEq(yesToken.balanceOf(address(predictionMarket)), 0);

        // 验证 ETH 已转出
        uint256 finalOwnerBalance = owner.balance;
        uint256 finalContractBalance = address(predictionMarket).balance;
        assertEq(finalOwnerBalance - initialOwnerBalance, expectedTotalEth);
        assertEq(finalContractBalance, initialContractBalance - expectedTotalEth);
    }

    function test_Checkpoint6_SendsExactETHAmount() public {
        uint256 initialOwnerBalance = owner.balance;
        uint256 initialContractBalance = address(predictionMarket).balance;
        uint256 lpTradingRevenue = predictionMarket.s_lpTradingRevenue();

        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        uint256 contractWinningTokens = yesToken.balanceOf(address(predictionMarket));
        uint256 ethFromTokens = (contractWinningTokens * INITIAL_TOKEN_VALUE) / PRECISION;
        uint256 expectedTotalEth = ethFromTokens + lpTradingRevenue;

        vm.prank(owner);
        predictionMarket.resolveMarketAndWithdraw();

        assertEq(owner.balance - initialOwnerBalance, expectedTotalEth);
        assertEq(address(predictionMarket).balance, initialContractBalance - expectedTotalEth);
    }

    // ============================================================
    // CHECKPOINT 7: 价格计算
    // ============================================================

    function test_Checkpoint7_CalculateBuyPrice() public {
        uint256 initialTokenAmount = (INITIAL_LIQUIDITY * PRECISION) / INITIAL_TOKEN_VALUE;
        uint256 tradingAmount = initialTokenAmount / 10;

        uint256 buyPrice = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, tradingAmount);

        // 计算预期价格
        uint256 currentTokenSoldBefore = initialTokenAmount - yesToken.balanceOf(address(predictionMarket));
        uint256 currentOtherTokenSold = initialTokenAmount - noToken.balanceOf(address(predictionMarket));
        uint256 totalTokensSoldBefore = currentTokenSoldBefore + currentOtherTokenSold;
        uint256 probabilityBefore = (currentTokenSoldBefore * PRECISION) / totalTokensSoldBefore;

        uint256 currentTokenReserveAfter = yesToken.balanceOf(address(predictionMarket)) - tradingAmount;
        uint256 currentTokenSoldAfter = initialTokenAmount - currentTokenReserveAfter;
        uint256 totalTokensSoldAfter = totalTokensSoldBefore + tradingAmount;
        uint256 probabilityAfter = (currentTokenSoldAfter * PRECISION) / totalTokensSoldAfter;

        uint256 probabilityAvg = (probabilityBefore + probabilityAfter) / 2;
        uint256 expectedPrice = (INITIAL_TOKEN_VALUE * probabilityAvg * tradingAmount) / (PRECISION * PRECISION);

        assertEq(buyPrice, expectedPrice);
    }

    function test_Checkpoint7_CalculateSellPrice() public {
        uint256 initialTokenAmount = (INITIAL_LIQUIDITY * PRECISION) / INITIAL_TOKEN_VALUE;
        uint256 tradingAmount = initialTokenAmount / 10;

        uint256 sellPrice = predictionMarket.getSellPriceInEth(IPredictionMarket.Outcome.YES, tradingAmount);

        // 计算预期价格
        uint256 currentTokenSoldBefore = initialTokenAmount - yesToken.balanceOf(address(predictionMarket));
        uint256 currentOtherTokenSold = initialTokenAmount - noToken.balanceOf(address(predictionMarket));
        uint256 totalTokensSoldBefore = currentTokenSoldBefore + currentOtherTokenSold;
        uint256 probabilityBefore = (currentTokenSoldBefore * PRECISION) / totalTokensSoldBefore;

        uint256 currentTokenReserveAfter = yesToken.balanceOf(address(predictionMarket)) + tradingAmount;
        uint256 currentTokenSoldAfter = initialTokenAmount - currentTokenReserveAfter;
        uint256 totalTokensSoldAfter = totalTokensSoldBefore - tradingAmount;
        uint256 probabilityAfter = (currentTokenSoldAfter * PRECISION) / totalTokensSoldAfter;

        uint256 probabilityAvg = (probabilityBefore + probabilityAfter) / 2;
        uint256 expectedPrice = (INITIAL_TOKEN_VALUE * probabilityAvg * tradingAmount) / (PRECISION * PRECISION);

        assertEq(sellPrice, expectedPrice);
    }

    function test_Checkpoint7_RevertBuyMoreThanReserve() public {
        uint256 reserveAmount = yesToken.balanceOf(address(predictionMarket));
        uint256 tooMany = reserveAmount + 1;

        vm.expectRevert(IPredictionMarket.PredictionMarket__InsufficientLiquidity.selector);
        predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, tooMany);
    }

    function test_Checkpoint7_ProbabilityWithLiquidityChanges() public {
        // 使用实时的 totalSupply() 作为“已售代币”的基准。若使用固定的 initialTokenAmount，
        // 在 addLiquidity 增加供应量后会发生下溢（JS 的 BigInt 通过有符号运算掩盖了这一问题）。

        // 添加流动性——概率应保持 50%
        vm.prank(owner);
        predictionMarket.addLiquidity{value: 10 ether}();

        uint256 currentTokenSold = yesToken.totalSupply() - yesToken.balanceOf(address(predictionMarket));
        uint256 totalTokensSold = currentTokenSold + (noToken.totalSupply() - noToken.balanceOf(address(predictionMarket)));
        uint256 probability = (currentTokenSold * PRECISION) / totalTokensSold;
        assertEq(probability, PRECISION / 2);

        // 再添加更多流动性——仍为 50%
        vm.prank(owner);
        predictionMarket.addLiquidity{value: 20 ether}();

        currentTokenSold = yesToken.totalSupply() - yesToken.balanceOf(address(predictionMarket));
        totalTokensSold = currentTokenSold + (noToken.totalSupply() - noToken.balanceOf(address(predictionMarket)));
        probability = (currentTokenSold * PRECISION) / totalTokensSold;
        assertEq(probability, PRECISION / 2);
    }

    function test_Checkpoint7_GetCurrentReserves() public {
        uint256 initialYesReserve = yesToken.balanceOf(address(predictionMarket));
        uint256 initialNoReserve = noToken.balanceOf(address(predictionMarket));

        // 用少量代币测试价格计算
        uint256 smallAmount = 1e15;
        uint256 yesPrice = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, smallAmount);
        uint256 noPrice = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.NO, smallAmount);
        assertGt(yesPrice, 0);
        assertGt(noPrice, 0);

        // 添加流动性
        vm.prank(owner);
        predictionMarket.addLiquidity{value: 5 ether}();

        uint256 newYesReserve = yesToken.balanceOf(address(predictionMarket));
        uint256 newNoReserve = noToken.balanceOf(address(predictionMarket));

        assertGt(newYesReserve, initialYesReserve);
        assertGt(newNoReserve, initialNoReserve);
        assertEq(newYesReserve, newNoReserve);

        // 价格仍然有效
        uint256 yesPriceAfter = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, smallAmount);
        uint256 noPriceAfter = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.NO, smallAmount);
        assertGt(yesPriceAfter, 0);
        assertGt(noPriceAfter, 0);
    }

    function test_Checkpoint7_ProbabilityEdgeCases() public {
        // 这些是纯数学检查，与 hardhat 测试的写法一致
        uint256 initialTokenAmount = (INITIAL_LIQUIDITY * PRECISION) / INITIAL_TOKEN_VALUE;

        // 售出的代币极少
        uint256 prob1 = (uint256(1) * PRECISION) / uint256(2);
        assertEq(prob1, PRECISION / 2);

        // 几乎所有代币都已售出
        uint256 prob2 = ((initialTokenAmount - 1) * PRECISION) / (initialTokenAmount * 2 - 2);
        assertEq(prob2, PRECISION / 2);

        // 不均衡：YES 售出量占总量的一半
        uint256 prob3 = ((initialTokenAmount / 2) * PRECISION) / initialTokenAmount;
        assertEq(prob3, PRECISION / 2);

        // 不均衡：YES 售出量占总量的四分之一
        uint256 prob4 = ((initialTokenAmount / 4) * PRECISION) / initialTokenAmount;
        assertEq(prob4, PRECISION / 4);
    }

    // ============================================================
    // CHECKPOINT 8: 买入/卖出代币
    // ============================================================

    function test_Checkpoint8_RevertBuyZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__AmountMustBeGreaterThanZero.selector);
        predictionMarket.buyTokensWithETH{value: 1 ether}(IPredictionMarket.Outcome.YES, 0);
    }

    function test_Checkpoint8_RevertSellZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__AmountMustBeGreaterThanZero.selector);
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, 0);
    }

    function test_Checkpoint8_RevertBuyWithIncorrectETH() public {
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        vm.prank(buyer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__MustSendExactETHAmount.selector);
        predictionMarket.buyTokensWithETH{value: requiredEth + 1}(IPredictionMarket.Outcome.YES, amountToBuy);
    }

    function test_Checkpoint8_BuyTokens() public {
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        uint256 initialBuyerTokens = yesToken.balanceOf(buyer);
        uint256 initialContractBalance = address(predictionMarket).balance;

        vm.prank(buyer);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        assertEq(yesToken.balanceOf(buyer), initialBuyerTokens + amountToBuy);
        assertEq(address(predictionMarket).balance, initialContractBalance + requiredEth);
    }

    function test_Checkpoint8_SellTokens() public {
        // 先买入一些代币
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);
        vm.prank(seller);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 授权代币
        vm.prank(seller);
        yesToken.approve(address(predictionMarket), amountToBuy);

        uint256 initialSellerBalance = seller.balance;
        uint256 initialContractBalance = address(predictionMarket).balance;
        uint256 initialSellerTokens = yesToken.balanceOf(seller);

        uint256 ethToReceive = predictionMarket.getSellPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        vm.prank(seller);
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, amountToBuy);

        assertEq(yesToken.balanceOf(seller), initialSellerTokens - amountToBuy);
        assertEq(seller.balance - initialSellerBalance, ethToReceive);
        assertEq(address(predictionMarket).balance, initialContractBalance - ethToReceive);
    }

    function test_Checkpoint8_RevertSellMoreThanOwned() public {
        // 买入一些代币
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);
        vm.prank(seller);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 授权
        vm.prank(seller);
        yesToken.approve(address(predictionMarket), amountToBuy + 1);

        // 尝试卖出超过持有量的代币
        vm.prank(seller);
        vm.expectRevert(
            abi.encodeWithSelector(
                IPredictionMarket.PredictionMarket__InsufficientBalance.selector,
                amountToBuy + 1,
                amountToBuy
            )
        );
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, amountToBuy + 1);
    }

    function test_Checkpoint8_RevertSellWithoutApproval() public {
        // 买入一些代币
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);
        vm.prank(seller);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 尝试在未授权的情况下卖出
        vm.prank(seller);
        vm.expectRevert(
            abi.encodeWithSelector(
                IPredictionMarket.PredictionMarket__InsufficientAllowance.selector,
                amountToBuy,
                0
            )
        );
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, amountToBuy);
    }

    function test_Checkpoint8_EmitsBuySellEvents() public {
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        // 买入并检查事件
        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.TokensPurchased(buyer, IPredictionMarket.Outcome.YES, amountToBuy, requiredEth);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 为卖出进行授权
        vm.prank(buyer);
        yesToken.approve(address(predictionMarket), amountToBuy);

        uint256 ethToReceive = predictionMarket.getSellPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        // 卖出并检查事件
        vm.prank(buyer);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.TokensSold(buyer, IPredictionMarket.Outcome.YES, amountToBuy, ethToReceive);
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, amountToBuy);
    }

    function test_Checkpoint8_RevertBuyAfterReport() public {
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(buyer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionAlreadyReported.selector);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);
    }

    function test_Checkpoint8_RevertSellAfterReport() public {
        // 先买入
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);
        vm.prank(seller);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 授权
        vm.prank(seller);
        yesToken.approve(address(predictionMarket), amountToBuy);

        // 报告
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        // 尝试卖出
        vm.prank(seller);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionAlreadyReported.selector);
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, amountToBuy);
    }

    function test_Checkpoint8_OwnerCannotBuyOrSell() public {
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);

        // 所有者尝试买入
        vm.prank(owner);
        vm.expectRevert(IPredictionMarket.PredictionMarket__OwnerCannotCall.selector);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 所有者尝试卖出
        vm.prank(owner);
        vm.expectRevert(IPredictionMarket.PredictionMarket__OwnerCannotCall.selector);
        predictionMarket.sellTokensForEth(IPredictionMarket.Outcome.YES, amountToBuy);
    }

    // ============================================================
    // CHECKPOINT 9: 代币赎回
    // ============================================================

    function test_Checkpoint9_RevertRedeemBeforeReport() public {
        vm.prank(redeemer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__PredictionNotReported.selector);
        predictionMarket.redeemWinningTokens(1 ether);
    }

    function test_Checkpoint9_RevertRedeemMoreThanOwned() public {
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(redeemer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__InsufficientWinningTokens.selector);
        predictionMarket.redeemWinningTokens(1 ether);
    }

    function test_Checkpoint9_RevertRedeemZero() public {
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(redeemer);
        vm.expectRevert(IPredictionMarket.PredictionMarket__AmountMustBeGreaterThanZero.selector);
        predictionMarket.redeemWinningTokens(0);
    }

    function test_Checkpoint9_RedeemWinningTokens() public {
        // 买入 YES 代币
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);
        vm.prank(redeemer);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 报告 YES 获胜
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        uint256 initialRedeemerBalance = redeemer.balance;
        uint256 initialContractBalance = address(predictionMarket).balance;
        uint256 initialRedeemerTokens = yesToken.balanceOf(redeemer);
        uint256 expectedEth = (amountToBuy * INITIAL_TOKEN_VALUE) / PRECISION;

        // 赎回
        vm.prank(redeemer);
        predictionMarket.redeemWinningTokens(amountToBuy);

        assertEq(yesToken.balanceOf(redeemer), initialRedeemerTokens - amountToBuy);
        assertEq(redeemer.balance - initialRedeemerBalance, expectedEth);
        assertEq(address(predictionMarket).balance, initialContractBalance - expectedEth);
    }

    function test_Checkpoint9_EmitsRedeemEvent() public {
        // 买入 YES 代币
        uint256 amountToBuy = yesToken.balanceOf(address(predictionMarket)) / 10;
        uint256 requiredEth = predictionMarket.getBuyPriceInEth(IPredictionMarket.Outcome.YES, amountToBuy);
        vm.prank(redeemer);
        predictionMarket.buyTokensWithETH{value: requiredEth}(IPredictionMarket.Outcome.YES, amountToBuy);

        // 报告 YES 获胜
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        uint256 expectedEth = (amountToBuy * INITIAL_TOKEN_VALUE) / PRECISION;

        vm.prank(redeemer);
        vm.expectEmit(true, false, false, true);
        emit IPredictionMarket.WinningTokensRedeemed(redeemer, amountToBuy, expectedEth);
        predictionMarket.redeemWinningTokens(amountToBuy);
    }

    function test_Checkpoint9_OwnerCannotRedeem() public {
        vm.prank(oracle);
        predictionMarket.report(IPredictionMarket.Outcome.YES);

        vm.prank(owner);
        vm.expectRevert(IPredictionMarket.PredictionMarket__OwnerCannotCall.selector);
        predictionMarket.redeemWinningTokens(1 ether);
    }
}
