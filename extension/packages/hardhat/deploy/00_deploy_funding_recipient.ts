import { artifacts, deployScript } from "../rocketh/deploy.js";

/**
 * 使用 deployer 账户部署名为 "FundingRecipient" 的合约。
 */
export default deployScript(
  async ({ deploy, namedAccounts }) => {
    const { deployer } = namedAccounts;

    await deploy("FundingRecipient", {
      account: deployer,
      artifact: artifacts.FundingRecipient,
      args: [],
    });
  },
  { tags: ["FundingRecipient"] },
);
