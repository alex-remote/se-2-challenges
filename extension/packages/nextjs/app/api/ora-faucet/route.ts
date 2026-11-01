import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

const oraTokenAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const stakingOracleAbi = [
  {
    type: "function",
    name: "oracleToken",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const DEPLOYER_PRIVATE_KEY =
  (process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined) ??
  // Hardhat 默认账户 #0 的私钥（仅限 localhost）。
  ("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const);

function isAddress(value: unknown): value is `0x${string}` {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const to = body?.to;
    const amount = body?.amount ?? "2000";

    if (!isAddress(to)) {
      return NextResponse.json({ error: "Invalid `to` address" }, { status: 400 });
    }
    if (typeof amount !== "string" || !/^\d+(\.\d+)?$/.test(amount)) {
      return NextResponse.json({ error: "Invalid `amount`" }, { status: 400 });
    }

    // 安全起见：此水龙头仅供本地 Hardhat 使用。
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "ORA faucet disabled in production" }, { status: 403 });
    }

    const publicClient = createPublicClient({ chain: hardhat, transport: http() });
    const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
    const walletClient = createWalletClient({ chain: hardhat, transport: http(), account });

    const stakingOracleAddress = (deployedContracts as any)?.[hardhat.id]?.StakingOracle?.address as
      | `0x${string}`
      | undefined;
    if (!stakingOracleAddress) {
      return NextResponse.json({ error: "StakingOracle not deployed on this network" }, { status: 500 });
    }

    const oraTokenAddress = (await publicClient.readContract({
      address: stakingOracleAddress,
      abi: stakingOracleAbi,
      functionName: "oracleToken",
    })) as `0x${string}`;

    const hash = await walletClient.writeContract({
      address: oraTokenAddress,
      abi: oraTokenAbi,
      functionName: "transfer",
      args: [to, parseEther(amount)],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error("Error funding ORA:", error);
    return NextResponse.json({ error: "Failed to fund ORA" }, { status: 500 });
  }
}
