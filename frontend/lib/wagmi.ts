import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { abstractTestnet } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [abstractTestnet],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [abstractTestnet.id]: http("https://api.testnet.abs.xyz"),
    },
  });
}
