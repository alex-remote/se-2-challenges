import { Address } from "@scaffold-ui/components";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useChallengeState } from "~~/services/store/challengeStore";

export const DisputedRow = ({ assertionId, state }: { assertionId: number; state: number }) => {
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
      onClick={() => {
        openAssertionModal({ ...assertionData, assertionId, state });
      }}
      className={`group border-b border-base-300 cursor-pointer`}
    >
      {/* 描述列 */}
      <td>
        <div className="group-hover:text-error">{assertionData.description}</div>
      </td>

      {/* 提议者列 */}
      <td>
        <Address address={assertionData.proposer} format="short" onlyEnsOrAddress disableAddressLink size="sm" />
      </td>

      {/* 争议者列 */}
      <td>
        <Address address={assertionData.disputer} format="short" onlyEnsOrAddress disableAddressLink size="sm" />
      </td>

      {/* 箭头图标列 */}
      <td className="">
        <div className="w-6 h-6 border-error border flex items-center justify-center hover:bg-base-200 group-hover:bg-error transition-colors mx-auto">
          <ChevronRightIcon className="w-4 h-4 text-error group-hover:text-white stroke-2 transition-colors" />
        </div>
      </td>
    </tr>
  );
};
