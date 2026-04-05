"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";

export function ConnectButton() {
  const { address } = useAccount();
  const { login } = useLoginWithAbstract();
  const { disconnect } = useDisconnect();

  if (address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-[var(--text-dim)]">{short}</span>
        <button
          onClick={() => disconnect()}
          className="font-mono text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="font-mono text-sm px-4 py-2 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors"
    >
      CONNECT_
    </button>
  );
}
