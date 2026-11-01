"use client";

import { OORowProps } from "../types";
import { TimeLeft } from "./TimeLeft";
import { formatEther } from "viem";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useChallengeState } from "~~/services/store/challengeStore";

export const ProposedRow = ({ assertionId, state }: OORowProps) => {
  const { openAssertionModal } = useChallengeState();
  const { data: assertionData } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  if (!assertionData) return null;

  return (
    <tr
      key={assertionId}
      className={`group border-b border-base-300 cursor-pointer`}
      onClick={() => {
        openAssertionModal({ ...assertionData, assertionId, state });
      }}
    >
      {/* 问题列 */}
      <td>
        <div className="group-hover:text-error">{assertionData?.description}</div>
      </td>

      {/* 保证金列 */}
      <td>{formatEther(assertionData?.bond)} ETH</td>

      {/* 提议列 */}
      <td>{assertionData?.proposedOutcome ? "True" : "False"}</td>

      {/* 挑战期列 */}
      <td>
        <TimeLeft startTime={assertionData?.startTime} endTime={assertionData?.endTime} />
      </td>

      {/* 箭头图标列 */}
      <td>
        <div className="w-6 h-6 border-error border flex items-center justify-center hover:bg-base-200 group-hover:bg-error transition-colors mx-auto">
          <ChevronRightIcon className="w-4 h-4 text-error group-hover:text-white stroke-2 transition-colors" />
        </div>
      </td>
    </tr>
  );
};
