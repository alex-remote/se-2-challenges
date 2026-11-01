"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useReadContracts } from "wagmi";
import { AssertedTable } from "~~/components/oracle/optimistic/AssertedTable";
import { AssertionModal } from "~~/components/oracle/optimistic/AssertionModal";
import { DisputedTable } from "~~/components/oracle/optimistic/DisputedTable";
import { ExpiredTable } from "~~/components/oracle/optimistic/ExpiredTable";
import { ProposedTable } from "~~/components/oracle/optimistic/ProposedTable";
import { SettledTable } from "~~/components/oracle/optimistic/SettledTable";
import { SubmitAssertionButton } from "~~/components/oracle/optimistic/SubmitAssertionButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useChallengeState } from "~~/services/store/challengeStore";

// 加载动画组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
  </div>
);

const Home: NextPage = () => {
  const setRefetchAssertionStates = useChallengeState(state => state.setRefetchAssertionStates);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: nextAssertionId, isLoading: isLoadingNextAssertionId } = useScaffoldReadContract({
    contractName: "OptimisticOracle",
    functionName: "nextAssertionId",
    query: {
      placeholderData: (previousData: any) => previousData,
    },
  });

  // 获取已部署的合约地址
  const { data: deployedContractAddress, isLoading: isLoadingDeployedContract } = useDeployedContractInfo({
    contractName: "OptimisticOracle",
  });

  // 构造合约调用数组，用于获取从 1 到 nextAssertionId-1 的所有断言的状态
  const assertionContracts = nextAssertionId
    ? Array.from({ length: Number(nextAssertionId) - 1 }, (_, i) => ({
        address: deployedContractAddress?.address as `0x${string}`,
        abi: deployedContractAddress?.abi,
        functionName: "getState",
        args: [BigInt(i + 1)],
      })).filter(contract => contract.address && contract.abi)
    : [];

  const {
    data: assertionStates,
    refetch: refetchAssertionStates,
    isLoading: isLoadingAssertionStates,
  } = useReadContracts({
    contracts: assertionContracts,
    query: {
      placeholderData: (previousData: any) => previousData,
    },
  });

  // 把 refetch 函数存入全局 store
  useEffect(() => {
    if (refetchAssertionStates) {
      setRefetchAssertionStates(refetchAssertionStates);
    }
  }, [refetchAssertionStates, setRefetchAssertionStates]);

  // 把断言 ID 映射到各自的状态，并过滤掉已过期的断言（状态 5）
  const assertionStateMap =
    nextAssertionId && assertionStates
      ? Array.from({ length: Number(nextAssertionId) - 1 }, (_, i) => ({
          assertionId: i + 1,
          state: (assertionStates[i]?.result as number) || 0, // 没有结果时默认为 0（Invalid）
        }))
      : [];

  // 跟踪首次加载何时完成
  const isFirstLoading =
    isInitialLoading && (isLoadingNextAssertionId || isLoadingAssertionStates || isLoadingDeployedContract);

  // 所有数据都可用时，标记为首次加载完成
  useEffect(() => {
    if (isInitialLoading && !isLoadingNextAssertionId && !isLoadingDeployedContract && !isLoadingAssertionStates) {
      setIsInitialLoading(false);
    }
  }, [isInitialLoading, isLoadingNextAssertionId, isLoadingDeployedContract, isLoadingAssertionStates]);

  return (
    <div className="container mx-auto px-8 py-8 max-w-screen-lg xl:max-w-screen-xl">
      {/* 仅在首次加载期间显示加载动画 */}
      {isFirstLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* 带弹窗的“提交断言”按钮 */}
          <SubmitAssertionButton />

          {/* 表格 */}
          <h2 className="text-2xl font-bold my-4">Asserted</h2>
          <AssertedTable assertions={assertionStateMap.filter(assertion => assertion.state === 1)} />
          <h2 className="text-2xl font-bold mt-12 mb-4">Proposed</h2>
          <ProposedTable assertions={assertionStateMap.filter(assertion => assertion.state === 2)} />
          <h2 className="text-2xl font-bold mt-12 mb-4">Disputed</h2>
          <DisputedTable assertions={assertionStateMap.filter(assertion => assertion.state === 3)} />
          <h2 className="text-2xl font-bold mt-12 mb-4">Settled</h2>
          <SettledTable assertions={assertionStateMap.filter(assertion => assertion.state === 4)} />
          <h2 className="text-2xl font-bold mt-12 mb-4">Expired</h2>
          <ExpiredTable assertions={assertionStateMap.filter(assertion => assertion.state === 5)} />
        </>
      )}

      <AssertionModal />
    </div>
  );
};

export default Home;
