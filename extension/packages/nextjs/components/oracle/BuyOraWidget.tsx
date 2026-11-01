"use client";

import { useMemo, useState } from "react";
import { erc20Abi, formatEther, parseEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const ETH_IN = "0.5";
const ORA_OUT = "100";

export const BuyOraWidget = () => {
  const { address: connectedAddress } = useAccount();
  const [isBuying, setIsBuying] = useState(false);

  // NOTE: `deployedContracts.ts` 是根据部署结果自动生成的。如果其中还没有 ORA，
  // 该 hook 会一直显示 "Target Contract is not deployed" 提示，直到你运行 `yarn deploy`。
  // 这样在部署 / ABI 尚未同步时，TS 仍能正常编译。
  const { writeContractAsync: writeOraUnsafe } = useScaffoldWriteContract({ contractName: "ORA" as any });
  const writeOra = writeOraUnsafe as any;

  // 通过 StakingOracle 中配置的代币地址读取 ORA 余额
  const { data: oracleTokenAddress } = useScaffoldReadContract({
    contractName: "StakingOracle",
    functionName: "oracleToken",
  });

  const { data: oraBalance, refetch: refetchOraBalance } = useReadContract({
    address: oracleTokenAddress as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress] : undefined,
    query: { enabled: !!oracleTokenAddress && !!connectedAddress, refetchInterval: 5000 },
  });

  const oraBalanceFormatted = useMemo(() => {
    if (oraBalance === undefined) return "—";
    return Number(formatEther(oraBalance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }, [oraBalance]);

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      await writeOra({
        functionName: "buy",
        value: parseEther(ETH_IN),
      });
      // 确保交易确认后组件立即刷新（而不是等待轮询）。
      await refetchOraBalance();
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="bg-base-100 p-4 border border-base-300 shadow-sm w-full md:w-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Buy ORA</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="font-mono">{ETH_IN} ETH</span> → <span className="font-mono">{ORA_OUT} ORA</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Your ORA balance: <span className="font-mono">{oraBalanceFormatted}</span>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleBuy} disabled={!connectedAddress || isBuying}>
          {isBuying ? "Buying..." : "Buy ORA"}
        </button>
      </div>
    </div>
  );
};
