import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { creators } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// GET /api/creators/:username — public
app.get("/:username", async (c) => {
  const username = c.req.param("username");

  const [creator] = await db
    .select()
    .from(creators)
    .where(eq(creators.username, username))
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

export default app;
