//
// 当你运行 'yarn harhat:test' 时会执行此脚本
//

import { network } from "hardhat";
import { expect } from "chai";
import type { Vendor, YourToken } from "../types/ethers-contracts/index.js";

describe("🚩 Challenge: 🏵 Token Vendor 🤖", function () {
  // NOTE: README 要求测试按 checkpoint 分组，这样你就可以运行：
  //   yarn test --grep "Checkpoint1"
  //   yarn test --grep "Checkpoint2"
  //   yarn test --grep "Checkpoint3"
  //   yarn test --grep "Checkpoint4"

  let ethers: Awaited<ReturnType<typeof network.create>>["ethers"];
  let networkHelpers: Awaited<ReturnType<typeof network.create>>["networkHelpers"];

  const contractAddress = process.env.CONTRACT_ADDRESS;

  const getYourTokenArtifact = () => {
    if (contractAddress) return "contracts/YourTokenAutograder.sol:YourToken";
    return "contracts/YourToken.sol:YourToken";
  };

  const getVendorArtifact = () => {
    if (process.env.CONTRACT_ADDRESS) return `contracts/download-${process.env.CONTRACT_ADDRESS}.sol:Vendor`;
    return "contracts/Vendor.sol:Vendor";
  };

  const TOKENS_PER_ETH = 100n;
  let INITIAL_SUPPLY: bigint;

  before(async function () {
    ({ ethers, networkHelpers } = await network.create());
    INITIAL_SUPPLY = ethers.parseEther("1000");
  });

  async function deployYourTokenFixture() {
    const [deployer, user] = await ethers.getSigners();
    const YourTokenFactory = await ethers.getContractFactory(getYourTokenArtifact());
    const yourToken = (await YourTokenFactory.deploy()) as unknown as YourToken;
    await yourToken.waitForDeployment();
    return { deployer, user, yourToken, yourTokenAddress: await yourToken.getAddress() };
  }

  async function deployVendorFixture(yourTokenAddress: string) {
    const VendorFactory = await ethers.getContractFactory(getVendorArtifact());
    const vendor = (await VendorFactory.deploy(yourTokenAddress)) as unknown as Vendor;
    await vendor.waitForDeployment();
    return { vendor, vendorAddress: await vendor.getAddress() };
  }

  describe("Checkpoint1: 🏵 Your Token (ERC20 mint + transfer)", function () {
    it("Checkpoint1: mints exactly 1000 tokens (18 decimals) to the deployer", async function () {
      const { deployer, yourToken } = await deployYourTokenFixture();

      const totalSupply = await yourToken.totalSupply();
      expect(totalSupply).to.equal(INITIAL_SUPPLY);

      const deployerBalance = await yourToken.balanceOf(deployer.address);
      expect(deployerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("Checkpoint1: can transfer tokens and balanceOf updates correctly", async function () {
      const { deployer, user, yourToken } = await deployYourTokenFixture();

      const amount = ethers.parseEther("10");
      await expect(yourToken.transfer(user.address, amount)).to.not.be.revert(ethers);

      expect(await yourToken.balanceOf(user.address)).to.equal(amount);
      expect(await yourToken.balanceOf(deployer.address)).to.equal(INITIAL_SUPPLY - amount);
    });
  });

  describe("Checkpoint2: ⚖️ Vendor buyTokens()", function () {
    it("Checkpoint2: tokensPerEth constant is 100", async function () {
      const { yourTokenAddress } = await deployYourTokenFixture();
      const { vendor } = await deployVendorFixture(yourTokenAddress);

      expect(await vendor.tokensPerEth()).to.equal(TOKENS_PER_ETH);
    });

    it("Checkpoint2: buyTokens reverts on 0 ETH with InvalidEthAmount", async function () {
      const { yourTokenAddress } = await deployYourTokenFixture();
      const { vendor } = await deployVendorFixture(yourTokenAddress);

      await expect(vendor.buyTokens({ value: 0 })).to.be.revertedWithCustomError(vendor, "InvalidEthAmount");
    });

    it("Checkpoint2: can buy 10 tokens for 0.1 ETH (and emits BuyTokens)", async function () {
      const { user, yourToken, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor, vendorAddress } = await deployVendorFixture(yourTokenAddress);

      // 把全部供应量注入 Vendor，使其可以出售代币。
      await yourToken.transfer(vendorAddress, INITIAL_SUPPLY);

      const ethToSpend = ethers.parseEther("0.1");
      const expectedTokens = ethToSpend * TOKENS_PER_ETH; // 0.1 ETH * 100 = 10 个代币（18 位小数）

      const startingBalance = await yourToken.balanceOf(user.address);
      const tx = vendor.connect(user).buyTokens({ value: ethToSpend });

      await expect(tx).to.emit(vendor, "BuyTokens").withArgs(user.address, ethToSpend, expectedTokens);

      expect(await yourToken.balanceOf(user.address)).to.equal(startingBalance + expectedTokens);
    });

    it("Checkpoint2: reverts if Vendor does not have enough tokens (InsufficientVendorTokenBalance)", async function () {
      const { yourTokenAddress } = await deployYourTokenFixture();
      const { vendor } = await deployVendorFixture(yourTokenAddress);

      const ethToSpend = ethers.parseEther("1");
      const requiredTokens = ethToSpend * TOKENS_PER_ETH;
      await expect(vendor.buyTokens({ value: ethToSpend }))
        .to.be.revertedWithCustomError(vendor, "InsufficientVendorTokenBalance")
        .withArgs(0, requiredTokens);
    });
  });

  describe("Checkpoint3: 👑 Ownable + withdraw()", function () {
    it("Checkpoint3: deployer is the owner", async function () {
      const { deployer, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor } = await deployVendorFixture(yourTokenAddress);

      expect(await vendor.owner()).to.equal(deployer.address);
    });

    it("Checkpoint3: only owner can withdraw (non-owner is rejected)", async function () {
      const { user, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor } = await deployVendorFixture(yourTokenAddress);

      await expect(vendor.connect(user).withdraw()).to.be.revert(ethers);
    });

    it("Checkpoint3: withdraw sends all ETH in Vendor to the owner", async function () {
      const { deployer, user, yourToken, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor, vendorAddress } = await deployVendorFixture(yourTokenAddress);

      // 向 Vendor 注入代币，并通过购买代币为 Vendor 注入 ETH。
      await yourToken.transfer(vendorAddress, INITIAL_SUPPLY);
      await vendor.connect(user).buyTokens({ value: ethers.parseEther("0.1") });

      const vendorEthBefore = await ethers.provider.getBalance(vendorAddress);
      expect(vendorEthBefore).to.be.gt(0);

      const ownerEthBefore = await ethers.provider.getBalance(deployer.address);
      const withdrawTx = await vendor.withdraw();
      const receipt = await withdrawTx.wait();
      expect(receipt?.status).to.equal(1);

      const tx = await ethers.provider.getTransaction(withdrawTx.hash);
      if (!tx || !receipt) throw new Error("Cannot resolve withdraw tx/receipt");
      const gasPrice = (receipt as any).effectiveGasPrice ?? tx.gasPrice ?? 0n;
      const gasCost = (receipt.gasUsed ?? 0n) * gasPrice;

      const ownerEthAfter = await ethers.provider.getBalance(deployer.address);
      const vendorEthAfter = await ethers.provider.getBalance(vendorAddress);

      expect(vendorEthAfter).to.equal(0);
      expect(ownerEthAfter).to.equal(ownerEthBefore + vendorEthBefore - gasCost);
    });

    it("Checkpoint3: withdraw reverts with EthTransferFailed if the owner can't receive ETH", async function () {
      const { deployer, user, yourToken, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor, vendorAddress } = await deployVendorFixture(yourTokenAddress);

      // 向 Vendor 注入代币，并为 Vendor 注入 ETH。
      await yourToken.transfer(vendorAddress, INITIAL_SUPPLY);
      await vendor.connect(user).buyTokens({ value: ethers.parseEther("0.1") });

      // 让 Vendor 成为它自己的所有者。由于 Vendor 没有 receive()/payable fallback，
      // 向它发送 ETH 默认会回滚（revert），从而应当触发 EthTransferFailed。
      await vendor.connect(deployer).transferOwnership(vendorAddress);

      const vendorEthBefore = await ethers.provider.getBalance(vendorAddress);

      await networkHelpers.impersonateAccount(vendorAddress);
      try {
        const vendorAsOwner = await ethers.getSigner(vendorAddress);
        // 使用模拟调用（不会从 vendorAddress 支付 gas），否则交易的 gas 会
        // 从 vendorAddress 中扣除，导致 `address(this).balance` 小于 vendorEthBefore。
        await expect(vendor.connect(vendorAsOwner).withdraw.staticCall())
          .to.be.revertedWithCustomError(vendor, "EthTransferFailed")
          .withArgs(vendorAddress, vendorEthBefore);
      } finally {
        await networkHelpers.stopImpersonatingAccount(vendorAddress);
      }
    });
  });

  describe("Checkpoint4: 🤔 Vendor buyback (sellTokens + approve)", function () {
    it("Checkpoint4: sellTokens rejects amount == 0 (InvalidTokenAmount)", async function () {
      const { user, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor } = await deployVendorFixture(yourTokenAddress);

      await expect(vendor.connect(user).sellTokens(0)).to.be.revertedWithCustomError(vendor, "InvalidTokenAmount");
    });

    it("Checkpoint4: sellTokens reverts if Vendor lacks ETH liquidity (InsufficientVendorEthBalance)", async function () {
      const { user, yourToken, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor, vendorAddress } = await deployVendorFixture(yourTokenAddress);

      // 直接给用户发放代币，以便他们尝试卖回。
      await yourToken.transfer(user.address, ethers.parseEther("10"));
      await yourToken.connect(user).approve(vendorAddress, ethers.parseEther("10"));

      const amountToSell = ethers.parseEther("10"); // 10 个代币 -> 预期换回 0.1 ETH
      const expectedEth = amountToSell / TOKENS_PER_ETH;

      await expect(vendor.connect(user).sellTokens(amountToSell))
        .to.be.revertedWithCustomError(vendor, "InsufficientVendorEthBalance")
        .withArgs(0, expectedEth);
    });

    it("Checkpoint4: approve + sellTokens returns correct ETH (and emits SellTokens)", async function () {
      const { user, yourToken, yourTokenAddress } = await deployYourTokenFixture();
      const { vendor, vendorAddress } = await deployVendorFixture(yourTokenAddress);

      // 向 Vendor 注入代币，并先通过购买为 Vendor 注入 ETH。
      await yourToken.transfer(vendorAddress, INITIAL_SUPPLY);
      await vendor.connect(user).buyTokens({ value: ethers.parseEther("0.1") }); // 用户获得 10 个代币

      const amountToSell = ethers.parseEther("10");
      const expectedEth = amountToSell / TOKENS_PER_ETH; // 0.1 ETH

      await yourToken.connect(user).approve(vendorAddress, amountToSell);

      const userEthBefore = await ethers.provider.getBalance(user.address);
      const tx = await vendor.connect(user).sellTokens(amountToSell);

      await expect(tx).to.emit(vendor, "SellTokens").withArgs(user.address, amountToSell, expectedEth);

      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const userEthAfter = await ethers.provider.getBalance(user.address);
      // ethers v6 的交易回执提供 `gasPrice`（实际生效的 gas 价格）。某些工具链提供的是 `effectiveGasPrice`。
      const effectiveGasPrice = ((receipt as any)?.gasPrice ?? (receipt as any)?.effectiveGasPrice ?? 0n) as bigint;
      const gasCost = (receipt?.gasUsed ?? 0n) * effectiveGasPrice;

      // ETH 变化量 = +expectedEth - gas
      expect(userEthAfter).to.equal(userEthBefore + expectedEth - gasCost);
    });
  });
});
