import { useEffect, useRef, useState } from "react";
import TooltipInfo from "../TooltipInfo";
import { usePublicClient } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const BucketCountdown = () => {
  const publicClient = usePublicClient();
  const { data: bucketWindow } = useScaffoldReadContract({
    contractName: "StakingOracle",
    functionName: "BUCKET_WINDOW",
  }) as { data: bigint | undefined };

  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [currentBucketNum, setCurrentBucketNum] = useState<bigint | null>(null);
  const lastBucketCheckTime = useRef<number>(0);

  // 每秒轮询一次 getCurrentBucketNumber，以保证准确
  const { data: contractBucketNum } = useScaffoldReadContract({
    contractName: "StakingOracle",
    functionName: "getCurrentBucketNumber",
    watch: true,
  }) as { data: bigint | undefined };

  useEffect(() => {
    if (contractBucketNum !== undefined) {
      setCurrentBucketNum(contractBucketNum);
      lastBucketCheckTime.current = Date.now();
    }
  }, [contractBucketNum]);

  useEffect(() => {
    if (!bucketWindow || !publicClient || !currentBucketNum) return;
    let mounted = true;
    const update = async () => {
      try {
        const block = await publicClient.getBlock();
        const blockNum = Number(block.number);
        const w = Number(bucketWindow);
        if (w <= 0) {
          setRemainingSec(null);
          return;
        }

        // 计算当前桶（bucket）中剩余的区块数
        // 桶编号 = (block.number / BUCKET_WINDOW) + 1
        // 因此当前桶的起始区块为：(currentBucketNum - 1) * BUCKET_WINDOW
        const bucketStartBlock = (Number(currentBucketNum) - 1) * w;
        const nextBucketBlock = bucketStartBlock + w;
        const blocksRemaining = nextBucketBlock - blockNum;

        // 加上 2 秒偏移，因为节点时间比系统时间超前
        const estimatedSecondsRemaining = Math.max(0, blocksRemaining + 2);

        if (mounted) setRemainingSec(estimatedSecondsRemaining > 24 ? 24 : estimatedSecondsRemaining);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // 忽略
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [bucketWindow, publicClient, currentBucketNum]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-xl font-bold">Bucket Countdown</h2>
      <div className="bg-base-100 p-4 w-full flex justify-center items-center relative h-full min-h-[140px]">
        <TooltipInfo
          top={0}
          right={0}
          className="tooltip-left"
          infoText="Shows the current bucket number and countdown to the next bucket. Each bucket lasts 24 blocks."
        />
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-gray-500">Bucket #{currentBucketNum?.toString() ?? "..."}</div>
          <div className="font-bold text-3xl">{remainingSec !== null ? `${remainingSec}s` : "..."}</div>
          <div className="text-xs text-gray-500">until next bucket</div>
        </div>
      </div>
    </div>
  );
};
