// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice 简单的 DEX 合约，允许用户用 ETH 兑换 CORN，或用 CORN 兑换 ETH
 */
contract CornDEX {
    /* ========== 全局变量 ========== */

    IERC20 token; //实例化导入的合约
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    /* ========== 事件 ========== */

    event Swap(address swapper, address inputToken, uint256 inputAmount, address outputToken, uint256 outputAmount);
    event PriceUpdated(uint256 price);
    /**
     * @notice 向 DEX 提供流动性并铸造 LPT 时触发。
     */
    event LiquidityProvided(address liquidityProvider, uint256 liquidityMinted, uint256 ethInput, uint256 tokensInput);

    /**
     * @notice 从 DEX 移除流动性并减少 DEX 内的 LPT 数量时触发。
     */
    event LiquidityRemoved(
        address liquidityRemover,
        uint256 liquidityWithdrawn,
        uint256 tokensOutput,
        uint256 ethOutput
    );

    /* ========== 构造函数 ========== */

    constructor(address tokenAddr) {
        token = IERC20(tokenAddr); //指定代币地址，该地址将接入接口，并通过变量 'token' 来使用
    }

    /* ========== 状态修改函数 ========== */

    /**
     * @notice 初始化将从 erc20 合约转入 DEX 本身的代币数量。为合约同时注入 ETH 和 CORN。
     * @param tokens 要转入 DEX 的数量
     * @return totalLiquidity 向 DEX 合约存入资产后所铸造的 LPT 数量
     * NOTE: 由于比例为 1:1，将 totalLiquidity 初始化为合约的 eth 余额是没问题的。
     */
    function init(uint256 tokens) public payable returns (uint256) {
        require(totalLiquidity == 0, "DEX: init - already has liquidity");
        totalLiquidity = address(this).balance;
        liquidity[msg.sender] = totalLiquidity;
        require(token.transferFrom(msg.sender, address(this), tokens), "DEX: init - transfer did not transact");
        return totalLiquidity;
    }

    /**
     * @notice 给定池中两种资产的储备时，返回你应收到的数量（yOutput）
     */
    function price(uint256 xInput, uint256 xReserves, uint256 yReserves) public pure returns (uint256 yOutput) {
        uint256 numerator = xInput * yReserves;
        uint256 denominator = (xReserves) + xInput;
        return (numerator / denominator);
    }

    /**
     * @notice 返回以 CORN 计价的 ETH 当前价格
     */
    function currentPrice() public view returns (uint256 _currentPrice) {
        _currentPrice = price(1 ether, address(this).balance, token.balanceOf(address(this)));
    }

    /**
     * @notice 给定你想得到的 yOutput 数量以及池中两种资产的储备时，返回你需要投入的数量（xInput）
     */
    function calculateXInput(
        uint256 yOutput,
        uint256 xReserves,
        uint256 yReserves
    ) public pure returns (uint256 xInput) {
        uint256 numerator = yOutput * xReserves;
        uint256 denominator = yReserves - yOutput;

        return (numerator / denominator) + 1;
    }

    /**
     * @notice 向 DEX 发送 Ether 以换取 $CORN
     */
    function ethToToken() internal returns (uint256 tokenOutput) {
        require(msg.value > 0, "cannot swap 0 ETH");
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = token.balanceOf(address(this));
        tokenOutput = price(msg.value, ethReserve, tokenReserve);

        require(token.transfer(msg.sender, tokenOutput), "ethToToken(): reverted swap.");
        emit Swap(msg.sender, address(0), msg.value, address(token), tokenOutput);
        return tokenOutput;
    }

    /**
     * @notice 向 DEX 发送 $CORN 代币以换取 Ether
     */
    function tokenToEth(uint256 tokenInput) internal returns (uint256 ethOutput) {
        require(tokenInput > 0, "cannot swap 0 tokens");
        require(token.balanceOf(msg.sender) >= tokenInput, "insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= tokenInput, "insufficient allowance");
        uint256 tokenReserve = token.balanceOf(address(this));
        ethOutput = price(tokenInput, tokenReserve, address(this).balance);
        require(token.transferFrom(msg.sender, address(this), tokenInput), "tokenToEth(): reverted swap.");
        (bool sent, ) = msg.sender.call{ value: ethOutput }("");
        require(sent, "tokenToEth: revert in transferring eth to you!");
        emit Swap(msg.sender, address(token), tokenInput, address(0), ethOutput);
        return ethOutput;
    }

    /**
     * @notice 允许用户通过同一个方法用 ETH 兑换 $CORN，或用 $CORN 兑换 ETH
     */
    function swap(uint256 inputAmount) public payable returns (uint256 outputAmount) {
        if (msg.value > 0 && inputAmount == msg.value) {
            outputAmount = ethToToken();
        } else {
            outputAmount = tokenToEth(inputAmount);
        }
        emit PriceUpdated(currentPrice());
    }

    /**
     * @notice 允许向流动性池存入 $CORN 和 $ETH
     * NOTE: 参数是调用此函数时附带发送的 msg.value。该数额也用于确定所需的 $CORN 数量，并从存款人处扣取。
     * NOTE: 用户必须在调用此函数之前先调用 approve 函数，授权 DEX 代其花费代币。
     * NOTE: 将按照 AMM 给出的价格，从用户钱包中扣除等值的两种资产。
     */
    function deposit() public payable returns (uint256 tokensDeposited) {
        require(msg.value > 0, "Must send value when depositing");
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokenDeposit;

        tokenDeposit = ((msg.value * tokenReserve) / ethReserve) + 1;

        require(token.balanceOf(msg.sender) >= tokenDeposit, "insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= tokenDeposit, "insufficient allowance");

        uint256 liquidityMinted = (msg.value * totalLiquidity) / ethReserve;
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        require(token.transferFrom(msg.sender, address(this), tokenDeposit));
        emit LiquidityProvided(msg.sender, liquidityMinted, msg.value, tokenDeposit);
        return tokenDeposit;
    }

    /**
     * @notice 允许从流动性池中提取 $CORN 和 $ETH
     * NOTE: 按当前代码，如果池中流动性极低，调用者最终可能只取回很少的资产。我想他们可以通过界面看到这一点。
     */
    function withdraw(uint256 amount) public returns (uint256 ethAmount, uint256 tokenAmount) {
        require(liquidity[msg.sender] >= amount, "withdraw: sender does not have enough liquidity to withdraw.");
        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethWithdrawn;

        ethWithdrawn = (amount * ethReserve) / totalLiquidity;

        tokenAmount = (amount * tokenReserve) / totalLiquidity;
        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;
        (bool sent, ) = payable(msg.sender).call{ value: ethWithdrawn }("");
        require(sent, "withdraw(): revert in transferring eth to you!");
        require(token.transfer(msg.sender, tokenAmount));
        emit LiquidityRemoved(msg.sender, amount, tokenAmount, ethWithdrawn);
        return (ethWithdrawn, tokenAmount);
    }
}
