import { artifacts, deployScript } from "../rocketh/deploy.js";
import { parseEther, getContractAddress } from "viem";
import { fetchPriceFromUniswap } from "../scripts/fetchPriceFromUniswap.js";

/**
 * 使用部署者账户部署 "RateController"、"MyUSD"、"DEX"、"Oracle"、"MyUSDStaking" 和 "MyUSDEngine"。
 *
 * 在 localhost 上，部署者账户是 Hardhat 自带的账户，已经预先充值。
 *
 * 部署到真实网络时（例如 `yarn deploy --network sepolia`），部署者账户
 * 需要有足够的余额来支付创建合约的 gas 费用。
 *
 * 你可以用 `yarn generate` 生成一个随机账户，或用 `yarn account:import` 导入你
 * 现有的私钥，它会写入 .env 文件中的 DEPLOYER_PRIVATE_KEY_ENCRYPTED（在 hardhat.config.ts 中使用）。
 * 运行 `yarn account` 查看部署者在各个网络上的余额。
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const ethPrice = await fetchPriceFromUniswap();

    // 填入部署完成后你希望成为合约所有者的账户
    const CONTRACT_OWNER = deployer; // 如果你想用部署者以外的账户来更新利率，请修改这里

    // 获取部署者当前的 nonce
    const nonceHex = (await env.network.provider.request({
      method: "eth_getTransactionCount",
      params: [deployer, "pending"],
    })) as `0x${string}`;
    const deployerNonce = Number(BigInt(nonceHex));

    // 根据 nonce 计算合约未来的地址
    const futureStakingAddress = getContractAddress({
      from: deployer,
      nonce: BigInt(deployerNonce + 4), // +4，因为它将是我们的第五次部署（在 MyUSD、DEX、Oracle、RateController 之后）
    });

    const futureEngineAddress = getContractAddress({
      from: deployer,
      nonce: BigInt(deployerNonce + 5), // +5，因为它将是我们的第六次部署（在 MyUSD、DEX、Oracle、Staking、RateController 之后）
    });

    const rateController = await env.deploy("RateController", {
      account: deployer,
      artifact: artifacts.RateController,
      args: [futureEngineAddress, futureStakingAddress],
    });

    const stablecoin = await env.deploy("MyUSD", {
      account: deployer,
      artifact: artifacts.MyUSD,
      args: [futureEngineAddress, futureStakingAddress],
    });

    const DEX = await env.deploy("DEX", {
      account: deployer,
      artifact: artifacts.DEX,
      args: [stablecoin.address],
    });

    const oracle = await env.deploy("Oracle", {
      account: deployer,
      artifact: artifacts.Oracle,
      args: [DEX.address, ethPrice],
    });

    const staking = await env.deploy("MyUSDStaking", {
      account: deployer,
      artifact: artifacts.MyUSDStaking,
      args: [stablecoin.address, futureEngineAddress, rateController.address],
    });

    // 最后在预测的地址上部署引擎
    const engine = await env.deploy("MyUSDEngine", {
      account: deployer,
      artifact: artifacts.MyUSDEngine,
      args: [oracle.address, stablecoin.address, staking.address, rateController.address],
    });

    if (engine.address.toLowerCase() !== futureEngineAddress.toLowerCase()) {
      throw new Error(
        "Engine address does not match predicted address, did you add transactions above this line that would skew the nonce set for 'futureEngineAddress'?",
      );
    }

    if (env.name === "default" || env.name === "localhost") {
      // 设置部署者的 ETH 余额
      // hardhat_setBalance 不在 provider 的 RPC 类型定义（schema）中，因此我们
      // 为这一次调用覆盖该 schema，以便为参数指定类型。
      await env.network.provider.request<{ params: [string, string]; result: null }>({
        method: "hardhat_setBalance",
        params: [deployer, `0x${parseEther("100000000000000000000").toString(16)}`],
      });

      // 部署者将向 DEX 提供流动性，以便我们可以兑换代币
      // 部署者会先借入稳定币，然后再向 DEX 提供流动性
      // 我们会让部署者账户存入大量抵押品，使其几乎不会面临清算风险
      const ethCollateralAmount = parseEther("10000000000000000000");
      // 设置稳定币的初始价格（由 DEX 流动性决定）
      const ethDEXAmount = parseEther("10000000");
      const myUSDAmount = ethPrice * 10000000n;

      // 借入稳定币
      await env.execute(engine, {
        functionName: "addCollateral",
        args: [],
        value: ethCollateralAmount,
        account: deployer,
      });
      await env.execute(engine, {
        functionName: "mintMyUSD",
        args: [myUSDAmount],
        account: deployer,
      });

      const confirmedBalance = (await env.read(stablecoin, {
        functionName: "balanceOf",
        args: [deployer],
      })) as bigint;
      // 如果部署者账户没有这些稳定币，就不向 DEX 添加流动性
      if (confirmedBalance === myUSDAmount) {
        // 授权 DEX 使用代币并初始化 DEX
        await env.execute(stablecoin, {
          functionName: "approve",
          args: [DEX.address, myUSDAmount],
          account: deployer,
        });
        await env.execute(DEX, {
          functionName: "init",
          args: [myUSDAmount],
          value: ethDEXAmount,
          account: deployer,
        });
      }

      // 设置引擎合约和质押合约的所有者
      if (CONTRACT_OWNER !== deployer) {
        await env.execute(engine, {
          functionName: "transferOwnership",
          args: [CONTRACT_OWNER],
          account: deployer,
        });
        await env.execute(staking, {
          functionName: "transferOwnership",
          args: [CONTRACT_OWNER],
          account: deployer,
        });
      }
    }
  },
  { tags: ["MyUSDEngine"] },
);
