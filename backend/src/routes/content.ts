import { Hono } from "hono";
import { eq, or, desc } from "drizzle-orm";
import { db } from "../db";
import { posts, creators } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { checkAccess } from "../services/gate";
import { uploadFile } from "../services/ipfs";
import { randomUUIDv7 } from "bun";

const app = new Hono();

// GET /api/my/posts — creator's own posts (auth required) — MUST be before /:identifier
app.get("/my/posts", authMiddleware, async (c) => {
  const walletAddress = c.get("walletAddress");

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.creatorId, walletAddress))
    .orderBy(desc(posts.publishedAt));

  return c.json(result);
});

// GET /api/creators/:identifier/posts — public (gated content shows as locked)
app.get("/:identifier/posts", async (c) => {
  const identifier = c.req.param("identifier");
  const userAddress = c.req.header("X-Wallet-Address");
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

  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.creatorId, creator.id))
    .orderBy(desc(posts.publishedAt));

  // For each post, check access
  const result = await Promise.all(
    allPosts.map(async (post) => {
      if (!post.isExclusive) {
        return post;
      }

      // If no wallet provided, it's locked
      if (!userAddress) {
        return { ...post, contentIpfsHash: null, locked: true };
      }

      const hasAccess = await checkAccess(
        userAddress,
        creator.id,
        post.requiredPassId,
        post.requiredPlanId
      );

      if (hasAccess) {
        return post;
      }

      return { ...post, contentIpfsHash: null, locked: true };
    })
  );

  return c.json(result);
});

// GET /api/posts/:id — single post with access check
app.get("/posts/:id", async (c) => {
  const postId = c.req.param("id");
  const userAddress = c.req.header("X-Wallet-Address");

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  if (!post.isExclusive) {
    return c.json(post);
  }

  if (!userAddress) {
    return c.json({ ...post, contentIpfsHash: null, locked: true });
  }

  const hasAccess = await checkAccess(
    userAddress,
    post.creatorId,
    post.requiredPassId,
    post.requiredPlanId
  );

  if (!hasAccess) {
    return c.json({ ...post, contentIpfsHash: null, locked: true });
  }

  return c.json(post);
});

// POST /api/posts — auth required
app.post("/posts", authMiddleware, async (c) => {
  const walletAddress = c.get("walletAddress");

  const body = await c.req.json<{
    title: string;
    content?: string;
    contentIpfsHash?: string;
    isExclusive?: boolean;
    requiredPlanId?: number;
    requiredPassId?: number;
  }>();

  if (!body.title) {
    return c.json({ error: "Title is required" }, 400);
  }

  // Use provided IPFS hash or store content as plain text hash placeholder
  const contentHash = body.contentIpfsHash ?? body.content ?? "";

  const [post] = await db
    .insert(posts)
    .values({
      id: randomUUIDv7(),
      creatorId: walletAddress,
      title: body.title,
      contentIpfsHash: contentHash,
      isExclusive: body.isExclusive ?? false,
      requiredPlanId: body.requiredPlanId ?? null,
      requiredPassId: body.requiredPassId ?? null,
    })
    .returning();

  return c.json(post, 201);
});

// DELETE /api/posts/:id — auth required
app.delete("/posts/:id", authMiddleware, async (c) => {
  const walletAddress = c.get("walletAddress");
  const postId = c.req.param("id");

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) return c.json({ error: "Post not found" }, 404);
  if (post.creatorId !== walletAddress) return c.json({ error: "Not your post" }, 403);

  await db.delete(posts).where(eq(posts.id, postId));
  return c.json({ ok: true });
});

// POST /api/upload — auth required, upload file to IPFS
app.post("/upload", authMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const cid = await uploadFile(file);
  return c.json({ cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` });
});

export default app;
