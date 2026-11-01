import { artifacts, deployScript } from "../rocketh/deploy.js";
import { parseEther } from "viem";

/**
 * 使用部署者账户部署 "Corn"、"CornDEX"、"Lending" 和 "MovePrice"。
 *
 * 在 localhost 上，部署者账户是 Hardhat 自带的账户，已经预先充值了资金。
 *
 * 部署到真实网络时（例如 `yarn deploy --network sepolia`），部署者账户
 * 应有足够的余额来支付创建合约的 gas 费用。
 *
 * 你可以用 `yarn generate` 生成一个随机账户，或用 `yarn account:import` 导入你
 * 已有的私钥（PK），这会填充 .env 文件中的 DEPLOYER_PRIVATE_KEY_ENCRYPTED（在 hardhat.config.ts 中使用）。
 * 运行 `yarn account` 查看部署者在各个网络上的余额。
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const cornToken = await env.deploy("Corn", {
      account: deployer,
      artifact: artifacts.Corn,
      args: [],
    });

    const cornDEX = await env.deploy("CornDEX", {
      account: deployer,
      artifact: artifacts.CornDEX,
      args: [cornToken.address],
    });

    const lending = await env.deploy("Lending", {
      account: deployer,
      artifact: artifacts.Lending,
      args: [cornDEX.address, cornToken.address],
    });

    // 设置 MovePrice（推动价格）合约
    const movePrice = await env.deploy("MovePrice", {
      account: deployer,
      artifact: artifacts.MovePrice,
      args: [cornDEX.address, cornToken.address],
    });

    // 仅在本地网络上设置合约状态
    if (env.name === "default" || env.name === "localhost") {
      // 给 MovePrice 合约发放 ETH 和 CORN
      await env.network.provider.request<{ params: [`0x${string}`, `0x${string}`]; result: null }>({
        method: "hardhat_setBalance",
        params: [movePrice.address, `0x${parseEther("10000000000000000000000").toString(16)}`],
      });
      await env.execute(cornToken, {
        functionName: "mintTo",
        args: [movePrice.address, parseEther("10000000000000000000000")],
        account: deployer,
      });
      // 出借人向 Lending 合约存入 CORN
      await env.execute(cornToken, {
        functionName: "mintTo",
        args: [lending.address, parseEther("10000000000000000000000")],
        account: deployer,
      });
      // 给部署者发放 CORN 和 ETH
      await env.execute(cornToken, {
        functionName: "mintTo",
        args: [deployer, parseEther("1000000000000")],
        account: deployer,
      });
      await env.network.provider.request<{ params: [`0x${string}`, `0x${string}`]; result: null }>({
        method: "hardhat_setBalance",
        params: [deployer, `0x${parseEther("100000000000").toString(16)}`],
      });

      await env.execute(cornToken, {
        functionName: "approve",
        args: [cornDEX.address, parseEther("1000000000")],
        account: deployer,
      });
      await env.execute(cornDEX, {
        functionName: "init",
        args: [parseEther("1000000000")],
        value: parseEther("1000000"),
        account: deployer,
      });
    }
  },
  { tags: ["Lending"] },
);
