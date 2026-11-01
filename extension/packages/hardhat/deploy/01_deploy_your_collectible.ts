import { artifacts, deployScript } from "../rocketh/deploy.js";

/**
 * 部署一个名为 "YourCollectible" 的合约。
 *
 * 在 localhost 上，部署者账户是 Hardhat 自带的账户，已经预先充值了资金。
 *
 * 部署到线上网络（例如 `yarn deploy --network sepolia`）时，部署者账户
 * 应有足够的余额来支付创建合约所需的 gas 费用。
 *
 * 你可以用 `yarn generate` 生成一个随机账户，它会把 DEPLOYER_PRIVATE_KEY_ENCRYPTED 填入
 * .env 文件（供 hardhat.config.ts 使用）。
 * 运行 `yarn account` 可查看部署者账户在各个网络上的余额。
 */
export default deployScript(
  async ({ deploy, namedAccounts }) => {
    const { deployer } = namedAccounts;

    await deploy("YourCollectible", {
      account: deployer,
      artifact: artifacts.YourCollectible,
      args: [],
    });
  },
  // 如果你有多个部署文件而只想运行其中一个，标签（tags）会很有用。
  // 例如：yarn deploy --tags YourCollectible
  { tags: ["YourCollectible"] },
);
