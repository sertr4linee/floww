"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useSubscribe } from "@/hooks/useSubscribe";

export function SubscribeButton({ creatorAddress }: { creatorAddress: string }) {
  const { address } = useAccount();
  const { login } = useLoginWithAbstract();
  const { subscribe, isPending, isConfirming, isSuccess } = useSubscribe();

  const handleSubscribe = async () => {
    if (!address) {
      login();
      return;
    }
    try {
      await subscribe(creatorAddress, 0); // default plan 0
    } catch (err) {
      console.error("Subscribe failed:", err);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isPending || isConfirming}
      className={`font-mono text-sm px-5 py-2.5 border transition-colors ${
        isSuccess
          ? "border-[var(--acid)] text-[var(--acid)]"
          : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--acid)] hover:text-[var(--acid)]"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {isSuccess
        ? "✓ SUBSCRIBED"
        : isPending
        ? "CONFIRM..."
        : isConfirming
        ? "CONFIRMING..."
        : "SUBSCRIBE_"}
    </button>
  );
}
