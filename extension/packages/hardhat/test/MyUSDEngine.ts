//
// 此脚本会在你运行 'yarn test' 时执行
//

import { network } from "hardhat";
import { expect } from "chai";
import type { MyUSD, DEX, MyUSDEngine, Oracle, MyUSDStaking, RateController } from "../types/ethers-contracts/index.js";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { fetchPriceFromUniswap } from "../scripts/fetchPriceFromUniswap.js";

describe("🚩 Stablecoin Challenge 🤓", function () {
  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];

  const contractAddress = process.env.CONTRACT_ADDRESS;
  let myUSDToken: MyUSD;
  let dex: DEX;
  let myUSDEngine: MyUSDEngine;
  let oracle: Oracle;
  let staking: MyUSDStaking;
  let rateController: RateController;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  let collateralAmount: bigint;
  let borrowAmount: bigint;

  beforeEach(async function () {
    ({ ethers } = await network.create());
    collateralAmount = ethers.parseEther("10");
    borrowAmount = ethers.parseEther("5000");
    [owner, user1, user2] = await ethers.getSigners();

    // 供 SRE 自动评分器使用——使用下载的合约而不是默认合约
    let contractArtifact = "";
    if (contractAddress) {
      contractArtifact = `contracts/download-${contractAddress}.sol:MyUSDEngine`;
    } else {
      contractArtifact = "contracts/MyUSDEngine.sol:MyUSDEngine";
    }

    // 获取部署者当前的 nonce
    const deployerNonce = await ethers.provider.getTransactionCount(owner.address);

    // 根据 nonce 计算合约未来的地址
    const futureStakingAddress = ethers.getCreateAddress({
      from: owner.address,
      nonce: deployerNonce + 4, // +4，因为这将是我们的第五次部署
    });

    const futureEngineAddress = ethers.getCreateAddress({
      from: owner.address,
      nonce: deployerNonce + 5, // +5，因为这将是我们的第六次部署
    });

    // 先部署 RateController
    const RateControllerFactory = await ethers.getContractFactory("RateController");
    rateController = (await RateControllerFactory.deploy(
      futureEngineAddress,
      futureStakingAddress,
    )) as unknown as RateController;

    // 使用预先计算的未来地址部署 MyUSD
    const MyUSDFactory = await ethers.getContractFactory("MyUSD");
    myUSDToken = (await MyUSDFactory.deploy(futureEngineAddress, futureStakingAddress)) as unknown as MyUSD;

    // 部署 DEX
    const DEXFactory = await ethers.getContractFactory("DEX");
    dex = (await DEXFactory.deploy(await myUSDToken.getAddress())) as unknown as DEX;

    const ethPrice = await fetchPriceFromUniswap();

    // 部署 Oracle
    const OracleFactory = await ethers.getContractFactory("Oracle");
    oracle = (await OracleFactory.deploy(await dex.getAddress(), ethPrice)) as unknown as Oracle;

    // 部署 MyUSDStaking
    const MyUSDStakingFactory = await ethers.getContractFactory("MyUSDStaking");
    staking = (await MyUSDStakingFactory.deploy(
      await myUSDToken.getAddress(),
      futureEngineAddress,
      await rateController.getAddress(),
    )) as unknown as MyUSDStaking;

    // 最后在预测的地址上部署 MyUSDEngine
    const MyUSDEngineFactory = await ethers.getContractFactory(contractArtifact);
    myUSDEngine = (await MyUSDEngineFactory.deploy(
      await oracle.getAddress(),
      await myUSDToken.getAddress(),
      await staking.getAddress(),
      await rateController.getAddress(),
    )) as unknown as MyUSDEngine;

    // 验证地址与预测结果一致
    expect(await myUSDEngine.getAddress()).to.equal(futureEngineAddress);
    expect(await staking.getAddress()).to.equal(futureStakingAddress);

    const ethCollateralAmount = ethers.parseEther("5000");
    // 为 DEX 初始化流动性
    const ethDEXAmount = ethers.parseEther("1000");
    const myUSDAmount = (await oracle.getETHUSDPrice()) * 1000n;

    // 添加抵押品并铸造 MyUSD，用于初始化 DEX
    await myUSDEngine.addCollateral({ value: ethCollateralAmount });
    await myUSDEngine.mintMyUSD(myUSDAmount);

    const confirmedBalance = await myUSDToken.balanceOf(owner.address);
    // 如果部署者账户没有这些稳定币，就不向 DEX 添加流动性
    if (confirmedBalance == myUSDAmount) {
      // 授权 DEX 使用代币并初始化 DEX
      await myUSDToken.approve(dex.target, myUSDAmount);
      await dex.init(myUSDAmount, { value: ethDEXAmount });
    }
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await myUSDToken.owner()).to.equal(owner.address);
      expect(await dex.totalLiquidity()).to.be.gt(0);
      expect(await oracle.getETHMyUSDPrice()).to.be.gt(0);
      expect(await myUSDEngine.borrowRate()).to.equal(0);
      expect(await staking.savingsRate()).to.equal(0);
    });
  });

  describe("Collateral Operations", function () {
    it("Should allow adding collateral", async function () {
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      expect(await myUSDEngine.s_userCollateral(user1.address)).to.equal(collateralAmount);
    });

    it("Should emit CollateralAdded event", async function () {
      await expect(myUSDEngine.connect(user1).addCollateral({ value: collateralAmount }))
        .to.emit(myUSDEngine, "CollateralAdded")
        .withArgs(user1.address, collateralAmount, await oracle.getETHMyUSDPrice());
    });

    it("Should allow withdrawing collateral when no debt", async function () {
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      expect(await myUSDEngine.s_userCollateral(user1.address)).to.be.gt(0n);
      await myUSDEngine.connect(user1).withdrawCollateral(collateralAmount);
      expect(await myUSDEngine.s_userCollateral(user1.address)).to.equal(0);
    });

    it("Should prevent withdrawing more than deposited", async function () {
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await expect(myUSDEngine.connect(user1).withdrawCollateral(collateralAmount * 2n)).to.be.revertedWithCustomError(
        myUSDEngine,
        "Engine__InsufficientCollateral",
      );
    });
  });

  describe("Borrowing Operations", function () {
    beforeEach(async function () {
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
    });

    it("Should allow borrowing when sufficiently collateralized", async function () {
      expect(await myUSDToken.balanceOf(user1.address)).to.equal(0n);
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.equal(borrowAmount);
      expect(await myUSDToken.balanceOf(user1.address)).to.equal(borrowAmount);
    });

    it("Should prevent borrowing when insufficiently collateralized", async function () {
      const tooMuchBorrow = (await oracle.getETHUSDPrice()) * collateralAmount;
      await expect(myUSDEngine.connect(user1).mintMyUSD(tooMuchBorrow)).to.be.revertedWithCustomError(
        myUSDEngine,
        "Engine__UnsafePositionRatio",
      );
    });

    it("Should emit DebtSharesMinted event", async function () {
      await expect(myUSDEngine.connect(user1).mintMyUSD(borrowAmount))
        .to.emit(myUSDEngine, "DebtSharesMinted")
        .withArgs(user1.address, borrowAmount, borrowAmount);
    });
  });

  describe("Repayment Operations", function () {
    beforeEach(async function () {
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);
    });

    it("Should allow repaying borrowed amount", async function () {
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.be.gt(0n);
      await myUSDToken.connect(user1).approve(myUSDEngine.target, borrowAmount);
      await myUSDEngine.connect(user1).repayUpTo(borrowAmount);
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.equal(0);
    });

    it("Should allow repaying less than full borrowed amount", async function () {
      await myUSDToken.connect(user1).approve(myUSDEngine.target, borrowAmount / 2n);
      await myUSDEngine.connect(user1).repayUpTo(borrowAmount / 2n);
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.equal(borrowAmount / 2n);
    });

    it("Should allow repaying more than borrowed", async function () {
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.be.gt(0n);
      await myUSDToken.connect(user1).approve(myUSDEngine.target, borrowAmount * 2n);
      await dex.connect(user1).swap(ethers.parseEther("10"), { value: ethers.parseEther("10") });
      await myUSDEngine.connect(user1).repayUpTo(borrowAmount * 2n);
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.equal(0);
    });

    it("Should emit DebtSharesBurned event", async function () {
      await myUSDToken.connect(user1).approve(myUSDEngine.target, borrowAmount);
      await expect(myUSDEngine.connect(user1).repayUpTo(borrowAmount))
        .to.emit(myUSDEngine, "DebtSharesBurned")
        .withArgs(user1.address, borrowAmount, await myUSDToken.balanceOf(user1.address));
    });
  });

  describe("Liquidation", function () {
    beforeEach(async function () {
      const collateralAmount = ethers.parseEther("1");
      const borrowAmount = ((await oracle.getETHUSDPrice()) * 1000n) / 1505n;
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);
      await myUSDToken
        .connect(await ethers.getImpersonatedSigner(myUSDEngine.target as string))
        .mintTo(user2.address, borrowAmount * 10n);
      await myUSDToken.connect(user2).approve(myUSDEngine.target, borrowAmount * 10n);
    });

    it("Should allow liquidation when position is unsafe", async function () {
      // 压低 ETH 价格，使 user1 的仓位低于 1.5
      const amountToSwap = ethers.parseEther("10");
      await dex.swap(amountToSwap, { value: amountToSwap });
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(await myUSDEngine.isLiquidatable(user1)).to.be.true;
      const beforeBalance = await ethers.provider.getBalance(user2.address);
      await myUSDEngine.connect(user2).liquidate(user1.address);
      const afterBalance = await ethers.provider.getBalance(user2.address);
      expect(await myUSDEngine.s_userDebtShares(user1.address)).to.equal(0);
      expect(afterBalance).to.be.gt(beforeBalance);
    });

    it("Should prevent liquidation of safe positions", async function () {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(await myUSDEngine.isLiquidatable(user1)).to.be.false;
      await expect(myUSDEngine.connect(user2).liquidate(user1.address)).to.be.revertedWithCustomError(
        myUSDEngine,
        "Engine__NotLiquidatable",
      );
    });

    it("Should emit appropriate events on liquidation", async function () {
      const amountToSwap = ethers.parseEther("10");
      await dex.swap(amountToSwap, { value: amountToSwap });
      await expect(myUSDEngine.connect(user2).liquidate(user1.address)).to.emit(myUSDEngine, "Liquidation");
    });
  });

  describe("Borrow Rate Management", function () {
    it("Should allow rate controller to set borrow rate", async function () {
      const newRate = 500; // 5%
      await rateController.setBorrowRate(newRate);
      expect(await myUSDEngine.borrowRate()).to.equal(newRate);
    });

    it("Should emit BorrowRateUpdated event when rate changes", async function () {
      const newRate = 300; // 3%
      await expect(rateController.setBorrowRate(newRate)).to.emit(myUSDEngine, "BorrowRateUpdated").withArgs(newRate);
    });

    it("Should prevent non-rate controller from setting borrow rate", async function () {
      const newRate = 500;
      // 先验证利率控制器可以设置它（若函数为空则会失败）
      await rateController.setBorrowRate(newRate);
      expect(await myUSDEngine.borrowRate()).to.equal(newRate);

      // 再验证非利率控制器无法设置
      await expect(myUSDEngine.connect(user1).setBorrowRate(newRate)).to.be.revertedWithCustomError(
        myUSDEngine,
        "Engine__NotRateController",
      );
    });

    it("Should prevent setting borrow rate below savings rate", async function () {
      // 先把借款利率设为 4%
      await rateController.setBorrowRate(400);
      // 再把储蓄利率设为 3%
      await rateController.setSavingsRate(300);

      // 尝试把借款利率设为 2%（低于储蓄利率）——应当回滚（revert）
      await expect(rateController.setBorrowRate(200)).to.be.revertedWithCustomError(
        myUSDEngine,
        "Engine__InvalidBorrowRate",
      );
    });

    it("Should allow setting borrow rate equal to savings rate", async function () {
      await rateController.setBorrowRate(400);
      await rateController.setSavingsRate(300);
      await rateController.setBorrowRate(300);
      expect(await myUSDEngine.borrowRate()).to.equal(300);
    });

    it("Should allow setting borrow rate above savings rate", async function () {
      await rateController.setBorrowRate(300);
      await rateController.setSavingsRate(300);
      await rateController.setBorrowRate(500);
      expect(await myUSDEngine.borrowRate()).to.equal(500);
    });
  });

  describe("Interest Accrual", function () {
    beforeEach(async function () {
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);
    });

    it("Should not accrue interest with zero borrow rate", async function () {
      const initialDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      expect(initialDebt).to.be.gt(0); // 验证确实产生了债务

      // 让时间快进 1 年
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const finalDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      expect(finalDebt).to.be.eq(initialDebt);
    });

    it("Should accrue interest correctly over time", async function () {
      const borrowRate = 1000; // 年化 10%
      await rateController.setBorrowRate(borrowRate);

      const initialDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      expect(initialDebt).to.be.gt(0); // 验证确实产生了债务

      // 让时间快进 1 年
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const finalDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      const expectedDebt = initialDebt + (initialDebt * BigInt(borrowRate)) / 10000n;

      expect(finalDebt).to.be.closeTo(expectedDebt, ethers.parseEther("0.001"));
    });

    it("Should accrue interest proportionally over partial time periods", async function () {
      const borrowRate = 1200; // 年化 12%
      await rateController.setBorrowRate(borrowRate);

      const initialDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      expect(initialDebt).to.be.gt(0); // 验证确实产生了债务

      // 让时间快进 6 个月
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]); // 约 6 个月
      await ethers.provider.send("evm_mine", []);

      const finalDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      const expectedDebt = initialDebt + (initialDebt * BigInt(borrowRate) * 182n) / (365n * 10000n);

      expect(finalDebt).to.be.closeTo(expectedDebt, ethers.parseEther("0.001"));
    });

    it("Should handle multiple interest accrual periods", async function () {
      const borrowRate = 500; // 年化 5%
      await rateController.setBorrowRate(borrowRate);

      const initialDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      expect(initialDebt).to.be.gt(0); // 验证确实产生了债务

      // 快进 3 个月
      await ethers.provider.send("evm_increaseTime", [91 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const midDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      const expectedMidDebt = initialDebt + (initialDebt * BigInt(borrowRate) * 91n) / (365n * 10000n);

      // 修改利率，并再快进 3 个月
      await rateController.setBorrowRate(800); // 年化 8%

      const afterRateChangeDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      await ethers.provider.send("evm_increaseTime", [91 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const finalDebt = await myUSDEngine.getCurrentDebtValue(user1.address);
      const expectedFinalDebt = afterRateChangeDebt + (afterRateChangeDebt * BigInt(800) * 91n) / (365n * 10000n);

      expect(midDebt).to.be.closeTo(expectedMidDebt, ethers.parseEther("0.001"));
      expect(finalDebt).to.be.closeTo(expectedFinalDebt, ethers.parseEther("0.001"));
    });
  });

  describe("Savings Rate Management", function () {
    beforeEach(async function () {
      await rateController.setBorrowRate(400);
      expect(await myUSDEngine.borrowRate()).to.equal(400);
    });

    it("Should allow rate controller to set savings rate", async function () {
      const newRate = 300; // 3%
      await rateController.setSavingsRate(newRate);
      expect(await staking.savingsRate()).to.equal(newRate);
    });

    it("Should emit SavingsRateUpdated event when rate changes", async function () {
      const newRate = 250; // 2.5%
      await expect(rateController.setSavingsRate(newRate)).to.emit(staking, "SavingsRateUpdated").withArgs(newRate);
    });

    it("Should prevent non-rate controller from setting savings rate", async function () {
      const newRate = 300;
      // 先验证利率控制器可以设置它（若函数为空则会失败）
      await rateController.setSavingsRate(newRate);
      expect(await staking.savingsRate()).to.equal(newRate);

      // 再验证非利率控制器无法设置
      await expect(staking.connect(user1).setSavingsRate(newRate)).to.be.revertedWithCustomError(
        staking,
        "Staking__NotRateController",
      );
    });

    it("Should prevent setting savings rate above borrow rate", async function () {
      // 尝试把储蓄利率设为 5%（高于借款利率）——应当回滚
      await expect(rateController.setSavingsRate(500)).to.be.revertedWithCustomError(
        staking,
        "Staking__InvalidSavingsRate",
      );
    });

    it("Should allow setting savings rate equal to borrow rate", async function () {
      const rate = 400; // 4%
      await rateController.setSavingsRate(rate);
      expect(await staking.savingsRate()).to.equal(rate);
    });

    it("Should prevent setting borrow rate below savings rate", async function () {
      await rateController.setSavingsRate(350);
      await expect(rateController.setBorrowRate(300)).to.be.revertedWithCustomError(
        myUSDEngine,
        "Engine__InvalidBorrowRate",
      );
    });
  });

  describe("Staking Operations", function () {
    beforeEach(async function () {
      // 获取一些 MyUSD 代币用于测试
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);

      // 验证 user1 拿到了代币
      expect(await myUSDToken.balanceOf(user1.address)).to.be.gt(0);
    });

    it("Should allow staking MyUSD tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await myUSDToken.connect(user1).approve(staking.target, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);

      expect(await staking.userShares(user1.address)).to.be.gt(0);
      expect(await staking.getBalance(user1.address)).to.equal(stakeAmount);
    });

    it("Should emit Staked event", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await myUSDToken.connect(user1).approve(staking.target, stakeAmount);

      await expect(staking.connect(user1).stake(stakeAmount))
        .to.emit(staking, "Staked")
        .withArgs(user1.address, stakeAmount, stakeAmount); // 初始为 1:1
    });

    it("Should prevent staking zero amount", async function () {
      await expect(staking.connect(user1).stake(0)).to.be.revertedWithCustomError(staking, "Staking__InvalidAmount");
    });

    it("Should prevent staking without sufficient balance", async function () {
      const stakeAmount = ethers.parseEther("100000"); // 超过用户持有的数量
      await myUSDToken.connect(user1).approve(staking.target, stakeAmount);

      await expect(staking.connect(user1).stake(stakeAmount)).to.be.revertedWithCustomError(
        staking,
        "MyUSD__InsufficientBalance",
      );
    });

    it("Should prevent staking without sufficient allowance", async function () {
      const stakeAmount = ethers.parseEther("1000");
      // 不授权，或授权不足的额度
      await myUSDToken.connect(user1).approve(staking.target, stakeAmount / 2n);

      await expect(staking.connect(user1).stake(stakeAmount)).to.be.revertedWithCustomError(
        staking,
        "MyUSD__InsufficientAllowance",
      );
    });

    it("Should handle multiple stakes from same user", async function () {
      const stakeAmount1 = ethers.parseEther("1000");
      const stakeAmount2 = ethers.parseEther("500");

      await myUSDToken.connect(user1).approve(staking.target, stakeAmount1 + stakeAmount2);

      await staking.connect(user1).stake(stakeAmount1);
      const balanceAfterFirst = await staking.getBalance(user1.address);

      await staking.connect(user1).stake(stakeAmount2);
      const balanceAfterSecond = await staking.getBalance(user1.address);

      expect(balanceAfterFirst).to.equal(stakeAmount1);
      expect(balanceAfterSecond).to.equal(stakeAmount1 + stakeAmount2);
    });
  });

  describe("Withdrawal Operations", function () {
    beforeEach(async function () {
      // 为用户准备 MyUSD 并质押一部分
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);

      const stakeAmount = ethers.parseEther("1000");
      await myUSDToken.connect(user1).approve(staking.target, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
    });

    it("Should allow withdrawing staked tokens", async function () {
      const initialBalance = await myUSDToken.balanceOf(user1.address);
      await staking.connect(user1).withdraw();
      const finalBalance = await myUSDToken.balanceOf(user1.address);

      expect(await staking.userShares(user1.address)).to.equal(0);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should emit Withdrawn event", async function () {
      const expectedAmount = await staking.getBalance(user1.address);
      const expectedShares = await staking.userShares(user1.address);

      await expect(staking.connect(user1).withdraw())
        .to.emit(staking, "Withdrawn")
        .withArgs(user1.address, expectedAmount, expectedShares);
    });

    it("Should prevent withdrawal with no balance", async function () {
      await expect(staking.connect(user2).withdraw()).to.be.revertedWithCustomError(
        staking,
        "Staking__InsufficientBalance",
      );
    });

    it("Should handle withdrawal after partial time with no interest", async function () {
      const stakeAmount = ethers.parseEther("1000");

      // 让时间快进，但不设置储蓄利率
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 天
      await ethers.provider.send("evm_mine", []);

      const balanceBeforeWithdraw = await staking.getBalance(user1.address);
      expect(balanceBeforeWithdraw).to.equal(stakeAmount);

      await staking.connect(user1).withdraw();
      expect(await staking.userShares(user1.address)).to.equal(0);
    });
  });

  describe("Savings Interest Accrual", function () {
    beforeEach(async function () {
      // 为用户准备 MyUSD 并质押一部分
      await myUSDEngine.connect(user1).addCollateral({ value: collateralAmount });
      await myUSDEngine.connect(user1).mintMyUSD(borrowAmount);

      const stakeAmount = ethers.parseEther("1000");
      await myUSDToken.connect(user1).approve(staking.target, stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
    });

    it("Should not accrue interest with zero savings rate", async function () {
      const initialBalance = await staking.getBalance(user1.address);
      expect(initialBalance).to.be.gt(0); // 验证代币确实已被质押

      // 让时间快进 1 年
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const finalBalance = await staking.getBalance(user1.address);
      expect(finalBalance).to.equal(initialBalance);
    });

    it("Should accrue interest correctly over time", async function () {
      const borrowRate = 1000; // 年化 10%
      const savingsRate = 800; // 年化 8%
      await rateController.setBorrowRate(borrowRate);
      await rateController.setSavingsRate(savingsRate);

      const initialBalance = await staking.getBalance(user1.address);
      expect(initialBalance).to.be.gt(0); // 验证代币确实已被质押

      // 让时间快进 1 年
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const finalBalance = await staking.getBalance(user1.address);
      const expectedBalance = initialBalance + (initialBalance * BigInt(savingsRate)) / 10000n;

      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should accrue interest proportionally over partial time periods", async function () {
      const borrowRate = 1200; // 年化 12%
      const savingsRate = 900; // 年化 9%
      await rateController.setBorrowRate(borrowRate);
      await rateController.setSavingsRate(savingsRate);

      const initialBalance = await staking.getBalance(user1.address);
      expect(initialBalance).to.be.gt(0); // 验证代币确实已被质押

      // 让时间快进 6 个月
      await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]); // 约 6 个月
      await ethers.provider.send("evm_mine", []);

      const finalBalance = await staking.getBalance(user1.address);
      const expectedBalance = initialBalance + (initialBalance * BigInt(savingsRate) * 182n) / (365n * 10000n);

      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should handle multiple interest accrual periods", async function () {
      await rateController.setBorrowRate(600); // 6%
      await rateController.setSavingsRate(400); // 年化 4%

      const initialBalance = await staking.getBalance(user1.address);
      expect(initialBalance).to.be.gt(0); // 验证代币确实已被质押

      // 快进 3 个月
      await ethers.provider.send("evm_increaseTime", [91 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // 获取利率变更前的余额——应包含 91 天、4% 利率的利息
      const expectedMidBalance = initialBalance + (initialBalance * BigInt(400) * 91n) / (365n * 10000n);
      const midBalance = await staking.getBalance(user1.address);

      // 修改利率，并再快进 3 个月
      await rateController.setBorrowRate(1000); // 10%
      await rateController.setSavingsRate(700); // 年化 7%

      const balanceAfterRateChange = await staking.getBalance(user1.address);
      // 现在按新的 7% 利率让时间快进
      await ethers.provider.send("evm_increaseTime", [91 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const expectedFinalBalance =
        balanceAfterRateChange + (balanceAfterRateChange * BigInt(700) * 91n) / (365n * 10000n);
      const finalBalance = await staking.getBalance(user1.address);

      expect(midBalance).to.be.closeTo(expectedMidBalance, ethers.parseEther("0.001"));
      expect(finalBalance).to.be.closeTo(expectedFinalBalance, ethers.parseEther("0.001"));
    });
  });
});
