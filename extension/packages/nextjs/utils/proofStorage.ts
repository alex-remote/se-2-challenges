/**
 * 用于在 localStorage 中存储和读取证明数据与承诺数据的工具函数
 */

export interface SerializableProofData {
  proof: number[]; // Uint8Array 序列化为数字数组
  publicInputs: any[];
  timestamp: number;
  contractAddress?: string;
  voteChoice?: boolean;
}

export interface CommitmentData {
  commitment: string;
  nullifier: string;
  secret: string;
  index: number;
}

export interface SerializableCommitmentData extends CommitmentData {
  timestamp: number;
  contractAddress?: string;
  userAddress?: string;
}

const PROOF_STORAGE_KEY_PREFIX = "zk-voting-proof-data";

/**
 * 生成特定于合约和用户的存储键
 */
const getStorageKey = (contractAddress?: string, userAddress?: string): string => {
  if (!contractAddress && !userAddress) {
    return `${PROOF_STORAGE_KEY_PREFIX}-default`;
  }
  if (!contractAddress) {
    return `${PROOF_STORAGE_KEY_PREFIX}-${userAddress?.toLowerCase() || "default"}`;
  }
  if (!userAddress) {
    return `${PROOF_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}`;
  }
  return `${PROOF_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}-${userAddress.toLowerCase()}`;
};

/**
 * 将 ProofData 转换为可存入 localStorage 的可序列化格式
 */
export const serializeProofData = (
  proofData: { proof: Uint8Array; publicInputs: any[] },
  contractAddress?: string,
  voteChoice?: boolean,
): SerializableProofData => {
  return {
    proof: Array.from(proofData.proof), // 将 Uint8Array 转换为数字数组
    publicInputs: proofData.publicInputs,
    timestamp: Date.now(),
    contractAddress,
    voteChoice,
  };
};

/**
 * 将序列化数据转换回 ProofData 格式
 */
export const deserializeProofData = (
  serializedData: SerializableProofData,
): { proof: Uint8Array; publicInputs: any[] } => {
  return {
    proof: new Uint8Array(serializedData.proof), // 将数字数组转换回 Uint8Array
    publicInputs: serializedData.publicInputs,
  };
};

/**
 * 将证明数据保存到 localStorage
 */
export const saveProofToLocalStorage = (
  proofData: { proof: Uint8Array; publicInputs: any[] },
  contractAddress?: string,
  voteChoice?: boolean,
  userAddress?: string,
): void => {
  try {
    const serialized = serializeProofData(proofData, contractAddress, voteChoice);
    const storageKey = getStorageKey(contractAddress, userAddress);
    localStorage.setItem(storageKey, JSON.stringify(serialized));
    console.log(`Proof data saved to localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to save proof data to localStorage:", error);
  }
};

/**
 * 从 localStorage 加载证明数据
 */
export const loadProofFromLocalStorage = (
  contractAddress?: string,
  userAddress?: string,
): { proof: Uint8Array; publicInputs: any[] } | null => {
  try {
    const storageKey = getStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const serialized: SerializableProofData = JSON.parse(stored);
    return deserializeProofData(serialized);
  } catch (error) {
    console.error("Failed to load proof data from localStorage:", error);
    return null;
  }
};

/**
 * 从 localStorage 获取包含元数据的完整序列化证明数据
 */
export const getStoredProofMetadata = (
  contractAddress?: string,
  userAddress?: string,
): SerializableProofData | null => {
  try {
    const storageKey = getStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to get stored proof metadata:", error);
    return null;
  }
};

/**
 * 从 localStorage 清除证明数据
 */
export const clearProofFromLocalStorage = (contractAddress?: string, userAddress?: string): void => {
  try {
    const storageKey = getStorageKey(contractAddress, userAddress);
    localStorage.removeItem(storageKey);
    console.log(`Proof data cleared from localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to clear proof data from localStorage:", error);
  }
};

/**
 * 检查 localStorage 中是否存在证明数据
 */
export const hasStoredProof = (contractAddress?: string, userAddress?: string): boolean => {
  try {
    const storageKey = getStorageKey(contractAddress, userAddress);
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
};

// 承诺存储相关函数
const COMMITMENT_STORAGE_KEY_PREFIX = "zk-voting-commitment-data";

/**
 * 为承诺生成特定于合约和用户的存储键
 */
const getCommitmentStorageKey = (contractAddress?: string, userAddress?: string): string => {
  if (!contractAddress && !userAddress) {
    return `${COMMITMENT_STORAGE_KEY_PREFIX}-default`;
  }
  if (!contractAddress) {
    return `${COMMITMENT_STORAGE_KEY_PREFIX}-${userAddress?.toLowerCase() || "default"}`;
  }
  if (!userAddress) {
    return `${COMMITMENT_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}`;
  }
  return `${COMMITMENT_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}-${userAddress.toLowerCase()}`;
};

/**
 * 将承诺数据保存到 localStorage
 */
export const saveCommitmentToLocalStorage = (
  commitmentData: CommitmentData,
  contractAddress?: string,
  userAddress?: string,
): void => {
  try {
    const serialized: SerializableCommitmentData = {
      ...commitmentData,
      timestamp: Date.now(),
      contractAddress,
      userAddress,
    };
    const storageKey = getCommitmentStorageKey(contractAddress, userAddress);
    localStorage.setItem(storageKey, JSON.stringify(serialized));
    console.log(`Commitment data saved to localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to save commitment data to localStorage:", error);
  }
};

/**
 * 从 localStorage 加载承诺数据
 */
export const loadCommitmentFromLocalStorage = (
  contractAddress?: string,
  userAddress?: string,
): CommitmentData | null => {
  try {
    const storageKey = getCommitmentStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const serialized: SerializableCommitmentData = JSON.parse(stored);
    // 只返回承诺数据，不含元数据
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timestamp, contractAddress: _, userAddress: __, ...commitmentData } = serialized;
    return commitmentData;
  } catch (error) {
    console.error("Failed to load commitment data from localStorage:", error);
    return null;
  }
};

/**
 * 从 localStorage 获取包含元数据的完整序列化承诺数据
 */
export const getStoredCommitmentMetadata = (
  contractAddress?: string,
  userAddress?: string,
): SerializableCommitmentData | null => {
  try {
    const storageKey = getCommitmentStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to get stored commitment metadata:", error);
    return null;
  }
};

/**
 * 从 localStorage 清除承诺数据
 */
export const clearCommitmentFromLocalStorage = (contractAddress?: string, userAddress?: string): void => {
  try {
    const storageKey = getCommitmentStorageKey(contractAddress, userAddress);
    localStorage.removeItem(storageKey);
    console.log(`Commitment data cleared from localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to clear commitment data from localStorage:", error);
  }
};

/**
 * 检查 localStorage 中是否存在承诺数据
 */
export const hasStoredCommitment = (contractAddress?: string, userAddress?: string): boolean => {
  try {
    const storageKey = getCommitmentStorageKey(contractAddress, userAddress);
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
};

// burner wallet（临时钱包）存储相关函数
export interface SerializableBurnerWalletData {
  privateKey: string;
  address: string;
  timestamp: number;
  contractAddress?: string;
  userAddress?: string;
}

const BURNER_WALLET_STORAGE_KEY_PREFIX = "zk-voting-burner-wallet";

/**
 * 为 burner wallet 生成特定于合约和用户的存储键
 */
const getBurnerWalletStorageKey = (contractAddress?: string, userAddress?: string): string => {
  if (!contractAddress && !userAddress) {
    return `${BURNER_WALLET_STORAGE_KEY_PREFIX}-default`;
  }
  if (!contractAddress) {
    return `${BURNER_WALLET_STORAGE_KEY_PREFIX}-${userAddress?.toLowerCase() || "default"}`;
  }
  if (!userAddress) {
    return `${BURNER_WALLET_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}`;
  }
  return `${BURNER_WALLET_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}-${userAddress.toLowerCase()}`;
};

/**
 * 将 burner wallet 数据保存到 localStorage
 */
export const saveBurnerWalletToLocalStorage = (
  privateKey: string,
  address: string,
  contractAddress?: string,
  userAddress?: string,
): void => {
  try {
    const serialized: SerializableBurnerWalletData = {
      privateKey,
      address,
      timestamp: Date.now(),
      contractAddress,
      userAddress,
    };
    const storageKey = getBurnerWalletStorageKey(contractAddress, userAddress);
    localStorage.setItem(storageKey, JSON.stringify(serialized));
    console.log(`Burner wallet saved to localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to save burner wallet to localStorage:", error);
  }
};

/**
 * 从 localStorage 加载 burner wallet 数据
 */
export const loadBurnerWalletFromLocalStorage = (
  contractAddress?: string,
  userAddress?: string,
): { privateKey: string; address: string } | null => {
  try {
    const storageKey = getBurnerWalletStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const serialized: SerializableBurnerWalletData = JSON.parse(stored);
    return {
      privateKey: serialized.privateKey,
      address: serialized.address,
    };
  } catch (error) {
    console.error("Failed to load burner wallet from localStorage:", error);
    return null;
  }
};

/**
 * 从 localStorage 获取包含元数据的完整序列化 burner wallet 数据
 */
export const getStoredBurnerWalletMetadata = (
  contractAddress?: string,
  userAddress?: string,
): SerializableBurnerWalletData | null => {
  try {
    const storageKey = getBurnerWalletStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to get stored burner wallet metadata:", error);
    return null;
  }
};

/**
 * 从 localStorage 清除 burner wallet 数据
 */
export const clearBurnerWalletFromLocalStorage = (contractAddress?: string, userAddress?: string): void => {
  try {
    const storageKey = getBurnerWalletStorageKey(contractAddress, userAddress);
    localStorage.removeItem(storageKey);
    console.log(`Burner wallet cleared from localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to clear burner wallet from localStorage:", error);
  }
};

/**
 * 检查 localStorage 中是否存在 burner wallet 数据
 */
export const hasStoredBurnerWallet = (contractAddress?: string, userAddress?: string): boolean => {
  try {
    const storageKey = getBurnerWalletStorageKey(contractAddress, userAddress);
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
};

// 交易结果存储相关函数
export interface TransactionResult {
  userOpHash: string;
  success: boolean;
  timestamp: number;
  contractAddress?: string;
  receipt?: any; // 完整的回执数据
  errorMessage?: string;
}

const TRANSACTION_RESULT_STORAGE_KEY_PREFIX = "zk-voting-transaction-result";

/**
 * 为交易结果生成特定于合约和用户的存储键
 */
const getTransactionResultStorageKey = (contractAddress?: string, userAddress?: string): string => {
  if (!contractAddress && !userAddress) {
    return `${TRANSACTION_RESULT_STORAGE_KEY_PREFIX}-default`;
  }
  if (!contractAddress) {
    return `${TRANSACTION_RESULT_STORAGE_KEY_PREFIX}-${userAddress?.toLowerCase() || "default"}`;
  }
  if (!userAddress) {
    return `${TRANSACTION_RESULT_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}`;
  }
  return `${TRANSACTION_RESULT_STORAGE_KEY_PREFIX}-${contractAddress.toLowerCase()}-${userAddress.toLowerCase()}`;
};

/**
 * 将交易结果保存到 localStorage
 */
export const saveTransactionResultToLocalStorage = (
  userOpHash: string,
  success: boolean,
  contractAddress?: string,
  userAddress?: string,
  receipt?: any,
  errorMessage?: string,
): void => {
  try {
    const transactionResult: TransactionResult = {
      userOpHash,
      success,
      timestamp: Date.now(),
      contractAddress,
      receipt,
      errorMessage,
    };
    const storageKey = getTransactionResultStorageKey(contractAddress, userAddress);
    localStorage.setItem(storageKey, JSON.stringify(transactionResult));
    console.log(
      `Transaction result saved to localStorage for contract: ${contractAddress}, user: ${userAddress}, success: ${success}`,
    );
  } catch (error) {
    console.error("Failed to save transaction result to localStorage:", error);
  }
};

/**
 * 从 localStorage 加载交易结果
 */
export const loadTransactionResultFromLocalStorage = (
  contractAddress?: string,
  userAddress?: string,
): TransactionResult | null => {
  try {
    const storageKey = getTransactionResultStorageKey(contractAddress, userAddress);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load transaction result from localStorage:", error);
    return null;
  }
};

/**
 * 从 localStorage 清除交易结果
 */
export const clearTransactionResultFromLocalStorage = (contractAddress?: string, userAddress?: string): void => {
  try {
    const storageKey = getTransactionResultStorageKey(contractAddress, userAddress);
    localStorage.removeItem(storageKey);
    console.log(`Transaction result cleared from localStorage for contract: ${contractAddress}, user: ${userAddress}`);
  } catch (error) {
    console.error("Failed to clear transaction result from localStorage:", error);
  }
};

/**
 * 检查 localStorage 中是否存在交易结果
 */
export const hasStoredTransactionResult = (contractAddress?: string, userAddress?: string): boolean => {
  try {
    const storageKey = getTransactionResultStorageKey(contractAddress, userAddress);
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
};
