import { createPublicClient, createWalletClient, http } from "viem";
import { abstractTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const publicClient = createPublicClient({
  chain: abstractTestnet,
  transport: http(process.env.RPC_URL),
});

export function getKeeperClient() {
  const account = privateKeyToAccount(
    process.env.KEEPER_PRIVATE_KEY as `0x${string}`
  );
  return createWalletClient({
    account,
    chain: abstractTestnet,
    transport: http(process.env.RPC_URL),
  });
}
