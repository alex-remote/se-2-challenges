"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

/**
 * 按钮组件：在控制台打印所有与 zk-voting 相关的 localStorage 数据
 * 包括当前应用的证明数据、承诺数据和 burner wallet（临时钱包）数据
 */
export const LogStorageButton = () => {
  const [isLogging, setIsLogging] = useState(false);
  const { address: userAddress } = useAccount();
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "Voting" });

  const logAllVotingStorage = () => {
    setIsLogging(true);

    try {
      const contractAddress = contractInfo?.address?.toLowerCase();
      const walletAddress = userAddress?.toLowerCase();

      if (!contractAddress || !walletAddress) {
        console.log(
          "ZK-VOTING: Connect a wallet and ensure the Voting contract is loaded to log scoped storage (contract + user).",
        );
        return;
      }

      // 关注的键：承诺和证明
      const commitmentKey = `zk-voting-commitment-data-${contractAddress}-${walletAddress}`;
      const proofKey = `zk-voting-proof-data-${contractAddress}-${walletAddress}`;

      console.log("=== ZK-VOTING ===");
      console.log(`Contract: ${contractAddress}`);
      console.log(`User:     ${walletAddress}`);

      // 承诺详情
      const commitmentRaw = localStorage.getItem(commitmentKey);
      if (commitmentRaw) {
        try {
          const commitment = JSON.parse(commitmentRaw);
          console.log("\nCommitment:");
          console.log(`  commitment: ${commitment.commitment}`);
          console.log(`  nullifier:  ${commitment.nullifier}`);
          console.log(`  secret:     ${commitment.secret}`);
        } catch {
          console.log("\nCommitment: (failed to parse)");
        }
      } else {
        console.log("\nCommitment: not found for this contract + user");
      }

      // 证明详情（打印完整数组）
      const proofRaw = localStorage.getItem(proofKey);
      if (proofRaw) {
        try {
          const proofData = JSON.parse(proofRaw);
          const proofArray = Array.isArray(proofData.proof) ? proofData.proof : [];
          console.log("\nProof (full array):", proofArray);
        } catch {
          console.log("\nProof: (failed to parse)");
        }
      } else {
        console.log("\nProof: not found for this contract + user");
      }

      console.log("\n=== END ZK-VOTING ===");
    } catch (error) {
      console.error("Failed to log zk-voting storage:", error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <button
      onClick={logAllVotingStorage}
      disabled={isLogging || !userAddress || !contractInfo?.address}
      className={`
        btn btn-sm btn-info gap-2 text-white dark:text-black
        ${isLogging ? "loading" : ""}
      `}
    >
      {isLogging ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          Logging...
        </>
      ) : (
        <>
          <DocumentTextIcon className="h-4 w-4" />
          Log Commitment & Proof
        </>
      )}
    </button>
  );
};
