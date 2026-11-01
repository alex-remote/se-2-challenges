import { network } from "hardhat";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { sleep, getConfig } from "./utils.js";
import { fetchPriceFromUniswap } from "./fetchPriceFromUniswap.js";
import { parseEther } from "viem";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type ViemConnection = Awaited<ReturnType<typeof network.connect>>["viem"];
let _viem: ViemConnection;

function loadDeployment(name: string): { address: `0x${string}`; abi: any; deployedBlock: bigint } {
  const path = join(__dirname, "..", "deployments", "default", `${name}.json`);
  const json = JSON.parse(readFileSync(path, "utf8"));
  return {
    address: json.address as `0x${string}`,
    abi: json.abi,
    deployedBlock: json.receipt?.blockNumber ? BigInt(json.receipt.blockNumber) : 0n,
  };
}

const oraTokenAbi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type WalletClient = Awaited<ReturnType<ViemConnection["getWalletClients"]>>[number];

const normalizeNodeInfo = (raw: any) => {
  const zero = 0n;
  if (!raw)
    return {
      stakedAmount: zero,
      lastReportedBucket: zero,
      reportCount: zero,
      claimedReportCount: zero,
      firstBucket: zero,
      active: false,
    };
  const get = (idx: number, name: string) => {
    const byName = raw[name];
    const byIndex = Array.isArray(raw) ? raw[idx] : undefined;
    if (typeof byName === "bigint") return byName as bigint;
    if (typeof byIndex === "bigint") return byIndex as bigint;
    const val = byName ?? byIndex ?? 0;
    try {
      return BigInt(String(val));
    } catch {
      return zero;
    }
  };
  return {
    stakedAmount: get(0, "stakedAmount"),
    lastReportedBucket: get(1, "lastReportedBucket"),
    reportCount: get(2, "reportCount"),
    claimedReportCount: get(3, "claimedReportCount"),
    firstBucket: get(4, "firstBucket"),
    active:
      typeof raw?.active === "boolean"
        ? (raw.active as boolean)
        : Array.isArray(raw) && typeof raw[5] === "boolean"
          ? (raw[5] as boolean)
          : false,
  };
};

// 机器人当前使用的基准价格。启动时从 Uniswap 初始化一次，
// 之后根据链上合约的价格进行更新。
let currentPrice: bigint | null = null;

const stringToBool = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

// 功能开关：当环境变量 AUTO_SLASH 为真值时，启用自动罚没（slashing）
const AUTO_SLASH: boolean = stringToBool(process.env.AUTO_SLASH);

const getStakingOracleDeployment = () => loadDeployment("StakingOracle");

const getActiveNodeWalletClients = async (stakingAddress: `0x${string}`, stakingAbi: any): Promise<WalletClient[]> => {
  const accounts = await _viem.getWalletClients();
  // 只筛选出已注册的节点（firstBucket != 0）
  const publicClient = await _viem.getPublicClient();
  const nodeClients: WalletClient[] = [];
  for (const client of accounts) {
    try {
      const rawNodeInfo = await publicClient.readContract({
        address: stakingAddress,
        abi: stakingAbi,
        functionName: "nodes",
        args: [client.account.address],
      });
      const node = normalizeNodeInfo(rawNodeInfo);
      if (node.firstBucket !== 0n && node.active) {
        nodeClients.push(client);
      }
    } catch {
      // 忽略
    }
  }
  return nodeClients;
};

const findNodeIndex = async (
  stakingAddress: `0x${string}`,
  stakingAbi: any,
  nodeAddress: `0x${string}`,
): Promise<number | null> => {
  const publicClient = await _viem.getPublicClient();
  // 逐个遍历索引，直到越界回滚（revert）为止
  try {
    const addresses = (await publicClient.readContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: "getNodeAddresses",
      args: [],
    })) as `0x${string}`[];
    return addresses.findIndex(addr => addr.toLowerCase() === nodeAddress.toLowerCase());
  } catch {}
  return null;
};

const getReportIndexForNode = async (
  publicClient: Awaited<ReturnType<ViemConnection["getPublicClient"]>>,
  stakingAddress: `0x${string}`,
  stakingAbi: any,
  bucketNumber: bigint,
  nodeAddress: `0x${string}`,
  fromBlock: bigint,
): Promise<number | null> => {
  try {
    const events = (await publicClient.getContractEvents({
      address: stakingAddress,
      abi: stakingAbi,
      eventName: "PriceReported",
      fromBlock,
      toBlock: "latest",
    })) as any[];
    const bucketEvents = events.filter((ev: any) => {
      const bucket = ev.args?.bucketNumber as bigint | undefined;
      return bucket !== undefined && bucket === bucketNumber;
    });
    const idx = bucketEvents.findIndex((ev: any) => {
      const reporter = (ev.args?.node as string | undefined) ?? "";
      return reporter.toLowerCase() === nodeAddress.toLowerCase();
    });
    return idx === -1 ? null : idx;
  } catch (error) {
    console.warn("Failed to compute report index:", (error as Error).message);
  }
  return null;
};

const runCycle = async () => {
  try {
    const { address, abi, deployedBlock } = getStakingOracleDeployment();
    const publicClient = await _viem.getPublicClient();
    const allWalletClients = await _viem.getWalletClients();
    const blockNumber = await publicClient.getBlockNumber();
    console.log(`\n[Block ${blockNumber}] Starting new oracle cycle...`);

    // 读取当前的桶（bucket）窗口和桶编号
    const [bucketWindow, currentBucket] = await Promise.all([
      publicClient
        .readContract({ address, abi, functionName: "BUCKET_WINDOW", args: [] })
        .then(value => BigInt(String(value))),
      publicClient
        .readContract({ address, abi, functionName: "getCurrentBucketNumber", args: [] })
        .then(value => BigInt(String(value))),
    ]);
    const previousBucket = currentBucket > 0n ? currentBucket - 1n : 0n;
    console.log(`BUCKET_WINDOW=${bucketWindow} | currentBucket=${currentBucket}`);

    // 用上一个桶已记录的中位数（RECORDED MEDIAN，而不是各上报价格的平均值）更新基准价格。
    // 若不可用，则退回到合约的最新价格，再退回到之前缓存的值。
    try {
      const previous = previousBucket;
      if (previous > 0n) {
        try {
          // `getPastPrice(bucket)` 返回该桶已记录的中位数（尚未记录则为 0）。
          const pastMedian = await publicClient.readContract({
            address,
            abi,
            functionName: "getPastPrice",
            args: [previous],
          });
          const median = BigInt(String(pastMedian));
          if (median > 0n) {
            currentPrice = median;
          }
        } catch {
          // 忽略并走兜底逻辑
        }

        if (currentPrice === null) {
          // 退回到链上的最新平均价格（上一个桶的平均值）
          try {
            const onchain = await publicClient.readContract({ address, abi, functionName: "getLatestPrice", args: [] });
            currentPrice = BigInt(String(onchain));
          } catch {
            // 保留之前的 currentPrice
          }
        }
      }
    } catch {
      // 保留之前的 currentPrice
    }

    // 每个周期加载一次配置，这样运行期间对配置文件的修改也能生效
    const cfg = getConfig();

    // 1) 上报价格：每个节点在每个桶中只上报一次
    const nodeWalletClients = await getActiveNodeWalletClients(address, abi);
    // 确保已有初始价格（在 run() 启动时设置一次）
    if (currentPrice === null) {
      currentPrice = await fetchPriceFromUniswap();
    }
    const reportTxHashes: `0x${string}`[] = [];
    for (const client of nodeWalletClients) {
      try {
        const rawNodeInfo = await publicClient.readContract({
          address,
          abi,
          functionName: "nodes",
          args: [client.account.address],
        });
        const node = normalizeNodeInfo(rawNodeInfo);
        if (node.lastReportedBucket !== currentBucket) {
          // 确定节点配置（跳过上报的概率和价格波动幅度）
          const nodeCfg = cfg.NODE_CONFIGS[client.account.address.toLowerCase()] || cfg.NODE_CONFIGS.default;
          const skipProb = Number(nodeCfg.PROBABILITY_OF_SKIPPING_REPORT ?? 0);
          if (Math.random() < skipProb) {
            console.log(`Skipping report (by probability) for ${client.account.address}`);
            continue;
          }
          // 以百万分率（ppm）用整数运算计算偏移后的价格
          const variancePpm = Math.floor((Number(nodeCfg.PRICE_VARIANCE) || 0) * 1_000_000);
          const randomPpm = variancePpm > 0 ? Math.floor(Math.random() * (variancePpm * 2 + 1)) - variancePpm : 0;
          const basePrice = currentPrice!; // 由上一个桶排除离群值后得出
          const delta = (basePrice * BigInt(randomPpm)) / 1_000_000n;
          const priceToReport = basePrice + delta;

          console.log(
            `Reporting price for node ${client.account.address} in bucket ${currentBucket} (price=${priceToReport})...`,
          );
          const txHash = await client.writeContract({
            address,
            abi,
            functionName: "reportPrice",
            args: [priceToReport],
          });
          reportTxHashes.push(txHash as `0x${string}`);
        }
      } catch (err) {
        console.warn(`Skipping report for ${client.account.address}:`, (err as Error).message);
      }
    }

    // 等待上报交易被打包，使后续读取（领取奖励）能看到更新后的状态。
    if (reportTxHashes.length > 0) {
      try {
        await Promise.all(reportTxHashes.map(hash => publicClient.waitForTransactionReceipt({ hash } as any)));
      } catch (err) {
        // 如果等待失败则继续执行——仍会尝试领取奖励，但可能看不到最新的上报。
        console.warn("Error while waiting for report tx receipts:", (err as Error).message);
      }
    }

    // 2) 达到法定数量（quorum）时自动最终确定中位数
    // 只能最终确定严格属于过去的桶，所以我们最终确定的是*上一个*桶（current - 1）。
    if (previousBucket > 0n) {
      let medianAlreadyRecorded = false;
      try {
        const median = await publicClient.readContract({
          address,
          abi,
          functionName: "getPastPrice",
          args: [previousBucket],
        });
        medianAlreadyRecorded = BigInt(String(median)) > 0n;
      } catch {
        medianAlreadyRecorded = false;
      }

      if (!medianAlreadyRecorded) {
        try {
          const activeNodeAddresses = (await publicClient.readContract({
            address,
            abi,
            functionName: "getNodeAddresses",
            args: [],
          })) as `0x${string}`[];

          const reportStatuses = await Promise.all(
            activeNodeAddresses.map(async nodeAddr => {
              try {
                const [price] = (await publicClient.readContract({
                  address,
                  abi,
                  functionName: "getSlashedStatus",
                  args: [nodeAddr, previousBucket],
                })) as [bigint, boolean];
                return price;
              } catch {
                return 0n;
              }
            }),
          );

          const reportedCount = reportStatuses.reduce((acc, price) => acc + (price > 0n ? 1n : 0n), 0n);
          const requiredReports =
            activeNodeAddresses.length === 0 ? 0n : (2n * BigInt(activeNodeAddresses.length) + 2n) / 3n;

          if (activeNodeAddresses.length === 0) {
            console.log("No active nodes; skipping recordBucketMedian evaluation.");
          } else if (reportedCount >= requiredReports) {
            const finalizer = allWalletClients[0];
            try {
              await finalizer.writeContract({
                address,
                abi,
                functionName: "recordBucketMedian",
                args: [previousBucket],
              });
              console.log(
                `Recorded median for bucket ${previousBucket} (reports ${reportedCount}/${requiredReports}).`,
              );
            } catch (err) {
              console.warn(`Failed to record median for bucket ${previousBucket}:`, (err as Error).message);
            }
          } else {
            console.log(
              `Skipping median recording for bucket ${previousBucket}; only ${reportedCount}/${requiredReports} reports.`,
            );
          }
        } catch (err) {
          console.warn("Unable to evaluate automatic recordBucketMedian:", (err as Error).message);
        }
      }
    }

    // 3) 罚没：如果上一个桶中存在离群值
    if (AUTO_SLASH) {
      try {
        const outliers = (await publicClient.readContract({
          address,
          abi,
          functionName: "getOutlierNodes",
          args: [previousBucket],
        })) as `0x${string}`[];

        if (outliers.length > 0) {
          console.log(`Found ${outliers.length} outliers in bucket ${previousBucket}, attempting to slash...`);
          // 使用第一个钱包（部署者）执行罚没
          const slasher = allWalletClients[0];
          for (const nodeAddr of outliers) {
            const index = await findNodeIndex(address, abi, nodeAddr);
            if (index === null) {
              console.warn(`Index not found for node ${nodeAddr}, skipping slashing.`);
              continue;
            }
            const reportIndex = await getReportIndexForNode(
              publicClient,
              address,
              abi,
              previousBucket,
              nodeAddr,
              deployedBlock,
            );
            if (reportIndex === null) {
              console.warn(`Report index not found for node ${nodeAddr}, skipping slashing.`);
              continue;
            }
            try {
              await slasher.writeContract({
                address,
                abi,
                functionName: "slashNode",
                args: [nodeAddr, previousBucket, BigInt(reportIndex), BigInt(index)],
              });
              console.log(
                `Slashed node ${nodeAddr} for bucket ${previousBucket} at indices report=${reportIndex}, node=${index}`,
              );
            } catch (err) {
              console.warn(`Failed to slash ${nodeAddr}:`, (err as Error).message);
            }
          }
        }
      } catch (err) {
        // 样本量很小时（例如只有 0 或 1 个上报），getOutlierNodes 可能会回滚（revert）
        console.log(`Skipping slashing check for bucket ${previousBucket}:`, (err as Error).message);
      }
    } else {
      // 自动罚没已被开关禁用
      console.log(`Auto-slash disabled; skipping slashing for bucket ${previousBucket}`);
    }

    // 4) 奖励：存在未领取奖励的上报时进行领取
    // 上报交易打包后先等待几秒再领取
    console.log("Waiting 2s before claiming rewards...");
    await sleep(2000);
    for (const client of nodeWalletClients) {
      try {
        const rawNodeInfo = await publicClient.readContract({
          address,
          abi,
          functionName: "nodes",
          args: [client.account.address],
        });
        const node = normalizeNodeInfo(rawNodeInfo);
        if (node.reportCount > node.claimedReportCount) {
          await client.writeContract({ address, abi, functionName: "claimReward", args: [] });
          console.log(`Claimed rewards for ${client.account.address}`);
        }
      } catch (err) {
        console.warn(`Failed to claim rewards for ${client.account.address}:`, (err as Error).message);
      }
    }
  } catch (error) {
    console.error("Error in oracle cycle:", error);
  }
};

const run = async () => {
  console.log("Starting oracle bot system...");
  ({ viem: _viem } = await network.connect());
  // 启动时获取一次 Uniswap 价格；后续周期将以链上上报为基准价格
  currentPrice = await fetchPriceFromUniswap();
  console.log(`Initial base price from Uniswap: ${currentPrice}`);

  // 如果节点尚未注册，则为本地测试启动节点（注资 + 授权 + 注册）。
  try {
    const { address, abi } = getStakingOracleDeployment();
    const publicClient = await _viem.getPublicClient();
    const accounts = await _viem.getWalletClients();
    // 与部署脚本保持一致：使用 accounts[1..10] 作为预言机节点
    const nodeAccounts = accounts.slice(1, 11);
    const deployerClient = accounts[0];

    const [minimumStake, oraTokenAddress] = await Promise.all([
      publicClient.readContract({ address, abi, functionName: "MINIMUM_STAKE", args: [] }).then(v => BigInt(String(v))),
      publicClient
        .readContract({
          address,
          abi,
          functionName: "oracleToken",
          args: [],
        })
        .then(v => v as unknown as `0x${string}`),
    ]);

    // 本地模拟时机器人的默认质押量（保持较小，以符合新的用户体验预期）
    const defaultStake = parseEther("500");
    const stakeAmount = minimumStake > defaultStake ? minimumStake : defaultStake;

    // 根据当前链上状态构建一个幂等的设置计划（这样重启后可以干净地接着执行）。
    const snapshots = await Promise.all(
      nodeAccounts.map(async nodeClient => {
        const nodeAddress = nodeClient.account.address;
        const [rawNodeInfo, balance, allowance] = await Promise.all([
          publicClient
            .readContract({ address, abi, functionName: "nodes", args: [nodeAddress] })
            .catch(() => null as any),
          publicClient.readContract({
            address: oraTokenAddress,
            abi: oraTokenAbi,
            functionName: "balanceOf",
            args: [nodeAddress],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: oraTokenAddress,
            abi: oraTokenAbi,
            functionName: "allowance",
            args: [nodeAddress, address],
          }) as Promise<bigint>,
        ]);

        const node = normalizeNodeInfo(rawNodeInfo);
        const effectiveStake = node.active
          ? await publicClient
              .readContract({ address, abi, functionName: "getEffectiveStake", args: [nodeAddress] })
              .then(v => BigInt(String(v)))
              .catch(() => 0n)
          : 0n;

        return { nodeClient, nodeAddress, node, effectiveStake, balance, allowance };
      }),
    );

    const transfers: { to: `0x${string}`; amount: bigint }[] = [];
    const perNodeActions: {
      nodeClient: WalletClient;
      nodeAddress: `0x${string}`;
      approveAmount: bigint;
      kind: "register" | "addStake" | "none";
      amount: bigint;
      note: string;
    }[] = [];

    for (const snap of snapshots) {
      const { nodeClient, nodeAddress, node, effectiveStake, balance, allowance } = snap;

      if (node.active) {
        if (effectiveStake < minimumStake) {
          const needed = minimumStake - effectiveStake;
          const transferAmount = balance < needed ? needed - balance : 0n;
          if (transferAmount > 0n) transfers.push({ to: nodeAddress, amount: transferAmount });

          const approveAmount = allowance < needed ? needed : 0n;
          perNodeActions.push({
            nodeClient,
            nodeAddress,
            approveAmount,
            kind: "addStake",
            amount: needed,
            note: `top up effectiveStake=${effectiveStake} by ${needed}`,
          });
        } else {
          perNodeActions.push({
            nodeClient,
            nodeAddress,
            approveAmount: 0n,
            kind: "none",
            amount: 0n,
            note: "already active (no action)",
          });
        }
        continue;
      }

      // 未激活 -> 注资/授权/注册。重启时只执行缺失的步骤。
      const transferAmount = balance < stakeAmount ? stakeAmount - balance : 0n;
      if (transferAmount > 0n) transfers.push({ to: nodeAddress, amount: transferAmount });

      const approveAmount = allowance < stakeAmount ? stakeAmount : 0n;
      perNodeActions.push({
        nodeClient,
        nodeAddress,
        approveAmount,
        kind: "register",
        amount: stakeAmount,
        note: `register with stake=${stakeAmount}`,
      });
    }

    // 1) 由部署者通过连续递增的 nonce 一次性集中为各节点注资。
    if (transfers.length > 0) {
      const deployerNonce = await publicClient.getTransactionCount({ address: deployerClient.account.address });
      const transferTxs: `0x${string}`[] = [];
      console.log(`Funding ${transfers.length} node(s) from deployer (burst)...`);
      for (const [i, t] of transfers.entries()) {
        const tx = await deployerClient.writeContract({
          address: oraTokenAddress,
          abi: oraTokenAbi,
          functionName: "transfer",
          nonce: deployerNonce + i,
          args: [t.to, t.amount],
        });
        transferTxs.push(tx as `0x${string}`);
      }
      await Promise.all(transferTxs.map(hash => publicClient.waitForTransactionReceipt({ hash })));
      console.log("Funding burst mined.");
    }

    // 2) 对每个节点，用显式 nonce 串联执行 approve -> (register|addStake)，最后一次性等待所有回执。
    const nodeNonces = await Promise.all(
      perNodeActions.map(a => publicClient.getTransactionCount({ address: a.nodeAddress })),
    );
    const nodeTxs: `0x${string}`[] = [];

    for (const [idx, action] of perNodeActions.entries()) {
      const { nodeClient, nodeAddress, approveAmount, kind, amount, note } = action;
      let nonce = nodeNonces[idx];

      if (kind === "none") {
        console.log(`Node ${nodeAddress}: ${note}`);
        continue;
      }

      console.log(`Node ${nodeAddress}: ${note}`);

      if (approveAmount > 0n) {
        const tx = await nodeClient.writeContract({
          address: oraTokenAddress,
          abi: oraTokenAbi,
          functionName: "approve",
          nonce,
          args: [address, approveAmount],
        });
        nodeTxs.push(tx as `0x${string}`);
        nonce += 1;
      }

      if (kind === "register") {
        const tx = await nodeClient.writeContract({
          address,
          abi,
          functionName: "registerNode",
          nonce,
          args: [amount],
        });
        nodeTxs.push(tx as `0x${string}`);
      } else if (kind === "addStake") {
        const tx = await nodeClient.writeContract({
          address,
          abi,
          functionName: "addStake",
          nonce,
          args: [amount],
        });
        nodeTxs.push(tx as `0x${string}`);
      }
    }

    if (nodeTxs.length > 0) {
      console.log(`Waiting for ${nodeTxs.length} node tx(s) to be mined...`);
      await Promise.all(nodeTxs.map(hash => publicClient.waitForTransactionReceipt({ hash })));
      console.log("Node setup txs mined.");
    }
  } catch (err) {
    console.warn("Node registration step failed:", (err as Error).message);
  }
  while (true) {
    await runCycle();
    await sleep(12000);
  }
};

run().catch(error => {
  console.error("Fatal error in oracle bot system:", error);
  process.exit(1);
});

// 处理进程终止信号
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT (Ctrl+C). Cleaning up...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM. Cleaning up...");
  process.exit(0);
});

// 处理未捕获的异常
process.on("uncaughtException", async error => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// 处理未处理的 promise rejection
process.on("unhandledRejection", async (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
