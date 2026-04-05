"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { type ReactNode, useState, useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render nothing until client-side mount — prevents SSR prerender
  // from hitting wagmi hooks without a provider
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--black)]" />
    );
  }

  return (
    <AbstractWalletProvider chain={abstractTestnet}>
      {children}
    </AbstractWalletProvider>
  );
}
