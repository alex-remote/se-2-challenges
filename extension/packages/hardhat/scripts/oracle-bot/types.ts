interface NodeConfig {
  PROBABILITY_OF_SKIPPING_REPORT: number;
  PRICE_VARIANCE: number; // 数值越大，价格波动范围越宽
}

export interface Config {
  PRICE: {
    CACHEDPRICE: number;
    TIMESTAMP: number;
  };
  INTERVALS: {
    PRICE_REPORT: number;
    VALIDATION: number;
  };
  NODE_CONFIGS: {
    [key: string]: NodeConfig;
    default: NodeConfig;
  };
}
