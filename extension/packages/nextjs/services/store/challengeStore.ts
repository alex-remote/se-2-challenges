import { create } from "zustand";

/**
 * Zustand 状态仓库（Store）
 *
 * 你可以用这个 useGlobalState 为应用添加全局状态，从而在应用的任何地方
 * 获取和设置这些值。
 *
 * 可以把它看作一个全局的 useState。
 */

type CommitmentData = {
  commitment: string;
  nullifier: string;
  secret: string;
  index?: number;
};

type ProofData = {
  proof: Uint8Array;
  publicInputs: any[];
};

type ChallengeState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  commitmentData: CommitmentData | null;
  setCommitmentData: (data: CommitmentData | null) => void;
  proofData: ProofData | null;
  setProofData: (data: ProofData | null) => void;
  voteChoice: boolean | null;
  setVoteChoice: (choice: boolean | null) => void;
};

export const useChallengeState = create<ChallengeState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  commitmentData: null,
  setCommitmentData: (data: CommitmentData | null) => set(() => ({ commitmentData: data })),
  proofData: null,
  setProofData: (data: ProofData | null) => set(() => ({ proofData: data })),
  voteChoice: null,
  setVoteChoice: (choice: boolean | null) => set(() => ({ voteChoice: choice })),
}));
