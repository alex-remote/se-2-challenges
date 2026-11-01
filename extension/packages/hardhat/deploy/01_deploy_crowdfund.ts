import { artifacts, deployScript } from "../rocketh/deploy.js";

/**
 * 使用 deployer 账户部署名为 "CrowdFund" 的合约。
 */
export default deployScript(
  async ({ deploy, get, namedAccounts }) => {
    const { deployer } = namedAccounts;

    const fundingRecipient = get("FundingRecipient");

    await deploy("CrowdFund", {
      account: deployer,
      artifact: artifacts.CrowdFund,
      args: [fundingRecipient.address],
    });
  },
  { tags: ["CrowdFund"] },
);
