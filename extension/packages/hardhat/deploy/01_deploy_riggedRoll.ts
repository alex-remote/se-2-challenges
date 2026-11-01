import { artifacts, deployScript } from "../rocketh/deploy.js";

export default deployScript(
  async env => {
    const diceGame = env.get("DiceGame");
    const diceGameAddress = diceGame.address;

    // 取消注释以部署 RiggedRoll 合约
    // const riggedRoll = await env.deploy("RiggedRoll", {
    //   account: env.namedAccounts.deployer,
    //   artifact: artifacts.RiggedRoll,
    //   args: [diceGameAddress],
    // });

    // 请把文本 "Your Address" 替换为你自己的地址。
    // try {
    //   await env.execute(riggedRoll, {
    //     functionName: "transferOwnership",
    //     args: ["Your Address"],
    //     account: env.namedAccounts.deployer,
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
    void diceGameAddress;
    void artifacts;
  },
  { tags: ["RiggedRoll"] },
);
