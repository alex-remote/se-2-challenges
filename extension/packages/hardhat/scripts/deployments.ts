import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

// 返回一个读取函数：根据给定网络的部署 JSON，
// 解析出已部署合约的地址。
export function createDeploymentReader(networkName: string) {
  const deploymentsDir = path.join(scriptsDir, "..", "deployments", networkName);
  return (name: string): string => {
    const filePath = path.join(deploymentsDir, `${name}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf8")).address;
  };
}
