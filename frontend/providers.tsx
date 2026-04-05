"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "wagmi/chains";
import { config } from "@/lib/wagmi";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AbstractWalletProvider chain={abstractTestnet}>
          {children}
        </AbstractWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
