"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "wagmi/chains";
import { config } from "@/lib/wagmi";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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
