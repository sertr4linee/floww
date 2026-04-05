"use client";

import { createConfig, http } from "wagmi";
import { abstractTestnet } from "wagmi/chains";
import { createAbstractClient } from "@abstract-foundation/agw-client";

export const config = createConfig({
  chains: [abstractTestnet],
  transports: {
    [abstractTestnet.id]: http("https://api.testnet.abs.xyz"),
  },
  ssr: true,
});
