import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { posts, creators } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { checkAccess } from "../services/gate";
import { uploadFile } from "../services/ipfs";
import { randomUUIDv7 } from "bun";

const app = new Hono();

// GET /api/creators/:username/posts — public (gated content shows as locked)
app.get("/:username/posts", async (c) => {
  const username = c.req.param("username");
  const userAddress = c.req.header("X-Wallet-Address");

  const [creator] = await db
    .select()
    .from(creators)
    .where(eq(creators.username, username))
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
    contentIpfsHash: string;
    isExclusive?: boolean;
    requiredPlanId?: number;
    requiredPassId?: number;
  }>();

  if (!body.title || !body.contentIpfsHash) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  const [post] = await db
    .insert(posts)
    .values({
      id: randomUUIDv7(),
      creatorId: walletAddress,
      title: body.title,
      contentIpfsHash: body.contentIpfsHash,
      isExclusive: body.isExclusive ?? false,
      requiredPlanId: body.requiredPlanId ?? null,
      requiredPassId: body.requiredPassId ?? null,
    })
    .returning();

  return c.json(post, 201);
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
