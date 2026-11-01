import { artifacts, deployScript } from "../rocketh/deploy.js";
import { getContractAddress } from "viem";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    console.log("Deploying OptimisticOracle...");
    // 获取 deployer 当前的 nonce
    const nonceHex = (await env.network.provider.request({
      method: "eth_getTransactionCount",
      params: [deployer, "pending"],
    })) as `0x${string}`;
    const deployerNonce = Number(BigInt(nonceHex));

    const futureDeciderAddress = getContractAddress({
      from: deployer,
      nonce: BigInt(deployerNonce + 1), // +1 是因为这将是我们的第二次部署
    });

    // 部署 OptimisticOracle 合约，并以 deployer 作为临时裁决者
    const optimisticOracle = await env.deploy("OptimisticOracle", {
      account: deployer,
      artifact: artifacts.OptimisticOracle,
      args: [futureDeciderAddress],
    });

    // 部署 Decider 合约
    const decider = await env.deploy("Decider", {
      account: deployer,
      artifact: artifacts.Decider,
      args: [optimisticOracle.address],
    });

    // 检查裁决者地址是否与预期地址一致
    if (decider.address.toLowerCase() !== futureDeciderAddress.toLowerCase()) {
      throw new Error("Decider address does not match expected address");
    }

    console.log("OptimisticOracle deployed to:", optimisticOracle.address);
    console.log("Decider deployed to:", decider.address);
  },
  { tags: ["OptimisticOracle"] },
);
