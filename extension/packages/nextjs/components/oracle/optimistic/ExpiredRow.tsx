import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import { formatEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const ExpiredRow = ({ assertionId }: { assertionId: number }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: assertionData } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "getAssertion",
    args: [BigInt(assertionId)],
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "OptimisticOracle",
  });

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await writeContractAsync({
        functionName: "claimRefund",
        args: [BigInt(assertionId)],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!assertionData) return null;

  return (
    <tr key={assertionId} className={`border-b border-base-300`}>
      {/* 描述列 */}
      <td>{assertionData.description}</td>

      {/* 断言者列 */}
      <td>
        <Address address={assertionData.asserter} format="short" onlyEnsOrAddress disableAddressLink size="sm" />
      </td>

      {/* 奖励列 */}
      <td>{formatEther(assertionData.reward)} ETH</td>

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
