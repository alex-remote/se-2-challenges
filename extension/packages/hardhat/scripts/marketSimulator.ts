/* eslint-disable @typescript-eslint/no-unused-vars */
import { HDNodeWallet } from "ethers";
import { network } from "hardhat";
import type { DEX, MyUSDEngine, MyUSD, MyUSDStaking, Oracle } from "../types/ethers-contracts/index.js";
import {
  DEX__factory,
  MyUSDEngine__factory,
  MyUSD__factory,
  MyUSDStaking__factory,
  Oracle__factory,
} from "../types/ethers-contracts/index.js";
import blessed from "blessed";
import contrib from "blessed-contrib";
import { createDeploymentReader } from "./deployments.js";

const { ethers, networkName } = await network.create();

const getDeployedAddress = createDeploymentReader(networkName);

// 账户类型与偏好
interface BorrowerProfile {
  type: "borrower";
  wallet: HDNodeWallet;
  debtTolerance: number; // 0-100，越高 = 越愿意按抵押品价值借入更多
  rateSensitivity: number; // 0-100，越高 = 对高借款利率越敏感
  maxAcceptableRate: number; // 基点——利率低于此值时仍会借款
  initialEth: bigint;
}

interface StakerProfile {
  type: "staker";
  wallet: HDNodeWallet;
  yieldSensitivity: number; // 0-100，越高 = 对质押收益越敏感
  minAcceptableRate: number; // 基点——可接受的最低储蓄利率
  initialEth: bigint;
}

type SimulatedAccount = BorrowerProfile | StakerProfile;

// 配置
const NUM_BORROWERS = 5;
const NUM_STAKERS = 5;
const SIMULATION_INTERVAL_MS = 2000;
const UI_REFRESH_MS = 500;

// 界面全局变量
let screen: blessed.Widgets.Screen;
let grid: any;
let systemInfoBox: blessed.Widgets.BoxElement;
let borrowersTable: any;
let stakersTable: any;
let activityLog: blessed.Widgets.Log;

// 带时间戳的活动日志
function logActivity(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  if (activityLog) {
    activityLog.log(`[${timestamp}] ${message}`);
    screen.render();
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

// 初始化界面
function initializeUI() {
  // 创建 blessed 屏幕
  screen = blessed.screen({
    smartCSR: true,
    title: "MyUSD Stablecoin Market Simulator",
  });

  // 帮助用户退出
  screen.key(["escape", "q", "C-c"], function () {
    return process.exit(0);
  });

  // 创建布局网格
  grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // 系统信息框——全宽，2 行
  systemInfoBox = grid.set(0, 0, 2, 12, blessed.box, {
    label: "System Status",
    tags: true,
    border: { type: "line" },
    style: {
      border: { fg: "blue" },
    },
  });

  // 借款人表格——全宽，3 行
  borrowersTable = grid.set(2, 0, 4, 12, contrib.table, {
    label: "Borrowers",
    keys: true,
    vi: true,
    interactive: false,
    selectedFg: "white",
    selectedBg: "blue",
    columnSpacing: 1,
    columnWidth: [14, 14, 14, 14, 40],
  });

  // 质押者表格——全宽，3 行
  stakersTable = grid.set(6, 0, 4, 12, contrib.table, {
    label: "Stakers",
    keys: true,
    vi: true,
    interactive: false,
    selectedFg: "white",
    selectedBg: "blue",
    columnSpacing: 1,
    columnWidth: [14, 14, 14, 14, 40],
  });

  // 活动日志——全宽，位于底部的 4 行
  activityLog = grid.set(10, 0, 2, 12, blessed.log, {
    label: "Activity Log",
    tags: true,
    scrollable: true,
    mouse: true,
    keys: true,
    vi: true,
    border: { type: "line" },
    scrollbar: {
      ch: " ",
      track: {
        bg: "cyan",
      },
      style: {
        inverse: true,
      },
    },
    style: {
      border: { fg: "green" },
    },
  });

  // 设置表格
  borrowersTable.setData({
    headers: ["Address", "Collateral", "Debt", "Max Rate", "Status"],
    data: [["Loading...", "...", "...", "...", "..."]],
  });

  stakersTable.setData({
    headers: ["Address", "MyUSD Bal", "Staked", "Min Rate", "Status"],
    data: [["Loading...", "...", "...", "...", "..."]],
  });

  // 初次渲染
  logActivity("Market simulator started");
  screen.render();
}

// 根据当前情况获取借款人的状态描述
function getBorrowerStatus(
  borrower: BorrowerProfile,
  currentDebt: bigint,
  collateralValue: bigint,
  currentBorrowRate: number,
): string {
  // 先检查利率是否可接受
  if (currentBorrowRate > borrower.maxAcceptableRate) {
    if (currentDebt > 0n) {
      return "{yellow-fg}Rate too high, unwinding debt";
    } else {
      return "{yellow-fg}Waiting for lower rate";
    }
  }

  // 如果完全没有抵押品但利率可接受
  if (collateralValue <= 0n) {
    return "{cyan-fg}Adding collateral";
  }

  // 最大债务检查
  const maxPossibleDebt = (collateralValue * 2n) / 3n; // 约为抵押品价值的 66%
  if (currentDebt >= maxPossibleDebt) {
    return "{red-fg}At max debt capacity";
  }

  // 确定借款意愿
  const rateFactor =
    1 -
    (Math.min(currentBorrowRate, borrower.maxAcceptableRate) / borrower.maxAcceptableRate) *
    (borrower.rateSensitivity / 100);

  const borrowingWillingness = (borrower.debtTolerance / 100) * rateFactor;

  // 计算杠杆率（债务与抵押品之比）
  const leverageRatio = collateralValue > 0n ? (Number(currentDebt) / Number(collateralValue)) * 100 : 0;

  if (borrowingWillingness > 0.7) {
    if (leverageRatio > 60) {
      return "{magenta-fg}Leveraged to the max";
    } else if (leverageRatio > 40) {
      return "{green-fg}Aggressively leveraging";
    } else {
      return "{green-fg}Starting leverage cycle";
    }
  } else if (borrowingWillingness > 0.3) {
    if (leverageRatio > 40) {
      return "{cyan-fg}Moderately leveraged";
    } else {
      return "{green-fg}Modest leveraging";
    }
  } else {
    return "{blue-fg}Cautious leveraging";
  }
}

// 根据当前情况获取质押者的状态描述
function getStakerStatus(
  staker: StakerProfile,
  myUSDBalance: bigint,
  stakedShares: bigint,
  currentSavingsRate: number,
): string {
  // 检查质押者是否有质押仓位
  if (stakedShares > 0n) {
    if (currentSavingsRate < staker.minAcceptableRate) {
      return "{yellow-fg}Rate too low, unstaking";
    } else {
      // 如果当前利率远高于最低要求，就非常有吸引力
      const rateDifference = currentSavingsRate - staker.minAcceptableRate;
      const rateAppeal = Math.min(1, rateDifference / 500); // 利率很高时上限为 1.0

      if (rateAppeal > 0.5) {
        return "{green-fg}Staked, great yield";
      } else {
        return "{cyan-fg}Staked, acceptable yield";
      }
    }
  }

  // 没有质押仓位
  if (myUSDBalance > ethers.parseEther("0.5")) {
    if (currentSavingsRate >= staker.minAcceptableRate) {
      // 利率差为正，说明是有吸引力的质押机会
      const rateDifference = currentSavingsRate - staker.minAcceptableRate;
      const rateAppeal = Math.min(1, rateDifference / 500); // 利率很高时上限为 1.0
      const stakingWillingness = (staker.yieldSensitivity / 100) * rateAppeal;

      if (stakingWillingness > 0.5) {
        return "{green-fg}Staking, good rate";
      } else {
        return "{blue-fg}Considering staking";
      }
    } else {
      return "{red-fg}Yield too low";
    }
  } else {
    if (currentSavingsRate >= staker.minAcceptableRate) {
      return "{cyan-fg}Acquiring MyUSD";
    } else {
      return "{gray-fg}Waiting for better rates";
    }
  }
}

// 用最新数据更新界面
async function updateUI(
  dex: DEX,
  ethPrice: bigint,
  engine: MyUSDEngine,
  myUSD: MyUSD,
  staking: MyUSDStaking,
  borrowers: BorrowerProfile[],
  stakers: StakerProfile[],
) {
  try {
    // 获取价格数据
    const ethToMyUSDPrice = await dex.currentPrice();
    const ethToMyUSDPriceNum = Number(ethers.formatEther(ethToMyUSDPrice));
    const ethPriceDecimal = Number(ethers.formatEther(ethPrice));
    const myUSDPriceInUSD = 1 / (ethToMyUSDPriceNum / ethPriceDecimal);

    // 获取多个部分都要用到的公共数据
    const savingsRate = Number(await staking.savingsRate());
    const borrowRate = Number(await engine.borrowRate());
    const debtExchangeRate = await engine.debtExchangeRate();
    const stakingExchangeRate = await staking.exchangeRate();

    // 更新系统信息
    try {
      systemInfoBox.setContent(
        `MyUSD Price: {yellow-fg}${myUSDPriceInUSD.toFixed(6)}{/yellow-fg}  |  ` +
        `ETH Price: {cyan-fg}${ethToMyUSDPriceNum.toFixed(1)} MyUSD{/cyan-fg} | ` +
        `Savings Rate: {cyan-fg}${savingsRate > 0 ? savingsRate / 100 : 0}% {/cyan-fg}  |  ` +
        `Borrow Rate: {magenta-fg}${borrowRate > 0 ? borrowRate / 100 : 0}% {/magenta-fg}`,
      );
    } catch (error: any) {
      console.log(`Error updating system info: ${error}`);
    }

    // 更新借款人表格
    try {
      const borrowerRows: string[][] = [];
      for (const borrower of borrowers) {
        const collateralAmount = await engine.s_userCollateral(borrower.wallet.address);
        const debtShares = await engine.s_userDebtShares(borrower.wallet.address);
        const debt = (debtShares * debtExchangeRate) / BigInt(1e18);

        // 根据借款人的仓位和市场情况获取状态文字
        const statusText = getBorrowerStatus(borrower, debt, collateralAmount, borrowRate);

        borrowerRows.push([
          borrower.wallet.address.slice(0, 6) + "...",
          Number(ethers.formatEther(collateralAmount).split(".")[0]).toLocaleString(),
          Number(ethers.formatEther(debt).split(".")[0]).toLocaleString(),
          (borrower.maxAcceptableRate / 100).toFixed(1) + "%",
          statusText,
        ]);
      }

      borrowersTable.setData({
        headers: ["Address", "Collateral", "Debt", "Max Rate", "Status"],
        data: borrowerRows,
      });
    } catch (error: any) {
      console.log(`Error updating borrowers table: ${error}`);
    }

    // 更新质押者表格
    try {
      const stakerRows: string[][] = [];
      for (const staker of stakers) {
        const myUSDBalance = await myUSD.balanceOf(staker.wallet.address);
        const stakedShares = await staking.userShares(staker.wallet.address);
        const stakedValue = (stakedShares * stakingExchangeRate) / BigInt(1e18);

        // 根据质押者的仓位和市场情况获取状态文字
        const statusText = getStakerStatus(staker, myUSDBalance, stakedShares, savingsRate);

        stakerRows.push([
          staker.wallet.address.slice(0, 6) + "...",
          Number(ethers.formatEther(myUSDBalance).split(".")[0]).toLocaleString(),
          Number(ethers.formatEther(stakedValue).split(".")[0]).toLocaleString(),
          (staker.minAcceptableRate / 100).toFixed(1) + "%",
          statusText,
        ]);
      }

      stakersTable.setData({
        headers: ["Address", "MyUSD Bal", "Staked", "Min Rate", "Status"],
        data: stakerRows.length > 0 ? stakerRows : [["-", "-", "-", "-", "No stakers"]],
      });
      stakersTable.show();
    } catch (error: any) {
      console.log(`Error updating stakers table: ${error}`);
    }

    // 渲染屏幕
    screen.render();
  } catch (error: any) {
    console.log(`Error updating UI: ${error}`);
  }
}

// 账户资金管理
async function fundAccountsIfNeeded(accounts: SimulatedAccount[], deployer: any) {
  for (const account of accounts) {
    const currentBalance = await ethers.provider.getBalance(account.wallet.address);

    // 余额低于 2 ETH 时注资
    if (currentBalance < ethers.parseEther("2")) {
      // 随机金额，介于 30-130 ETH 之间
      const randomEth = 30 + Math.random() * 100;
      // 质押者获得更多，因为他们无法利用杠杆对价格产生复利式的影响。
      const multiplier = account.type === "staker" ? 1.66 : 1;
      const topUpAmount = ethers.parseEther((randomEth * multiplier).toString());

      const tx = await deployer.sendTransaction({
        to: account.wallet.address,
        value: topUpAmount,
      });
      await tx.wait();
      logActivity(`Topped up ${account.wallet.address.slice(0, 6)}... with ${randomEth.toFixed(2)} ETH`);
    }
  }
}

// 创建具有不同画像的账户
async function setupAccounts(): Promise<SimulatedAccount[]> {
  const accounts: SimulatedAccount[] = [];
  const initialEth = ethers.parseEther("120"); // 每个账户 120 ETH
  const [deployer] = await ethers.getSigners();

  // 使用基础助记词创建确定性钱包
  const baseMnemonic = "test test test test test test test test test test test junk";

  // 创建借款人账户
  for (let i = 0; i < NUM_BORROWERS; i++) {
    const wallet = ethers.HDNodeWallet.fromPhrase(baseMnemonic, `m/44'/60'/0'/0/${i}`).connect(ethers.provider);

    // 创建各不相同的画像
    accounts.push({
      type: "borrower",
      wallet,
      debtTolerance: 20 + Math.floor(Math.random() * 70), // 20-90%
      rateSensitivity: 25 + Math.floor(Math.random() * 75), // 25-100%
      maxAcceptableRate: 100 + Math.floor(Math.random() * 2100), // 100-2200 基点
      initialEth,
    });
  }

  // 创建质押者账户
  for (let i = 0; i < NUM_STAKERS; i++) {
    const wallet = ethers.HDNodeWallet.fromPhrase(baseMnemonic, `m/44'/60'/0'/0/${i + NUM_BORROWERS}`).connect(
      ethers.provider,
    );

    accounts.push({
      type: "staker",
      wallet,
      yieldSensitivity: 25 + Math.floor(Math.random() * 75), // 25-100%
      minAcceptableRate: 200 + Math.floor(Math.random() * 800), // 200-1000 基点
      initialEth,
    });
  }

  // 进行初始注资
  await fundAccountsIfNeeded(accounts, deployer);

  return accounts;
}

// 模拟借款人行为
async function simulateBorrowing(
  engine: MyUSDEngine,
  myUSD: MyUSD,
  dex: DEX,
  borrowers: BorrowerProfile[],
  currentBorrowRate: number,
) {
  for (const borrower of borrowers) {
    const engineWithBorrower = engine.connect(borrower.wallet);
    const myUSDWithBorrower = myUSD.connect(borrower.wallet);

    // 获取当前债务和抵押品
    const collateralValue = await engine.calculateCollateralValue(borrower.wallet.address);
    const currentDebt = await engine.getCurrentDebtValue(borrower.wallet.address);
    // 根据借款人画像计算要保留的固定债务额
    const baseAmount = ethers.parseEther("100000"); // 基础金额为 100000 MyUSD
    const riskMultiplier = (borrower.debtTolerance / 100) * (1 - borrower.rateSensitivity / 200);
    const amountToKeep = (baseAmount * BigInt(Math.floor(riskMultiplier * 100))) / 100n;
    // 检查借款人是否因利率过高而需要偿还债务
    if (currentDebt > amountToKeep && currentBorrowRate > borrower.maxAcceptableRate) {
      const myUSDBalance = await myUSD.balanceOf(borrower.wallet.address);

      if (myUSDBalance > ethers.parseEther("10")) {
        try {
          // 计算要销毁的数量（当前债务 - 要保留的数量）
          let amountToBurn = currentDebt - amountToKeep;
          if (amountToBurn < 0n) amountToBurn = 0n;
          if (amountToBurn > myUSDBalance) {
            amountToBurn = myUSDBalance;
          }

          // 授权并销毁债务
          await myUSDWithBorrower.approve(engine.target, amountToBurn);
          await engineWithBorrower.repayUpTo(amountToBurn);

          logActivity(
            `Borrower ${borrower.wallet.address.slice(0, 6)}... repaid ${ethers.formatEther(amountToBurn).slice(0, 6)} MyUSD ` +
            `(keeping ${ethers.formatEther(amountToKeep).slice(0, 6)} MyUSD)`,
          );
        } catch (error: any) {
          logActivity(`Failed to repay debt for ${borrower.wallet.address.slice(0, 6)}...`);
        }
        continue;
      } else {
        // 如果没有 MyUSD 余额但利率过高，尝试用 ETH 兑换一些
        const ethBalance = await ethers.provider.getBalance(borrower.wallet.address);
        const safeEthToSwap = ethBalance - ethers.parseEther("1"); // 至少保留 1 ETH

        if (safeEthToSwap > 0n) {
          try {
            // 用 ETH 兑换 MyUSD 用于偿还
            const dexWithBorrower = dex.connect(borrower.wallet);
            await dexWithBorrower.swap(safeEthToSwap, { value: safeEthToSwap });

            logActivity(
              `Borrower ${borrower.wallet.address.slice(0, 6)}... swapped ${ethers.formatEther(safeEthToSwap).slice(0, 6)} ETH for MyUSD ` +
              `to repay debt (rate: ${currentBorrowRate} > ${borrower.maxAcceptableRate})`,
            );
            continue;
          } catch (error: any) {
            logActivity(`Failed to swap ETH for MyUSD for ${borrower.wallet.address.slice(0, 6)}...`);
          }
        }
      }
    }

    // 利率可接受时的正常借款行为
    if (currentBorrowRate <= borrower.maxAcceptableRate) {
      // 根据利率敏感度计算借款意愿
      const rateFactor =
        1 -
        (Math.min(currentBorrowRate, borrower.maxAcceptableRate) / borrower.maxAcceptableRate) *
        (borrower.rateSensitivity / 100);

      // 容忍度越高 + 利率敏感度越低 = 借得越多
      const borrowingWillingness = (borrower.debtTolerance / 100) * rateFactor;

      if (collateralValue <= 0n) {
        // 如果没有抵押品，先添加一些
        const collateralToAdd = ethers.parseEther((1 + Math.random() * 5).toString());
        const balance = await ethers.provider.getBalance(borrower.wallet.address);

        if (balance > collateralToAdd + ethers.parseEther("1")) {
          try {
            await engineWithBorrower.addCollateral({ value: collateralToAdd });
            logActivity(
              `Borrower ${borrower.wallet.address.slice(0, 6)}... added ${ethers.formatEther(collateralToAdd).slice(0, 6)} ETH as collateral`,
            );
          } catch (error: any) {
            logActivity(`Failed to add collateral for ${borrower.wallet.address.slice(0, 6)}...`);
          }
        }
        continue;
      }

      // 计算最大可借债务（基于 150% 抵押率）
      const maxPossibleDebt = (collateralValue * 2n) / 3n; // 约为抵押品价值的 66%（150% 抵押率）

      if (currentDebt >= maxPossibleDebt) {
        logActivity(`Borrower ${borrower.wallet.address.slice(0, 6)}... at max debt capacity`);
        continue;
      }

      // 根据借款意愿计算要借的数量
      const availableToBorrow = maxPossibleDebt - currentDebt;
      const borrowAmount = (availableToBorrow * BigInt(Math.floor(borrowingWillingness * 100))) / 100n;

      if (borrowAmount > 0n) {
        try {
          // 杠杆借款策略——每次执行一轮杠杆循环
          await executeBorrowing(borrower, engine, myUSD, dex, borrowAmount, borrowingWillingness, currentBorrowRate);
        } catch (error: any) {
          logActivity(
            `Failed to execute leveraged borrowing for ${borrower.wallet.address.slice(0, 6)}... Error: ${error}`,
          );
        }
      }
    }
  }
}

// 执行单轮杠杆借款策略
async function executeBorrowing(
  borrower: BorrowerProfile,
  engine: MyUSDEngine,
  myUSD: MyUSD,
  dex: DEX,
  borrowAmount: bigint,
  borrowingWillingness: number,
  currentBorrowRate: number,
) {
  const engineWithBorrower = engine.connect(borrower.wallet);
  const myUSDWithBorrower = myUSD.connect(borrower.wallet);
  const dexWithBorrower = dex.connect(borrower.wallet);

  // 如果剩余数量太小，就不必操作了
  if (borrowAmount < ethers.parseEther("0.1")) {
    return;
  }

  try {
    // 1. 借入 MyUSD
    await engineWithBorrower.mintMyUSD(borrowAmount);

    // 2. 授权并将 MyUSD 兑换成 ETH（比例取决于风险偏好）
    let percentToSwapNum = 60 + borrower.debtTolerance * 0.3 - borrower.rateSensitivity * 0.2;
    percentToSwapNum = Math.max(10, Math.min(100, percentToSwapNum));
    const percentToSwap = BigInt(Math.round(percentToSwapNum));
    const myUSDToSwap = (borrowAmount * percentToSwap) / 100n;
    await myUSDWithBorrower.approve(dex.target, myUSDToSwap);
    const swapTx = await dexWithBorrower.swap(myUSDToSwap);
    await swapTx.wait();

    // 4. 把 ETH 添加为抵押品（使用超出 1 ETH 安全余量部分的 90%）
    const ethBalance = await ethers.provider.getBalance(borrower.wallet.address);
    const safetyMargin = ethers.parseEther("1");

    if (ethBalance > safetyMargin) {
      const ethToAdd = ((ethBalance - safetyMargin) * 90n) / 100n; // 添加可用 ETH 的 90%

      if (ethToAdd > ethers.parseEther("0.05")) {
        // 仅在数量足够有意义时执行
        const addCollateralTx = await engineWithBorrower.addCollateral({ value: ethToAdd });
        await addCollateralTx.wait();
      }
    }

    logActivity(
      `Borrower ${borrower.wallet.address.slice(0, 6)}... leveraged borrowed ${ethers.formatEther(borrowAmount).slice(0, 6)} MyUSD ` +
      `(rate: ${currentBorrowRate} bps, willingness: ${(borrowingWillingness * 100).toFixed(1)}%)`,
    );
  } catch (error: any) {
    logActivity(`Leveraged borrowing failed for ${borrower.wallet.address.slice(0, 6)}... Error: ${error}`);
  }
}

// 模拟质押者行为
async function simulateStaking(
  dex: DEX,
  myUSD: MyUSD,
  staking: MyUSDStaking,
  stakers: StakerProfile[],
  currentSavingsRate: number,
) {
  for (const staker of stakers) {
    // 获取当前 MyUSD 余额和已质押数量
    const myUSDBalance = await myUSD.balanceOf(staker.wallet.address);
    const stakedShares = await staking.userShares(staker.wallet.address);

    const stakingWithStaker = staking.connect(staker.wallet);
    const myUSDWithStaker = myUSD.connect(staker.wallet);
    const dexWithStaker = dex.connect(staker.wallet);

    // 根据利率判断质押者是否应取消质押
    if (stakedShares > 0n && currentSavingsRate < staker.minAcceptableRate) {
      try {
        // 当利率低于最低可接受利率时，取消质押全部份额
        if (stakedShares > 0n) {
          // 取消质押全部份额
          await stakingWithStaker.withdraw();

          logActivity(
            `Staker ${staker.wallet.address.slice(0, 6)}... unstaked ALL shares ` +
            `(rate: ${currentSavingsRate} bps < min rate: ${staker.minAcceptableRate} bps)`,
          );
        }
      } catch (error: any) {
        logActivity(`Failed to unstake for ${staker.wallet.address.slice(0, 6)}...`);
      }

      // 如果已取消质押或已有余额，把全部 MyUSD 卖出换成 ETH
      const sellableBalance = await myUSD.balanceOf(staker.wallet.address);

      if (sellableBalance > 0n) {
        try {
          // 利率低于最低要求时，把全部 MyUSD 兑换成 ETH
          if (sellableBalance > 0n) {
            // 授权并将 MyUSD 兑换成 ETH
            await myUSDWithStaker.approve(dex.target, sellableBalance);
            await dexWithStaker.swap(sellableBalance);

            logActivity(
              `Staker ${staker.wallet.address.slice(0, 6)}... sold ALL MyUSD (${ethers.formatEther(sellableBalance).slice(0, 6)}) for ETH ` +
              `(rate too low: ${currentSavingsRate} < ${staker.minAcceptableRate} bps)`,
            );
          }
        } catch (error: any) {
          logActivity(`Failed to sell MyUSD for ${staker.wallet.address.slice(0, 6)}...: ${error}`);
        }
      }

      continue;
    }

    // 判断质押者是否应获取 MyUSD
    const ethReserve = ethers.parseEther("0.1"); // 用于支付 gas
    if (myUSDBalance < ethReserve && currentSavingsRate >= staker.minAcceptableRate) {
      const ethBalance = await ethers.provider.getBalance(staker.wallet.address);
      if (ethBalance > ethReserve) {
        try {
          // 用 ETH 兑换 MyUSD
          const ethToSwap = ethBalance - ethReserve;
          await dexWithStaker.swap(ethToSwap, { value: ethToSwap });
          logActivity(
            `Staker ${staker.wallet.address.slice(0, 6)}... swapped ${ethers.formatEther(ethToSwap).slice(0, 6)} ETH for MyUSD`,
          );
        } catch (error: any) {
          logActivity(`Failed to swap ETH for MyUSD for ${staker.wallet.address.slice(0, 6)}...`);
        }
        continue;
      }
    }

    // 根据当前利率决定是否质押
    if (currentSavingsRate >= staker.minAcceptableRate) {
      // 根据利率和敏感度计算质押意愿
      // 利率越高，意愿按比例越强
      const rateDifference = currentSavingsRate - staker.minAcceptableRate;
      const rateAppeal = Math.min(1, rateDifference / 500); // 利率很高时上限为 1.0
      const stakingWillingness = (staker.yieldSensitivity / 100) * rateAppeal;

      // 计算要质押的数量
      const amountToStake = (myUSDBalance * BigInt(Math.floor(stakingWillingness * 100))) / 100n;

      if (amountToStake > 0n) {
        try {
          // 授权并质押
          await myUSDWithStaker.approve(staking.target, amountToStake);
          await stakingWithStaker.stake(amountToStake);
          logActivity(
            `Staker ${staker.wallet.address.slice(0, 6)}... staked ${ethers.formatEther(amountToStake).slice(0, 6)} MyUSD ` +
            `(rate: ${currentSavingsRate} bps, willingness: ${(stakingWillingness * 100).toFixed(1)}%)`,
          );
        } catch (error: any) {
          logActivity(`Failed to stake for ${staker.wallet.address.slice(0, 6)}...`);
        }
      }
    }
  }
}

// 主模拟函数
async function simulateMarket(
  dex: DEX,
  ethPrice: bigint,
  engine: MyUSDEngine,
  myUSD: MyUSD,
  staking: MyUSDStaking,
  accounts: SimulatedAccount[],
  deployer: any,
) {
  logActivity("Starting market simulation...");

  // 按类型区分账户
  const borrowers = accounts.filter(a => a.type === "borrower") as BorrowerProfile[];
  const stakers = accounts.filter(a => a.type === "staker") as StakerProfile[];

  logActivity(`Initialized with ${borrowers.length} borrowers and ${stakers.length} stakers`);

  // 从合约获取当前利率
  const currentSavingsRate = Number(await staking.savingsRate());
  const currentBorrowRate = Number(await engine.borrowRate());

  logActivity(`Initial rates - Savings: ${currentSavingsRate} bps, Borrow: ${currentBorrowRate} bps`);

  // 启动界面更新定时器
  setInterval(() => updateUI(dex, ethPrice, engine, myUSD, staking, borrowers, stakers), UI_REFRESH_MS);

  // 按固定间隔执行市场行为
  setInterval(async () => {
    try {
      // 获取最新利率
      const latestSavingsRate = Number(await staking.savingsRate());
      const latestBorrowRate = Number(await engine.borrowRate());

      // 检查账户，需要时注资
      await fundAccountsIfNeeded(accounts, deployer);

      // 模拟借款人行为（每轮 50% 概率）
      if (Math.random() < 0.5) {
        await simulateBorrowing(engine, myUSD, dex, borrowers, latestBorrowRate);
      }

      // 模拟质押者行为（每轮 50% 概率）
      if (Math.random() < 0.5) {
        await simulateStaking(dex, myUSD, staking, stakers, latestSavingsRate);
      }
    } catch (error: any) {
      logActivity(`Error in market simulation interval: ${error}`);
    }
  }, SIMULATION_INTERVAL_MS);
}

async function main() {
  try {
    // 先初始化界面
    initializeUI();
    logActivity("Initializing simulator...");

    const [deployer] = await ethers.getSigners();
    const dex: DEX = DEX__factory.connect(getDeployedAddress("DEX"), deployer);
    const oracle: Oracle = Oracle__factory.connect(getDeployedAddress("Oracle"), deployer);
    const ethPrice = await oracle.getETHUSDPrice();
    const engine: MyUSDEngine = MyUSDEngine__factory.connect(getDeployedAddress("MyUSDEngine"), deployer);
    const myUSD: MyUSD = MyUSD__factory.connect(getDeployedAddress("MyUSD"), deployer);
    const staking: MyUSDStaking = MyUSDStaking__factory.connect(getDeployedAddress("MyUSDStaking"), deployer);

    logActivity("Connected to deployed contracts");
    const accounts = await setupAccounts();
    logActivity("Created simulated accounts");

    // 启动市场模拟
    await simulateMarket(dex, ethPrice, engine, myUSD, staking, accounts, deployer);
  } catch (error: any) {
    logActivity(`Fatal error: ${error}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
