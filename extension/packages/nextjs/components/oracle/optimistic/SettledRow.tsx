"use client";

import { useState } from "react";
import { SettledRowProps } from "../types";
import { LoadingRow } from "./LoadingRow";
import { Address } from "@scaffold-ui/components";
import { formatEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ZERO_ADDRESS } from "~~/utils/scaffold-eth/common";

export const SettledRow = ({ assertionId }: SettledRowProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { data: assertionData, isLoading } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "OptimisticOracle",
  });

  if (isLoading) return <LoadingRow />;
  if (!assertionData) return null;

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      const functionName = assertionData?.winner === ZERO_ADDRESS ? "claimUndisputedReward" : "claimDisputedReward";
      await writeContractAsync({
        functionName,
        args: [BigInt(assertionId)],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  const winner = assertionData?.winner === ZERO_ADDRESS ? assertionData?.proposer : assertionData?.winner;
  const outcome =
    assertionData?.winner === ZERO_ADDRESS ? assertionData?.proposedOutcome : assertionData?.resolvedOutcome;

  return (
    <tr key={assertionId} className={`border-b border-base-300`}>
      {/* 问题列 */}
      <td>{assertionData?.description}</td>

      {/* 答案列 */}
      <td>{outcome ? "True" : "False"}</td>

      {/* 胜方列 */}
      <td>
        <Address address={winner} format="short" onlyEnsOrAddress disableAddressLink size="sm" />
      </td>

      {/* 奖励列 */}
      <td>{formatEther(assertionData?.reward)} ETH</td>

      {/* 已领取列 */}
      <td>
        {assertionData?.claimed ? (
          <button className="btn btn-primary btn-xs" disabled>
            Claimed
          </button>
        ) : (
          <button className="btn btn-primary btn-xs" onClick={handleClaim} disabled={isClaiming}>
            Claim
          </button>
        )}
      </td>
    </tr>
  );
};
