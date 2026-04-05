"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, SUBSCRIPTION_ABI } from "@/lib/contracts";

export function useSubscribe() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const subscribe = async (creatorAddress: string, planId: number) => {
    return writeContractAsync({
      address: CONTRACTS.subscription,
      abi: SUBSCRIPTION_ABI,
      functionName: "subscribe",
      args: [creatorAddress as `0x${string}`, BigInt(planId)],
    });
  };

  const cancel = async (creatorAddress: string) => {
    return writeContractAsync({
      address: CONTRACTS.subscription,
      abi: SUBSCRIPTION_ABI,
      functionName: "cancel",
      args: [creatorAddress as `0x${string}`],
    });
  };

  return { subscribe, cancel, isPending, isConfirming, isSuccess, hash };
}
