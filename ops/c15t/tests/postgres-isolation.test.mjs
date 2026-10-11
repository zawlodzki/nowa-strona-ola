import assert from "node:assert/strict";
import test from "node:test";
import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import { c15tInstance, policyBuilder } from "@c15t/backend";
import { kyselyAdapter } from "@c15t/backend/db/adapters/kysely";
import { DB } from "@c15t/backend/db/schema";
import { migrator } from "@c15t/backend/db/migrator";
import { isolateLegacyAdapter } from "../dist/server/legacy-adapter.js";
import { createOlaConsentInstances } from "../dist/server/ola-c15t.js";
import { createConsentRouter } from "../dist/server/consent-router.js";
import { removeEvidenceBefore } from "../dist/server/retention-queries.js";

const connectionString = process.env.TEST_DATABASE_URL;
test(
  "PostgreSQL actual handlers isolate legacy/Ola and preserve Ola history from latest change",
  { skip: !connectionString },
  async () => {
    assert.equal(
      new URL(connectionString).pathname,
      "/ola_consent_isolation_test",
      "Only explicitly named disposable database is allowed",
    );
    const pool = new pg.Pool({ connectionString, max: 3 });
    const db = new Kysely({ dialect: new PostgresDialect({ pool }) });
    try {
      const tables = await db.introspection.getTables();
      assert.equal(
        tables.length,
        0,
        "Test database must be empty; no existing data may be touched",
      );
      const adapter = kyselyAdapter({ db, provider: "postgresql" });
      const migration = await migrator({
        db: DB.client(adapter),
        schema: "latest",
      });
      await migration.execute();
      const signingKey = "local-disposable-pg-test-key-at-least-32-characters";
      const legacy = c15tInstance({
        adapter: isolateLegacyAdapter(adapter),
        basePath: "/api/c15t",
        trustedOrigins: ["https://www.zawlodzki.pl"],
        disableGeoLocation: true,
        branding: "none",
        telemetry: { enabled: false },
        openapi: { enabled: false },
        logger: { level: "error" },
        policyPacks: policyBuilder.createPackWithDefault([], {
          id: "zawlodzki_global_opt_in_v2",
          isDefault: true,
          model: "opt-in",
          expiryDays: 365,
          scopeMode: "strict",
          categories: ["necessary", "measurement", "marketing"],
          preselectedCategories: ["necessary"],
          uiMode: "banner",
        }),
        policySnapshot: {
          signingKey,
          onValidationFailure: "reject",
          audience: "zawlodzki-webflow",
        },
      });
      const router = createConsentRouter(
        legacy,
        createOlaConsentInstances(adapter, signingKey),
      );
      const prod = "https://aleksandraolesiewicz.com";
      const stage = "https://ola-website-staging.zawlodzki.workers.dev";
      const oldOrigin = "https://www.zawlodzki.pl";
      const id = "sub_2jv6z8n4q9";
      const legacyId = "sub_7nHkAzq9";
      const cutoff = new Date("2023-10-11T00:00:00Z");
      const old = cutoff.getTime() - 10_000;
      const recent = cutoff.getTime() + 10_000;
      async function call(path, origin, body) {
        const response = await router(
          new Request(`https://consent.local/api/c15t/${path}`, {
            method: body ? "POST" : "GET",
            headers: { origin, "content-type": "application/json" },
            ...(body ? { body: JSON.stringify(body) } : {}),
          }),
        );
        return { status: response.status, body: await response.json() };
      }
      function payload(origin, token, subjectId, givenAt) {
        return {
          subjectId,
          domain: new URL(origin).hostname,
          type: "cookie_banner",
          givenAt,
          preferences: { necessary: true, measurement: true, marketing: false },
          consentAction: "custom",
          uiSource: "banner",
          policySnapshotToken: token,
        };
      }
      const initialized = await call("init", prod);
      assert.equal(initialized.status, 200);
      const token = initialized.body.policySnapshotToken;
      assert.equal(
        (await call("subjects", prod, payload(prod, token, id, old))).status,
        200,
      );
      assert.equal(
        (await call("subjects", prod, payload(prod, token, id, recent))).status,
        200,
      );
      assert.equal((await call(`subjects/${id}`, prod)).status, 200);
      assert.equal((await call(`subjects/${id}`, stage)).status, 404);
      assert.equal((await call(`subjects/${id}`, oldOrigin)).status, 404);
      assert.equal(
        (await call("subjects", stage, payload(stage, token, id, recent)))
          .status,
        409,
      );
      const oldInit = await call("init", oldOrigin);
      for (const givenAt of [old, recent])
        assert.equal(
          (
            await call(
              "subjects",
              oldOrigin,
              payload(
                oldOrigin,
                oldInit.body.policySnapshotToken,
                legacyId,
                givenAt,
              ),
            )
          ).status,
          200,
        );
      assert.equal((await call(`subjects/${legacyId}`, prod)).status, 404);
      const legacyOrm = DB.client(isolateLegacyAdapter(adapter)).orm("2.0.0");
      assert.equal(await legacyOrm.count("subject"), 1);
      await legacyOrm.transaction(async (transaction) => {
        await transaction.updateMany("subject", {
          set: { externalId: "legacy-test" },
        });
      });
      assert.equal(
        (
          await db
            .selectFrom("subject")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst()
        ).externalId,
        null,
      );
      const firstConsent = await db
        .selectFrom("consent")
        .selectAll()
        .where("subjectId", "=", id)
        .where("givenAt", "=", new Date(old))
        .executeTakeFirstOrThrow();
      await db
        .insertInto("auditLog")
        .values({
          id: "aud_retentiontest",
          entityType: "consent",
          entityId: firstConsent.id,
          actionType: "consent_given",
          subjectId: id,
          createdAt: new Date(old),
          tenantId: "ola-production",
        })
        .execute();
      await removeEvidenceBefore(db, sql`${cutoff}`);
      assert.equal(
        (
          await db
            .selectFrom("consent")
            .selectAll()
            .where("subjectId", "=", id)
            .execute()
        ).length,
        2,
      );
      assert.equal(
        (
          await db
            .selectFrom("auditLog")
            .selectAll()
            .where("id", "=", "aud_retentiontest")
            .execute()
        ).length,
        1,
      );
      assert.equal(
        (
          await db
            .selectFrom("consent")
            .selectAll()
            .where("subjectId", "=", legacyId)
            .execute()
        ).length,
        1,
      );
      await removeEvidenceBefore(db, sql`${new Date(recent + 1)}`);
      assert.equal(
        (await db.selectFrom("consent").selectAll().execute()).length,
        0,
      );
      assert.equal(
        (await db.selectFrom("auditLog").selectAll().execute()).length,
        0,
      );
    } finally {
      await db.destroy();
    }
  },
);
