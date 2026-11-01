//
// 运行 'yarn test' 时会执行此脚本
//
import { network } from "hardhat";
import { expect } from "chai";
import type { FundingRecipient, CrowdFund } from "../types/ethers-contracts/index.js";

describe("🚩 Challenge: 📣 Crowdfunding App", function () {
  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];
  let provider: Awaited<ReturnType<typeof network.create>>["provider"];

  let fundingRecipient: FundingRecipient;
  let crowdFundContract: CrowdFund;

  before(async function () {
    ({ ethers, provider } = await network.create());
  });

  describe("CrowdFund", function () {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    let contractArtifact: string;
    if (contractAddress) {
      // 供自动评分程序使用。
      contractArtifact = `contracts/download-${contractAddress}.sol:CrowdFund`;
    } else {
      contractArtifact = "contracts/CrowdFund.sol:CrowdFund";
    }

    const deployContracts = async () => {
      const FundingRecipientFactory = await ethers.getContractFactory("FundingRecipient");
      fundingRecipient = (await FundingRecipientFactory.deploy()) as unknown as FundingRecipient;

      const CrowdFundFactory = await ethers.getContractFactory(contractArtifact);
      crowdFundContract = (await CrowdFundFactory.deploy(await fundingRecipient.getAddress())) as unknown as CrowdFund;
    };

    describe("Checkpoint 1: 🤝 Contributing 💵", function () {
      beforeEach(async function () {
        await deployContracts();
      });

      const getContributionEventsFromReceipt = (receipt: any) => {
        // 我们不使用 `.to.emit` 之类的 chai 匹配器，这样在精简环境中也能运行。
        const parsed = receipt.logs
          .map((log: any) => {
            try {
              return crowdFundContract.interface.parseLog(log);
            } catch {
              return undefined;
            }
          })
          .filter(Boolean);
        return parsed.filter((p: any) => p.name === "Contribution");
      };

      it("Checkpoint1: balances should go up when you contribute()", async function () {
        const [owner] = await ethers.getSigners();

        const startingBalance = await crowdFundContract.balances(owner.address);

        const amount = ethers.parseEther("0.001");
        const contributeTx = await crowdFundContract.contribute({ value: amount });
        const receipt = await contributeTx.wait();
        expect(receipt?.status).to.equal(1);

        const newBalance = await crowdFundContract.balances(owner.address);
        expect(newBalance).to.equal(startingBalance + amount);
      });

      it("Checkpoint1: should emit a Contribution event with contributor + amount", async function () {
        const [owner] = await ethers.getSigners();

        const amount = ethers.parseEther("0.001");
        const tx = await crowdFundContract.contribute({ value: amount });
        const receipt = await tx.wait();
        expect(receipt?.status).to.equal(1);

        const contributionEvents = getContributionEventsFromReceipt(receipt);
        expect(contributionEvents.length).to.equal(1);

        const evt = contributionEvents[0];
        expect(evt.args[0]).to.equal(owner.address);
        expect(evt.args[1]).to.equal(amount);
      });

      it("Checkpoint1: should accumulate multiple contributions from the same user", async function () {
        const [owner] = await ethers.getSigners();

        const starting = await crowdFundContract.balances(owner.address);

        const a1 = ethers.parseEther("0.001");
        const a2 = ethers.parseEther("0.002");
        await (await crowdFundContract.contribute({ value: a1 })).wait();
        await (await crowdFundContract.contribute({ value: a2 })).wait();

        const ending = await crowdFundContract.balances(owner.address);
        expect(ending).to.equal(starting + a1 + a2);
      });

      it("Checkpoint1: should track balances independently per contributor", async function () {
        const [owner, secondAccount] = await ethers.getSigners();

        const a1 = ethers.parseEther("0.001");
        const a2 = ethers.parseEther("0.002");

        await (await crowdFundContract.connect(owner).contribute({ value: a1 })).wait();
        await (await crowdFundContract.connect(secondAccount).contribute({ value: a2 })).wait();

        expect(await crowdFundContract.balances(owner.address)).to.equal(a1);
        expect(await crowdFundContract.balances(secondAccount.address)).to.equal(a2);
      });

      it("Checkpoint1: contract ETH balance should increase when someone contributes", async function () {
        const startContractBal = await ethers.provider.getBalance(await crowdFundContract.getAddress());

        const amount = ethers.parseEther("0.001");
        await (await crowdFundContract.contribute({ value: amount })).wait();

        const endContractBal = await ethers.provider.getBalance(await crowdFundContract.getAddress());
        expect(endContractBal).to.equal(startContractBal + amount);
      });
    });

    describe("Checkpoint 2: 📤 Withdrawing Funds", function () {
      beforeEach(async function () {
        await deployContracts();
      });

      const setOpenToWithdrawTrue = async () => {
        // Checkpoint 2 中没有 `openToWithdraw` 的 setter，所以我们直接在存储中切换它。
        //
        // 如果你看不懂这里施展的“魔法”，也不用担心。
        //
        // 重要：`openToWithdraw` 可能：
        // - 独占一个存储槽（bool 使用该槽的最低有效字节），或者
        // - 被打包进已有的槽（例如紧跟在一个 `address` 之后声明，于是与它共享 slot 0），
        //   这种情况下，把整个槽设为 `0x...01` 并不一定能翻转这个 bool。
        //
        // 因此我们每次只修改一个字节来探测 (slot, byteOffset)，并检查哪次修改能让
        // `openToWithdraw()` 返回 true。这实际上回答了：“哪个存储位置会影响这个变量？”
        const target = await crowdFundContract.getAddress();

        // 如果已经开放，就无需处理。
        if (await crowdFundContract.openToWithdraw()) return;

        const writeStorageAt = async (slot: bigint, value: string) => {
          const slotHex = ethers.zeroPadValue(ethers.toBeHex(slot), 32);
          await provider.request({ method: "hardhat_setStorageAt", params: [target, slotHex, value] });
        };

        const hexToBytes32 = (hex: string) => {
          // `getStorage` 返回的应是带 0x 前缀的 32 字节十六进制串。
          const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
          const padded = normalized.padStart(64, "0");
          const out: number[] = [];
          for (let i = 0; i < 64; i += 2) out.push(parseInt(padded.slice(i, i + 2), 16));
          if (out.length !== 32) throw new Error("Expected 32 bytes");
          return out;
        };

        const bytes32ToHex = (bytes: number[]) => {
          if (bytes.length !== 32) throw new Error("Expected 32 bytes");
          const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");
          return "0x" + hex;
        };

        // 探测足够多的槽，这样调整变量顺序或新增变量都不会破坏测试。
        // （映射 `balances` 也位于某个槽中，但由于我们总会还原不成功的写入，
        //  所以探测它也是安全的。）
        for (let s = 0n; s <= 20n; s++) {
          const original = await ethers.provider.getStorage(target, s);
          const originalBytes = hexToBytes32(original);

          try {
            // 尝试把每个字节依次设为 0x01（其他字节保持不变）。
            // 存储字在十六进制中以大端序表示，但由于我们会探测全部 32 个字节，
            // 这里无需考虑字节序/打包方向。
            for (let byteIdx = 0; byteIdx < 32; byteIdx++) {
              const mutated = [...originalBytes];
              mutated[byteIdx] = 0x01;
              await writeStorageAt(s, bytes32ToHex(mutated));

              const isOpen = await crowdFundContract.openToWithdraw();
              if (isOpen === true) {
                // 找到了影响 `openToWithdraw` 的 (slot, byteIdx)。
                // 我们有意为本测试保留这次存储修改。
                return;
              }

              // 不是这个字节 → 继续之前先恢复原值。
              await writeStorageAt(s, original);
            }
          } catch {
            // 如果该函数尚不存在，这里无需处理。
          }
          // 确保在进入下一个槽之前，把存储恢复成原样。
          await writeStorageAt(s, original);
        }

        throw new Error("Could not locate `openToWithdraw` storage slot to toggle it for tests.");
      };

      it("Checkpoint2: withdraw should revert with NotOpenToWithdraw() when withdrawals are not open", async function () {
        await expect(crowdFundContract.withdraw()).to.be.revertedWithCustomError(
          crowdFundContract,
          "NotOpenToWithdraw",
        );
      });

      it("Checkpoint2: withdraw should send your full balance and zero-out your recorded balance", async function () {
        const [, contributor] = await ethers.getSigners();

        const amount = ethers.parseEther("0.001");
        await (await crowdFundContract.connect(contributor).contribute({ value: amount })).wait();
        expect(await crowdFundContract.balances(contributor.address)).to.equal(amount);

        // 由于还没有实现 setter，我们直接修改存储，把 openToWithdraw 设为 true。
        await setOpenToWithdrawTrue();

        const startingBalance = await ethers.provider.getBalance(contributor.address);
        const withdrawTx = await crowdFundContract.connect(contributor).withdraw();

        const tx = await ethers.provider.getTransaction(withdrawTx.hash);
        if (!tx) throw new Error("Cannot resolve transaction");
        const receipt = await ethers.provider.getTransactionReceipt(withdrawTx.hash);
        if (!receipt) throw new Error("Cannot resolve receipt");

        const gasCost = tx.gasPrice * receipt.gasUsed;
        const endingBalance = await ethers.provider.getBalance(contributor.address);

        expect(endingBalance).to.equal(startingBalance + amount - gasCost);
        expect(await crowdFundContract.balances(contributor.address)).to.equal(0n);
      });

      it("Checkpoint2: withdrawing twice should not let you withdraw more than you contributed", async function () {
        const [, contributor] = await ethers.getSigners();

        const amount = ethers.parseEther("0.001");
        await (await crowdFundContract.connect(contributor).contribute({ value: amount })).wait();

        // 由于还没有实现 setter，我们直接修改存储，把 openToWithdraw 设为 true。
        await setOpenToWithdrawTrue();

        await (await crowdFundContract.connect(contributor).withdraw()).wait();
        const balanceAfterFirst = await ethers.provider.getBalance(contributor.address);

        // 第二次 withdraw 应退还 0；只有 gas 会改变钱包余额。
        const secondTx = await crowdFundContract.connect(contributor).withdraw();
        const tx = await ethers.provider.getTransaction(secondTx.hash);
        if (!tx) throw new Error("Cannot resolve transaction");
        const receipt = await ethers.provider.getTransactionReceipt(secondTx.hash);
        if (!receipt) throw new Error("Cannot resolve receipt");
        const gasCost = tx.gasPrice * receipt.gasUsed;

        const balanceAfterSecond = await ethers.provider.getBalance(contributor.address);
        expect(balanceAfterSecond).to.equal(balanceAfterFirst - gasCost);
        expect(await crowdFundContract.balances(contributor.address)).to.equal(0n);
      });
    });

    describe("Checkpoint 3: 🔬 State Machine / Timing ⏱", function () {
      beforeEach(async function () {
        await deployContracts();
      });

      it("Checkpoint3: execute() should revert with TooEarly() if called before the deadline", async function () {
        await expect(crowdFundContract.execute()).to.be.revertedWithCustomError(crowdFundContract, "TooEarly");
      });

      it("Checkpoint3: timeLeft should decrease as time moves forward (until it hits 0)", async function () {
        const t1 = await crowdFundContract.timeLeft();
        expect(Number(t1)).to.be.greaterThan(0);

        await provider.request({ method: "evm_increaseTime", params: [5] });
        await provider.request({ method: "evm_mine" });

        const t2 = await crowdFundContract.timeLeft();
        expect(Number(t2)).to.be.lessThan(Number(t1));
        expect(Number(t2)).to.be.greaterThanOrEqual(0);
      });

      it("Checkpoint3: if enough is contributed and time has passed, execute() should complete()", async function () {
        const timeLeft1 = await crowdFundContract.timeLeft();
        expect(
          Number(timeLeft1),
          "timeLeft not greater than 0. Did you implement the timeLeft() function correctly?",
        ).to.greaterThan(0);

        const amount = ethers.parseEther("1");
        await crowdFundContract.contribute({ value: amount });

        await provider.request({ method: "evm_increaseTime", params: [72 * 3600] });
        await provider.request({ method: "evm_mine" });

        const timeLeft2 = await crowdFundContract.timeLeft();
        expect(
          Number(timeLeft2),
          "timeLeft not equal to 0. Did you implement the timeLeft() function correctly?",
        ).to.equal(0);

        const startRecipientBal = await ethers.provider.getBalance(await fundingRecipient.getAddress());
        const startContractBal = await ethers.provider.getBalance(await crowdFundContract.getAddress());

        await crowdFundContract.execute();

        const result = await fundingRecipient.completed();
        expect(result).to.equal(true);

        const endRecipientBal = await ethers.provider.getBalance(await fundingRecipient.getAddress());
        const endContractBal = await ethers.provider.getBalance(await crowdFundContract.getAddress());

        // 资金应已通过 `complete{value: ...}()` 转入 FundingRecipient
        expect(endRecipientBal).to.equal(startRecipientBal + startContractBal);
        expect(endContractBal).to.equal(0n);
      });

      it("Checkpoint3: if not enough is contributed and time has passed, execute() should enable withdraw", async function () {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [owner, secondAccount] = await ethers.getSigners();

        await crowdFundContract.connect(secondAccount).contribute({
          value: ethers.parseEther("0.001"),
        });

        await provider.request({ method: "evm_increaseTime", params: [72 * 3600] });
        await provider.request({ method: "evm_mine" });

        await crowdFundContract.execute();

        const result = await fundingRecipient.completed();
        expect(result).to.equal(false);

        // 如果已实现 `openToWithdraw`（Checkpoint 2/3），它现在应为 true。
        // 我们使用 `as any`，这样在更早的 checkpoint 阶段这个测试文件也能编译。
        if ((crowdFundContract as any).openToWithdraw) {
          const isOpen = await (crowdFundContract as any).openToWithdraw();
          expect(isOpen).to.equal(true);
        }

        const startingBalance = await ethers.provider.getBalance(secondAccount.address);
        const withdrawTx = await crowdFundContract.connect(secondAccount).withdraw();

        const tx = await ethers.provider.getTransaction(withdrawTx.hash);
        if (!tx) throw new Error("Cannot resolve transaction");

        const receipt = await ethers.provider.getTransactionReceipt(withdrawTx.hash);
        if (!receipt) throw new Error("Cannot resolve receipt");

        const gasCost = tx.gasPrice * receipt.gasUsed;
        const endingBalance = await ethers.provider.getBalance(secondAccount.address);

        expect(endingBalance).to.equal(startingBalance + ethers.parseEther("0.001") - gasCost);
      });
    });

    describe("Checkpoint 4: 💵 Receive Function / UX 🙎", function () {
      beforeEach(async function () {
        await deployContracts();
      });

      it("Checkpoint4: sending ETH directly to the contract should behave like contribute()", async function () {
        const [owner] = await ethers.getSigners();
        const startingBalance = await crowdFundContract.balances(owner.address);

        const amount = ethers.parseEther("0.001");
        const sendTx = await owner.sendTransaction({ to: await crowdFundContract.getAddress(), value: amount });
        await sendTx.wait();

        const newBalance = await crowdFundContract.balances(owner.address);
        expect(newBalance).to.equal(startingBalance + amount);
      });
    });
  });
});
