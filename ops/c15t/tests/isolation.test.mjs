import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { Kysely, SqliteDialect, sql } from "kysely";
import { c15tInstance, policyBuilder } from "@c15t/backend";
import { kyselyAdapter } from "@c15t/backend/db/adapters/kysely";
import { DB } from "@c15t/backend/db/schema";
import { migrator } from "@c15t/backend/db/migrator";
import { createOlaConsentInstances } from "../dist/server/ola-c15t.js";
import { isolateLegacyAdapter } from "../dist/server/legacy-adapter.js";
import { createConsentRouter } from "../dist/server/consent-router.js";
import { removeEvidenceBefore } from "../dist/server/retention-queries.js";

async function setup() {
  const sqlite = new DatabaseSync(":memory:");
  const database = {
    close: () => sqlite.close(),
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        reader: statement.columns().length > 0,
        all: (parameters) => statement.all(...parameters),
        run: (parameters) => statement.run(...parameters),
        iterate: (parameters) => statement.iterate(...parameters),
      };
    },
  };
  const db = new Kysely({ dialect: new SqliteDialect({ database }) });
  const adapter = kyselyAdapter({ db, provider: "sqlite" });
  const result = await migrator({ db: DB.client(adapter), schema: "latest" });
  await result.execute();
  const signingKey = "test-local-only-signing-key-at-least-32-characters";
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
  const services = createOlaConsentInstances(adapter, signingKey);
  return {
    db,
    adapter,
    router: createConsentRouter(legacy, services),
    services,
  };
}
const prod = "https://aleksandraolesiewicz.com";
const stage = "https://ola-website-staging.zawlodzki.workers.dev";
const legacyOrigin = "https://www.zawlodzki.pl";
const id = "sub_2jv6z8n4q9";
function payload(origin, token, subjectId = id) {
  return {
    subjectId,
    domain: new URL(origin).hostname,
    type: "cookie_banner",
    givenAt: Date.now(),
    preferences: { necessary: true, measurement: true, marketing: false },
    consentAction: "custom",
    policySnapshotToken: token,
    uiSource: "dialog",
  };
}
async function call(router, path, origin, body, method) {
  const response = await router(
    new Request(`https://consent.local/api/c15t/${path}`, {
      method: method ?? (body ? "POST" : "GET"),
      headers: {
        ...(origin ? { origin } : {}),
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  );
  return {
    status: response.status,
    body: await response.json(),
    headers: response.headers,
  };
}

test("real handlers isolate Ola production, staging and unchanged legacy evidence", async () => {
  const { db, router } = await setup();
  try {
    const initialized = await call(router, "init", prod);
    assert.equal(initialized.status, 200);
    assert.equal(initialized.body.policy.id, "olesiewicz_global_opt_in_v1");
    const write = await call(
      router,
      "subjects",
      prod,
      payload(prod, initialized.body.policySnapshotToken),
    );
    assert.equal(write.status, 200);
    assert.equal(write.body.domain, "aleksandraolesiewicz.com");
    assert.deepEqual(write.body.appliedPreferences, {
      necessary: true,
      measurement: true,
      marketing: false,
    });
    assert.equal((await call(router, `subjects/${id}`, prod)).status, 200);
    assert.equal((await call(router, `subjects/${id}`, stage)).status, 404);
    assert.equal(
      (await call(router, `subjects/${id}`, legacyOrigin)).status,
      404,
    );
    const crossSnapshot = await call(
      router,
      "subjects",
      stage,
      payload(stage, initialized.body.policySnapshotToken),
    );
    assert.equal(crossSnapshot.status, 409);
    const before = await db.selectFrom("consent").selectAll().execute();
    assert.equal(before.length, 1);
    assert.equal(before[0].tenantId, "ola-production");
    const legacyInit = await call(router, "init", legacyOrigin);
    const legacyId = "sub_7nHkAzq9";
    assert.equal(
      (
        await call(
          router,
          "subjects",
          legacyOrigin,
          payload(legacyOrigin, legacyInit.body.policySnapshotToken, legacyId),
        )
      ).status,
      200,
    );
    assert.equal(
      (await call(router, `subjects/${legacyId}`, legacyOrigin)).status,
      200,
    );
    assert.equal(
      (await call(router, `subjects/${legacyId}`, prod)).status,
      404,
    );
    assert.equal(
      (await call(router, `subjects/${legacyId}`, stage)).status,
      404,
    );
    assert.equal(
      (
        await db
          .selectFrom("subject")
          .selectAll()
          .where("id", "=", legacyId)
          .executeTakeFirst()
      ).tenantId,
      null,
    );
    assert.equal(
      (
        await call(
          router,
          `subjects/${id}`,
          prod,
          { externalId: "cross-tenant" },
          "PATCH",
        )
      ).status,
      405,
    );
    const legacyPatch = await call(
      router,
      `subjects/${id}`,
      legacyOrigin,
      { externalId: "cross-tenant" },
      "PATCH",
    );
    assert.equal(legacyPatch.status, 404);
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
  } finally {
    await db.destroy();
  }
});

test("origin and domain boundaries reject untrusted requests before creating consent", async () => {
  const { db, router } = await setup();
  try {
    assert.equal((await call(router, "init")).status, 403);
    assert.equal(
      (await call(router, "init", "https://foreign.example")).status,
      403,
    );
    assert.equal(
      (await call(router, "init", "http://localhost:4321")).status,
      403,
    );
    const initialized = await call(router, "init", prod);
    const body = payload(prod, initialized.body.policySnapshotToken);
    assert.equal(
      (
        await call(router, "subjects", prod, {
          ...body,
          domain: "www.zawlodzki.pl",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call(router, "subjects", prod, {
          ...body,
          metadata: { health: "must not be stored" },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call(router, "subjects", prod, {
          ...body,
          externalSubjectId: "client-id",
        })
      ).status,
      400,
    );
    assert.equal(
      (await call(router, "subjects", prod, { ...body, type: "other" })).status,
      400,
    );
    for (const extra of [
      { uiSource: "private@example.com-PCOS" },
      { consentAction: "private@example.com" },
      { preferences: { ...body.preferences, email: "private@example.com" } },
    ])
      assert.equal(
        (await call(router, "subjects", prod, { ...body, ...extra })).status,
        400,
      );
    assert.equal(
      (await db.selectFrom("consent").selectAll().execute()).length,
      0,
    );
    const status = await call(router, "status");
    assert.equal(status.status, 200);
    const preflight = await router(
      new Request("https://consent.local/api/c15t/subjects", {
        method: "OPTIONS",
        headers: {
          origin: stage,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      }),
    );
    assert.equal(preflight.headers.get("access-control-allow-origin"), stage);
  } finally {
    await db.destroy();
  }
});

test("legacy adapter scopes transactions, counts, deletes and upserts to tenant null", async () => {
  const { db, adapter } = await setup();
  try {
    const raw = DB.client(adapter).orm("2.0.0");
    const legacy = DB.client(isolateLegacyAdapter(adapter)).orm("2.0.0");
    const now = new Date();
    await raw.create("subject", {
      id,
      externalId: null,
      identityProvider: null,
      createdAt: now,
      updatedAt: now,
      tenantId: "ola-production",
    });
    const legacyId = "sub_7nHkAzq9";
    await legacy.create("subject", {
      id: legacyId,
      externalId: null,
      identityProvider: null,
      createdAt: now,
      updatedAt: now,
      tenantId: "ola-production",
    });
    assert.equal(await legacy.count("subject"), 1);
    await legacy.transaction(async (transaction) => {
      await transaction.updateMany("subject", {
        set: { externalId: "legacy-only" },
      });
      assert.equal(await transaction.count("subject"), 1);
    });
    assert.equal(
      (await raw.findFirst("subject", { where: (b) => b("id", "=", id) }))
        .externalId,
      null,
    );
    assert.equal(
      (await raw.findFirst("subject", { where: (b) => b("id", "=", legacyId) }))
        .tenantId,
      null,
    );
    await legacy.upsert("subject", {
      where: (b) => b("id", "=", legacyId),
      update: { externalId: "updated" },
      create: {
        id: legacyId,
        externalId: null,
        identityProvider: null,
        createdAt: now,
        updatedAt: now,
        tenantId: "ola-production",
      },
    });
    assert.equal(
      (
        await legacy.findFirst("subject", {
          where: (b) => b("id", "=", legacyId),
        })
      ).externalId,
      "updated",
    );
    await legacy.deleteMany("subject", {});
    assert.equal(await raw.count("subject"), 1);
    assert.equal(await legacy.count("subject"), 0);
  } finally {
    await db.destroy();
  }
});

test("Ola history expires from last consent change while legacy retention stays unchanged", async () => {
  const { db, router } = await setup();
  try {
    const cutoff = Date.UTC(2023, 9, 11);
    const old = cutoff - 10_000;
    const recent = cutoff + 10_000;
    const initialized = await call(router, "init", prod);
    await call(router, "subjects", prod, {
      ...payload(prod, initialized.body.policySnapshotToken),
      givenAt: old,
    });
    await call(router, "subjects", prod, {
      ...payload(prod, initialized.body.policySnapshotToken),
      givenAt: recent,
    });
    const oldOlaConsent = await db
      .selectFrom("consent")
      .selectAll()
      .where("givenAt", "=", old)
      .executeTakeFirst();
    await db
      .insertInto("auditLog")
      .values({
        id: "aud_oldola",
        entityType: "consent",
        entityId: oldOlaConsent.id,
        actionType: "consent_given",
        subjectId: id,
        createdAt: old,
        tenantId: "ola-production",
      })
      .execute();
    const legacyInit = await call(router, "init", legacyOrigin);
    const legacyId = "sub_7nHkAzq9";
    await call(router, "subjects", legacyOrigin, {
      ...payload(legacyOrigin, legacyInit.body.policySnapshotToken, legacyId),
      givenAt: old,
    });
    await call(router, "subjects", legacyOrigin, {
      ...payload(legacyOrigin, legacyInit.body.policySnapshotToken, legacyId),
      givenAt: recent,
    });
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
          .where("id", "=", "aud_oldola")
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
    await removeEvidenceBefore(db, sql`${recent + 1}`);
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
});
