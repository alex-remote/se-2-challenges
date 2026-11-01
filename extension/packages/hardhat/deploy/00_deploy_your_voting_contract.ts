import { artifacts, deployScript } from "../rocketh/deploy.js";

/**
 * 使用部署者账户部署名为 "Voting" 的合约。
 *
 * 在 localhost 上，部署者账户是 Hardhat 自带的账户，已经预先注入了资金。
 *
 * 部署到线上网络（例如 `yarn deploy --network sepolia`）时，部署者账户
 * 需要有足够的余额来支付创建合约的 gas 费用。
 *
 * 你可以用 `yarn generate` 生成一个随机账户，或用 `yarn account:import` 导入你
 * 已有的私钥，这会填写 .env 文件中的 DEPLOYER_PRIVATE_KEY_ENCRYPTED（供 hardhat.config.ts 使用）。
 * 运行 `yarn account` 可以查看部署者在各个网络上的余额。
 */
export default deployScript(
  async ({ deploy, namedAccounts }) => {
    const { deployer } = namedAccounts;

    const ownerAddress = "0x0000000000000000000000000000000000000001";

    /// checkpoint 6 //////
    const verifierAddress = "0x0000000000000000000000000000000000000002"; // 占位值
    // const verifier = await deploy("HonkVerifier", {
    //   account: deployer,
    //   artifact: artifacts.HonkVerifier,
    //   args: [],
    // });

    /// checkpoint 2 //////
    const leanIMTAddress = "0x0000000000000000000000000000000000000003"; // 占位值
    // const poseidon3 = await deploy("PoseidonT3", {
    //   account: deployer,
    //   artifact: artifacts.PoseidonT3,
    //   args: [],
    // });

    // const leanIMT = await deploy(
    //   "LeanIMT",
    //   {
    //     account: deployer,
    //     artifact: artifacts.LeanIMT,
    //     args: [],
    //   },
    //   {
    //     libraries: {
    //       PoseidonT3: poseidon3.address,
    //     },
    //   },
    // );

    await deploy(
      "Voting",
      {
        account: deployer,
        artifact: artifacts.Voting,
        args: [ownerAddress, verifierAddress, "Should we build zk apps?"],
      },
      {
        libraries: {
          LeanIMT: leanIMTAddress,
        },
      },
    );
  },
  // 当你有多个部署文件而只想运行其中一个时，标签（tags）非常有用。
  // 例如：yarn deploy --tags YourVotingContract
  { tags: ["YourVotingContract"] },
);
