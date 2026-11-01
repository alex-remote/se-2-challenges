import { artifacts, deployScript } from "../rocketh/deploy.js";

/**
 * 使用部署者账户部署名为 "YourToken" 的合约。
 *
 * 在 localhost 上，部署者账户是 Hardhat 自带的账户，已经预先注入了资金。
 *
 * 部署到线上网络（例如 `yarn deploy --network sepolia`）时，部署者账户
 * 需要有足够的余额来支付创建合约的 gas 费用。
 *
 * 你可以用 `yarn generate` 生成一个随机账户，该命令会把 DEPLOYER_PRIVATE_KEY_ENCRYPTED
 * 写入 .env 文件（供 hardhat.config.ts 使用）。
 * 运行 `yarn account` 可以查看部署者在各个网络上的余额。
 */
export default deployScript(
  async ({ deploy, namedAccounts }) => {
    const { deployer } = namedAccounts;

    await deploy("YourToken", {
      account: deployer,
      artifact: artifacts.YourToken,
      args: [],
    });
  },
  // 当你有多个部署文件而只想运行其中一个时，标签（tags）非常有用。
  // 例如：yarn deploy --tags YourToken
  { tags: ["YourToken"] },
);
