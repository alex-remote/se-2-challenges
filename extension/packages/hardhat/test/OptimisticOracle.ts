import { expect } from "chai";
import { network } from "hardhat";
import type { OptimisticOracle, Decider } from "../types/ethers-contracts/index.js";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";

describe("OptimisticOracle", function () {
  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];

  before(async () => {
    ({ ethers } = await network.create());
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_setIntervalMining", [0]);
  });

  let optimisticOracle: OptimisticOracle;
  let deciderContract: Decider;
  let owner: HardhatEthersSigner;
  let asserter: HardhatEthersSigner;
  let proposer: HardhatEthersSigner;
  let disputer: HardhatEthersSigner;
  let otherUser: HardhatEthersSigner;

  const contractAddress = process.env.CONTRACT_ADDRESS;

  let contractArtifact: string;
  if (contractAddress) {
    // 供自动评分程序使用
    contractArtifact = `contracts/download-${contractAddress}.sol:OptimisticOracle`;
  } else {
    contractArtifact = "contracts/02_Optimistic/OptimisticOracle.sol:OptimisticOracle";
  }

  // 状态枚举
  const State = {
    Invalid: 0n,
    Asserted: 1n,
    Proposed: 2n,
    Disputed: 3n,
    Settled: 4n,
    Expired: 5n,
  };

  beforeEach(async function () {
    [owner, asserter, proposer, disputer, otherUser] = await ethers.getSigners();

    // 以临时裁决者（owner）部署 OptimisticOracle
    const OptimisticOracleFactory = await ethers.getContractFactory(contractArtifact);
    optimisticOracle = (await OptimisticOracleFactory.deploy(owner.address)) as OptimisticOracle;

    // 部署 Decider
    const DeciderFactory = await ethers.getContractFactory("Decider");
    deciderContract = (await DeciderFactory.deploy(optimisticOracle.target)) as Decider;

    // 在预言机中设置裁决者
    await optimisticOracle.setDecider(deciderContract.target);
  });
  describe("Checkpoint4", function () {
    describe("Deployment", function () {
      it("Should deploy successfully", function () {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(optimisticOracle.target).to.not.be.undefined;
      });

      it("Should set the correct owner", async function () {
        const contractOwner = await optimisticOracle.owner();
        expect(contractOwner).to.equal(owner.address);
      });

      it("Should have correct constants", async function () {
        const minimumAssertionWindow = await optimisticOracle.MINIMUM_ASSERTION_WINDOW();
        const disputeWindow = await optimisticOracle.DISPUTE_WINDOW();

        expect(minimumAssertionWindow).to.equal(180n); // 3 分钟
        expect(disputeWindow).to.equal(180n); // 3 分钟
      });

      it("Should start with nextAssertionId at 1", async function () {
        const nextAssertionId = await optimisticOracle.nextAssertionId();
        expect(nextAssertionId).to.equal(1n);
      });

      it("Should return correct assertionId for first assertion", async function () {
        const description = "Will Bitcoin reach $1m by end of 2026?";
        const reward = ethers.parseEther("1");

        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        // 从事件中获取 assertionId
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        const assertionId = parsedEvent!.args[0];

        expect(assertionId).to.equal(1n);
      });
    });

    describe("Event Assertion", function () {
      it("Should allow users to assert events with reward", async function () {
        const description = "Will Bitcoin reach $1m by end of 2026?";
        const reward = ethers.parseEther("1");

        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();

        // 从事件中获取 assertionId
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        const assertionId = parsedEvent!.args[0];

        expect(tx)
          .to.emit(optimisticOracle, "EventAsserted")
          .withArgs(assertionId, asserter.address, description, reward);
      });

      it("Should reject assertions with insufficient reward", async function () {
        const description = "Will Bitcoin reach $1m by end of 2026?";
        const insufficientReward = ethers.parseEther("0.0");

        await expect(
          optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: insufficientReward }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidValue");
      });
    });

    describe("Outcome Proposal", function () {
      let assertionId: bigint;
      let description: string;
      let reward: bigint;

      beforeEach(async function () {
        description = "Will Bitcoin reach $1m by end of 2026?";
        reward = ethers.parseEther("1");
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        // 从事件中获取 assertionId
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        assertionId = parsedEvent!.args[0];
      });

      it("Should allow proposing outcomes with correct bond", async function () {
        const bond = reward * 2n;
        const outcome = true;

        const tx = await optimisticOracle.connect(proposer).proposeOutcome(assertionId, outcome, { value: bond });

        expect(tx).to.emit(optimisticOracle, "OutcomeProposed").withArgs(assertionId, proposer.address, outcome);
      });

      it("Should reject proposals with incorrect bond", async function () {
        const wrongBond = ethers.parseEther("0.05");
        const outcome = true;

        await expect(
          optimisticOracle.connect(proposer).proposeOutcome(assertionId, outcome, { value: wrongBond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidValue");
      });

      it("Should reject duplicate proposals", async function () {
        const bond = reward * 2n;
        const outcome = true;

        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, outcome, { value: bond });

        await expect(
          optimisticOracle.connect(otherUser).proposeOutcome(assertionId, !outcome, { value: bond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "AssertionProposed");
      });
    });

    describe("Outcome Dispute", function () {
      let assertionId: bigint;
      let description: string;
      let reward: bigint;

      beforeEach(async function () {
        description = "Will Bitcoin reach $1m by end of 2026?";
        reward = ethers.parseEther("1");
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        assertionId = parsedEvent!.args[0];

        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });
      });

      it("Should allow disputing outcomes with correct bond", async function () {
        const bond = reward * 2n;

        const tx = await optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond });

        expect(tx).to.emit(optimisticOracle, "OutcomeDisputed").withArgs(assertionId, disputer.address);
      });

      it("Should reject disputes with incorrect bond", async function () {
        const wrongBond = ethers.parseEther("0.05");

        await expect(
          optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: wrongBond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidValue");
      });

      it("Should reject disputes after deadline", async function () {
        // 将时间快进到争议窗口期之后
        await ethers.provider.send("evm_increaseTime", [181]); // 3 分钟 + 1 秒
        await ethers.provider.send("evm_mine");

        const bond = reward * 2n;
        await expect(
          optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidTime");
      });

      it("Should reject duplicate disputes", async function () {
        const bond = reward * 2n;
        await optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond });

        await expect(
          optimisticOracle.connect(otherUser).disputeOutcome(assertionId, { value: bond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "ProposalDisputed");
      });
    });

    describe("Start and End Time Logic", function () {
      it("Should not allow proposal before startTime", async function () {
        const reward = ethers.parseEther("1");
        const now = (await ethers.provider.getBlock("latest"))!.timestamp;
        const start = now + 1000;
        const end = start + 1000;
        const tx = await optimisticOracle.connect(asserter).assertEvent("future event", start, end, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        if (!parsedEvent) throw new Error("Event not found");
        const assertionId = parsedEvent.args[0];

        const bond = reward * 2n;
        await expect(
          optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidTime");
      });

      it("Should not allow proposal after endTime", async function () {
        const reward = ethers.parseEther("1");
        const now = (await ethers.provider.getBlock("latest"))!.timestamp;
        const start = now + 1; // 开始时间必须在未来
        const end = now + 200; // 200 秒，超过 DISPUTE_WINDOW（180 秒）
        const tx = await optimisticOracle.connect(asserter).assertEvent("short event", start, end, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        if (!parsedEvent) throw new Error("Event not found");
        const assertionId = parsedEvent.args[0];

        // 等到 endTime 之后
        await ethers.provider.send("evm_increaseTime", [201]);
        await ethers.provider.send("evm_mine");

        const bond = reward * 2n;
        await expect(
          optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidTime");
      });

      it("Should allow proposal only within [startTime, endTime]", async function () {
        const reward = ethers.parseEther("1");
        const now = (await ethers.provider.getBlock("latest"))!.timestamp;
        const start = now + 10; // 开始时间在未来
        const end = start + 200; // 确保 endTime 在足够远的未来
        const tx = await optimisticOracle.connect(asserter).assertEvent("window event", start, end, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        if (!parsedEvent) throw new Error("Event not found");
        const assertionId = parsedEvent.args[0];

        const bond = reward * 2n;

        // 在 startTime 之前——应当失败
        await expect(
          optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond }),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidTime");

        // 推进到 startTime
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        // 现在应当可以成功
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });
      });
    });
  });

  describe("Checkpoint5", function () {
    describe("Undisputed Reward Claiming", function () {
      let assertionId: bigint;
      let description: string;
      let reward: bigint;

      beforeEach(async function () {
        description = "Will Bitcoin reach $1m by end of 2026?";
        reward = ethers.parseEther("1");
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        assertionId = parsedEvent!.args[0];

        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });
      });

      it("Should allow claiming undisputed rewards after deadline", async function () {
        // 将时间快进到争议窗口期之后
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");

        const initialBalance = await ethers.provider.getBalance(proposer.address);
        const tx = await optimisticOracle.connect(proposer).claimUndisputedReward(assertionId);
        const receipt = await tx.wait();
        const finalBalance = await ethers.provider.getBalance(proposer.address);

        // 检查提议者是否收到了奖励（奖励 + 保证金 - gas 费用）
        const expectedReward = reward + reward * 2n;
        const gasCost = receipt!.gasUsed * receipt!.gasPrice!;
        expect(finalBalance - initialBalance + gasCost).to.equal(expectedReward);
      });

      it("Should reject claiming before deadline", async function () {
        await expect(
          optimisticOracle.connect(proposer).claimUndisputedReward(assertionId),
        ).to.be.revertedWithCustomError(optimisticOracle, "InvalidTime");
      });

      it("Should reject claiming disputed assertions", async function () {
        const bond = reward * 2n;
        await optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond });

        await expect(
          optimisticOracle.connect(proposer).claimUndisputedReward(assertionId),
        ).to.be.revertedWithCustomError(optimisticOracle, "ProposalDisputed");
      });

      it("Should reject claiming already claimed rewards", async function () {
        // 快进时间并领取
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");
        await optimisticOracle.connect(proposer).claimUndisputedReward(assertionId);

        await expect(
          optimisticOracle.connect(proposer).claimUndisputedReward(assertionId),
        ).to.be.revertedWithCustomError(optimisticOracle, "AlreadyClaimed");
      });
    });

    describe("Disputed Reward Claiming", function () {
      let assertionId: bigint;
      let description: string;
      let reward: bigint;

      beforeEach(async function () {
        description = "Will Bitcoin reach $1m by end of 2026?";
        reward = ethers.parseEther("1");
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        assertionId = parsedEvent!.args[0];

        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });
        await optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond });
      });

      it("Should allow winner to claim disputed rewards after settlement", async function () {
        // 以提议者胜出进行结算
        await deciderContract.connect(owner).settleDispute(assertionId, true);

        const initialBalance = await ethers.provider.getBalance(proposer.address);
        const tx = await optimisticOracle.connect(proposer).claimDisputedReward(assertionId);
        const receipt = await tx.wait();
        const finalBalance = await ethers.provider.getBalance(proposer.address);

        // 检查提议者是否收到了奖励（奖励 + 保证金 - gas 费用）
        const expectedReward = reward * 3n;
        const gasCost = receipt!.gasUsed * receipt!.gasPrice!;
        expect(finalBalance - initialBalance + gasCost).to.equal(expectedReward);
      });

      it("Should allow disputer to claim when they win", async function () {
        // 以争议者胜出进行结算
        await deciderContract.connect(owner).settleDispute(assertionId, false);

        const initialBalance = await ethers.provider.getBalance(disputer.address);
        const tx = await optimisticOracle.connect(disputer).claimDisputedReward(assertionId);
        const receipt = await tx.wait();
        const finalBalance = await ethers.provider.getBalance(disputer.address);

        // 检查争议者是否收到了奖励
        const expectedReward = reward * 3n;
        const gasCost = receipt!.gasUsed * receipt!.gasPrice!;
        expect(finalBalance - initialBalance + gasCost).to.equal(expectedReward);
      });

      it("Should reject claiming before settlement", async function () {
        await expect(optimisticOracle.connect(proposer).claimDisputedReward(assertionId)).to.be.revertedWithCustomError(
          optimisticOracle,
          "AwaitingDecider",
        );
      });

      it("Should reject claiming already claimed rewards", async function () {
        await deciderContract.connect(owner).settleDispute(assertionId, true);
        await optimisticOracle.connect(proposer).claimDisputedReward(assertionId);

        await expect(optimisticOracle.connect(proposer).claimDisputedReward(assertionId)).to.be.revertedWithCustomError(
          optimisticOracle,
          "AlreadyClaimed",
        );
      });
    });

    describe("Refund Claiming", function () {
      let assertionId: bigint;
      let description: string;
      let reward: bigint;

      beforeEach(async function () {
        description = "Will Bitcoin reach $1m by end of 2026?";
        reward = ethers.parseEther("1");
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        assertionId = parsedEvent!.args[0];
      });

      it("Should allow asserter to claim refund for assertions without proposals", async function () {
        // 将时间快进到争议窗口期之后
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");

        const initialBalance = await ethers.provider.getBalance(asserter.address);
        const tx = await optimisticOracle.connect(asserter).claimRefund(assertionId);
        const receipt = await tx.wait();
        const finalBalance = await ethers.provider.getBalance(asserter.address);

        // 检查断言者是否收到了退款（奖励 - gas 费用）
        const gasCost = receipt!.gasUsed * receipt!.gasPrice!;
        expect(finalBalance - initialBalance + gasCost).to.equal(reward);
      });

      it("Should reject refund claiming for assertions with proposals", async function () {
        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });

        await expect(optimisticOracle.connect(asserter).claimRefund(assertionId)).to.be.revertedWithCustomError(
          optimisticOracle,
          "AssertionProposed",
        );
      });

      it("Should reject claiming already claimed refunds", async function () {
        // 快进时间并领取
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");
        await optimisticOracle.connect(asserter).claimRefund(assertionId);

        await expect(optimisticOracle.connect(asserter).claimRefund(assertionId)).to.be.revertedWithCustomError(
          optimisticOracle,
          "AlreadyClaimed",
        );
      });
    });
  });

  describe("Checkpoint6", function () {
    describe("Dispute Settlement", function () {
      let assertionId: bigint;
      let description: string;
      let reward: bigint;

      beforeEach(async function () {
        description = "Will Bitcoin reach $1m by end of 2026?";
        reward = ethers.parseEther("1");
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        assertionId = parsedEvent!.args[0];

        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });
        await optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond });
      });

      it("Should allow decider to settle disputed assertions", async function () {
        const resolvedOutcome = true;
        const tx = await deciderContract.connect(owner).settleDispute(assertionId, resolvedOutcome);

        expect(tx)
          .to.emit(optimisticOracle, "AssertionSettled")
          .withArgs(assertionId, resolvedOutcome, proposer.address);

        // 通过检查状态来确认该断言已被正确结算
        const state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Settled); // 已结算状态
      });

      it("Should reject settlement by non-decider", async function () {
        const resolvedOutcome = true;

        await expect(
          optimisticOracle.connect(otherUser).settleAssertion(assertionId, resolvedOutcome),
        ).to.be.revertedWithCustomError(optimisticOracle, "OnlyDecider");
      });

      it("Should reject settling undisputed assertions", async function () {
        // 创建一个新的未被争议的断言
        const newDescription = "Will Ethereum reach $10k by end of 2024?";
        const newTx = await optimisticOracle.connect(asserter).assertEvent(newDescription, 0, 0, { value: reward });
        const newReceipt = await newTx.wait();
        const newEvent = newReceipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const newParsedEvent = optimisticOracle.interface.parseLog(newEvent as any);
        const newAssertionId = newParsedEvent!.args[0];

        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(newAssertionId, true, { value: bond });

        const resolvedOutcome = true;
        await expect(
          deciderContract.connect(owner).settleDispute(newAssertionId, resolvedOutcome),
        ).to.be.revertedWithCustomError(optimisticOracle, "NotDisputedAssertion");
      });
    });

    describe("State Management", function () {
      it("Should return correct states for different scenarios", async function () {
        const description = "Will Bitcoin reach $1m by end of 2026?";
        const reward = ethers.parseEther("1");

        // 不存在的断言为 Invalid 状态
        let state = await optimisticOracle.getState(999n);
        expect(state).to.equal(State.Invalid); // 无效

        // Asserted 状态
        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        const assertionId = parsedEvent!.args[0];

        state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Asserted); // 已断言

        // Proposed 状态
        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });
        state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Proposed); // 已提议

        // Disputed 状态
        await optimisticOracle.connect(disputer).disputeOutcome(assertionId, { value: bond });
        state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Disputed); // 已争议

        // Settled 状态（在裁决者裁定之后）
        await deciderContract.connect(owner).settleDispute(assertionId, true);
        state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Settled); // 已结算
      });

      it("Should show settled state for claimable uncontested assertions", async function () {
        const description = "Will Ethereum reach $10k by end of 2024?";
        const reward = ethers.parseEther("1");

        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        const assertionId = parsedEvent!.args[0];

        const bond = reward * 2n;
        await optimisticOracle.connect(proposer).proposeOutcome(assertionId, true, { value: bond });

        // 将时间快进到争议窗口期之后
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");

        const state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Settled); // 已结算（可以领取）
      });

      it("Should show expired state for assertions without proposals after deadline", async function () {
        const description = "Will Ethereum reach $10k by end of 2024?";
        const reward = ethers.parseEther("1");

        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        const assertionId = parsedEvent!.args[0];

        // 在没有任何提议的情况下，将时间快进到争议窗口期之后
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");

        const state = await optimisticOracle.getState(assertionId);
        expect(state).to.equal(State.Expired); // 已过期
      });

      it("Should revert getResolution for expired assertions without proposals", async function () {
        const description = "Will Ethereum reach $10k by end of 2024?";
        const reward = ethers.parseEther("1");

        const tx = await optimisticOracle.connect(asserter).assertEvent(description, 0, 0, { value: reward });
        const receipt = await tx.wait();
        const event = receipt!.logs.find(
          log => optimisticOracle.interface.parseLog(log as any)?.name === "EventAsserted",
        );
        const parsedEvent = optimisticOracle.interface.parseLog(event as any);
        const assertionId = parsedEvent!.args[0];

        // 在没有任何提议的情况下，将时间快进到断言窗口期之后
        await ethers.provider.send("evm_increaseTime", [181]);
        await ethers.provider.send("evm_mine");

        // getResolution 应当回滚（revert），因为从未有人提议过结果
        // （没有提议的过期断言不存在有效的最终结果）
        await expect(optimisticOracle.getResolution(assertionId)).to.be.revertedWithCustomError(
          optimisticOracle,
          "NotProposedAssertion",
        );
      });
    });
  });
});
