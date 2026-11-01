import { create } from "zustand";
import { AssertionWithIdAndState } from "~~/components/oracle/types";

/**
 * Zustand 状态仓库
 *
 * 你可以通过这个 useGlobalState 为应用添加全局状态，从而在应用的任何位置
 * 读取和设置这些值。
 *
 * 可以把它看作一个全局的 useState。
 */

type ChallengeState = {
  // 区块时间戳跟踪
  timestamp: bigint | null;
  setTimestamp: (timestamp: bigint | null) => void;
  // 乐观预言机
  refetchAssertionStates: () => void;
  setRefetchAssertionStates: (refetchFn: () => void) => void;
  // 断言弹窗
  openAssertion: AssertionWithIdAndState | null;
  openAssertionModal: (assertion: AssertionWithIdAndState) => void;
  closeAssertionModal: () => void;
};

export const useChallengeState = create<ChallengeState>(set => ({
  // 区块时间戳跟踪
  timestamp: null,
  setTimestamp: (timestamp: bigint | null): void => set(() => ({ timestamp })),
  // 乐观预言机
  refetchAssertionStates: () => {},
  setRefetchAssertionStates: (refetchFn: () => void) => set(() => ({ refetchAssertionStates: refetchFn })),
  // 断言弹窗
  openAssertion: null,
  openAssertionModal: (assertion: AssertionWithIdAndState) =>
    set(() => ({
      openAssertion: assertion,
    })),
  closeAssertionModal: () => set(() => ({ openAssertion: null })),
}));
