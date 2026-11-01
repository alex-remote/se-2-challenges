import { artifacts, deployScript } from "../rocketh/deploy.js";
import { parseEther } from "viem";

/**
 * 使用部署者账户部署名为 "Vendor" 的合约。
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
  async env => {
    const { deployer } = env.namedAccounts;
    const yourToken = env.get<typeof artifacts.YourToken.abi>("YourToken");

    /**
     * 学生 TODO:
     * - 在这里填入你在前端使用的地址（保留 "" 则默认使用部署者地址）
     */
    const FRONTEND_ADDRESS = "";

    /**
     * 模式开关：
     * - 为 true 时：部署 Vendor，并把代币余额转入其中作为初始库存
     * - 为 false 时：把代币发送到你的前端地址（未设置时发送给部署者）
     */
    const SEND_TOKENS_TO_VENDOR = false; // 在 Checkpoint 2 之前不要切换！

    const recipientAddress =
      FRONTEND_ADDRESS && FRONTEND_ADDRESS.trim().length > 0 ? (FRONTEND_ADDRESS as `0x${string}`) : deployer;

    if (!SEND_TOKENS_TO_VENDOR) {
      // 把全部初始供应量发送到你在界面中使用的钱包（当部署者 != 界面钱包时很有用）。
      // 如果 FRONTEND_ADDRESS 为 ""，则默认为部署者（即不做任何转账）。
      if (recipientAddress !== deployer) {
        await env.execute(yourToken, {
          functionName: "transfer",
          args: [recipientAddress, parseEther("1000")],
          account: deployer,
        });
      }
      return;
    } else {
      // 部署 Vendor
      const vendor = await env.deploy("Vendor", {
        account: deployer,
        artifact: artifacts.Vendor,
        args: [yourToken.address],
      });

      // 把代币转给 Vendor（注入初始库存）
      await env.execute(yourToken, {
        functionName: "transfer",
        args: [vendor.address, parseEther("1000")],
        account: deployer,
      });

      // 将界面所用的钱包设为所有者（用于 withdraw() 等）。未设置时默认为部署者。
      await env.execute(vendor, {
        functionName: "transferOwnership",
        args: [recipientAddress],
        account: deployer,
      });
    }
  },
  // 当你有多个部署文件而只想运行其中一个时，标签（tags）非常有用。
  // 例如：yarn deploy --tags Vendor
  { tags: ["Vendor"] },
);
