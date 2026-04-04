import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  bigint,
} from "drizzle-orm/pg-core";

export const creators = pgTable("creators", {
  id: text("id").primaryKey(), // wallet address
  username: text("username").unique().notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarIpfsHash: text("avatar_ipfs_hash"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(), // uuid
  creatorId: text("creator_id")
    .references(() => creators.id)
    .notNull(),
  title: text("title").notNull(),
  contentIpfsHash: text("content_ipfs_hash").notNull(),
  isExclusive: boolean("is_exclusive").default(false),
  requiredPlanId: integer("required_plan_id"),
  requiredPassId: integer("required_pass_id"),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const tips = pgTable("tips", {
  id: text("id").primaryKey(), // tx hash
  fromAddress: text("from_address").notNull(),
  creatorAddress: text("creator_address").notNull(),
  token: text("token"), // null = ETH
  amount: numeric("amount").notNull(),
  fee: numeric("fee").notNull(),
  message: text("message"),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(), // tx hash
  subscriberAddress: text("subscriber_address").notNull(),
  creatorAddress: text("creator_address").notNull(),
  planId: integer("plan_id").notNull(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  active: boolean("active").default(true),
});

export const passesMinted = pgTable("passes_minted", {
  id: text("id").primaryKey(), // tx hash
  passId: integer("pass_id").notNull(),
  buyerAddress: text("buyer_address").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
});

export const indexerState = pgTable("indexer_state", {
  id: text("id").primaryKey(), // contract name
  lastBlockIndexed: bigint("last_block_indexed", { mode: "bigint" }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
