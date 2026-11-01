import { parseEther } from "viem";

export function multiplyTo1e18(tokens: string | bigint) {
  try {
    return parseEther(tokens.toString());
  } catch (err) {
    // 代币数量格式错误
    return 0n;
  }
}

export function getTokenPrice(tokens: string | bigint, tokensPerEth?: bigint) {
  const tokensMultiplied = multiplyTo1e18(tokens);

  return tokensPerEth ? tokensMultiplied / tokensPerEth : tokensMultiplied;
}
