import { parseEther, formatEther } from "viem";
import {
  getPublicClient,
  getWalletClients,
  getDeployerClient,
  DEPLOYER_INDEX,
} from "./accounts.js";
import { getContract } from "./contractHelper.js";

const NUM_ACCOUNTS = 5;
const CHANCE_TO_BORROW = 0.3;
const CHANCE_TO_ADD_COLLATERAL = 0.2;

const liquidationInProgress = new Set();

const publicClient = getPublicClient();
const walletClients = getWalletClients();
const deployer = getDeployerClient();

// 使用 anvil 的 0-4 号账户作为机器人账户（部署者是 9 号账户）
const botClients = walletClients.slice(0, NUM_ACCOUNTS);

const lending = getContract("Lending");
const corn = getContract("Corn");
const cornDEX = getContract("CornDEX");
const movePrice = getContract("MovePrice");

async function fundAccountsIfNeeded() {
  for (const client of botClients) {
    const balance = await publicClient.getBalance({
      address: client.account.address,
    });
    if (balance < parseEther("2")) {
      const randomEth = 3 + Math.random() * 10;
      const hash = await deployer.sendTransaction({
        to: client.account.address,
        value: parseEther(randomEth.toFixed(4)),
      });
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(
        `Topped up ${client.account.address} with ${randomEth.toFixed(2)} ETH`
      );
    }
  }
}

async function simulateBorrowing() {
  const client = botClients[Math.floor(Math.random() * botClients.length)];

  const collateralValue = await publicClient.readContract({
    address: lending.address,
    abi: lending.abi,
    functionName: "calculateCollateralValue",
    args: [client.account.address],
  });
  if (collateralValue <= 0n) return;

  const aggressive = Math.random() < CHANCE_TO_BORROW;
  const percentage = aggressive
    ? 85 + Math.random() * 14
    : 30 + Math.random() * 40;

  const maxBorrowAmount =
    (collateralValue * BigInt(Math.floor(percentage * 10))) / 1000n;
  if (maxBorrowAmount <= 0n) return;

  try {
    const hash = await client.writeContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "borrowCorn",
      args: [maxBorrowAmount],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(
      `${client.account.address} borrowed ${formatEther(maxBorrowAmount)} CORN (${aggressive ? "aggressive" : "conservative"}, ${((Number(maxBorrowAmount) * 100) / Number(collateralValue)).toFixed(1)}% of collateral)`
    );
  } catch {
    // 借款后仓位将不安全，跳过
  }
}

async function simulateAddCollateral() {
  const client = botClients[Math.floor(Math.random() * botClients.length)];

  const balance = await publicClient.getBalance({
    address: client.account.address,
  });

  if (balance > parseEther("3")) {
    const maxPossible = balance - parseEther("2");
    const percentage = 20 + Math.random() * 60;
    const amountToAdd =
      (maxPossible * BigInt(Math.floor(percentage * 10))) / 1000n;

    if (amountToAdd > parseEther("0.1")) {
      try {
        const hash = await client.writeContract({
          address: lending.address,
          abi: lending.abi,
          functionName: "addCollateral",
          value: amountToAdd,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(
          `${client.account.address} added ${formatEther(amountToAdd)} ETH as collateral`
        );
      } catch {
        // 跳过
      }
    }
  }
}

async function checkAndPerformLiquidations() {
  // 通过事件获取所有添加过抵押品的用户
  const logs = await publicClient.getLogs({
    address: lending.address,
    event: {
      type: "event",
      name: "CollateralAdded",
      inputs: [
        { name: "user", type: "address", indexed: true },
        { name: "amount", type: "uint256", indexed: true },
        { name: "price", type: "uint256", indexed: false },
      ],
    },
    fromBlock: lending.deployedBlock,
  });

  const users = [...new Set(logs.map((log) => log.args.user))];

  for (const user of users) {
    if (liquidationInProgress.has(user.toLowerCase())) continue;

    const amountBorrowed = await publicClient.readContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "s_userBorrowed",
      args: [user],
    });
    if (amountBorrowed === 0n) continue;

    const isLiquidatable = await publicClient.readContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "isLiquidatable",
      args: [user],
    });
    if (!isLiquidatable) continue;

    // 找一个不是被清算用户本人的清算人
    const liquidators = botClients.filter(
      (c) => c.account.address.toLowerCase() !== user.toLowerCase()
    );

    // 检查哪些清算人持有足够的 CORN
    let liquidator = null;
    for (const candidate of liquidators) {
      const cornBalance = await publicClient.readContract({
        address: corn.address,
        abi: corn.abi,
        functionName: "balanceOf",
        args: [candidate.account.address],
      });
      if (cornBalance >= amountBorrowed) {
        liquidator = candidate;
        break;
      }
    }

    // 如果没有人持有足够的 CORN，尝试用 ETH 兑换 CORN
    if (!liquidator) {
      const swapper =
        liquidators[Math.floor(Math.random() * liquidators.length)];
      if (!swapper) continue;

      const currentPrice = await publicClient.readContract({
        address: cornDEX.address,
        abi: cornDEX.abi,
        functionName: "currentPrice",
      });

      const ethNeeded =
        (amountBorrowed * currentPrice * 110n) / (1000n * parseEther("1"));
      const balance = await publicClient.getBalance({
        address: swapper.account.address,
      });
      const maxETH =
        ethNeeded > balance ? balance - parseEther("0.1") : ethNeeded;
      if (maxETH < parseEther("0.01")) continue;

      try {
        const hash = await swapper.writeContract({
          address: cornDEX.address,
          abi: cornDEX.abi,
          functionName: "swap",
          args: [maxETH],
          value: maxETH,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const newBalance = await publicClient.readContract({
          address: corn.address,
          abi: corn.abi,
          functionName: "balanceOf",
          args: [swapper.account.address],
        });
        if (newBalance >= amountBorrowed) {
          liquidationInProgress.add(user.toLowerCase());
          console.log(
            `${swapper.account.address} swapped ${formatEther(maxETH)} ETH for CORN`
          );
          liquidator = swapper;
        }
      } catch {
        console.error("Failed to swap ETH for CORN");
      }
    }

    if (!liquidator) continue;
    liquidationInProgress.add(user.toLowerCase());
    console.log(
      `${liquidator.account.address} found liquidatable position for user: ${user}`
    );

    try {
      // 授权 Lending 合约转走 CORN
      const approveHash = await liquidator.writeContract({
        address: corn.address,
        abi: corn.abi,
        functionName: "approve",
        args: [lending.address, amountBorrowed],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // 清算
      const liqHash = await liquidator.writeContract({
        address: lending.address,
        abi: lending.abi,
        functionName: "liquidate",
        args: [user],
      });
      await publicClient.waitForTransactionReceipt({ hash: liqHash });

      // 用清算所得重新存入一部分抵押品
      const liqBalance = await publicClient.getBalance({
        address: liquidator.account.address,
      });
      if (liqBalance > parseEther("2")) {
        try {
          const depHash = await liquidator.writeContract({
            address: lending.address,
            abi: lending.abi,
            functionName: "addCollateral",
            value: liqBalance - parseEther("2"),
          });
          await publicClient.waitForTransactionReceipt({ hash: depHash });
        } catch {
          // 跳过
        }
      }

      console.log(`Successfully liquidated position for user ${user}`);
    } catch {
      console.error(`Failed to liquidate user ${user}`);
    } finally {
      liquidationInProgress.delete(user.toLowerCase());
    }

    break;
  }
}

async function main() {
  console.log("Starting lending market simulation...");
  console.log(`Using ${NUM_ACCOUNTS} bot accounts`);
  console.log(`Deployer: ${deployer.account.address}`);

  let trend = Math.random() > 0.5 ? 1 : -1;
  let trendDuration = 0;
  let maxTrendDuration = Math.floor(Math.random() * 8) + 7;

  const run = async () => {
    try {
      // 1. 推动价格
      trendDuration++;
      if (trendDuration >= maxTrendDuration) {
        trend *= -1;
        trendDuration = 0;
        maxTrendDuration = Math.floor(Math.random() * 8) + 7;
        console.log(`Trend reversed to ${trend > 0 ? "upward" : "downward"}`);
      }

      const noise = Math.random() * 2.5 - 1.6;
      const direction = trend + noise;
      const amount = parseEther("24");
      const amountToSell = direction > 0 ? amount : -amount * 1000n;

      // 如果 MovePrice 缺少将要花费的资产则跳过
      if (amountToSell > 0n) {
        const mpEth = await publicClient.getBalance({ address: movePrice.address });
        if (mpEth < amountToSell) {
          trend = -1;
          trendDuration = 0;
        }
      } else {
        const mpCorn = await publicClient.readContract({
          address: corn.address,
          abi: corn.abi,
          functionName: "balanceOf",
          args: [movePrice.address],
        });
        if (mpCorn < -amountToSell) {
          trend = 1;
          trendDuration = 0;
        }
      }

      const finalAmount = trend > 0 ? amount : -amount * 1000n;
      const mpHas = trend > 0
        ? await publicClient.getBalance({ address: movePrice.address })
        : await publicClient.readContract({
            address: corn.address,
            abi: corn.abi,
            functionName: "balanceOf",
            args: [movePrice.address],
          });
      const needed = trend > 0 ? finalAmount : -finalAmount;

      if (mpHas >= needed) {
        await deployer.writeContract({
          address: movePrice.address,
          abi: movePrice.abi,
          functionName: "movePrice",
          args: [finalAmount],
        });
      }

      // 2. 如有需要则为账户充值
      await fundAccountsIfNeeded();

      // 3. 随机借款
      if (Math.random() < CHANCE_TO_BORROW) {
        await simulateBorrowing();
      }

      // 4. 随机添加抵押品
      if (Math.random() < CHANCE_TO_ADD_COLLATERAL) {
        await simulateAddCollateral();
      }

      // 5. 检查清算
      await checkAndPerformLiquidations();
    } catch (error) {
      if (process.env.DEBUG) {
        console.error("Simulation error:", error);
      }
    }
  };

  setInterval(run, 2000);

  // 保持进程运行
  process.stdin.resume();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
