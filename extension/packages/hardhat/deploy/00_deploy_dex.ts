import { parseEther } from "viem";
import { artifacts, deployScript } from "../rocketh/deploy.js";

/**
 * 部署 "Balloons" 和 "DEX"。
 *
 * 在 localhost 上，部署者账户是 Hardhat 自带的账户，已经预先充值。
 *
 * 部署到线上网络时（例如 `yarn deploy --network sepolia`），部署者账户
 * 需要有足够的余额来支付创建合约所需的 gas 费用。
 *
 * 你可以用 `yarn generate` 生成一个随机账户，它会把 DEPLOYER_PRIVATE_KEY_ENCRYPTED 填入
 * .env 文件（供 hardhat.config.ts 使用）。
 * 运行 `yarn account` 可以查看部署者在各个网络上的余额。
 */
export default deployScript(
  async ({ deploy, execute, namedAccounts }) => {
    const { deployer } = namedAccounts;

    const balloons = await deploy("Balloons", {
      account: deployer,
      artifact: artifacts.Balloons,
      args: [],
    });

    const dex = await deploy("DEX", {
      account: deployer,
      artifact: artifacts.DEX,
      args: [balloons.address],
    });

    // // CHECKPOINT 2: 替换为你的前端地址，部署时即可获得 10 个气球。
    // // 默认是 Hardhat 测试账户 #1——在本地开箱即用。
    // const frontendAddress = "YOUR_FRONTEND_ADDRESS";
    // await execute(balloons, { functionName: "transfer", args: [frontendAddress, parseEther("10")], account: deployer });

    // // CHECKPOINT 3: 取消注释即可在部署时初始化 DEX：
    // console.log("Approving DEX (" + dex.address + ") to take Balloons from main account...");
    // await execute(balloons, { functionName: "approve", args: [dex.address, parseEther("100")], account: deployer });
    // console.log("INIT exchange...");
    // await execute(dex, { functionName: "init", args: [parseEther("5")], value: parseEther("5"), account: deployer });
  },
  // 如果你有多个部署文件、但只想运行其中一个，tags 会很有用。
  // 例如 yarn deploy --tags DEX
  { tags: ["Balloons", "DEX"] },
);
