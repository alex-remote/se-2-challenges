import { expect } from "chai";
import { network } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import type { StakingOracle, ORA } from "../types/ethers-contracts/index.js";

describe("Checkpoint2 - StakingOracle", function () {
  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];
  let networkHelpers: Awaited<ReturnType<typeof network.create>>["networkHelpers"];

  before(async () => {
    ({ ethers, networkHelpers } = await network.create());
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_setIntervalMining", [0]);
  });

  let oracle: StakingOracle;
  let oraToken: ORA;
  let node1: HardhatEthersSigner;
  let node2: HardhatEthersSigner;
  let node3: HardhatEthersSigner;
  let node4: HardhatEthersSigner;
  let node5: HardhatEthersSigner;
  let node6: HardhatEthersSigner;
  let slasher: HardhatEthersSigner;

  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (contractAddress) {
    // 如果设置了该环境变量，则跳过此测试文件（供自动评分程序使用）
    return true;
  }

  async function mineBuckets(count: number) {
    const bucketWindow = Number(await oracle.BUCKET_WINDOW());
    await networkHelpers.mine(bucketWindow * count);
  }

  async function moveToFreshBucket() {
    // 确保当前桶（bucket）中还剩足够多的区块，这样包含多笔交易的上报流程
    // 不会在测试中途意外跨过桶边界。
    const bucketWindow = Number(await oracle.BUCKET_WINDOW());
    const blockNum = await ethers.provider.getBlockNumber();
    const toNext = (bucketWindow - (blockNum % bucketWindow)) % bucketWindow; // 0..bucketWindow-1
    await networkHelpers.mine(toNext + 1);
  }

  async function oracleAddr() {
    return await oracle.getAddress();
  }

  async function stakeForDelayedFirstReport() {
    // 如果节点注册后没有在其注册所在的桶中上报，那么桶推进后它就会被惩罚。
    // 留出足够的余量，让测试可以在首次上报前安全地挖过若干个桶。
    const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
    const INACTIVITY_PENALTY = await oracle.INACTIVITY_PENALTY();
    // 预留若干个错过桶的余量，以避免设置交易 + 挖块推进了多个桶的边界情况。
    return MINIMUM_STAKE + 10n * INACTIVITY_PENALTY;
  }

  async function fundApproveAndRegister(node: HardhatEthersSigner, amount: bigint) {
    // node1 是 ORA 的部署者，ORA 构造函数中会给它铸造一大笔 ORA 余额。
    if (node.address.toLowerCase() !== node1.address.toLowerCase()) {
      await (await oraToken.connect(node1).transfer(node.address, amount)).wait();
    }
    await (await oraToken.connect(node).approve(await oracleAddr(), amount)).wait();
    await (await oracle.connect(node).registerNode(amount)).wait();
  }

  async function indexOfNodeAddress(address: string) {
    const arr = await oracle.getNodeAddresses();
    return arr.findIndex(a => a.toLowerCase() === address.toLowerCase());
  }

  beforeEach(async function () {
    [node1, node2, node3, node4, node5, node6, slasher] = await ethers.getSigners();
    const ORAFactory = await ethers.getContractFactory("ORA");
    oraToken = (await ORAFactory.deploy()) as unknown as ORA;
    await oraToken.waitForDeployment();

    const StakingOracleFactory = await ethers.getContractFactory("StakingOracle");
    oracle = (await StakingOracleFactory.deploy(await oraToken.getAddress())) as StakingOracle;
    await oracle.waitForDeployment();

    // StakingOracle 必须是 ORA 代币合约的所有者才能铸造奖励
    await (await oraToken.transferOwnership(await oracle.getAddress())).wait();
  });
  describe("constructor", function () {
    it("wires the provided ORA token", async function () {
      const tokenAddress = await oracle.oracleToken();
      expect(tokenAddress).to.equal(await oraToken.getAddress());
    });

    it("mints ORA to deployer via token constructor", async function () {
      const bal = await oraToken.balanceOf(node1.address);
      expect(bal).to.be.gt(0n);
    });
  });
  describe("getNodeAddresses", function () {
    it("returns all registered nodes in order", async function () {
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await fundApproveAndRegister(node1, MINIMUM_STAKE);
      await fundApproveAndRegister(node2, MINIMUM_STAKE);
      await fundApproveAndRegister(node3, MINIMUM_STAKE);
      const nodeAddresses = await oracle.getNodeAddresses();
      expect(nodeAddresses.length).to.equal(3);
      expect(nodeAddresses[0]).to.equal(node1.address);
      expect(nodeAddresses[1]).to.equal(node2.address);
      expect(nodeAddresses[2]).to.equal(node3.address);
    });
  });
  describe("Node Registration", function () {
    it("allows register with minimum stake and emits events", async function () {
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await (await oraToken.connect(node1).approve(await oracleAddr(), MINIMUM_STAKE)).wait();
      await expect(oracle.connect(node1).registerNode(MINIMUM_STAKE))
        .to.emit(oracle, "NodeRegistered")
        .withArgs(node1.address, MINIMUM_STAKE);
      const info = await oracle.nodes(node1.address);
      expect(info.stakedAmount).to.equal(MINIMUM_STAKE);
      expect(info.active).to.equal(true);
      expect(info.reportCount).to.equal(0n);
      expect(info.claimedReportCount).to.equal(0n);
      expect(await oracle.getNodeAddresses()).to.deep.equal([node1.address]);
    });
    it("rejects insufficient stake and duplicate registration", async function () {
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await expect(oracle.connect(node1).registerNode(MINIMUM_STAKE - 1n)).to.be.revertedWithCustomError(
        oracle,
        "InsufficientStake",
      );
      await (await oraToken.connect(node1).approve(await oracleAddr(), MINIMUM_STAKE)).wait();
      await oracle.connect(node1).registerNode(MINIMUM_STAKE);
      await (await oraToken.connect(node1).approve(await oracleAddr(), MINIMUM_STAKE)).wait();
      await expect(oracle.connect(node1).registerNode(MINIMUM_STAKE)).to.be.revertedWithCustomError(
        oracle,
        "NodeAlreadyRegistered",
      );
    });
  });
  describe("Price Reporting", function () {
    beforeEach(async function () {
      await fundApproveAndRegister(node1, await stakeForDelayedFirstReport());
    });

    it("emits PriceReported and prevents double report in same bucket", async function () {
      await mineBuckets(1);
      const tx = await oracle.connect(node1).reportPrice(1600);
      const rcpt = await tx.wait();
      if (!rcpt) throw new Error("no receipt");

      const parsed = rcpt.logs
        .map(log => {
          try {
            return oracle.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(e => e?.name === "PriceReported");
      if (!parsed) throw new Error("PriceReported event not found");

      const reportedNode = parsed.args[0] as string;
      const reportedPrice = parsed.args[1] as bigint;
      const reportedBucket = parsed.args[2] as bigint;

      expect(reportedNode).to.equal(node1.address);
      expect(reportedPrice).to.equal(1600n);

      const [p, slashed] = await oracle.getSlashedStatus(node1.address, reportedBucket);
      expect(p).to.equal(1600n);
      expect(slashed).to.equal(false);

      await expect(oracle.connect(node1).reportPrice(1700)).to.be.revertedWithCustomError(
        oracle,
        "AlreadyReportedInCurrentBucket",
      );
    });

    it("rejects zero price and unregistered node", async function () {
      await expect(oracle.connect(node1).reportPrice(0)).to.be.revertedWithCustomError(oracle, "InvalidPrice");
      await expect(oracle.connect(node2).reportPrice(1000)).to.be.revertedWithCustomError(oracle, "NodeNotRegistered");
    });

    it("rejects when effective stake falls below minimum after missed buckets", async function () {
      // 质押量恰好为 MINIMUM_STAKE 时，错过 1 次应有的上报就会扣除 INACTIVITY_PENALTY，使质押量低于 MINIMUM_STAKE。
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await fundApproveAndRegister(node2, MINIMUM_STAKE);
      await mineBuckets(1);
      await expect(oracle.connect(node2).reportPrice(1600)).to.be.revertedWithCustomError(oracle, "InsufficientStake");
    });
  });

  describe("Claim Reward", function () {
    beforeEach(async function () {
      await fundApproveAndRegister(node1, await stakeForDelayedFirstReport());
    });

    it("reverts when there are no unclaimed report rewards", async function () {
      await expect(oracle.connect(node1).claimReward()).to.be.revertedWithCustomError(oracle, "NoRewardsAvailable");
    });

    it("mints 1 ORA per report and reverts with no additional rewards", async function () {
      await mineBuckets(1);
      await (await oracle.connect(node1).reportPrice(1600)).wait();
      const beforeBal = await oraToken.balanceOf(node1.address);
      await (await oracle.connect(node1).claimReward()).wait();
      const afterBal = await oraToken.balanceOf(node1.address);
      const REWARD_PER_REPORT = await oracle.REWARD_PER_REPORT();
      expect(afterBal - beforeBal).to.equal(REWARD_PER_REPORT);
      await expect(oracle.connect(node1).claimReward()).to.be.revertedWithCustomError(oracle, "NoRewardsAvailable");
    });

    it("accumulates rewards across multiple buckets", async function () {
      await mineBuckets(1);
      await (await oracle.connect(node1).reportPrice(1600)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node1).reportPrice(1700)).wait();
      const beforeBal = await oraToken.balanceOf(node1.address);
      await (await oracle.connect(node1).claimReward()).wait();
      const afterBal = await oraToken.balanceOf(node1.address);
      const REWARD_PER_REPORT = await oracle.REWARD_PER_REPORT();
      expect(afterBal - beforeBal).to.equal(REWARD_PER_REPORT * 2n);
    });
  });
  describe("Prices by bucket", function () {
    beforeEach(async function () {
      const stake = await stakeForDelayedFirstReport();
      await fundApproveAndRegister(node1, stake);
      await fundApproveAndRegister(node2, stake);
      await moveToFreshBucket();
    });
    it("reverts getLatestPrice until a bucket median is recorded", async function () {
      await expect(oracle.getLatestPrice()).to.be.revertedWithCustomError(oracle, "MedianNotRecorded");
    });

    it("returns median for previous bucket via getLatestPrice after recordBucketMedian", async function () {
      await mineBuckets(1);
      const bucketA = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1100)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node6).recordBucketMedian(bucketA)).wait();
      const latest = await oracle.getLatestPrice();
      expect(latest).to.equal(1050n);
    });

    it("getPastPrice returns stored median for a finalized bucket", async function () {
      await mineBuckets(1);
      const bucketA = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1100)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node6).recordBucketMedian(bucketA)).wait();
      const pastMedian = await oracle.getPastPrice(bucketA);
      expect(pastMedian).to.equal(1050n);
      const [p1] = await oracle.getSlashedStatus(node1.address, bucketA);
      const [p2] = await oracle.getSlashedStatus(node2.address, bucketA);
      expect(p1).to.equal(1000n);
      expect(p2).to.equal(1100n);
    });

    it("getPastPrice reverts for bucket without recorded median", async function () {
      await mineBuckets(1);
      const futureBucket = await oracle.getCurrentBucketNumber();
      await expect(oracle.getPastPrice(futureBucket)).to.be.revertedWithCustomError(oracle, "MedianNotRecorded");
    });
  });
  describe("Effective stake and addStake", function () {
    beforeEach(async function () {
      await moveToFreshBucket();
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await fundApproveAndRegister(node1, MINIMUM_STAKE + 10n);
    });
    it("penalizes missed buckets and floors at zero; addStake increases", async function () {
      const INACTIVITY_PENALTY = await oracle.INACTIVITY_PENALTY();
      await mineBuckets(2);
      const eff1 = await oracle.getEffectiveStake(node1.address);
      // 自注册以来已过去 2 个桶 且上报次数为 0，expectedReports=2，所以惩罚 = 2*INACTIVITY_PENALTY。
      const staked = (await oracle.nodes(node1.address)).stakedAmount;
      expect(eff1).to.equal(staked - 2n * INACTIVITY_PENALTY);

      const addAmount = 500n;
      await (await oraToken.connect(node1).approve(await oracleAddr(), addAmount)).wait();
      await (await oracle.connect(node1).addStake(addAmount)).wait();
      const eff2 = await oracle.getEffectiveStake(node1.address);
      expect(eff2).to.equal(staked + addAmount - 2n * INACTIVITY_PENALTY);
    });
    it("rejects zero value stake addition", async function () {
      await expect(oracle.connect(node1).addStake(0)).to.be.revertedWithCustomError(oracle, "InsufficientStake");
    });
  });
  describe("Slashing - deviation in past bucket", function () {
    beforeEach(async function () {
      // 确保当前桶中还剩足够多的区块，这样设置交易 + 首次上报
      // 不会意外跨过桶边界而立即触发不活跃惩罚。
      await moveToFreshBucket();

      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      const stake = await stakeForDelayedFirstReport();
      await fundApproveAndRegister(node1, stake);
      await fundApproveAndRegister(node2, stake);

      // 让 node3 的质押量恰好为 MINIMUM_STAKE，这样在测试移除路径时 MISREPORT_PENALTY 可以把它完全罚没到零。
      // 为了避免不活跃惩罚影响之后的上报，让 node3 在其注册所在的桶中立即上报一次。
      await fundApproveAndRegister(node3, MINIMUM_STAKE);
      await (await oracle.connect(node3).reportPrice(1000)).wait();
    });
    it("reverts for current bucket and for non-deviated prices", async function () {
      const current = await oracle.getCurrentBucketNumber();
      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      // 这里 reportIndex=0 无关紧要，因为会先检查是否为当前桶
      await expect(
        oracle.connect(slasher).slashNode(node3.address, current, 0, node3AddressesIndex),
      ).to.be.revertedWithCustomError(oracle, "OnlyPastBucketsAllowed");

      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1050)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();
      const node3AddressesIndexB = await indexOfNodeAddress(node3.address);
      // node3 是这个桶中第三个上报的 => reportIndex=2
      await expect(
        oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndexB),
      ).to.be.revertedWithCustomError(oracle, "NotDeviated");
    });
    it("slashes deviated node, rewards slasher, and cannot slash again", async function () {
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      const extra = MINIMUM_STAKE; // 确保扣除 MISREPORT_PENALTY 后仍有质押剩余
      // 为 node3 注入额外质押所需的资金（它在 beforeEach 中已把全部余额用于质押 MINIMUM_STAKE）
      await (await oraToken.connect(node1).transfer(node3.address, extra)).wait();
      await (await oraToken.connect(node3).approve(await oracleAddr(), extra)).wait();
      await (await oracle.connect(node3).addStake(extra)).wait();

      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1200)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();

      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      const slasherBalBefore = await oraToken.balanceOf(slasher.address);
      const tx = await oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndex);
      await tx.wait();

      const SLASHER_REWARD_PERCENTAGE = await oracle.SLASHER_REWARD_PERCENTAGE();
      const MISREPORT_PENALTY = await oracle.MISREPORT_PENALTY();
      const expectedReward = (MISREPORT_PENALTY * SLASHER_REWARD_PERCENTAGE) / 100n;
      const slasherBalAfter = await oraToken.balanceOf(slasher.address);
      expect(slasherBalAfter - slasherBalBefore).to.equal(expectedReward);

      await expect(
        oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndex),
      ).to.be.revertedWithCustomError(oracle, "NodeAlreadySlashed");
    });
    it("slashes deviated node and removes when stake hits zero", async function () {
      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1200)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();

      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      await (await oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndex)).wait();

      const addresses = await oracle.getNodeAddresses();
      expect(addresses).to.not.include(node3.address);
      const infoAfter = await oracle.nodes(node3.address);
      expect(infoAfter.active).to.equal(false);
    });
    it("verifies slashed flag is set correctly after slashing", async function () {
      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1200)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();

      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      await (await oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndex)).wait();
      const [price, slashedFlag] = await oracle.getSlashedStatus(node3.address, bucketB);
      expect(price).to.equal(1200n);
      expect(slashedFlag).to.equal(true);
    });
    it("reverts for exact 10% deviation threshold (should not slash)", async function () {
      // 中位数为 1000，因此 10% 的偏差意味着 1100 或 900。
      // 当 MAX_DEVIATION_BPS = 1000（10%）时，恰好 10% 的偏差不应被罚没（严格大于 >）。
      // NOTE: 由于桶边界取决于 block.number，而测试会挖块，因此在注册和这次首次上报之间
      // 有可能推进了不止 1 个桶（因为设置交易）。
      // 通过给 node3 补充质押使其始终 >= MINIMUM_STAKE，从而让这个测试结果保持确定。
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await (await oraToken.connect(node1).transfer(node3.address, MINIMUM_STAKE)).wait();
      await (await oraToken.connect(node3).approve(await oracleAddr(), MINIMUM_STAKE)).wait();
      await (await oracle.connect(node3).addStake(MINIMUM_STAKE)).wait();

      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1100)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();
      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      await expect(
        oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndex),
      ).to.be.revertedWithCustomError(oracle, "NotDeviated");
    });
    it("reverts IndexOutOfBounds when index is out of range", async function () {
      // 触发移除路径（质押 -> 0），并提供一个无效的 nodeAddressesIndex。
      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1200)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();

      const addresses = await oracle.getNodeAddresses();
      const invalidIndex = addresses.length; // 索引越界
      await expect(
        oracle.connect(slasher).slashNode(node3.address, bucketB, 2, invalidIndex),
      ).to.be.revertedWithCustomError(oracle, "IndexOutOfBounds");
    });
    it("reverts NodeNotAtGivenIndex when index doesn't match address", async function () {
      await mineBuckets(1);
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1200)).wait();
      await mineBuckets(1);
      await (await oracle.connect(node4).recordBucketMedian(bucketB)).wait();

      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      // 尝试罚没 node3，但使用 node1 的 reportIndex（0）
      await expect(
        oracle.connect(slasher).slashNode(node3.address, bucketB, 0, node3AddressesIndex),
      ).to.be.revertedWithCustomError(oracle, "NodeNotAtGivenIndex");
    });

    it("reverts MedianNotRecorded if slashing is attempted before recordBucketMedian", async function () {
      await moveToFreshBucket();
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1200)).wait();
      await mineBuckets(1);
      const node3AddressesIndex = await indexOfNodeAddress(node3.address);
      await expect(
        oracle.connect(slasher).slashNode(node3.address, bucketB, 2, node3AddressesIndex),
      ).to.be.revertedWithCustomError(oracle, "MedianNotRecorded");
    });
  });
  describe("exitNode", function () {
    beforeEach(async function () {
      const MINIMUM_STAKE = await oracle.MINIMUM_STAKE();
      await fundApproveAndRegister(node1, MINIMUM_STAKE);
      await fundApproveAndRegister(node2, MINIMUM_STAKE);
    });
    it("reverts before waiting period and exits with effective stake after", async function () {
      const idx = await indexOfNodeAddress(node1.address);
      // 确保 lastReportedBucket 已设置，这样等待期就从最后一次上报开始计算。
      await (await oracle.connect(node1).reportPrice(1500)).wait();
      await expect(oracle.connect(node1).exitNode(idx)).to.be.revertedWithCustomError(oracle, "WaitingPeriodNotOver");
      const WAITING_PERIOD = Number(await oracle.WAITING_PERIOD());
      await mineBuckets(WAITING_PERIOD);
      const effectiveStake = await oracle.getEffectiveStake(node1.address);
      const balBefore = await oraToken.balanceOf(node1.address);
      const tx = await oracle.connect(node1).exitNode(idx);
      await tx.wait();
      const balAfter = await oraToken.balanceOf(node1.address);
      expect(balAfter - balBefore).to.equal(effectiveStake);
      // 验证节点已被移除
      const addresses = await oracle.getNodeAddresses();
      expect(addresses).to.not.include(node1.address);
      // 验证节点已被删除（对于未激活的节点，effectiveStake 应为 0）
      expect(await oracle.getEffectiveStake(node1.address)).to.equal(0);
    });
    it("reverts IndexOutOfBounds when index is out of range", async function () {
      await mineBuckets(2);
      const addresses = await oracle.getNodeAddresses();
      const invalidIndex = addresses.length; // 索引越界
      await expect(oracle.connect(node1).exitNode(invalidIndex)).to.be.revertedWithCustomError(
        oracle,
        "IndexOutOfBounds",
      );
    });
    it("reverts NodeNotAtGivenIndex when index doesn't match address", async function () {
      await mineBuckets(2);
      const idx2 = await indexOfNodeAddress(node2.address);
      // 尝试让 node1 退出，但使用 node2 的索引
      await expect(oracle.connect(node1).exitNode(idx2)).to.be.revertedWithCustomError(oracle, "NodeNotAtGivenIndex");
    });
  });
  describe("getOutlierNodes", function () {
    beforeEach(async function () {
      const stake = await stakeForDelayedFirstReport();
      await fundApproveAndRegister(node1, stake);
      await fundApproveAndRegister(node2, stake);
      await fundApproveAndRegister(node3, stake);
      await fundApproveAndRegister(node4, stake);
      await fundApproveAndRegister(node5, stake);
      await fundApproveAndRegister(node6, stake);
    });
    it("returns empty array when no outliers exist", async function () {
      await moveToFreshBucket();
      const bucketB = await oracle.getCurrentBucketNumber();
      // 所有节点在这个桶中上报相同的价格
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1000)).wait();
      await (await oracle.connect(node4).reportPrice(1000)).wait();
      await (await oracle.connect(node5).reportPrice(1000)).wait();
      await (await oracle.connect(node6).reportPrice(1000)).wait();
      await mineBuckets(1);
      await (await oracle.connect(slasher).recordBucketMedian(bucketB)).wait();
      const outliers = await oracle.getOutlierNodes(bucketB);
      expect(outliers.length).to.equal(0);
    });
    it("returns deviated node addresses", async function () {
      await moveToFreshBucket();
      const bucketB = await oracle.getCurrentBucketNumber();
      // node4 上报 1200，而其他节点上报 1000（中位数 = 1000）
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1000)).wait();
      await (await oracle.connect(node4).reportPrice(1200)).wait();
      await (await oracle.connect(node5).reportPrice(1000)).wait();
      await (await oracle.connect(node6).reportPrice(1000)).wait();
      await mineBuckets(1);
      await (await oracle.connect(slasher).recordBucketMedian(bucketB)).wait();
      const outliers = await oracle.getOutlierNodes(bucketB);
      expect(outliers.length).to.equal(1);
      expect(outliers[0]).to.equal(node4.address);
    });
    it("excludes nodes that did not report in the bucket", async function () {
      await moveToFreshBucket();
      const bucketB = await oracle.getCurrentBucketNumber();
      // 只有 4 个上报者（满足 6 个节点的 2/3 阈值：requiredReports = 4）
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node4).reportPrice(1200)).wait();
      await (await oracle.connect(node5).reportPrice(1000)).wait();
      await mineBuckets(1);
      await (await oracle.connect(slasher).recordBucketMedian(bucketB)).wait();
      const outliers = await oracle.getOutlierNodes(bucketB);
      expect(outliers.length).to.equal(1);
      expect(outliers[0]).to.equal(node4.address);
      expect(outliers).to.not.include(node3.address);
    });
    it("handles multiple outliers correctly", async function () {
      await moveToFreshBucket();
      const bucketB = await oracle.getCurrentBucketNumber();
      await (await oracle.connect(node1).reportPrice(1000)).wait();
      await (await oracle.connect(node2).reportPrice(1000)).wait();
      await (await oracle.connect(node3).reportPrice(1000)).wait();
      await (await oracle.connect(node4).reportPrice(1400)).wait(); // 离群值（偏离中位数 1000 超过 10%）
      await (await oracle.connect(node5).reportPrice(1400)).wait(); // 离群值
      await (await oracle.connect(node6).reportPrice(1000)).wait();
      await mineBuckets(1);
      await (await oracle.connect(slasher).recordBucketMedian(bucketB)).wait();
      const outliers = await oracle.getOutlierNodes(bucketB);
      expect(outliers.length).to.equal(2);
      expect(outliers).to.include(node4.address);
      expect(outliers).to.include(node5.address);
    });
  });
});
