"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

/**
 * 按钮组件：清除所有与 zk-voting 相关的 localStorage 数据
 * 包括当前应用的证明数据、承诺数据和 burner wallet（临时钱包）数据
 */
export const ClearStorageButton = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const clearAllVotingStorage = () => {
    setIsClearing(true);

    try {
      // 获取 localStorage 中的所有键
      const keys = Object.keys(localStorage);

      // 筛选出属于本 zk-voting 应用的键
      const zkVotingKeys = keys.filter(
        key =>
          key.startsWith("zk-voting-proof-data") ||
          key.startsWith("zk-voting-commitment-data") ||
          key.startsWith("zk-voting-burner-wallet") ||
          key.startsWith("zk-voting-transaction-result"),
      );

      // 移除所有与 zk-voting 相关的键
      zkVotingKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Cleared ${zkVotingKeys.length} zk-voting storage items:`, zkVotingKeys);

      // 强制重新加载页面，以重置所有缓存的状态
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear zk-voting storage:", error);
    } finally {
      setIsClearing(false);
      setShowConfirm(false);
    }
  };

  const handleClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    clearAllVotingStorage();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isClearing}
        className={`
          btn btn-sm btn-error gap-2
          ${isClearing ? "loading" : ""}
          ${showConfirm ? "btn-outline" : ""}
        `}
      >
        {isClearing ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            Clearing...
          </>
        ) : (
          <>
            <TrashIcon className="h-4 w-4" />
            {showConfirm ? "⚠️ Confirm Clear Local Storage ⚠️" : "Clear Local Storage"}
          </>
        )}
      </button>
    </div>
  );
};
