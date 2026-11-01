import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "..", "hardhat", "scripts", "oracle-bot", "config.json");

export type ConfigKey = "PROBABILITY_OF_SKIPPING_REPORT" | "PRICE_VARIANCE";

export async function updateConfigValue(key: ConfigKey, value: number, nodeAddress?: string): Promise<void> {
  try {
    // 读取当前配置
    const configContent = await fs.promises.readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(configContent);

    // 校验取值
    if (typeof value !== "number" || value < 0) {
      throw new Error("Value must be a non-negative number");
    }

    if (key === "PROBABILITY_OF_SKIPPING_REPORT" && value > 1) {
      throw new Error("Skip probability must be between 0 and 1");
    }

    if (nodeAddress) {
      // 更新该节点专属的配置
      if (!config.NODE_CONFIGS[nodeAddress]) {
        config.NODE_CONFIGS[nodeAddress] = { ...config.NODE_CONFIGS.default };
      }
      config.NODE_CONFIGS[nodeAddress][key] = value;
    } else {
      // 更新默认配置
      config.NODE_CONFIGS.default[key] = value;
    }

    // 以规范的格式写回文件
    await fs.promises.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error updating config:", error);
    throw error;
  }
}
