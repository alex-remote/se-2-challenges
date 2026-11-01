import { expect } from "chai";
import { network } from "hardhat";
import type { PredictionMarket, PredictionMarket__factory } from "../types/ethers-contracts/index.js";

describe("📈📉🏎️ Prediction Markets Challenge", function () {
  // 我们定义一个 fixture，以便在每个测试中复用相同的初始设置。

  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];
  let predictionMarket: PredictionMarket;
  let owner: any;
  let oracle: any;

  let contractArtifact = "";
  if (process.env.CONTRACT_ADDRESS) {
    contractArtifact = `contracts/download-${process.env.CONTRACT_ADDRESS}.sol:PredictionMarket`;
  } else {
    // 使用短名称，使 hardhat-ethers 返回 PredictionMarket__factory（带类型的方法）
    contractArtifact = "PredictionMarket";
  }

  async function getPredictionMarketFactory(): Promise<PredictionMarket__factory> {
    return (await ethers.getContractFactory(contractArtifact)) as PredictionMarket__factory;
  }

  before(async () => {
    ({ ethers } = await network.create());
    [owner, oracle] = await ethers.getSigners();
    const predictionMarketFactory = await getPredictionMarketFactory();
    predictionMarket = await predictionMarketFactory.deploy(
      owner.address,
      oracle.address,
      "Test Question",
      ethers.parseEther("1"),
      50,
      20,
      { value: ethers.parseEther("10") },
    );
    await predictionMarket.waitForDeployment();
  });

  describe("Checkpoint2", function () {
    it("Should revert when no ETH is provided for initial liquidity", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();

      await expect(
        predictionMarketFactory.deploy(
          owner.address,
          oracle.address,
          "Test Question",
          ethers.parseEther("1"),
          50,
          20,
          { value: 0 }, // 未提供 ETH
        ),
      ).to.be.revertedWithCustomError(predictionMarketFactory, "PredictionMarket__MustProvideETHForInitialLiquidity");
    });

    it("Should revert when initialYesProbability is 0 or >= 100", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();

      // 测试用例 1：initialYesProbability = 0
      await expect(
        predictionMarketFactory.deploy(
          owner.address,
          oracle.address,
          "Test Question",
          ethers.parseEther("1"),
          0, // 无效概率（0）
          20,
          { value: ethers.parseEther("10") },
        ),
      ).to.be.revertedWithCustomError(predictionMarketFactory, "PredictionMarket__InvalidProbability");

      // 测试用例 2：initialYesProbability = 100
      await expect(
        predictionMarketFactory.deploy(
          owner.address,
          oracle.address,
          "Test Question",
          ethers.parseEther("1"),
          100, // 无效概率（>= 100）
          20,
          { value: ethers.parseEther("10") },
        ),
      ).to.be.revertedWithCustomError(predictionMarketFactory, "PredictionMarket__InvalidProbability");
    });

    it("Should revert when percentageToLock is >= 100 or 0", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();

      // 测试用例 1：percentageToLock = 0
      await expect(
        predictionMarketFactory.deploy(
          owner.address,
          oracle.address,
          "Test Question",
          ethers.parseEther("1"),
          50,
          0, // 无效百分比（0）
          { value: ethers.parseEther("10") },
        ),
      ).to.be.revertedWithCustomError(predictionMarketFactory, "PredictionMarket__InvalidPercentageToLock");

      // 测试用例 2：percentageToLock = 100
      await expect(
        predictionMarketFactory.deploy(
          owner.address,
          oracle.address,
          "Test Question",
          ethers.parseEther("1"),
          50,
          100, // 无效百分比（>= 100）
          { value: ethers.parseEther("10") },
        ),
      ).to.be.revertedWithCustomError(predictionMarketFactory, "PredictionMarket__InvalidPercentageToLock");
    });
    it("Should set the correct state variables on deployment", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const question = "Will the green car win the race?";
      const initialTokenValue = ethers.parseEther("0.01");
      const initialYesProbability = 60;
      const percentageToLock = 10;
      const initialLiquidity = ethers.parseEther("1");

      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        question,
        initialTokenValue,
        initialYesProbability,
        percentageToLock,
        { value: initialLiquidity },
      );
      await predictionMarket.waitForDeployment();

      // 验证所有状态变量都已正确设置
      expect(await predictionMarket.i_oracle()).to.equal(oracle.address);
      expect(await predictionMarket.s_question()).to.equal(question);
      expect(await predictionMarket.i_initialTokenValue()).to.equal(initialTokenValue);
      expect(await predictionMarket.i_initialYesProbability()).to.equal(initialYesProbability);
      expect(await predictionMarket.i_percentageLocked()).to.equal(percentageToLock);
      expect(await predictionMarket.s_ethCollateral()).to.equal(initialLiquidity);
    });
  });

  describe("Checkpoint3", function () {
    it("Should correctly calculate initial token amounts", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const question = "Will the green car win the race?";
      const initialTokenValue = ethers.parseEther("0.01");
      const initialYesProbability = 60;
      const percentageToLock = 10;
      const initialLiquidity = ethers.parseEther("1");

      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        question,
        initialTokenValue,
        initialYesProbability,
        percentageToLock,
        { value: initialLiquidity },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);

      // 计算预期值
      const PRECISION = BigInt(1e18); // 1e18 精度
      const initialTokenAmount = (initialLiquidity * PRECISION) / initialTokenValue; // 10 个代币

      // 验证代币数量
      expect(await yesToken.totalSupply()).to.equal(initialTokenAmount);
      expect(await noToken.totalSupply()).to.equal(initialTokenAmount);
    });

    it("Should correctly transfer locked tokens to deployer", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const question = "Will the green car win the race?";
      const initialTokenValue = ethers.parseEther("0.01");
      const initialYesProbability = 60;
      const percentageToLock = 10;
      const initialLiquidity = ethers.parseEther("1");

      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        question,
        initialTokenValue,
        initialYesProbability,
        percentageToLock,
        { value: initialLiquidity },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);

      // 计算预期值
      const PRECISION = BigInt(1e18); // 1e18 精度
      const initialTokenAmount = (initialLiquidity * PRECISION) / initialTokenValue; // 10 个代币
      const initialYesAmountLocked =
        (initialTokenAmount * BigInt(initialYesProbability) * BigInt(percentageToLock) * BigInt(2)) / BigInt(10000);
      const initialNoAmountLocked =
        (initialTokenAmount * BigInt(100 - initialYesProbability) * BigInt(percentageToLock) * BigInt(2)) /
        BigInt(10000);

      // 验证锁定的代币已转给部署者
      expect(await yesToken.balanceOf(owner.address)).to.equal(initialYesAmountLocked);
      expect(await noToken.balanceOf(owner.address)).to.equal(initialNoAmountLocked);
    });
  });

  describe("Checkpoint4", function () {
    it("Should successfully add liquidity, mint tokens and update state variables", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();
      const initialEthCollateral = await predictionMarket.s_ethCollateral();
      const liquidityToAdd = ethers.parseEther("5");
      const expectedTokenAmount = (liquidityToAdd * BigInt(1e18)) / ethers.parseEther("1");
      // 获取初始代币余额
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);
      const initialYesTokenBalance = await yesToken.balanceOf(predictionMarket.getAddress());
      const initialNoTokenBalance = await noToken.balanceOf(predictionMarket.getAddress());
      // 添加流动性
      await predictionMarket.connect(owner).addLiquidity({ value: liquidityToAdd });
      // 验证状态变化
      expect(await predictionMarket.s_ethCollateral()).to.equal(initialEthCollateral + liquidityToAdd);
      expect(await yesToken.balanceOf(predictionMarket.getAddress())).to.equal(
        initialYesTokenBalance + expectedTokenAmount,
      );
      expect(await noToken.balanceOf(predictionMarket.getAddress())).to.equal(
        initialNoTokenBalance + expectedTokenAmount,
      );
    });

    it("Should revert when trying to remove more tokens than available", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 尝试移除比我们最初提供的更多的 ETH
      const ethToRemove = ethers.parseEther("11"); // 尝试移除 11 ETH，而我们只有价值 10 ETH 的代币

      // 尝试移除超出可用代币数量的流动性
      await expect(predictionMarket.connect(owner).removeLiquidity(ethToRemove)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__InsufficientTokenReserve",
      );
    });
    it("Should successfully remove liquidity, burn tokens and update state variables", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();
      const initialEthCollateral = await predictionMarket.s_ethCollateral();
      const ethToRemove = ethers.parseEther("5");
      const expectedTokenAmount = (ethToRemove * BigInt(1e18)) / ethers.parseEther("1");
      // 获取初始代币余额
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);
      const initialYesTokenBalance = await yesToken.balanceOf(predictionMarket.getAddress());
      const initialNoTokenBalance = await noToken.balanceOf(predictionMarket.getAddress());
      // 移除流动性
      await predictionMarket.connect(owner).removeLiquidity(ethToRemove);
      // 验证状态变化
      expect(await predictionMarket.s_ethCollateral()).to.equal(initialEthCollateral - ethToRemove);
      expect(await yesToken.balanceOf(predictionMarket.getAddress())).to.equal(
        initialYesTokenBalance - expectedTokenAmount,
      );
      expect(await noToken.balanceOf(predictionMarket.getAddress())).to.equal(
        initialNoTokenBalance - expectedTokenAmount,
      );
    });

    it("Should emit correct events when adding and removing liquidity", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 测试 LiquidityAdded 事件
      const liquidityToAdd = ethers.parseEther("5");
      const expectedTokenAmount = (liquidityToAdd * BigInt(1e18)) / ethers.parseEther("1");

      // 添加流动性，并预期触发事件
      await expect(predictionMarket.connect(owner).addLiquidity({ value: liquidityToAdd }))
        .to.emit(predictionMarket, "LiquidityAdded")
        .withArgs(owner.address, liquidityToAdd, expectedTokenAmount);

      // 测试 LiquidityRemoved 事件
      const ethToRemove = ethers.parseEther("3");
      const expectedTokenAmountToRemove = (ethToRemove * BigInt(1e18)) / ethers.parseEther("1");

      // 移除流动性，并预期触发事件
      await expect(predictionMarket.connect(owner).removeLiquidity(ethToRemove))
        .to.emit(predictionMarket, "LiquidityRemoved")
        .withArgs(owner.address, ethToRemove, expectedTokenAmountToRemove);
    });
  });

  describe("Checkpoint5", function () {
    it("Should revert when trying to add liquidity after prediction is reported", async function () {
      // 先报告预测结果
      await predictionMarket.connect(oracle).report(0); // 报告 YES 为获胜选项

      // 尝试在预测结果报告后添加流动性
      await expect(
        predictionMarket.connect(owner).addLiquidity({ value: ethers.parseEther("1") }),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__PredictionAlreadyReported");
    });

    it("Should revert when trying to remove liquidity after prediction is reported", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 先报告预测结果
      await predictionMarket.connect(oracle).report(0); // 报告 YES 为获胜选项

      // 尝试在预测结果报告后移除流动性
      await expect(
        predictionMarket.connect(owner).removeLiquidity(ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__PredictionAlreadyReported");
    });

    it("Should revert when trying to report after prediction is reported", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 先报告预测结果
      await predictionMarket.connect(oracle).report(0); // 报告 YES 为获胜选项

      // 尝试再次报告
      await expect(predictionMarket.connect(oracle).report(0)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__PredictionAlreadyReported",
      );
    });

    it("Should revert when trying to report when not called by the s_oracle", async function () {
      const [owner, oracle, nonOracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 尝试从非预言机账户报告
      await expect(predictionMarket.connect(nonOracle).report(0)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__OnlyOracleCanReport",
      );
    });

    it("Should correctly set winning token and isReported flag when reporting", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 在报告之前获取代币地址
      const yesTokenAddress = await predictionMarket.i_yesToken();

      // 初始时 isReported 应为 false
      expect(await predictionMarket.s_isReported()).to.equal(false);

      // 报告 YES 结果
      await predictionMarket.connect(oracle).report(0);

      // 验证 isReported 已被设为 true
      expect(await predictionMarket.s_isReported()).to.equal(true);

      // 验证获胜代币被设为 YES 代币
      expect(await predictionMarket.s_winningToken()).to.equal(yesTokenAddress);

      // 部署一个新实例来测试 NO 结果
      const predictionMarket2 = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question 2",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket2.waitForDeployment();

      // 获取第二个实例的代币地址
      const noTokenAddress2 = await predictionMarket2.i_noToken();

      // 初始时 isReported 应为 false
      expect(await predictionMarket2.s_isReported()).to.equal(false);

      // 报告 NO 结果
      await predictionMarket2.connect(oracle).report(1);

      // 验证 isReported 已被设为 true
      expect(await predictionMarket2.s_isReported()).to.equal(true);

      // 验证获胜代币被设为 NO 代币
      expect(await predictionMarket2.s_winningToken()).to.equal(noTokenAddress2);
    });

    it("Should emit correct MarketReported event when reporting", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 在报告之前获取代币地址
      const yesTokenAddress = await predictionMarket.i_yesToken();

      // 报告 YES 结果，并预期触发事件
      await expect(predictionMarket.connect(oracle).report(0))
        .to.emit(predictionMarket, "MarketReported")
        .withArgs(oracle.address, 0, yesTokenAddress); // 0 代表 YES 结果

      // 部署一个新实例来测试 NO 结果
      const predictionMarket2 = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question 2",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket2.waitForDeployment();

      // 获取第二个实例的代币地址
      const noTokenAddress2 = await predictionMarket2.i_noToken();

      // 报告 NO 结果，并预期触发事件
      await expect(predictionMarket2.connect(oracle).report(1))
        .to.emit(predictionMarket2, "MarketReported")
        .withArgs(oracle.address, 1, noTokenAddress2); // 1 代表 NO 结果
    });
  });

  describe("Checkpoint6", function () {
    it("Should revert when trying to resolve before prediction is reported", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 尝试在报告之前结算
      await expect(predictionMarket.connect(owner).resolveMarketAndWithdraw()).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__PredictionNotReported",
      );
    });

    it("Should correctly resolve market and withdraw ETH", async function () {
      const [owner, oracle, nonOwner] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取初始余额
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const initialContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());

      // 报告预测结果
      await predictionMarket.connect(oracle).report(0); // 报告 YES 为获胜选项

      // 获取获胜代币合约及初始值
      const winningTokenAddress = await predictionMarket.s_winningToken();
      const winningToken = await ethers.getContractAt("PredictionMarketToken", winningTokenAddress);
      const initialWinningTokens = await winningToken.balanceOf(predictionMarket.getAddress());
      const initialLpTradingRevenue = await predictionMarket.s_lpTradingRevenue();

      // 在结算之前计算预期金额
      const expectedEthAmount = (initialWinningTokens * ethers.parseEther("1")) / BigInt(1e18);
      const expectedTotalEthToSend = expectedEthAmount + initialLpTradingRevenue;

      // 尝试从非所有者账户结算（应当失败）
      await expect(predictionMarket.connect(nonOwner).resolveMarketAndWithdraw()).to.be.revertedWithCustomError(
        predictionMarket,
        "OwnableUnauthorizedAccount",
      );

      // 结算市场
      const tx = await predictionMarket.connect(owner).resolveMarketAndWithdraw();
      const receipt = await tx.wait();

      // 获取最终余额
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const finalContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());
      const finalWinningTokens = await winningToken.balanceOf(predictionMarket.getAddress());

      // 验证状态变化
      const expectedWinningTokens = BigInt(0);
      expect(finalWinningTokens).to.equal(expectedWinningTokens); // 所有获胜代币都应被销毁

      // 在余额计算中把 gas 费用考虑在内
      const gasUsed = receipt?.gasUsed || BigInt(0);
      const gasPrice = tx.gasPrice || BigInt(0);
      const gasCost = gasUsed * gasPrice;
      const actualEthReceived = finalOwnerBalance - initialOwnerBalance + gasCost;

      // 验证发送的金额准确无误
      expect(actualEthReceived).to.equal(expectedTotalEthToSend);
      expect(finalContractBalance).to.equal(initialContractBalance - expectedTotalEthToSend);

      // 验证事件已触发
      const marketResolvedEvent = receipt?.logs.find(log => {
        try {
          return predictionMarket.interface.parseLog({ topics: log.topics, data: log.data })?.name === "MarketResolved";
        } catch {
          return false;
        }
      });
      const expectedEvent = marketResolvedEvent !== undefined;
      expect(expectedEvent).to.equal(true);
    });

    it("Should send exact totalEthToSend amount to msg.sender", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取初始余额
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const initialContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());
      const initialLpTradingRevenue = await predictionMarket.s_lpTradingRevenue();

      // 报告预测结果
      await predictionMarket.connect(oracle).report(0); // 报告 YES 为获胜选项

      // 获取获胜代币合约及余额
      const winningTokenAddress = await predictionMarket.s_winningToken();
      const winningToken = await ethers.getContractAt("PredictionMarketToken", winningTokenAddress);
      const contractWinningTokens = await winningToken.balanceOf(predictionMarket.getAddress());

      // 根据获胜代币计算预期的 ETH 数量
      const ethFromWinningTokens = (contractWinningTokens * ethers.parseEther("1")) / BigInt(1e18);

      // 计算预期发送的 ETH 总额
      const expectedTotalEthToSend = ethFromWinningTokens + initialLpTradingRevenue;

      // 结算市场并获取交易
      const tx = await predictionMarket.connect(owner).resolveMarketAndWithdraw();
      const receipt = await tx.wait();

      // 获取最终余额
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const finalContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());

      // 计算实际发送的 ETH（把 gas 费用考虑在内）
      const gasUsed = receipt?.gasUsed || BigInt(0);
      const gasPrice = tx.gasPrice || BigInt(0);
      const gasCost = gasUsed * gasPrice;
      const actualEthReceived = finalOwnerBalance - initialOwnerBalance + gasCost;

      // 验证发送的金额准确无误
      expect(actualEthReceived).to.equal(expectedTotalEthToSend);
      expect(finalContractBalance).to.equal(initialContractBalance - expectedTotalEthToSend);
    });
  });

  describe("Checkpoint7", function () {
    it("Should correctly calculate buy price in ETH", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);

      // 计算预期值
      const PRECISION = BigInt(1e18);
      const initialTokenAmount = (ethers.parseEther("10") * PRECISION) / ethers.parseEther("1");
      const tradingAmount = initialTokenAmount / BigInt(10); // 购买总供应量的 10%

      // 获取 YES 代币的买入价格
      const buyPrice = await predictionMarket.getBuyPriceInEth(0, tradingAmount);

      // 验证价格计算
      const currentTokenSoldBefore = initialTokenAmount - (await yesToken.balanceOf(predictionMarket.getAddress()));
      const currentOtherTokenSold = initialTokenAmount - (await noToken.balanceOf(predictionMarket.getAddress()));
      const totalTokensSoldBefore = currentTokenSoldBefore + currentOtherTokenSold;
      const probabilityBefore = (currentTokenSoldBefore * PRECISION) / totalTokensSoldBefore;

      const currentTokenReserveAfter = (await yesToken.balanceOf(predictionMarket.getAddress())) - tradingAmount;
      const currentTokenSoldAfter = initialTokenAmount - currentTokenReserveAfter;
      const totalTokensSoldAfter = totalTokensSoldBefore + tradingAmount;
      const probabilityAfter = (currentTokenSoldAfter * PRECISION) / totalTokensSoldAfter;

      const probabilityAvg = (probabilityBefore + probabilityAfter) / BigInt(2);
      const expectedPrice = (ethers.parseEther("1") * probabilityAvg * tradingAmount) / (PRECISION * PRECISION);

      expect(buyPrice).to.equal(expectedPrice);
    });

    it("Should correctly calculate sell price in ETH", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);

      // 计算预期值
      const PRECISION = BigInt(1e18);
      const initialTokenAmount = (ethers.parseEther("10") * PRECISION) / ethers.parseEther("1");
      const tradingAmount = initialTokenAmount / BigInt(10); // 卖出总供应量的 10%

      // 获取 YES 代币的卖出价格
      const sellPrice = await predictionMarket.getSellPriceInEth(0, tradingAmount);

      // 验证价格计算
      const currentTokenSoldBefore = initialTokenAmount - (await yesToken.balanceOf(predictionMarket.getAddress()));
      const currentOtherTokenSold = initialTokenAmount - (await noToken.balanceOf(predictionMarket.getAddress()));
      const totalTokensSoldBefore = currentTokenSoldBefore + currentOtherTokenSold;
      const probabilityBefore = (currentTokenSoldBefore * PRECISION) / totalTokensSoldBefore;

      const currentTokenReserveAfter = (await yesToken.balanceOf(predictionMarket.getAddress())) + tradingAmount;
      const currentTokenSoldAfter = initialTokenAmount - currentTokenReserveAfter;
      const totalTokensSoldAfter = totalTokensSoldBefore - tradingAmount;
      const probabilityAfter = (currentTokenSoldAfter * PRECISION) / totalTokensSoldAfter;

      const probabilityAvg = (probabilityBefore + probabilityAfter) / BigInt(2);
      const expectedPrice = (ethers.parseEther("1") * probabilityAvg * tradingAmount) / (PRECISION * PRECISION);

      expect(sellPrice).to.equal(expectedPrice);
    });

    it("Should revert when trying to buy more tokens than available in reserve", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 尝试购买超过储备中可用数量的代币
      const reserveAmount = await yesToken.balanceOf(predictionMarket.getAddress());
      const tooManyTokens = reserveAmount + BigInt(1);

      await expect(predictionMarket.getBuyPriceInEth(0, tooManyTokens)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__InsufficientLiquidity",
      );
    });

    it("Should correctly calculate probability for different token amounts", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);

      // 计算预期值
      const PRECISION = BigInt(1e18);
      const initialTokenAmount = (ethers.parseEther("10") * PRECISION) / ethers.parseEther("1");

      // 测试不同场景
      const scenarios = [
        { liquidityToAdd: ethers.parseEther("10"), expectedProbability: PRECISION / BigInt(2) }, // 50% YES（初始状态）
        { liquidityToAdd: ethers.parseEther("20"), expectedProbability: PRECISION / BigInt(2) }, // 仍为 50% YES
      ];

      for (const scenario of scenarios) {
        // 添加流动性以产生代币余额
        await predictionMarket.connect(owner).addLiquidity({ value: scenario.liquidityToAdd });

        // 计算概率
        const currentTokenSold = initialTokenAmount - (await yesToken.balanceOf(predictionMarket.getAddress()));
        const totalTokensSold =
          initialTokenAmount -
          (await yesToken.balanceOf(predictionMarket.getAddress())) +
          (initialTokenAmount - (await noToken.balanceOf(predictionMarket.getAddress())));
        const probability = (currentTokenSold * PRECISION) / totalTokensSold;

        expect(probability).to.equal(scenario.expectedProbability);
      }
    });

    it("Should correctly get current reserves for both YES and NO outcomes", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const noTokenAddress = await predictionMarket.i_noToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const noToken = await ethers.getContractAt("PredictionMarketToken", noTokenAddress);

      // 获取初始储备
      const initialYesReserve = await yesToken.balanceOf(predictionMarket.getAddress());
      const initialNoReserve = await noToken.balanceOf(predictionMarket.getAddress());

      // 通过 YES 结果的价格计算来测试储备
      const smallAmount = BigInt(1e15); // 使用小额以尽量减小价格影响
      const yesPrice = await predictionMarket.getBuyPriceInEth(0, smallAmount);
      expect(yesPrice).to.be.gt(0); // 价格应被正确计算

      // 通过 NO 结果的价格计算来测试储备
      const noPrice = await predictionMarket.getBuyPriceInEth(1, smallAmount);
      expect(noPrice).to.be.gt(0); // 价格应被正确计算

      // 添加一些流动性以改变储备
      await predictionMarket.connect(owner).addLiquidity({ value: ethers.parseEther("5") });

      // 获取新的储备
      const newYesReserve = await yesToken.balanceOf(predictionMarket.getAddress());
      const newNoReserve = await noToken.balanceOf(predictionMarket.getAddress());

      // 验证两种储备等量增加
      expect(newYesReserve).to.be.gt(initialYesReserve);
      expect(newNoReserve).to.be.gt(initialNoReserve);
      expect(newYesReserve).to.equal(newNoReserve);

      // 再次通过价格计算来测试储备
      const yesPriceAfter = await predictionMarket.getBuyPriceInEth(0, smallAmount);
      const noPriceAfter = await predictionMarket.getBuyPriceInEth(1, smallAmount);

      // 在新的储备下，价格仍应被正确计算
      expect(yesPriceAfter).to.be.gt(0);
      expect(noPriceAfter).to.be.gt(0);
    });

    it("Should correctly calculate probability with edge cases", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 计算预期值
      const PRECISION = BigInt(1e18);
      const initialTokenAmount = (ethers.parseEther("10") * PRECISION) / ethers.parseEther("1");

      // 测试概率计算的不同场景
      const scenarios = [
        // 售出的代币极少（几乎全部仍在储备中）
        {
          yesTokensSold: BigInt(1),
          totalTokensSold: BigInt(2),
          expectedProbability: PRECISION / BigInt(2), // 50%
        },
        // 几乎所有代币都已售出（储备极少）
        {
          yesTokensSold: initialTokenAmount - BigInt(1),
          totalTokensSold: initialTokenAmount * BigInt(2) - BigInt(2),
          expectedProbability: PRECISION / BigInt(2), // 50%
        },
        // 分布不均（售出的 YES 代币更多）
        {
          yesTokensSold: initialTokenAmount / BigInt(2),
          totalTokensSold: initialTokenAmount,
          expectedProbability: PRECISION / BigInt(2), // 50%
        },
        // 分布不均（售出的 NO 代币更多）
        {
          yesTokensSold: initialTokenAmount / BigInt(4),
          totalTokensSold: initialTokenAmount,
          expectedProbability: PRECISION / BigInt(4), // 25%
        },
      ];

      for (const scenario of scenarios) {
        // 使用合约中的公式计算概率
        const probability = (scenario.yesTokensSold * PRECISION) / scenario.totalTokensSold;

        // 验证概率计算
        expect(probability).to.equal(scenario.expectedProbability);

        // 验证概率处于有效范围内（0 到 1）
        expect(probability).to.be.gte(BigInt(0));
        expect(probability).to.be.lte(PRECISION);
      }
    });
  });

  describe("Checkpoint8", function () {
    it("Should revert when trying to buy tokens with zero amount", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 尝试以零数量购买代币
      await expect(
        predictionMarket.connect(owner).buyTokensWithETH(0, 0, { value: ethers.parseEther("1") }),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__AmountMustBeGreaterThanZero");
    });

    it("Should revert when trying to sell tokens with zero amount", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 尝试以零数量卖出代币
      await expect(predictionMarket.connect(owner).sellTokensForEth(0, 0)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__AmountMustBeGreaterThanZero",
      );
    });

    it("Should revert when trying to buy tokens with incorrect ETH amount", async function () {
      const [owner, oracle, buyer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 计算要购买的数量
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);

      // 尝试用不正确的 ETH 数额购买
      await expect(
        predictionMarket.connect(buyer).buyTokensWithETH(0, amountToBuy, { value: requiredEth + BigInt(1) }),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__MustSendExactETHAmount");
    });

    it("Should successfully buy tokens with ETH", async function () {
      const [owner, oracle, buyer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 计算要购买的数量
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);

      // 获取初始余额
      const initialBuyerBalance = await yesToken.balanceOf(buyer.address);
      const initialContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());

      // 购买代币
      await predictionMarket.connect(buyer).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 获取最终余额
      const finalBuyerBalance = await yesToken.balanceOf(buyer.address);
      const finalContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());

      // 验证代币转账
      expect(finalBuyerBalance).to.equal(initialBuyerBalance + amountToBuy);
      expect(finalContractBalance).to.equal(initialContractBalance + requiredEth);
    });

    it("Should successfully sell tokens for ETH", async function () {
      const [owner, oracle, seller] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 先购买一些代币
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);
      await predictionMarket.connect(seller).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 授权代币以便卖出
      await yesToken.connect(seller).approve(predictionMarket.getAddress(), amountToBuy);

      // 获取初始余额
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);
      const initialContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());
      const initialSellerTokens = await yesToken.balanceOf(seller.address);

      // 计算将收到的 ETH
      const ethToReceive = await predictionMarket.getSellPriceInEth(0, amountToBuy);

      // 卖出代币
      const tx = await predictionMarket.connect(seller).sellTokensForEth(0, amountToBuy);
      const receipt = await tx.wait();

      // 获取最终余额
      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      const finalContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());
      const finalSellerTokens = await yesToken.balanceOf(seller.address);

      // 计算实际收到的 ETH（把 gas 费用考虑在内）
      const gasUsed = receipt?.gasUsed || BigInt(0);
      const gasPrice = tx.gasPrice || BigInt(0);
      const gasCost = gasUsed * gasPrice;
      const actualEthReceived = finalSellerBalance - initialSellerBalance + gasCost;

      // 验证代币转账及收到的 ETH
      expect(finalSellerTokens).to.equal(initialSellerTokens - amountToBuy);
      expect(actualEthReceived).to.equal(ethToReceive);
      expect(finalContractBalance).to.equal(initialContractBalance - ethToReceive);
    });

    it("Should revert when trying to sell more tokens than owned", async function () {
      const [owner, oracle, seller] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 先购买一些代币
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);
      await predictionMarket.connect(seller).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 授权代币以便卖出
      await yesToken.connect(seller).approve(predictionMarket.getAddress(), amountToBuy);

      // 尝试卖出超过持有数量的代币
      const tooManyTokens = amountToBuy + BigInt(1);
      await expect(predictionMarket.connect(seller).sellTokensForEth(0, tooManyTokens)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__InsufficientBalance",
      );
    });

    it("Should revert when trying to sell tokens without approval", async function () {
      const [owner, oracle, seller] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 先购买一些代币
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);
      await predictionMarket.connect(seller).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 尝试在未授权的情况下卖出代币
      await expect(predictionMarket.connect(seller).sellTokensForEth(0, amountToBuy)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__InsufficientAllowance",
      );
    });

    it("Should emit correct events when buying and selling tokens", async function () {
      const [owner, oracle, trader] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 计算要购买的数量
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);

      // 购买代币，并预期触发事件
      await expect(predictionMarket.connect(trader).buyTokensWithETH(0, amountToBuy, { value: requiredEth }))
        .to.emit(predictionMarket, "TokensPurchased")
        .withArgs(trader.address, 0, amountToBuy, requiredEth);

      // 授权代币以便卖出
      await yesToken.connect(trader).approve(predictionMarket.getAddress(), amountToBuy);

      // 计算将收到的 ETH
      const ethToReceive = await predictionMarket.getSellPriceInEth(0, amountToBuy);

      // 卖出代币，并预期触发事件
      await expect(predictionMarket.connect(trader).sellTokensForEth(0, amountToBuy))
        .to.emit(predictionMarket, "TokensSold")
        .withArgs(trader.address, 0, amountToBuy, ethToReceive);
    });

    it("Should revert when trying to buy tokens after prediction is reported", async function () {
      const [owner, oracle, buyer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 计算要购买的数量
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);

      // 报告预测结果
      await predictionMarket.connect(oracle).report(0);

      // 尝试在预测结果报告后购买代币
      await expect(
        predictionMarket.connect(buyer).buyTokensWithETH(0, amountToBuy, { value: requiredEth }),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__PredictionAlreadyReported");
    });

    it("Should revert when trying to sell tokens after prediction is reported", async function () {
      const [owner, oracle, seller] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 先购买一些代币
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);
      await predictionMarket.connect(seller).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 授权代币以便卖出
      await yesToken.connect(seller).approve(predictionMarket.getAddress(), amountToBuy);

      // 报告预测结果
      await predictionMarket.connect(oracle).report(0);

      // 尝试在预测结果报告后卖出代币
      await expect(predictionMarket.connect(seller).sellTokensForEth(0, amountToBuy)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__PredictionAlreadyReported",
      );
    });

    it("Owner cannot buy or sell tokens", async function () {
      const [owner] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        owner.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);

      // 所有者尝试购买代币
      await expect(
        predictionMarket.connect(owner).buyTokensWithETH(0, amountToBuy, { value: requiredEth }),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__OwnerCannotCall");

      // 所有者尝试卖出代币（即使所有者没有代币，也应在所有者检查处回滚）
      await expect(predictionMarket.connect(owner).sellTokensForEth(0, amountToBuy)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__OwnerCannotCall",
      );
    });
  });

  describe("Checkpoint9", function () {
    it("Should revert when trying to redeem before prediction is reported", async function () {
      const [owner, oracle, redeemer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 尝试在预测结果报告前赎回
      await expect(
        predictionMarket.connect(redeemer).redeemWinningTokens(ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__PredictionNotReported");
    });

    it("Should revert when trying to redeem more tokens than owned", async function () {
      const [owner, oracle, redeemer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 报告预测结果
      await predictionMarket.connect(oracle).report(0); // 报告 YES 为获胜结果

      // 尝试赎回超过持有数量的代币
      await expect(
        predictionMarket.connect(redeemer).redeemWinningTokens(ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__InsufficientWinningTokens");
    });

    it("Should revert when trying to redeem zero tokens", async function () {
      const [owner, oracle, redeemer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 报告预测结果
      await predictionMarket.connect(oracle).report(0);

      // 尝试赎回零个代币
      await expect(predictionMarket.connect(redeemer).redeemWinningTokens(0)).to.be.revertedWithCustomError(
        predictionMarket,
        "PredictionMarket__AmountMustBeGreaterThanZero",
      );
    });

    it("Should successfully redeem winning tokens and receive ETH", async function () {
      const [owner, oracle, redeemer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 先购买一些 YES 代币
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);
      await predictionMarket.connect(redeemer).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 报告 YES 为获胜结果
      await predictionMarket.connect(oracle).report(0);

      // 获取初始余额
      const initialRedeemerBalance = await ethers.provider.getBalance(redeemer.address);
      const initialContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());
      const initialRedeemerTokens = await yesToken.balanceOf(redeemer.address);

      // 计算预期将收到的 ETH
      const expectedEthToReceive = (amountToBuy * ethers.parseEther("1")) / BigInt(1e18);

      // 赎回代币
      const tx = await predictionMarket.connect(redeemer).redeemWinningTokens(amountToBuy);
      const receipt = await tx.wait();

      // 获取最终余额
      const finalRedeemerBalance = await ethers.provider.getBalance(redeemer.address);
      const finalContractBalance = await ethers.provider.getBalance(predictionMarket.getAddress());
      const finalRedeemerTokens = await yesToken.balanceOf(redeemer.address);

      // 计算实际收到的 ETH（把 gas 费用考虑在内）
      const gasUsed = receipt?.gasUsed || BigInt(0);
      const gasPrice = tx.gasPrice || BigInt(0);
      const gasCost = gasUsed * gasPrice;
      const actualEthReceived = finalRedeemerBalance - initialRedeemerBalance + gasCost;

      // 验证代币销毁及 ETH 转账
      expect(finalRedeemerTokens).to.equal(initialRedeemerTokens - amountToBuy);
      expect(actualEthReceived).to.equal(expectedEthToReceive);
      expect(finalContractBalance).to.equal(initialContractBalance - expectedEthToReceive);
    });

    it("Should emit correct WinningTokensRedeemed event", async function () {
      const [owner, oracle, redeemer] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 获取代币合约
      const yesTokenAddress = await predictionMarket.i_yesToken();
      const yesToken = await ethers.getContractAt("PredictionMarketToken", yesTokenAddress);

      // 先购买一些 YES 代币
      const amountToBuy = (await yesToken.balanceOf(predictionMarket.getAddress())) / BigInt(10);
      const requiredEth = await predictionMarket.getBuyPriceInEth(0, amountToBuy);
      await predictionMarket.connect(redeemer).buyTokensWithETH(0, amountToBuy, { value: requiredEth });

      // 报告 YES 为获胜结果
      await predictionMarket.connect(oracle).report(0);

      // 计算预期将收到的 ETH
      const expectedEthToReceive = (amountToBuy * ethers.parseEther("1")) / BigInt(1e18);

      // 赎回代币，并预期触发事件
      await expect(predictionMarket.connect(redeemer).redeemWinningTokens(amountToBuy))
        .to.emit(predictionMarket, "WinningTokensRedeemed")
        .withArgs(redeemer.address, amountToBuy, expectedEthToReceive);
    });

    it("Owner cannot redeem tokens", async function () {
      const [owner, oracle] = await ethers.getSigners();
      const predictionMarketFactory = await getPredictionMarketFactory();
      const predictionMarket = await predictionMarketFactory.deploy(
        owner.address,
        oracle.address,
        "Test Question",
        ethers.parseEther("1"),
        50,
        20,
        { value: ethers.parseEther("10") },
      );
      await predictionMarket.waitForDeployment();

      // 报告 YES 为获胜结果
      await predictionMarket.connect(oracle).report(0);

      // 尝试以所有者身份赎回（应当回滚）
      await expect(
        predictionMarket.connect(owner).redeemWinningTokens(ethers.parseEther("1")),
      ).to.be.revertedWithCustomError(predictionMarket, "PredictionMarket__OwnerCannotCall");
    });
  });
});
