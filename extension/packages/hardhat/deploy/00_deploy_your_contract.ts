import { artifacts, deployScript } from "../rocketh/deploy.js";
import { parseEther } from "viem";
import * as fs from "fs";

/**
 * 使用部署者账户部署名为 "PredictionMarket" 的合约。
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

    const question = "Will the green car win the race?";
    const initialLiquidity = parseEther("1");
    const initialTokenValue = parseEther("0.01");
    const initialProbability = 50;
    const percentageLocked = 10;
    const liquidityProvider = deployer;
    const oracle = deployer;

    const predictionMarket = await env.deploy("PredictionMarket", {
      account: deployer,
      artifact: artifacts.PredictionMarket,
      args: [liquidityProvider, oracle, question, initialTokenValue, initialProbability, percentageLocked],
      value: initialLiquidity,
    });

    console.log("PredictionMarket deployed to:", predictionMarket.address);

    // 获取已部署的 YES 和 NO 代币合约的地址与 ABI，并将它们复制到 deployments 目录
    try {
      const i_yesToken = (await env.read(predictionMarket, { functionName: "i_yesToken" })) as `0x${string}`;
      const i_noToken = (await env.read(predictionMarket, { functionName: "i_noToken" })) as `0x${string}`;
      const abi = artifacts.PredictionMarketToken.abi;
      const yesToken = { address: i_yesToken, abi };
      const noToken = { address: i_noToken, abi };

      const chainDir = `./deployments/${env.name}`;
      fs.writeFileSync(`${chainDir}/PredictionMarketTokenYes.json`, JSON.stringify(yesToken, null, 2));
      fs.writeFileSync(`${chainDir}/PredictionMarketTokenNo.json`, JSON.stringify(noToken, null, 2));
      console.log("Token JSON files written successfully");
    } catch (error) {
      console.error("Error handling token files:", error);
    }
  },
  // 当你有多个部署文件而只想运行其中一个时，标签（tags）非常有用。
  // 例如：yarn deploy --tags PredictionMarket
  { tags: ["PredictionMarket"] },
);
