import { db } from "../db";
import { subscriptions } from "../db/schema";
import { and, eq, lte } from "drizzle-orm";
import { getKeeperClient, publicClient } from "../lib/viem";
import { SUBSCRIPTION_ADDRESS, SUBSCRIPTION_ABI } from "../lib/contracts";

export async function runRenewalJob() {
  console.log("[renewal] Checking for due subscriptions...");

  // Find all active subscriptions past their billing date
  const due = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.active, true),
        lte(subscriptions.nextBillingDate, new Date())
      )
    );

  if (due.length === 0) {
    console.log("[renewal] No subscriptions due.");
    return;
  }

  console.log(`[renewal] Found ${due.length} due subscriptions.`);

  const keeper = getKeeperClient();

  for (const sub of due) {
    try {
      // Simulate first to check if it will succeed
      await publicClient.simulateContract({
        address: SUBSCRIPTION_ADDRESS,
        abi: SUBSCRIPTION_ABI,
        functionName: "renew",
        args: [
          sub.subscriberAddress as `0x${string}`,
          sub.creatorAddress as `0x${string}`,
        ],
        account: keeper.account,
      });

      // Execute the renewal
      const hash = await keeper.writeContract({
        address: SUBSCRIPTION_ADDRESS,
        abi: SUBSCRIPTION_ABI,
        functionName: "renew",
        args: [
          sub.subscriberAddress as `0x${string}`,
          sub.creatorAddress as `0x${string}`,
        ],
      });

      console.log(
        `[renewal] Renewed ${sub.subscriberAddress.slice(0, 8)}... → ${sub.creatorAddress.slice(0, 8)}... (tx: ${hash})`
      );
    } catch (err: any) {
      console.error(
        `[renewal] Failed to renew ${sub.subscriberAddress.slice(0, 8)}...: ${err.message}`
      );

      // If the subscriber doesn't have enough USDC, deactivate the subscription
      if (err.message?.includes("insufficient") || err.message?.includes("allowance")) {
        await db
          .update(subscriptions)
          .set({ active: false })
          .where(eq(subscriptions.id, sub.id));
        console.log(`[renewal] Deactivated subscription ${sub.id} (insufficient funds)`);
      }
    }
  }
}

// Run every hour
export function startRenewalCron() {
  console.log("[renewal] Cron started (every 1h)");
  // Run immediately once
  runRenewalJob();
  // Then every hour
  setInterval(runRenewalJob, 60 * 60 * 1000);
}
