import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import creatorsRoutes from "./routes/creators";
import contentRoutes from "./routes/content";
import analyticsRoutes from "./routes/analytics";
import { startIndexer } from "./services/indexer";
import { startRenewalCron } from "./jobs/renewal";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://floww.xyz"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "X-Message", "X-Wallet-Address"],
  })
);

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "floww-api" }));

// Routes
app.route("/api/creators", creatorsRoutes);
app.route("/api", contentRoutes);
app.route("/api/dashboard", analyticsRoutes);

// Start server
const port = parseInt(process.env.PORT ?? "3001");

console.log(`Floww API starting on port ${port}`);

// Start the indexer (non-blocking)
startIndexer().catch((err) => {
  console.error("[indexer] Failed to start:", err);
});

export default {
  port,
  fetch: app.fetch,
};
