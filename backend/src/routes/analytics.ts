import { Hono } from "hono";
import { eq, sql, desc, and } from "drizzle-orm";
import { db } from "../db";
import { tips, subscriptions } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

type AuthEnv = {
  Variables: {
    walletAddress: string;
  };
};

const app = new Hono<AuthEnv>();

// All analytics routes require auth
app.use("/*", authMiddleware);

// GET /api/dashboard/stats — overview stats
app.get("/stats", async (c) => {
  const walletAddress = c.get("walletAddress");

  // Total tips received
  const [tipStats] = await db
    .select({
      totalTips: sql<number>`count(*)`,
      totalAmount: sql<string>`coalesce(sum(${tips.amount}::numeric), 0)`,
    })
    .from(tips)
    .where(eq(tips.creatorAddress, walletAddress));

  // Active subscribers
  const [subStats] = await db
    .select({
      activeSubscribers: sql<number>`count(*)`,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.creatorAddress, walletAddress),
        eq(subscriptions.active, true)
      )
    );

  return c.json({
    totalTips: tipStats?.totalTips ?? 0,
    totalAmount: tipStats?.totalAmount ?? "0",
    activeSubscribers: subStats?.activeSubscribers ?? 0,
  });
});

// GET /api/dashboard/tips — paginated tips list
app.get("/tips", async (c) => {
  const walletAddress = c.get("walletAddress");
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = parseInt(c.req.query("limit") ?? "20");
  const offset = (page - 1) * limit;

  const result = await db
    .select()
    .from(tips)
    .where(eq(tips.creatorAddress, walletAddress))
    .orderBy(desc(tips.blockTimestamp))
    .limit(limit)
    .offset(offset);

  return c.json({ data: result, page, limit });
});

// GET /api/dashboard/subscribers — active subscribers
app.get("/subscribers", async (c) => {
  const walletAddress = c.get("walletAddress");

  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.creatorAddress, walletAddress),
        eq(subscriptions.active, true)
      )
    )
    .orderBy(desc(subscriptions.nextBillingDate));

  return c.json(result);
});

export default app;
