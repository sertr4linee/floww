import { Hono } from "hono";
import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { creators } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// GET /api/creators/:identifier — public (lookup by username OR wallet address)
app.get("/:identifier", async (c) => {
  const identifier = c.req.param("identifier");

  // If it looks like an address (starts with 0x), search by id too
  const isAddress = identifier.startsWith("0x");

  const [creator] = await db
    .select()
    .from(creators)
    .where(
      isAddress
        ? or(eq(creators.username, identifier), eq(creators.id, identifier.toLowerCase()))
        : eq(creators.username, identifier)
    )
    .limit(1);

  if (!creator) {
    return c.json({ error: "Creator not found" }, 404);
  }

  return c.json(creator);
});

// POST /api/creators/me — auth required
app.post("/me", authMiddleware, async (c) => {
  const walletAddress = c.get("walletAddress");
  const body = await c.req.json<{
    username: string;
    displayName?: string;
    bio?: string;
    avatarIpfsHash?: string;
    email?: string;
  }>();

  if (!body.username || body.username.length < 3) {
    return c.json({ error: "Username must be at least 3 characters" }, 400);
  }

  // Check if username is taken by someone else
  const [existing] = await db
    .select()
    .from(creators)
    .where(eq(creators.username, body.username))
    .limit(1);

  if (existing && existing.id !== walletAddress) {
    return c.json({ error: "Username already taken" }, 409);
  }

  // Upsert creator
  const [creator] = await db
    .insert(creators)
    .values({
      id: walletAddress,
      username: body.username,
      displayName: body.displayName ?? null,
      bio: body.bio ?? null,
      avatarIpfsHash: body.avatarIpfsHash ?? null,
      email: body.email ?? null,
    })
    .onConflictDoUpdate({
      target: creators.id,
      set: {
        username: body.username,
        displayName: body.displayName ?? null,
        bio: body.bio ?? null,
        avatarIpfsHash: body.avatarIpfsHash ?? null,
        email: body.email ?? null,
      },
    })
    .returning();

  return c.json(creator);
});

// GET /api/creators/me/profile — get own profile (auth required)
app.get("/me/profile", authMiddleware, async (c) => {
  const walletAddress = c.get("walletAddress");

  const [creator] = await db
    .select()
    .from(creators)
    .where(eq(creators.id, walletAddress))
    .limit(1);

  if (!creator) return c.json({ error: "Profile not found" }, 404);
  return c.json(creator);
});

export default app;
