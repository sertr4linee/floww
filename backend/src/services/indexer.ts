import { parseAbiItem, formatUnits } from "viem";
import { publicClient } from "../lib/viem";
import { TIP_ADDRESS, SUBSCRIPTION_ADDRESS, GATE_ADDRESS } from "../lib/contracts";
import { db } from "../db";
import { tips, subscriptions, passesMinted, indexerState } from "../db/schema";
import { notifyNewTip, notifyNewSubscriber } from "./notifications";
import { eq } from "drizzle-orm";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function getLastBlock(contractName: string): Promise<bigint> {
  const [state] = await db
    .select()
    .from(indexerState)
    .where(eq(indexerState.id, contractName))
    .limit(1);
  return state?.lastBlockIndexed ?? 0n;
}

async function saveLastBlock(contractName: string, blockNumber: bigint) {
  await db
    .insert(indexerState)
    .values({
      id: contractName,
      lastBlockIndexed: blockNumber,
    })
    .onConflictDoUpdate({
      target: indexerState.id,
      set: {
        lastBlockIndexed: blockNumber,
        updatedAt: new Date(),
      },
    });
}

async function backfillTips(fromBlock: bigint) {
  console.log(`[indexer] Backfilling tips from block ${fromBlock}`);
  const logs = await publicClient.getLogs({
    address: TIP_ADDRESS,
    event: parseAbiItem(
      "event Tipped(address indexed from, address indexed creator, address token, uint256 amount, uint256 fee, string message)"
    ),
    fromBlock,
    toBlock: "latest",
  });

  for (const log of logs) {
    const { from, creator, token, amount, fee, message } = log.args;
    if (!from || !creator || amount === undefined || fee === undefined) continue;
    await db
      .insert(tips)
      .values({
        id: log.transactionHash!,
        fromAddress: from.toLowerCase(),
        creatorAddress: creator.toLowerCase(),
        token: token === ZERO_ADDRESS ? null : token ?? null,
        amount: amount.toString(),
        fee: fee.toString(),
        message: message ?? "",
        blockNumber: log.blockNumber ?? 0n,
        blockTimestamp: new Date(),
      })
      .onConflictDoNothing();
  }

  if (logs.length > 0) {
    const lastLog = logs[logs.length - 1]!;
    const lastBlock = lastLog.blockNumber ?? 0n;
    await saveLastBlock("tip", lastBlock);
    console.log(`[indexer] Backfilled ${logs.length} tips up to block ${lastBlock}`);
  }
}

async function backfillSubscriptions(fromBlock: bigint) {
  console.log(`[indexer] Backfilling subscriptions from block ${fromBlock}`);

  // Subscribed events
  const subLogs = await publicClient.getLogs({
    address: SUBSCRIPTION_ADDRESS,
    event: parseAbiItem(
      "event Subscribed(address indexed subscriber, address indexed creator, uint256 planId)"
    ),
    fromBlock,
    toBlock: "latest",
  });

  for (const log of subLogs) {
    const { subscriber, creator, planId } = log.args;
    if (!subscriber || !creator || planId === undefined) continue;
    await db
      .insert(subscriptions)
      .values({
        id: log.transactionHash!,
        subscriberAddress: subscriber.toLowerCase(),
        creatorAddress: creator.toLowerCase(),
        planId: Number(planId),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
      })
      .onConflictDoNothing();
  }

  // Cancelled events
  const cancelLogs = await publicClient.getLogs({
    address: SUBSCRIPTION_ADDRESS,
    event: parseAbiItem(
      "event Cancelled(address indexed subscriber, address indexed creator)"
    ),
    fromBlock,
    toBlock: "latest",
  });

  for (const log of cancelLogs) {
    const { subscriber, creator } = log.args;
    // Find and deactivate the subscription
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriberAddress, subscriber!.toLowerCase()))
      .limit(1);

    if (existing) {
      await db
        .update(subscriptions)
        .set({ active: false })
        .where(eq(subscriptions.id, existing.id));
    }
  }

  const allLogs = [...subLogs, ...cancelLogs];
  if (allLogs.length > 0) {
    const lastBlock = allLogs.reduce(
      (max, log) => (log.blockNumber! > max ? log.blockNumber! : max),
      0n
    );
    await saveLastBlock("subscription", lastBlock);
    console.log(`[indexer] Backfilled ${allLogs.length} subscription events`);
  }
}

async function backfillPasses(fromBlock: bigint) {
  console.log(`[indexer] Backfilling passes from block ${fromBlock}`);
  const logs = await publicClient.getLogs({
    address: GATE_ADDRESS,
    event: parseAbiItem(
      "event PassMinted(uint256 indexed passId, address indexed buyer)"
    ),
    fromBlock,
    toBlock: "latest",
  });

  for (const log of logs) {
    const { passId, buyer } = log.args;
    await db
      .insert(passesMinted)
      .values({
        id: log.transactionHash!,
        passId: Number(passId!),
        buyerAddress: buyer!.toLowerCase(),
        blockNumber: log.blockNumber!,
        blockTimestamp: new Date(),
      })
      .onConflictDoNothing();
  }

  if (logs.length > 0) {
    const lastLog = logs[logs.length - 1]!;
    const lastBlock = lastLog.blockNumber ?? 0n;
    await saveLastBlock("gate", lastBlock);
    console.log(`[indexer] Backfilled ${logs.length} pass mints`);
  }
}

function watchTips() {
  return publicClient.watchEvent({
    address: TIP_ADDRESS,
    event: parseAbiItem(
      "event Tipped(address indexed from, address indexed creator, address token, uint256 amount, uint256 fee, string message)"
    ),
    onLogs: async (logs) => {
      for (const log of logs) {
        const { from, creator, token, amount, fee, message } = log.args;
        await db
          .insert(tips)
          .values({
            id: log.transactionHash!,
            fromAddress: from!.toLowerCase(),
            creatorAddress: creator!.toLowerCase(),
            token: token === ZERO_ADDRESS ? null : token,
            amount: amount!.toString(),
            fee: fee!.toString(),
            message: message ?? "",
            blockNumber: log.blockNumber!,
            blockTimestamp: new Date(),
          })
          .onConflictDoNothing();

        await saveLastBlock("tip", log.blockNumber!);
        console.log(`[indexer] New tip: ${from} → ${creator} (${amount})`);

        // Send email notification
        notifyNewTip(creator!, from!, amount!.toString(), token ?? null, message ?? "").catch(() => {});
      }
    },
  });
}

function watchSubscriptions() {
  const unwatchSub = publicClient.watchEvent({
    address: SUBSCRIPTION_ADDRESS,
    event: parseAbiItem(
      "event Subscribed(address indexed subscriber, address indexed creator, uint256 planId)"
    ),
    onLogs: async (logs) => {
      for (const log of logs) {
        const { subscriber, creator, planId } = log.args;
        await db
          .insert(subscriptions)
          .values({
            id: log.transactionHash!,
            subscriberAddress: subscriber!.toLowerCase(),
            creatorAddress: creator!.toLowerCase(),
            planId: Number(planId!),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            active: true,
          })
          .onConflictDoNothing();

        await saveLastBlock("subscription", log.blockNumber!);
        console.log(`[indexer] New sub: ${subscriber} → ${creator}`);
      }
    },
  });

  const unwatchCancel = publicClient.watchEvent({
    address: SUBSCRIPTION_ADDRESS,
    event: parseAbiItem(
      "event Cancelled(address indexed subscriber, address indexed creator)"
    ),
    onLogs: async (logs) => {
      for (const log of logs) {
        const { subscriber } = log.args;
        const [existing] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.subscriberAddress, subscriber!.toLowerCase()))
          .limit(1);

        if (existing) {
          await db
            .update(subscriptions)
            .set({ active: false })
            .where(eq(subscriptions.id, existing.id));
        }

        await saveLastBlock("subscription", log.blockNumber!);
      }
    },
  });

  return () => {
    unwatchSub();
    unwatchCancel();
  };
}

function watchPasses() {
  return publicClient.watchEvent({
    address: GATE_ADDRESS,
    event: parseAbiItem(
      "event PassMinted(uint256 indexed passId, address indexed buyer)"
    ),
    onLogs: async (logs) => {
      for (const log of logs) {
        const { passId, buyer } = log.args;
        await db
          .insert(passesMinted)
          .values({
            id: log.transactionHash!,
            passId: Number(passId!),
            buyerAddress: buyer!.toLowerCase(),
            blockNumber: log.blockNumber!,
            blockTimestamp: new Date(),
          })
          .onConflictDoNothing();

        await saveLastBlock("gate", log.blockNumber!);
        console.log(`[indexer] Pass minted: #${passId} by ${buyer}`);
      }
    },
  });
}

export async function startIndexer() {
  console.log("[indexer] Starting...");

  // Backfill from last indexed block
  const [tipBlock, subBlock, gateBlock] = await Promise.all([
    getLastBlock("tip"),
    getLastBlock("subscription"),
    getLastBlock("gate"),
  ]);

  await Promise.all([
    backfillTips(tipBlock > 0n ? tipBlock + 1n : 0n),
    backfillSubscriptions(subBlock > 0n ? subBlock + 1n : 0n),
    backfillPasses(gateBlock > 0n ? gateBlock + 1n : 0n),
  ]);

  // Start live watchers
  const unwatchTips = watchTips();
  const unwatchSubs = watchSubscriptions();
  const unwatchPasses = watchPasses();

  console.log("[indexer] Live watchers started");

  return () => {
    unwatchTips();
    unwatchSubs();
    unwatchPasses();
  };
}
