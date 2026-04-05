"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { CONTRACTS, TIP_ABI } from "@/lib/contracts";

export function useTip() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const tipETH = async (creatorAddress: string, amountEth: string, message: string) => {
    return writeContractAsync({
      address: CONTRACTS.tip,
      abi: TIP_ABI,
      functionName: "tipETH",
      args: [creatorAddress as `0x${string}`, message],
      value: parseEther(amountEth),
    });
  };

  const tipUSDC = async (creatorAddress: string, amountUSDC: string, message: string) => {
    return writeContractAsync({
      address: CONTRACTS.tip,
      abi: TIP_ABI,
      functionName: "tipERC20",
      args: [
        creatorAddress as `0x${string}`,
        CONTRACTS.usdc,
        parseUnits(amountUSDC, 6),
        message,
      ],
    });
  };

  return { tipETH, tipUSDC, isPending, isConfirming, isSuccess, hash };
}
