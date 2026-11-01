//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {PredictionMarketToken} from "./PredictionMarketToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PredictionMarket is Ownable {
    /////////////////
    /// 错误 //////
    /////////////////

    error PredictionMarket__MustProvideETHForInitialLiquidity();
    error PredictionMarket__InvalidProbability();
    error PredictionMarket__PredictionAlreadyReported();
    error PredictionMarket__OnlyOracleCanReport();
    error PredictionMarket__OwnerCannotCall();
    error PredictionMarket__PredictionNotReported();
    error PredictionMarket__InsufficientWinningTokens();
    error PredictionMarket__AmountMustBeGreaterThanZero();
    error PredictionMarket__MustSendExactETHAmount();
    error PredictionMarket__InsufficientTokenReserve(Outcome _outcome, uint256 _amountToken);
    error PredictionMarket__TokenTransferFailed();
    error PredictionMarket__ETHTransferFailed();
    error PredictionMarket__InsufficientBalance(uint256 _tradingAmount, uint256 _userBalance);
    error PredictionMarket__InsufficientAllowance(uint256 _tradingAmount, uint256 _allowance);
    error PredictionMarket__InsufficientLiquidity();
    error PredictionMarket__InvalidPercentageToLock();

    //////////////////////////
    /// 状态变量 //////
    //////////////////////////

    enum Outcome {
        YES,
        NO
    }

    uint256 private constant PRECISION = 1e18;

    /// Checkpoint 2 ///

    /// Checkpoint 3 ///

    /// Checkpoint 5 ///

    /////////////////////////
    /// 事件 //////
    /////////////////////////

    event TokensPurchased(address indexed buyer, Outcome outcome, uint256 amount, uint256 ethAmount);
    event TokensSold(address indexed seller, Outcome outcome, uint256 amount, uint256 ethAmount);
    event WinningTokensRedeemed(address indexed redeemer, uint256 amount, uint256 ethAmount);
    event MarketReported(address indexed oracle, Outcome winningOutcome, address winningToken);
    event MarketResolved(address indexed resolver, uint256 totalEthToSend);
    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokensAmount);
    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokensAmount);

    /////////////////
    /// 修饰器 ///
    /////////////////

    /// Checkpoint 5 ///

    /// Checkpoint 6 ///

    /// Checkpoint 8 ///

    //////////////////
    ////构造函数///
    //////////////////

    constructor(
        address _liquidityProvider,
        address _oracle,
        string memory _question,
        uint256 _initialTokenValue,
        uint8 _initialYesProbability,
        uint8 _percentageToLock
    ) payable Ownable(_liquidityProvider) {
        /// Checkpoint 2 ////
        /// Checkpoint 3 ////
    }

    /////////////////
    /// 函数 ///
    /////////////////

    /**
     * @notice 向预测市场添加流动性并铸造代币
     * @dev 只有所有者可以添加流动性，且仅限预测结果尚未报告时
     */
    function addLiquidity() external payable onlyOwner {
        //// Checkpoint 4 ////
    }

    /**
     * @notice 从预测市场移除流动性并销毁相应的代币；如果你在预测结束前移除流动性，将得不到 lpReserve 的任何份额
     * @dev 只有所有者可以移除流动性，且仅限预测结果尚未报告时
     * @param _ethToWithdraw 要从流动性池中提取的 ETH 数量
     */
    function removeLiquidity(uint256 _ethToWithdraw) external onlyOwner {
        //// Checkpoint 4 ////
    }

    /**
     * @notice 报告该预测的获胜结果
     * @dev 只有预言机可以报告获胜结果，且仅限预测结果尚未报告时
     * @param _winningOutcome 获胜结果（YES 或 NO）
     */
    function report(Outcome _winningOutcome) external {
        //// Checkpoint 5 ////
    }

    /**
     * @notice 预测结算后，合约所有者可以赎回合约持有的获胜代币，并从合约中取回 ETH，包括 LP 收益和抵押品
     * @dev 只能由所有者调用，且仅限预测已结算时
     * @return ethRedeemed 赎回的 ETH 数量
     */
    function resolveMarketAndWithdraw() external onlyOwner returns (uint256 ethRedeemed) {
        /// Checkpoint 6 ////
    }

    /**
     * @notice 用 ETH 购买预测结果代币，需要先调用 priceInETH 函数来获取购买代币的正确数额
     * @param _outcome 要购买其代币的可能结果（YES 或 NO）
     * @param _amountTokenToBuy 要购买的代币数量
     */
    function buyTokensWithETH(Outcome _outcome, uint256 _amountTokenToBuy) external payable {
        /// Checkpoint 8 ////
    }

    /**
     * @notice 卖出预测结果代币换取 ETH，需要先调用 priceInETH 函数来获取购买代币的正确数额
     * @param _outcome 要卖出其代币的可能结果（YES 或 NO）
     * @param _tradingAmount 要卖出的代币数量
     */
    function sellTokensForEth(Outcome _outcome, uint256 _tradingAmount) external {
        /// Checkpoint 8 ////
    }

    /**
     * @notice 预测结算后，用获胜代币赎回 ETH：获胜代币会被销毁，用户获得 ETH
     * @dev 仅限预测已结算时
     * @param _amount 要赎回的获胜代币数量
     */
    function redeemWinningTokens(uint256 _amount) external {
        /// Checkpoint 9 ////
    }

    /**
     * @notice 计算买入代币的 ETH 总价
     * @param _outcome 要购买其代币的可能结果（YES 或 NO）
     * @param _tradingAmount 要购买的代币数量
     * @return 以 ETH 计的总价
     */
    function getBuyPriceInEth(Outcome _outcome, uint256 _tradingAmount) public view returns (uint256) {
        /// Checkpoint 7 ////
    }

    /**
     * @notice 计算卖出代币的 ETH 总价
     * @param _outcome 要卖出其代币的可能结果（YES 或 NO）
     * @param _tradingAmount 要卖出的代币数量
     * @return 以 ETH 计的总价
     */
    function getSellPriceInEth(Outcome _outcome, uint256 _tradingAmount) public view returns (uint256) {
        /// Checkpoint 7 ////
    }

    /////////////////////////
    /// 辅助函数 ///
    ////////////////////////

    /**
     * @dev 内部辅助函数，用于计算买入和卖出时的 ETH 价格
     * @param _outcome 可能的结果（YES 或 NO）
     * @param _tradingAmount 代币数量
     * @param _isSelling 是否为卖出计算
     */
    function _calculatePriceInEth(Outcome _outcome, uint256 _tradingAmount, bool _isSelling)
        private
        view
        returns (uint256)
    {
        /// Checkpoint 7 ////
    }

    /**
     * @dev 内部辅助函数，用于获取代币当前的储备
     * @param _outcome 可能的结果（YES 或 NO）
     * @return 代币当前的储备
     */
    function _getCurrentReserves(Outcome _outcome) private view returns (uint256, uint256) {
        /// Checkpoint 7 ////
    }

    /**
     * @dev 内部辅助函数，用于计算代币的概率
     * @param tokensSold 已售出的代币数量
     * @param totalSold 已售出的代币总数
     * @return 代币的概率
     */
    function _calculateProbability(uint256 tokensSold, uint256 totalSold) private pure returns (uint256) {
        /// Checkpoint 7 ////
    }

    /////////////////////////
    /// Getter 函数 ///
    ////////////////////////

    /**
     * @notice 获取预测的详细信息
     */
    function getPrediction()
        external
        view
        returns (
            string memory question,
            string memory outcome1,
            string memory outcome2,
            address oracle,
            uint256 initialTokenValue,
            uint256 yesTokenReserve,
            uint256 noTokenReserve,
            bool isReported,
            address yesToken,
            address noToken,
            address winningToken,
            uint256 ethCollateral,
            uint256 lpTradingRevenue,
            address predictionMarketOwner,
            uint256 initialProbability,
            uint256 percentageLocked
        )
    {
        /// Checkpoint 3 ////
        // oracle = i_oracle;
        // initialTokenValue = i_initialTokenValue;
        // percentageLocked = i_percentageLocked;
        // initialProbability = i_initialYesProbability;
        // question = s_question;
        // ethCollateral = s_ethCollateral;
        // lpTradingRevenue = s_lpTradingRevenue;
        // predictionMarketOwner = owner();
        // yesToken = address(i_yesToken);
        // noToken = address(i_noToken);
        // outcome1 = i_yesToken.name();
        // outcome2 = i_noToken.name();
        // yesTokenReserve = i_yesToken.balanceOf(address(this));
        // noTokenReserve = i_noToken.balanceOf(address(this));
        /// Checkpoint 5 ////
        // isReported = s_isReported;
        // winningToken = address(s_winningToken);
    }
}
