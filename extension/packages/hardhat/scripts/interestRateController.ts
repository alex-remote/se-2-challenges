import { network } from "hardhat";
import type { DEX, RateController, MyUSDStaking, MyUSDEngine, Oracle } from "../types/ethers-contracts/index.js";
import {
  DEX__factory,
  RateController__factory,
  MyUSDStaking__factory,
  MyUSDEngine__factory,
  Oracle__factory,
} from "../types/ethers-contracts/index.js";
import { createDeploymentReader } from "./deployments.js";

const { ethers, networkName } = await network.create();

const getDeployedAddress = createDeploymentReader(networkName);

// --- 配置 ---
const TARGET_PRICE = 1;
const PRICE_TOLERANCE = 0.000005;
const RATE_ADJUSTMENT_INTERVAL = 2000; // 毫秒
const BORROW_RATE_MIN = 200; // 2%
const BORROW_RATE_MAX = 3000; // 30%
const SAVINGS_RATE_MIN = 200; // 2%
const PRICE_WINDOW = 10;
const RATE_CHANGE_DELAY = 10; // 再次调整利率前需要等待的迭代次数
const PEG_HIT_THRESHOLD = 2; // 启用增长模式所需的锚定命中次数
const RATE_SPREAD = 100; // 借款利率与储蓄利率之间保持 1% 的利差

// --- 状态 ---
const priceHistory: number[] = [];
let iterationsSinceLastChange = 0;
let isInitialized = false;
let isGrowthMode = false;
let pegHits = 0;
let lastRateDirection: "UP" | "DOWN" | null = null;

function logChange(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function getPriceDirection(): "UP" | "DOWN" | "FLAT" {
  if (priceHistory.length < PRICE_WINDOW) return "FLAT";
  const a = priceHistory[0];
  const b = priceHistory[priceHistory.length - 1];
  if (a < b) return "UP";
  if (a > b) return "DOWN";
  return "FLAT";
}

function priceDeviation(price: number): number {
  return (price - 1) / 1;
}

interface BinarySearchState {
  absoluteBounds: {
    min: number;
    max: number;
  };
  searchBounds: {
    low: number;
    high: number;
  };
  lastRate: number;
}

function getNextRate(
  state: BinarySearchState,
  direction: "UP" | "DOWN" | "FLAT",
  isPriceStable: boolean,
): { newRate: number; newState: BinarySearchState } {
  const { absoluteBounds, searchBounds, lastRate } = state;

  // 如果价格稳定，则重置搜索区间
  if (isPriceStable) {
    return {
      newRate: lastRate,
      newState: {
        absoluteBounds,
        searchBounds: {
          low: absoluteBounds.min,
          high: absoluteBounds.max,
        },
        lastRate,
      },
    };
  }

  // 如果搜索区间过窄（相差不足 10 bps），则以 100 bps 的余量重置区间
  if (searchBounds.high - searchBounds.low < 10) {
    const midPoint = Math.floor((searchBounds.low + searchBounds.high) / 2);
    const newLow = Math.max(midPoint - 50, absoluteBounds.min);
    const newHigh = Math.min(midPoint + 50, absoluteBounds.max);

    return {
      newRate: lastRate,
      newState: {
        absoluteBounds,
        searchBounds: {
          low: newLow,
          high: newHigh,
        },
        lastRate,
      },
    };
  }

  // 判断是否需要调整区间
  if (direction === "UP" || direction === "FLAT") {
    // 价格过高，需要降低利率
    const newRate = Math.floor((searchBounds.low + lastRate) / 2);
    return {
      newRate,
      newState: {
        absoluteBounds,
        searchBounds: {
          low: searchBounds.low,
          high: Math.min(lastRate + 100, absoluteBounds.max), // 当前利率过高
        },
        lastRate: newRate,
      },
    };
  } else {
    // 价格过低，需要提高利率
    const newRate = Math.floor((lastRate + searchBounds.high) / 2);
    return {
      newRate,
      newState: {
        absoluteBounds,
        searchBounds: {
          low: Math.max(lastRate - 100, absoluteBounds.min), // 当前利率过低
          high: searchBounds.high,
        },
        lastRate: newRate,
      },
    };
  }
}

function checkPegHit(direction: "UP" | "DOWN" | "FLAT"): boolean {
  if (direction === "FLAT") return false;

  const isHit = lastRateDirection !== null && lastRateDirection !== direction;
  lastRateDirection = direction;
  return isHit;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const dex: DEX = DEX__factory.connect(getDeployedAddress("DEX"), deployer);
  const rateController: RateController = RateController__factory.connect(
    getDeployedAddress("RateController"),
    deployer,
  );
  const engine: MyUSDEngine = MyUSDEngine__factory.connect(getDeployedAddress("MyUSDEngine"), deployer);
  const staking: MyUSDStaking = MyUSDStaking__factory.connect(getDeployedAddress("MyUSDStaking"), deployer);
  const oracle: Oracle = Oracle__factory.connect(getDeployedAddress("Oracle"), deployer);
  const ethPrice = await oracle.getETHUSDPrice();

  const startBorrowRate = await engine.borrowRate();
  const startSavingsRate = await staking.savingsRate();
  logChange(`Interest Rate Controller started in TEMPERED mode`);

  // 确保储蓄利率初始为 0
  if (startSavingsRate > 0) {
    logChange("Setting savings rate to 0 for tempered mode");
    await rateController.setSavingsRate(0);
  }

  // 初始化二分搜索状态
  const borrowState: BinarySearchState = {
    absoluteBounds: {
      min: BORROW_RATE_MIN,
      max: BORROW_RATE_MAX,
    },
    searchBounds: {
      low: BORROW_RATE_MIN,
      high: BORROW_RATE_MAX,
    },
    lastRate: Number(startBorrowRate),
  };

  const savingsState: BinarySearchState = {
    absoluteBounds: {
      min: SAVINGS_RATE_MIN,
      max: Number(startBorrowRate),
    },
    searchBounds: {
      low: SAVINGS_RATE_MIN,
      high: Number(startBorrowRate),
    },
    lastRate: Number(startSavingsRate),
  };

  setInterval(async () => {
    try {
      // --- 获取价格 ---
      const currentPriceRaw = await dex.currentPrice();
      const currentPriceEth = 1 / (Number(ethers.formatEther(currentPriceRaw)) / Number(ethers.formatEther(ethPrice)));
      priceHistory.push(currentPriceEth);
      if (priceHistory.length > PRICE_WINDOW) priceHistory.shift();
      const deviation = priceDeviation(currentPriceEth);
      const direction = getPriceDirection();
      const isPriceStable = Math.abs(deviation) <= PRICE_TOLERANCE;

      // 如果尚未初始化，则先初始化
      if (!isInitialized) {
        if (priceHistory.length >= PRICE_WINDOW) {
          logChange("Initial price direction established");
          isInitialized = true;
        } else {
          logChange("Waiting for initial price data...");
          return;
        }
      }

      // --- 借款利率逻辑 ---
      const isMovingTowardsPeg =
        (TARGET_PRICE > currentPriceEth && direction === "UP") ||
        (TARGET_PRICE < currentPriceEth && direction === "DOWN");
      const shouldChangeRate =
        Math.abs(deviation) > PRICE_TOLERANCE && !isMovingTowardsPeg && iterationsSinceLastChange >= RATE_CHANGE_DELAY;

      // 检测到稳定锚定后启用增长模式
      if (iterationsSinceLastChange > RATE_CHANGE_DELAY * 2 && isPriceStable && !isGrowthMode) {
        isGrowthMode = true;
        logChange("Activating GROWTH mode after stable peg detection!");

        // 大幅提高储蓄利率
        const initialSavingsRate = borrowState.lastRate - RATE_SPREAD;
        await rateController.setSavingsRate(initialSavingsRate);
        Object.assign(borrowState.searchBounds, { low: initialSavingsRate });
      }

      if (shouldChangeRate) {
        // 检查价格是否穿越了锚定价格
        if (!isGrowthMode && checkPegHit(direction)) {
          // 只有距离上一次命中已经过了一段时间，才算作一次新的锚定命中
          pegHits++;
          logChange(`Peg hit detected! (${pegHits}/${PEG_HIT_THRESHOLD})`);

          // 命中次数达到阈值后启用增长模式
          if (pegHits >= PEG_HIT_THRESHOLD) {
            isGrowthMode = true;
            logChange("Activating GROWTH mode after stable peg detection!");
            borrowState.searchBounds.low = BORROW_RATE_MIN;
          }
        }

        const { newRate, newState } = getNextRate(borrowState, direction, isPriceStable);
        logChange(
          `Price ${currentPriceEth.toFixed(6)} ${currentPriceEth > TARGET_PRICE ? "above" : "below"} peg, ` +
          `adjusting borrow rate to ${newRate}bps [${newState.searchBounds.low}, ${newState.searchBounds.high}]`,
        );
        await rateController.setBorrowRate(newRate);
        Object.assign(borrowState, newState);
        iterationsSinceLastChange = 0;

        // --- 储蓄利率逻辑（仅在增长模式下） ---
        if (isGrowthMode) {
          const maximumRate = Math.max(borrowState.lastRate - RATE_SPREAD, SAVINGS_RATE_MIN);
          // 更新储蓄利率的绝对边界
          Object.assign(savingsState.absoluteBounds, { max: maximumRate });
          Object.assign(savingsState.searchBounds, { high: maximumRate });

          const { newRate, newState } = getNextRate(savingsState, direction, isPriceStable);
          // 确保储蓄利率保持在边界内，且不超过当前借款利率
          const boundedRate = Math.min(Math.max(newRate, SAVINGS_RATE_MIN), maximumRate);
          logChange(
            `Price ${currentPriceEth.toFixed(6)} ${currentPriceEth > TARGET_PRICE ? "above" : "below"} peg, ` +
            `adjusting savings rate to ${boundedRate}bps [${newState.searchBounds.low}, ${maximumRate}]`,
          );
          await rateController.setSavingsRate(boundedRate);
          Object.assign(savingsState, newState);
          Object.assign(borrowState.searchBounds, {
            low: savingsState.lastRate,
          });
        }
      } else {
        iterationsSinceLastChange++;
      }
    } catch (e) {
      logChange(`Error: ${e}`);
    }
  }, RATE_ADJUSTMENT_INTERVAL);

  process.stdin.resume();
}

main().catch(e => {
  logChange(`Fatal error: ${e}`);
  process.exit(1);
});
