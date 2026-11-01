import { expect } from "chai";
import { network } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import type { WhitelistOracle, SimpleOracle } from "../types/ethers-contracts/index.js";

describe("Checkpoint1", function () {
  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];

  before(async () => {
    ({ ethers } = await network.create());
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_setIntervalMining", [0]);
  });

  let whitelistOracle: WhitelistOracle;
  let owner: HardhatEthersSigner,
    addr1: HardhatEthersSigner,
    addr2: HardhatEthersSigner,
    addr3: HardhatEthersSigner,
    addr4: HardhatEthersSigner;

  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (contractAddress) {
    // 如果设置了该环境变量，则跳过此测试文件（供自动评分程序使用）
    return true;
  }

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const WhitelistOracleFactory = await ethers.getContractFactory("WhitelistOracle");
    whitelistOracle = (await WhitelistOracleFactory.deploy()) as WhitelistOracle;
  });

  it("Should deploy and set owner", async function () {
    expect(await whitelistOracle.owner()).to.equal(owner.address);
  });

  it("Should allow adding oracles and deploy SimpleOracle contracts", async function () {
    await whitelistOracle.addOracle(addr1.address);

    const oracleAddress = await whitelistOracle.oracles(0);
    expect(oracleAddress).to.not.equal(ethers.ZeroAddress);

    // 检查该预言机是否为 SimpleOracle 合约
    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle = SimpleOracleFactory.attach(oracleAddress) as SimpleOracle;
    expect(await oracle.owner()).to.equal(addr1.address);
  });

  it("Should allow removing oracles by index", async function () {
    await whitelistOracle.addOracle(addr1.address);
    await whitelistOracle.addOracle(addr2.address);

    const oracle1Address = await whitelistOracle.oracles(0);

    await whitelistOracle.removeOracle(0);

    // 移除后，索引 0 处的预言机应当变了（被末尾的元素换过来）
    const newOracle0Address = await whitelistOracle.oracles(0);
    expect(newOracle0Address).to.not.equal(oracle1Address);

    // 应当只剩下一个预言机
    await expect(whitelistOracle.oracles(1)).to.be.revert(ethers);
  });

  it("Should emit OracleAdded event when an oracle is added", async function () {
    const tx = await whitelistOracle.addOracle(addr1.address);
    await tx.wait();
    const oracleAddress = await whitelistOracle.oracles(0);

    expect(tx).to.emit(whitelistOracle, "OracleAdded").withArgs(oracleAddress, addr1.address);
  });

  it("Should emit OracleRemoved event when an oracle is removed", async function () {
    await whitelistOracle.addOracle(addr1.address);
    const oracleAddress = await whitelistOracle.oracles(0);

    await expect(whitelistOracle.removeOracle(0)).to.emit(whitelistOracle, "OracleRemoved").withArgs(oracleAddress);
  });

  it("Should revert with IndexOutOfBounds when trying to remove non-existent oracle", async function () {
    await expect(whitelistOracle.removeOracle(0)).to.be.revertedWithCustomError(whitelistOracle, "IndexOutOfBounds");

    await whitelistOracle.addOracle(addr1.address);
    await expect(whitelistOracle.removeOracle(1)).to.be.revertedWithCustomError(whitelistOracle, "IndexOutOfBounds");

    await whitelistOracle.removeOracle(0);
    await expect(whitelistOracle.removeOracle(0)).to.be.revertedWithCustomError(whitelistOracle, "IndexOutOfBounds");
  });

  it("Should revert with NoOraclesAvailable when getPrice is called with no oracles", async function () {
    await expect(whitelistOracle.getPrice()).to.be.revertedWithCustomError(whitelistOracle, "NoOraclesAvailable");
  });

  it("Should return correct price with one oracle", async function () {
    await whitelistOracle.addOracle(addr1.address);
    const oracleAddress = await whitelistOracle.oracles(0);

    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle = SimpleOracleFactory.attach(oracleAddress) as SimpleOracle;

    await oracle.setPrice(1000n);

    const price = await whitelistOracle.getPrice();
    expect(price).to.equal(1000n);
  });

  it("Should return correct median price with odd number of oracles", async function () {
    await whitelistOracle.addOracle(addr1.address);
    await whitelistOracle.addOracle(addr2.address);
    await whitelistOracle.addOracle(addr3.address);

    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle1 = SimpleOracleFactory.attach(await whitelistOracle.oracles(0)) as SimpleOracle;
    const oracle2 = SimpleOracleFactory.attach(await whitelistOracle.oracles(1)) as SimpleOracle;
    const oracle3 = SimpleOracleFactory.attach(await whitelistOracle.oracles(2)) as SimpleOracle;

    await oracle1.setPrice(1000n);
    await oracle2.setPrice(3000n);
    await oracle3.setPrice(2000n);

    const medianPrice = await whitelistOracle.getPrice();
    expect(medianPrice).to.equal(2000n);
  });

  it("Should return correct median price with even number of oracles", async function () {
    await whitelistOracle.addOracle(addr1.address);
    await whitelistOracle.addOracle(addr2.address);
    await whitelistOracle.addOracle(addr3.address);
    await whitelistOracle.addOracle(addr4.address);

    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle1 = SimpleOracleFactory.attach(await whitelistOracle.oracles(0)) as SimpleOracle;
    const oracle2 = SimpleOracleFactory.attach(await whitelistOracle.oracles(1)) as SimpleOracle;
    const oracle3 = SimpleOracleFactory.attach(await whitelistOracle.oracles(2)) as SimpleOracle;
    const oracle4 = SimpleOracleFactory.attach(await whitelistOracle.oracles(3)) as SimpleOracle;

    await oracle1.setPrice(1000n);
    await oracle2.setPrice(3000n);
    await oracle3.setPrice(2000n);
    await oracle4.setPrice(4000n);

    const medianPrice = await whitelistOracle.getPrice();
    expect(medianPrice).to.equal(2500n);
  });

  it("Should exclude price reports older than 24 seconds from median calculation", async function () {
    await whitelistOracle.addOracle(addr1.address);
    await whitelistOracle.addOracle(addr2.address);
    await whitelistOracle.addOracle(addr3.address);

    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle1 = SimpleOracleFactory.attach(await whitelistOracle.oracles(0)) as SimpleOracle;
    const oracle2 = SimpleOracleFactory.attach(await whitelistOracle.oracles(1)) as SimpleOracle;
    const oracle3 = SimpleOracleFactory.attach(await whitelistOracle.oracles(2)) as SimpleOracle;

    await oracle1.setPrice(1000n);
    await oracle2.setPrice(2000n);
    await oracle3.setPrice(3000n);

    let medianPrice = await whitelistOracle.getPrice();
    expect(medianPrice).to.equal(2000n);

    // 将时间推进 25 秒（超过 24 秒的 STALE_DATA_WINDOW）
    await ethers.provider.send("evm_increaseTime", [25]);
    await ethers.provider.send("evm_mine");

    // 只为其中两个预言机设置新价格（旧价格应当已过期）
    await oracle1.setPrice(5000n);
    await oracle2.setPrice(3000n);

    // 应当只使用这两个新鲜价格：[5000, 3000] 的中位数 = 4000
    medianPrice = await whitelistOracle.getPrice();
    expect(medianPrice).to.equal(4000n);
  });

  it("Should return empty array when no oracles are active", async function () {
    const activeNodes = await whitelistOracle.getActiveOracleNodes();
    expect(activeNodes.length).to.equal(0);
  });

  it("Should return correct active oracle nodes", async function () {
    await whitelistOracle.addOracle(addr1.address);
    await whitelistOracle.addOracle(addr2.address);

    const oracle1Address = await whitelistOracle.oracles(0);
    const oracle2Address = await whitelistOracle.oracles(1);

    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle1 = SimpleOracleFactory.attach(oracle1Address) as SimpleOracle;
    const oracle2 = SimpleOracleFactory.attach(oracle2Address) as SimpleOracle;

    await oracle1.setPrice(1000n);
    await oracle2.setPrice(2000n);

    let activeNodes = await whitelistOracle.getActiveOracleNodes();
    expect(activeNodes.length).to.equal(2);
    expect(activeNodes).to.include(oracle1Address);
    expect(activeNodes).to.include(oracle2Address);

    // 让 oracle1 的价格过期
    await ethers.provider.send("evm_increaseTime", [25]);
    await ethers.provider.send("evm_mine");

    // 只更新 oracle2
    await oracle2.setPrice(3000n);

    activeNodes = await whitelistOracle.getActiveOracleNodes();
    expect(activeNodes.length).to.equal(1);
    expect(activeNodes[0]).to.equal(oracle2Address);
  });

  it("Should handle edge case when all prices are stale but array is not empty", async function () {
    await whitelistOracle.addOracle(addr1.address);
    await whitelistOracle.addOracle(addr2.address);

    const SimpleOracleFactory = await ethers.getContractFactory("SimpleOracle");
    const oracle1 = SimpleOracleFactory.attach(await whitelistOracle.oracles(0)) as SimpleOracle;
    const oracle2 = SimpleOracleFactory.attach(await whitelistOracle.oracles(1)) as SimpleOracle;

    await oracle1.setPrice(1000n);
    await oracle2.setPrice(2000n);

    // 先验证中位数在初始状态下能正常计算
    const medianPrice = await whitelistOracle.getPrice();
    expect(medianPrice).to.equal(1500n);

    // 让所有价格都过期
    await ethers.provider.send("evm_increaseTime", [25]);
    await ethers.provider.send("evm_mine");

    const activeNodes = await whitelistOracle.getActiveOracleNodes();
    expect(activeNodes.length).to.equal(0);
  });
});
