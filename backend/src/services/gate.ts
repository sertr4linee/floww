import { publicClient } from "../lib/viem";
import { GATE_ADDRESS, GATE_ABI, SUBSCRIPTION_ADDRESS, SUBSCRIPTION_ABI } from "../lib/contracts";

// Simple in-memory cache (60s TTL)
const cache = new Map<string, { value: boolean; expiry: number }>();
const CACHE_TTL = 60_000; // 60 seconds

function getCached(key: string): boolean | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key: string, value: boolean) {
  cache.set(key, { value, expiry: Date.now() + CACHE_TTL });
}

export async function checkAccess(
  userAddress: string,
  creatorAddress: string,
  passId?: number | null,
  planId?: number | null
): Promise<boolean> {
  // Public content — no gate
  if (!passId && !planId) return true;

  // Check NFT pass access
  if (passId != null) {
    const cacheKey = `pass:${userAddress}:${passId}`;
    const cached = getCached(cacheKey);
    if (cached !== null) return cached;

    const hasAccess = await publicClient.readContract({
      address: GATE_ADDRESS,
      abi: GATE_ABI,
      functionName: "hasAccess",
      args: [userAddress as `0x${string}`, BigInt(passId)],
    });

    setCache(cacheKey, hasAccess);
    return hasAccess;
  }

  // Check subscription access
  const cacheKey = `sub:${userAddress}:${creatorAddress}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const isActive = await publicClient.readContract({
    address: SUBSCRIPTION_ADDRESS,
    abi: SUBSCRIPTION_ABI,
    functionName: "isActive",
    args: [userAddress as `0x${string}`, creatorAddress as `0x${string}`],
  });

  setCache(cacheKey, isActive);
  return isActive;
}
