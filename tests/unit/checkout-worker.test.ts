import { readFile } from "node:fs/promises";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  CONSENT_VERSION,
  handleCheckout,
  remainingProducts,
  verifyStripeSignature,
  type CheckoutEnvironment,
} from "../../worker/src/checkout";

const origin = "https://shop.example";
const browserCookie = "__Host-ola_checkout=" + "a".repeat(64);
let runtime: Miniflare;
let env: CheckoutEnvironment;
const sessions = new Map<string, Record<string, unknown>>();
const createdBodies: URLSearchParams[] = [];
const createdHeaders: Headers[] = [];
const idempotency = new Map<string, string>();
let nextId = 0;

beforeAll(async () => {
  runtime = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          modules: true,
          script: "export default { fetch() { return new Response('ok') } }",
          compatibilityDate: "2026-09-13",
          d1Databases: ["CHECKOUT_DB"],
        },
      ],
    }),
  );
  const db = await runtime.getD1Database("CHECKOUT_DB");
  await db.exec(
    (
      await readFile(
        new URL("../../worker/migrations/0001_checkout.sql", import.meta.url),
        "utf8",
      )
    ).replace(/\n/g, " "),
  );
  env = {
    CHECKOUT_DB: db,
    CHECKOUT_ENABLED: "true",
    CHECKOUT_SITE_ORIGIN: origin,
    STRIPE_SECRET_KEY: "sk_test_fixture",
    STRIPE_WEBHOOK_SECRET: "whsec_fixture",
    STRIPE_PRICE_EBOOK_01: "price_01",
    STRIPE_PRICE_EBOOK_02: "price_02",
    STRIPE_PRICE_EBOOK_03: "price_03",
    STRIPE_PAIR_COUPON: "coupon_pair",
  };
});
afterAll(async () => {
  await runtime.dispose();
});
beforeEach(async () => {
  await env.CHECKOUT_DB?.prepare("DELETE FROM checkout_orders").run();
  sessions.clear();
  createdBodies.length = 0;
  createdHeaders.length = 0;
  idempotency.clear();
  nextId = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const path = new URL(input).pathname;
      if (init?.method === "POST" && path.endsWith("/expire")) {
        const id = path.split("/").at(-2) ?? "";
        const session = sessions.get(id);
        if (!session) return new Response("missing", { status: 404 });
        if (session.status === "complete")
          return new Response("completed", { status: 400 });
        session.status = "expired";
        return Response.json(session);
      }
      if (init?.method === "POST") {
        const params = new URLSearchParams(String(init.body));
        const key = new Headers(init.headers).get("Idempotency-Key") ?? "";
        let id = idempotency.get(key);
        if (!id) {
          id = `cs_test_${++nextId}`;
          idempotency.set(key, id);
          createdBodies.push(params);
          createdHeaders.push(new Headers(init.headers));
          sessions.set(id, {
            id,
            url: `https://checkout.stripe.com/c/pay/${id}`,
            status: "open",
            payment_status: "unpaid",
            currency: "pln",
            amount_total: 9700,
            client_reference_id: params.get("client_reference_id"),
            payment_intent: `pi_${id}`,
          });
        }
        return Response.json(sessions.get(id));
      }
      if (path.includes("payment_intents/"))
        return Response.json({
          status: "succeeded",
          latest_charge: { amount_refunded: 0, disputed: false },
        });
      const id = path.split("/").at(-1) ?? "";
      return Response.json(sessions.get(id));
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());
function request(
  path: string,
  body?: unknown,
  cookie?: string,
  requestOrigin = origin,
): Request {
  return new Request(`${origin}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      ...(body
        ? { origin: requestOrigin, "content-type": "application/json" }
        : {}),
      ...(cookie ? { cookie } : { cookie: browserCookie }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
function single(code = "ebook-01") {
  return {
    productCode: code,
    customerName: "Anna Test",
    email: "anna@example.invalid",
    consentAccepted: true,
    consentVersion: CONSENT_VERSION,
    requestId: crypto.randomUUID(),
  };
}
async function firstPaid(code = "ebook-01") {
  const result = await handleCheckout(
    request("/api/checkout/orders", single(code)),
    env,
  );
  expect(result.status).toBe(200);
  const cookie = result.headers.get("set-cookie")?.split(";")[0] ?? "";
  const session = sessions.get("cs_test_1");
  if (!session) throw new Error("missing session");
  session.status = "complete";
  session.payment_status = "paid";
  const status = await handleCheckout(
    request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
    env,
  );
  expect(await status.json()).toMatchObject({
    status: "paid",
    kind: "single",
    bundleAvailable: true,
  });
  return cookie;
}
async function signature(
  text: string,
  time = Math.floor(Date.now() / 1000),
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode("whsec_fixture"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${time}.${text}`),
  );
  return `t=${time},v1=${Array.from(new Uint8Array(mac), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

describe("PCOS checkout with local D1", () => {
  it("keeps sales closed by default and rejects unaccepted or obsolete consent", async () => {
    const closed = await handleCheckout(
      request("/api/checkout/orders", single()),
      { ...env, CHECKOUT_ENABLED: "false" },
    );
    expect(closed.status).toBe(503);
    expect(await closed.json()).toEqual({ error: "sales_not_enabled" });
    for (const changes of [
      { consentAccepted: false },
      { consentVersion: "old" },
    ]) {
      const result = await handleCheckout(
        request("/api/checkout/orders", { ...single(), ...changes }),
        env,
      );
      expect(result.status).toBe(400);
    }
    expect(createdBodies).toHaveLength(0);
  });
  it("stores exact consent and price snapshot before creating a single Stripe session", async () => {
    const input = single();
    const result = await handleCheckout(
      request("/api/checkout/orders", input),
      env,
    );
    expect(result.headers.get("set-cookie")).toContain(
      "Secure; HttpOnly; SameSite=Lax; Path=/",
    );
    expect(await result.json()).toEqual({
      checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_1",
    });
    const row = await env.CHECKOUT_DB?.prepare(
      "SELECT amount,consent_text,terms_version,snapshot,owner_hash FROM checkout_orders",
    ).first<{
      amount: number;
      consent_text: string;
      terms_version: string;
      snapshot: string;
      owner_hash: string;
    }>();
    expect(row).toMatchObject({ amount: 9700, terms_version: "2.4" });
    expect(row?.consent_text).toContain(
      "po dostarczeniu e-booka utracę prawo odstąpienia",
    );
    expect(createdBodies[0]?.get("line_items[0][price]")).toBe("price_01");
    expect(
      createdBodies[0]?.get("consent_collection[terms_of_service]"),
    ).toBeNull();
    expect(createdBodies[0]?.get("submit_type")).toBe("pay");
    const cookie = result.headers.get("set-cookie")?.split(";")[0];
    const repeat = await handleCheckout(
      request("/api/checkout/orders", input, cookie),
      env,
    );
    expect(repeat.status).toBe(200);
    expect(createdBodies).toHaveLength(1);
    const conflict = await handleCheckout(
      request(
        "/api/checkout/orders",
        { ...input, productCode: "ebook-02" },
        cookie,
      ),
      env,
    );
    expect(conflict.status).toBe(409);
  });
  it.each(["ebook-01", "ebook-02", "ebook-03"] as const)(
    "sells exactly both missing books after %s and prevents duplicate sessions",
    async (code) => {
      const cookie = await firstPaid(code);
      const payload = {
        parentSessionId: "cs_test_1",
        consentAccepted: true,
        consentVersion: CONSENT_VERSION,
        requestId: crypto.randomUUID(),
        productCodes: ["ebook-01"],
        amount: 1,
      };
      const results = await Promise.all([
        handleCheckout(request("/api/checkout/bundle", payload, cookie), env),
        handleCheckout(
          request(
            "/api/checkout/bundle",
            { ...payload, requestId: crypto.randomUUID() },
            cookie,
          ),
          env,
        ),
      ]);
      expect(results.map((result) => result.status)).toEqual([200, 200]);
      expect(createdBodies).toHaveLength(2);
      const bundle = createdBodies[1];
      const expected = remainingProducts(code).map(
        (value) => `price_${value.slice(-2)}`,
      );
      expect([
        bundle?.get("line_items[0][price]"),
        bundle?.get("line_items[1][price]"),
      ]).toEqual(expected);
      expect(bundle?.get("line_items[2][price]")).toBeNull();
      expect(bundle?.get("line_items[0][quantity]")).toBe("1");
      expect(bundle?.get("line_items[1][quantity]")).toBe("1");
      expect(bundle?.get("discounts[0][coupon]")).toBe("coupon_pair");
      expect(bundle?.get("allow_promotion_codes")).toBeNull();
      const pair = sessions.get("cs_test_2");
      if (!pair) throw new Error("missing pair");
      pair.status = "complete";
      pair.payment_status = "paid";
      await handleCheckout(
        request("/api/checkout/status?session_id=cs_test_2", undefined, cookie),
        env,
      );
      const again = await handleCheckout(
        request(
          "/api/checkout/bundle",
          { ...payload, requestId: crypto.randomUUID() },
          cookie,
        ),
        env,
      );
      expect(again.status).toBe(409);
    },
  );
  it("does not grant ownership from the session URL and rejects CSRF", async () => {
    await firstPaid();
    const status = await handleCheckout(
      request(
        "/api/checkout/status?session_id=cs_test_1",
        undefined,
        "__Host-ola_checkout=" + "b".repeat(64),
      ),
      env,
    );
    expect(status.status).toBe(404);
    const csrf = await handleCheckout(
      request(
        "/api/checkout/orders",
        single(),
        undefined,
        "https://attacker.example",
      ),
      env,
    );
    expect(csrf.status).toBe(403);
  });
  it("requires paid first purchase and verifies payment amount before granting the pair", async () => {
    const result = await handleCheckout(
      request("/api/checkout/orders", single()),
      env,
    );
    const cookie = result.headers.get("set-cookie")?.split(";")[0];
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    expect(
      (
        await handleCheckout(
          request("/api/checkout/bundle", payload, cookie),
          env,
        )
      ).status,
    ).toBe(409);
    const session = sessions.get("cs_test_1");
    if (!session) throw new Error("missing session");
    session.status = "complete";
    session.payment_status = "paid";
    session.amount_total = 1;
    expect(
      (
        await handleCheckout(
          request("/api/checkout/bundle", payload, cookie),
          env,
        )
      ).status,
    ).toBe(409);
  });
  it("accepts authenticated repeated payment events and never rolls a paid order back", async () => {
    await handleCheckout(request("/api/checkout/orders", single()), env);
    const session = sessions.get("cs_test_1");
    if (!session) throw new Error("missing session");
    session.status = "complete";
    session.payment_status = "paid";
    async function send(type: string) {
      const body = JSON.stringify({ type, data: { object: session } });
      return handleCheckout(
        new Request(`${origin}/webhooks/stripe`, {
          method: "POST",
          headers: { "stripe-signature": await signature(body) },
          body,
        }),
        env,
      );
    }
    expect((await send("checkout.session.completed")).status).toBe(200);
    expect((await send("checkout.session.completed")).status).toBe(200);
    session.status = "expired";
    session.payment_status = "unpaid";
    expect((await send("checkout.session.expired")).status).toBe(200);
    expect(
      await env.CHECKOUT_DB?.prepare(
        "SELECT status FROM checkout_orders",
      ).first(),
    ).toEqual({ status: "paid" });
  });
  it("bootstraps ownership before POST and fixes the Stripe expiry and consent metadata", async () => {
    const catalog = await handleCheckout(
      new Request(`${origin}/api/checkout/catalog`),
      env,
    );
    const cookie = catalog.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toMatch(/^__Host-ola_checkout=[a-f0-9]{64}$/);
    const noCookie = await handleCheckout(
      new Request(`${origin}/api/checkout/orders`, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify(single()),
      }),
      env,
    );
    expect(await noCookie.json()).toEqual({
      error: "checkout_session_required",
    });
    const input = single();
    await handleCheckout(request("/api/checkout/orders", input, cookie), env);
    const params = createdBodies[0];
    const row = await env.CHECKOUT_DB?.prepare(
      "SELECT created_at FROM checkout_orders",
    ).first<{ created_at: number }>();
    expect(params?.get("expires_at")).toBe(
      String(Math.floor((row?.created_at ?? 0) / 1000) + 3600),
    );
    expect(params?.get("payment_method_types[0]")).toBeNull();
    expect(createdHeaders[0]?.get("Stripe-Version")).toBe("2026-08-26.dahlia");
    expect(params?.get("integration_identifier")).toMatch(
      /^ola-checkout-[a-p]{8}$/,
    );
    expect(params?.get("adaptive_pricing[enabled]")).toBe("false");
    expect(params?.get("custom_text[submit][message]")).toBe(
      "Płacisz za zamówienie złożone w Wellbiz sp. z o.o. Potwierdzenie wyślemy na Twój adres e-mail.",
    );
    expect(params?.get("metadata[regulamin_version]")).toBe("2.4");
    expect(params?.get("metadata[z2_text_version]")).toBe(
      "pcos-d27-2026-10-18",
    );
    expect(params?.get("metadata[z2]")).toBe("true");
  });
  it("revokes the offer after refund and never restores it from repeated completion", async () => {
    const cookie = await firstPaid();
    const text = JSON.stringify({
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_cs_test_1" } },
    });
    const event = await handleCheckout(
      new Request(`${origin}/webhooks/stripe`, {
        method: "POST",
        headers: { "stripe-signature": await signature(text) },
        body: text,
      }),
      env,
    );
    expect(event.status).toBe(200);
    const state = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await state.json()).toMatchObject({
      status: "revoked",
      bundleAvailable: false,
    });
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    expect(
      (
        await handleCheckout(
          request("/api/checkout/bundle", payload, cookie),
          env,
        )
      ).status,
    ).toBe(409);
  });
  it("expires an already-open discounted session when its parent is refunded", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    await handleCheckout(request("/api/checkout/bundle", payload, cookie), env);
    const text = JSON.stringify({
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_cs_test_1" } },
    });
    const result = await handleCheckout(
      new Request(`${origin}/webhooks/stripe`, {
        method: "POST",
        headers: { "stripe-signature": await signature(text) },
        body: text,
      }),
      env,
    );
    expect(result.status).toBe(200);
    expect(sessions.get("cs_test_2")?.status).toBe("expired");
    expect(
      (
        await handleCheckout(
          request("/api/checkout/bundle", payload, cookie),
          env,
        )
      ).status,
    ).toBe(409);
  });
  it("preserves a concurrently paid pair and flags it for review after its parent is refunded", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    await handleCheckout(request("/api/checkout/bundle", payload, cookie), env);
    const pair = sessions.get("cs_test_2");
    if (!pair) throw new Error("missing pair");
    pair.status = "complete";
    pair.payment_status = "paid";
    const text = JSON.stringify({
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_cs_test_1" } },
    });
    const result = await handleCheckout(
      new Request(`${origin}/webhooks/stripe`, {
        method: "POST",
        headers: { "stripe-signature": await signature(text) },
        body: text,
      }),
      env,
    );
    expect(result.status).toBe(200);
    const child = await env.CHECKOUT_DB?.prepare(
      "SELECT status,review_reason FROM checkout_orders WHERE kind='bundle'",
    ).first();
    expect(child).toEqual({
      status: "paid",
      review_reason: "parent_revoked_after_bundle_payment",
    });
  });
  it("detects a chargeback even before its webhook and rejects the pair", async () => {
    const cookie = await firstPaid();
    const previous = fetch;
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) =>
      url.includes("payment_intents/")
        ? Response.json({
            status: "succeeded",
            latest_charge: { amount_refunded: 0, disputed: true },
          })
        : previous(url, init),
    );
    const state = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await state.json()).toMatchObject({
      status: "revoked",
      bundleAvailable: false,
    });
  });
  it("does not send the browser to a stale bundle session after the 60-minute payment deadline", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    await handleCheckout(request("/api/checkout/bundle", payload, cookie), env);
    await env.CHECKOUT_DB?.prepare(
      "UPDATE checkout_orders SET created_at = ? WHERE kind = 'bundle'",
    )
      .bind(Date.now() - 3600001)
      .run();
    const retry = await handleCheckout(
      request("/api/checkout/bundle", payload, cookie),
      env,
    );
    expect(retry.status).toBe(409);
    expect(await retry.json()).toEqual({ error: "order_expired" });
    expect(createdBodies).toHaveLength(2);
    const fresh = await handleCheckout(
      request(
        "/api/checkout/bundle",
        { ...payload, requestId: crypto.randomUUID() },
        cookie,
      ),
      env,
    );
    expect(fresh.status).toBe(200);
    expect(createdBodies).toHaveLength(3);
    const old = await handleCheckout(
      request("/api/checkout/bundle", payload, cookie),
      env,
    );
    expect(old.status).toBe(409);
  });
  it("does not mark a refunded bundle paid when its completion event arrives after the refund", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    await handleCheckout(request("/api/checkout/bundle", payload, cookie), env);
    const before = await env.CHECKOUT_DB?.prepare(
      "SELECT stripe_payment_intent,status FROM checkout_orders WHERE kind='bundle'",
    ).first();
    expect(before).toEqual({ stripe_payment_intent: null, status: "pending" });
    const refund = JSON.stringify({
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_cs_test_2" } },
    });
    expect(
      (
        await handleCheckout(
          new Request(`${origin}/webhooks/stripe`, {
            method: "POST",
            headers: { "stripe-signature": await signature(refund) },
            body: refund,
          }),
          env,
        )
      ).status,
    ).toBe(200);
    const previous = fetch;
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) =>
      url.includes("payment_intents/pi_cs_test_2")
        ? Response.json({
            status: "succeeded",
            latest_charge: { amount_refunded: 9700, disputed: false },
          })
        : previous(url, init),
    );
    const session = sessions.get("cs_test_2");
    if (!session) throw new Error("missing bundle");
    session.status = "complete";
    session.payment_status = "paid";
    const completed = JSON.stringify({
      type: "checkout.session.completed",
      data: { object: session },
    });
    const result = await handleCheckout(
      new Request(`${origin}/webhooks/stripe`, {
        method: "POST",
        headers: { "stripe-signature": await signature(completed) },
        body: completed,
      }),
      env,
    );
    expect(result.status).toBe(200);
    const state = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_2", undefined, cookie),
      env,
    );
    expect(await state.json()).toMatchObject({
      status: "revoked",
      kind: "bundle",
      bundleAvailable: false,
    });
    expect(
      await env.CHECKOUT_DB?.prepare(
        "SELECT status,paid_at FROM checkout_orders WHERE kind='bundle'",
      ).first(),
    ).toEqual({ status: "revoked", paid_at: null });
  });
  it("revalidates a cached paid bundle against a later refund even without the refund webhook", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    await handleCheckout(request("/api/checkout/bundle", payload, cookie), env);
    const session = sessions.get("cs_test_2");
    if (!session) throw new Error("missing bundle");
    session.status = "complete";
    session.payment_status = "paid";
    expect(
      await (
        await handleCheckout(
          request(
            "/api/checkout/status?session_id=cs_test_2",
            undefined,
            cookie,
          ),
          env,
        )
      ).json(),
    ).toMatchObject({ status: "paid" });
    const previous = fetch;
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) =>
      url.includes("payment_intents/pi_cs_test_2")
        ? Response.json({
            status: "succeeded",
            latest_charge: { amount_refunded: 9700, disputed: false },
          })
        : previous(url, init),
    );
    const state = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_2", undefined, cookie),
      env,
    );
    expect(await state.json()).toMatchObject({
      status: "revoked",
      kind: "bundle",
      bundleAvailable: false,
    });
  });
  it("rejects forged, altered and stale webhook signatures", async () => {
    const text = '{"type":"unknown","data":{}}';
    const signed = await signature(text);
    expect(await verifyStripeSignature(text, signed, "whsec_fixture")).toBe(
      true,
    );
    expect(
      await verifyStripeSignature(`${text} `, signed, "whsec_fixture"),
    ).toBe(false);
    expect(
      await verifyStripeSignature(
        text,
        await signature(text, 1000),
        "whsec_fixture",
      ),
    ).toBe(false);
    const result = await handleCheckout(
      new Request(`${origin}/webhooks/stripe`, {
        method: "POST",
        body: text,
        headers: { "stripe-signature": "forged" },
      }),
      env,
    );
    expect(result.status).toBe(400);
  });
});
