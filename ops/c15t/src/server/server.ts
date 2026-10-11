import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { c15t } from "./c15t.js";
import { adapter, closeDatabase, pool } from "./database.js";
import { createOlaConsentInstances } from "./ola-c15t.js";
import { createConsentRouter } from "./consent-router.js";
import { removeExpiredEvidence } from "./retention.js";

const app = new Hono();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

app.get("/assets/cmp-v1.js", serveStatic({ path: "./dist/public/cmp-v1.js" }));
const consentHandler = createConsentRouter(
  c15t,
  createOlaConsentInstances(adapter, process.env.C15T_POLICY_SIGNING_KEY ?? ""),
);
app.all("/api/c15t/*", (context) => consentHandler(context.req.raw));
app.all("*", (context) => context.notFound());

async function verifyDatabase(): Promise<void> {
  const client = await pool.connect();
  client.release();
}

await verifyDatabase();
await removeExpiredEvidence();

const server = serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port,
});

const retentionTimer = setInterval(
  () => {
    void removeExpiredEvidence().catch((error: unknown) => {
      console.error("c15t evidence retention failed", error);
    });
  },
  24 * 60 * 60 * 1_000,
);
retentionTimer.unref();

async function shutdown(signal: string): Promise<void> {
  console.info(`Received ${signal}, stopping c15t`);
  clearInterval(retentionTimer);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
