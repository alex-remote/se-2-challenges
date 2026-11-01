import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { usePublicClient, useWalletClient } from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const AddOracleButton = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { writeContractAsync: writeWhitelistOracle } = useScaffoldWriteContract({ contractName: "WhitelistOracle" });

  const handleAddOracle = async () => {
    if (!walletClient || !publicClient) {
      notification.error("Please connect wallet and enter both oracle owner address and initial price");
      return;
    }

    try {
      // 生成一个新的预言机地址
      const privateKey = generatePrivateKey();
      const oracleAddress = privateKeyToAccount(privateKey).address;

      // 把预言机添加到白名单
      await writeWhitelistOracle({
        functionName: "addOracle",
        args: [oracleAddress],
      });
    } catch (error: any) {
      console.log("Error adding oracle:", error);
    }
  };

  return (
    <button className="btn btn-primary h-full btn-sm font-normal gap-1" onClick={handleAddOracle}>
      <PlusIcon className="h-4 w-4" />
      <span>Add Oracle Node</span>
    </button>
  );
};
