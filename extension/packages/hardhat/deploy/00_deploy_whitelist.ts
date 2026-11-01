import { artifacts, deployScript } from "../rocketh/deploy.js";
import { fetchPriceFromUniswap } from "../scripts/fetchPriceFromUniswap.js";

/**
 * 部署 WhitelistOracle 合约，并通过它创建 SimpleOracle 实例。
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    console.log("Deploying WhitelistOracle contract...");
    const whitelistOracle = await env.deploy("WhitelistOracle", {
      account: deployer,
      artifact: artifacts.WhitelistOracle,
      args: [],
    });

    // 如果是在真实网络上，则跳过其余的设置步骤
    if (env.name === "default" || env.name === "localhost") {
      // 使用 hardhat 节点自带的账户作为预言机所有者：deployer + 前 9 个未命名账户。
      const nodeOwners = [deployer, ...env.unnamedAccounts.slice(0, 9)] as `0x${string}`[];

      console.log("Creating SimpleOracle instances through WhitelistOracle...");
      for (let i = 0; i < nodeOwners.length; i++) {
        console.log(`Creating SimpleOracle ${i + 1}/${nodeOwners.length} with owner: ${nodeOwners[i]}`);
        await env.execute(whitelistOracle, {
          functionName: "addOracle",
          args: [nodeOwners[i]],
          account: deployer,
        });
      }

      // WhitelistOracle 会把每个创建的 SimpleOracle 追加到它的 `oracles` 数组中，因此 oracles(i) 就是
      // nodeOwners[i] 所拥有的那个实例。
      const createdOracleAddresses: `0x${string}`[] = [];
      for (let i = 0; i < nodeOwners.length; i++) {
        const oracleAddress = (await env.read(whitelistOracle, {
          functionName: "oracles",
          args: [BigInt(i)],
        })) as `0x${string}`;
        createdOracleAddresses.push(oracleAddress);
        console.log(`✅ Created SimpleOracle at: ${oracleAddress}`);
      }

      // 为每个创建的 SimpleOracle 设置初始价格。这些实例是在运行时通过 addOracle 创建的
      // （而不是通过 rocketh 部署的），所以要用 { address, abi } 来指定它们，而不是用
      // 部署对象。每个所有者在自己的预言机上设置价格。
      console.log("Setting initial prices for each SimpleOracle...");
      const initialPrice = await fetchPriceFromUniswap();
      const simpleOracleAbi = artifacts.SimpleOracle.abi;
      for (let i = 0; i < createdOracleAddresses.length; i++) {
        await env.execute(
          { address: createdOracleAddresses[i], abi: simpleOracleAbi },
          { functionName: "setPrice", args: [initialPrice], account: nodeOwners[i] },
        );
        console.log(`Set price for SimpleOracle ${i + 1} to: ${initialPrice}`);
      }

      // 计算初始中位数价格
      console.log("Calculating initial median price...");
      const medianPrice = await env.read(whitelistOracle, { functionName: "getPrice", args: [] });
      console.log(`Initial median price: ${medianPrice.toString()}`);
    }
    console.log("WhitelistOracle contract deployed and configured successfully!");
  },
  { tags: ["Oracles"] },
);
