// IPFS 固定（pinning）通过 SpeedRunEthereum 代理完成，因此本挑战不需要任何 IPFS 凭据。
const IPFS_API_URL = "https://speedrunethereum.com/api/ipfs";

const request = async (path: string, init?: RequestInit) => {
  let res: Response;
  try {
    res = await fetch(`${IPFS_API_URL}${path}`, { ...init, signal: AbortSignal.timeout(30_000) });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError")
      throw new Error("SpeedRunEthereum IPFS proxy timed out");
    throw error;
  }
  // 即使响应不是 JSON（例如 Vercel 的错误页面），也不能因此丢掉状态码
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `SpeedRunEthereum IPFS proxy responded ${res.status}`);
  return data;
};

export async function addToIPFS(metadata: object) {
  const { cid } = await request("/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  // 调用方从 `path` 字段读取 CID
  return { path: cid as string };
}

export async function getNFTMetadataFromIPFS(ipfsHash: string) {
  return request(`/${encodeURIComponent(ipfsHash.trim())}`);
}
