import { artifacts, deployScript } from "../rocketh/deploy.js";
import { parseEther, formatEther } from "viem";

export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const diceGame = await env.deploy("DiceGame", {
      account: deployer,
      artifact: artifacts.DiceGame,
      args: [],
    });

    // env.deploy 会忽略 `value`；因此单独给合约注资（DiceGame 有 receive()）
    await env.tx({
      account: deployer,
      to: diceGame.address,
      value: parseEther("0.05"),
    });

    console.log("Deployed Dice Game Contract Address", diceGame.address);

    const balanceHex = (await env.network.provider.request({
      method: "eth_getBalance",
      params: [diceGame.address, "latest"],
    })) as `0x${string}`;
    console.log("Deployed Dice Game Contract Balance", formatEther(BigInt(balanceHex)));
  },
  { tags: ["DiceGame"] },
);
