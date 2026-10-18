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
  OFFER_EMAIL_REQUEST_VERSION,
  OFFER_EMAIL_REQUEST_TEXT,
  handleCheckout,
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
const initialProducts = [
  {
    productCode: "ebook-01",
    title: "Suplementy",
    stripePriceId: "price_01",
    priceGross: 97,
    availability: "available",
  },
  {
    productCode: "ebook-02",
    title: "Badania",
    stripePriceId: "price_02",
    priceGross: 97,
    availability: "available",
  },
  {
    productCode: "ebook-03",
    title: "Szczupła",
    stripePriceId: "price_03",
    priceGross: 97,
    availability: "available",
  },
];
function initialCatalog() {
  return initialProducts.map((product) => ({
    ...product,
    crossSell: {
      products: initialProducts.filter(
        (other) => other.productCode !== product.productCode,
      ),
      kicker: "Dwa kolejne kroki",
      title: "Uzupełnij swoją bibliotekę",
      lead: "Dwa uzupełniające poradniki w pakiecie.",
      stripeCouponId: "coupon_pair",
    },
  }));
}
let cmsCatalog = initialCatalog();
let cmsSalesState: unknown = "ready";
let chargedAt = Math.floor(Date.now() / 1000);

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
  await db.exec(
    (
      await readFile(
        new URL(
          "../../worker/migrations/0002_offer_email_requests.sql",
          import.meta.url,
        ),
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
    CHECKOUT_SANITY_PROJECT_ID: "projectfixture",
    CHECKOUT_SANITY_DATASET: "production",
  };
});
afterAll(async () => {
  await runtime.dispose();
});
beforeEach(async () => {
  await env.CHECKOUT_DB?.prepare(
    "DELETE FROM checkout_offer_email_requests",
  ).run();
  await env.CHECKOUT_DB?.prepare("DELETE FROM checkout_orders").run();
  sessions.clear();
  createdBodies.length = 0;
  createdHeaders.length = 0;
  idempotency.clear();
  nextId = 0;
  cmsCatalog = initialCatalog();
  cmsSalesState = "ready";
  chargedAt = Math.floor(Date.now() / 1000);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const parsedUrl = new URL(input);
      const path = parsedUrl.pathname;
      if (parsedUrl.hostname.endsWith(".api.sanity.io"))
        return Response.json({
          result: parsedUrl.searchParams.get("query")?.includes("].salesState")
            ? cmsSalesState
            : cmsCatalog,
        });
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
          latest_charge: {
            amount_refunded: 0,
            disputed: false,
            created: chargedAt,
          },
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
async function firstPaid(code = "ebook-01", bundleAvailable = true) {
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
    bundleAvailable,
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
      const expected = initialProducts
        .filter((product) => product.productCode !== code)
        .map((product) => product.stripePriceId);
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
            latest_charge: {
              amount_refunded: 0,
              disputed: true,
              created: chargedAt,
            },
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
            latest_charge: {
              amount_refunded: 9700,
              disputed: false,
              created: chargedAt,
            },
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
            latest_charge: {
              amount_refunded: 9700,
              disputed: false,
              created: chargedAt,
            },
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
  it("uses a configured future-series pair, offer copy and coupon instead of PCOS complements", async () => {
    const future = [
      {
        productCode: "perimenopause-01",
        title: "Pierwszy poradnik",
        stripePriceId: "price_future1",
        priceGross: 97,
        availability: "available",
      },
      {
        productCode: "perimenopause-02",
        title: "Drugi poradnik",
        stripePriceId: "price_future2",
        priceGross: 97,
        availability: "available",
      },
      {
        productCode: "perimenopause-03",
        title: "Trzeci poradnik",
        stripePriceId: "price_future3",
        priceGross: 97,
        availability: "available",
      },
    ];
    cmsCatalog = future.map((product) => ({
      ...product,
      crossSell: {
        products: future
          .filter((other) => other.productCode !== product.productCode)
          .reverse(),
        kicker: "Twój kolejny krok",
        title: "Poznaj cały temat",
        lead: "Dwa poradniki, jedna cena.",
        stripeCouponId: "future_coupon",
      },
    }));
    const cookie = await firstPaid("perimenopause-01");
    cmsCatalog = initialCatalog();
    const state = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await state.json()).toMatchObject({
      remainingProductCodes: ["perimenopause-03", "perimenopause-02"],
      offer: {
        kicker: "Twój kolejny krok",
        title: "Poznaj cały temat",
        lead: "Dwa poradniki, jedna cena.",
        originalAmount: 19400,
        bundleAmount: 9700,
        currency: "pln",
      },
    });
    const result = await handleCheckout(
      request(
        "/api/checkout/bundle",
        {
          parentSessionId: "cs_test_1",
          consentAccepted: true,
          consentVersion: CONSENT_VERSION,
          requestId: crypto.randomUUID(),
          productCodes: ["ebook-02", "ebook-03"],
        },
        cookie,
      ),
      env,
    );
    expect(result.status).toBe(200);
    expect(createdBodies[1]?.get("line_items[0][price]")).toBe("price_future3");
    expect(createdBodies[1]?.get("line_items[1][price]")).toBe("price_future2");
    expect(createdBodies[1]?.get("discounts[0][coupon]")).toBe("future_coupon");
    expect(createdBodies[1]?.get("success_url")).toBe(
      `${origin}/zamowienie/potwierdzenie/?session_id={CHECKOUT_SESSION_ID}`,
    );
  });
  it("counts seven days from Stripe payment time and rejects new discounted orders after that deadline", async () => {
    chargedAt = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 - 1;
    const cookie = await firstPaid("ebook-01", false);
    const state = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await state.json()).toMatchObject({
      offer: {
        expiresAt: new Date(
          (chargedAt + 7 * 24 * 60 * 60) * 1000,
        ).toISOString(),
      },
      bundleAvailable: false,
    });
    const result = await handleCheckout(
      request(
        "/api/checkout/bundle",
        {
          parentSessionId: "cs_test_1",
          consentAccepted: true,
          consentVersion: CONSENT_VERSION,
          requestId: crypto.randomUUID(),
        },
        cookie,
      ),
      env,
    );
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ error: "offer_expired" });
    expect(createdBodies).toHaveLength(1);
  });
  it("allows an already accepted bundle session to finish after the offer deadline without creating a new order", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      consentAccepted: true,
      consentVersion: CONSENT_VERSION,
      requestId: crypto.randomUUID(),
    };
    const initial = await handleCheckout(
      request("/api/checkout/bundle", payload, cookie),
      env,
    );
    expect(initial.status).toBe(200);
    await env.CHECKOUT_DB?.prepare(
      "UPDATE checkout_orders SET paid_at=? WHERE kind='single'",
    )
      .bind(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1)
      .run();
    const repeated = await handleCheckout(
      request("/api/checkout/bundle", payload, cookie),
      env,
    );
    expect(repeated.status).toBe(200);
    expect(await repeated.json()).toEqual(await initial.json());
    expect(createdBodies).toHaveLength(2);
    const fresh = await handleCheckout(
      request(
        "/api/checkout/bundle",
        { ...payload, requestId: crypto.randomUUID() },
        cookie,
      ),
      env,
    );
    expect(fresh.status).toBe(409);
    expect(await fresh.json()).toEqual({ error: "offer_expired" });
    const pair = sessions.get("cs_test_2");
    if (!pair) throw new Error("missing pair");
    pair.status = "complete";
    pair.payment_status = "paid";
    const final = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_2", undefined, cookie),
      env,
    );
    expect(await final.json()).toMatchObject({
      status: "paid",
      kind: "bundle",
    });
  });
  it("returns only public product labels from the trusted CMS catalog", async () => {
    const result = await handleCheckout(request("/api/checkout/catalog"), env);
    expect(result.status).toBe(200);
    const payload = await result.json();
    expect(payload.products).toEqual(
      initialProducts.map(({ productCode: code, title }) => ({ code, title })),
    );
    expect(JSON.stringify(payload)).not.toContain("stripePriceId");
    expect(JSON.stringify(payload)).not.toContain("coupon_pair");
  });
  it("rejects a malformed CMS pair before creating any Stripe payment", async () => {
    const first = cmsCatalog[0];
    const same = initialProducts[0];
    if (!first || !same) throw new Error("missing fixture");
    first.crossSell.products = [same, same];
    const result = await handleCheckout(
      request("/api/checkout/orders", single()),
      env,
    );
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: "invalid_catalog" });
    expect(createdBodies).toHaveLength(0);
  });
  it("reuses the accepted single-order snapshot when CMS content changes during a browser retry", async () => {
    const payload = single();
    const first = await handleCheckout(
      request("/api/checkout/orders", payload),
      env,
    );
    expect(first.status).toBe(200);
    cmsCatalog = [];
    const repeated = await handleCheckout(
      request("/api/checkout/orders", payload),
      env,
    );
    expect(repeated.status).toBe(200);
    expect(await repeated.json()).toEqual(await first.json());
    expect(createdBodies).toHaveLength(1);
  });
  it("records one explicit offer-email request with exact wording and timestamp despite concurrent retries", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      requestAccepted: true,
      requestVersion: OFFER_EMAIL_REQUEST_VERSION,
    };
    const before = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await before.json()).toMatchObject({
      offerEmailRequested: false,
      offerEmailRequestAvailable: true,
    });
    const requests = await Promise.all([
      handleCheckout(
        request("/api/checkout/offer-email-request", payload, cookie),
        env,
      ),
      handleCheckout(
        request("/api/checkout/offer-email-request", payload, cookie),
        env,
      ),
    ]);
    for (const result of requests) {
      expect(result.status).toBe(200);
      expect(await result.json()).toEqual({
        requested: true,
        deliveryPending: true,
      });
    }
    const row = await env.CHECKOUT_DB?.prepare(
      "SELECT request_version,request_text,requested_at FROM checkout_offer_email_requests",
    ).first<{
      request_version: string;
      request_text: string;
      requested_at: number;
    }>();
    expect(row).toMatchObject({
      request_version: OFFER_EMAIL_REQUEST_VERSION,
      request_text: OFFER_EMAIL_REQUEST_TEXT,
    });
    expect(row?.requested_at).toBeGreaterThan(0);
    const count = await env.CHECKOUT_DB?.prepare(
      "SELECT COUNT(*) AS count FROM checkout_offer_email_requests",
    ).first<{ count: number }>();
    expect(count?.count).toBe(1);
    const after = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await after.json()).toMatchObject({
      offerEmailRequested: true,
      offerEmailRequestAvailable: false,
    });
    expect(createdBodies).toHaveLength(1);
  });
  it("requires ownership, exact explicit request version and same-origin for an offer email", async () => {
    const cookie = await firstPaid();
    const payload = {
      parentSessionId: "cs_test_1",
      requestAccepted: true,
      requestVersion: OFFER_EMAIL_REQUEST_VERSION,
    };
    for (const changes of [
      { requestAccepted: false },
      { requestVersion: "obsolete" },
    ]) {
      const result = await handleCheckout(
        request(
          "/api/checkout/offer-email-request",
          { ...payload, ...changes },
          cookie,
        ),
        env,
      );
      expect(result.status).toBe(400);
    }
    const stranger = await handleCheckout(
      request(
        "/api/checkout/offer-email-request",
        payload,
        "__Host-ola_checkout=" + "b".repeat(64),
      ),
      env,
    );
    expect(stranger.status).toBe(404);
    const csrf = await handleCheckout(
      request(
        "/api/checkout/offer-email-request",
        payload,
        cookie,
        "https://other.example",
      ),
      env,
    );
    expect(csrf.status).toBe(403);
    const count = await env.CHECKOUT_DB?.prepare(
      "SELECT COUNT(*) AS count FROM checkout_offer_email_requests",
    ).first<{ count: number }>();
    expect(count?.count).toBe(0);
  });
  it("does not record an offer-email request for an unpaid order", async () => {
    const created = await handleCheckout(
      request("/api/checkout/orders", single()),
      env,
    );
    expect(created.status).toBe(200);
    const result = await handleCheckout(
      request("/api/checkout/offer-email-request", {
        parentSessionId: "cs_test_1",
        requestAccepted: true,
        requestVersion: OFFER_EMAIL_REQUEST_VERSION,
      }),
      env,
    );
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ error: "parent_not_paid" });
    const count = await env.CHECKOUT_DB?.prepare(
      "SELECT COUNT(*) AS count FROM checkout_offer_email_requests",
    ).first<{ count: number }>();
    expect(count?.count).toBe(0);
  });
  it("does not accept a new email request after the seven-day offer deadline", async () => {
    chargedAt = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 - 1;
    const cookie = await firstPaid("ebook-01", false);
    const result = await handleCheckout(
      request(
        "/api/checkout/offer-email-request",
        {
          parentSessionId: "cs_test_1",
          requestAccepted: true,
          requestVersion: OFFER_EMAIL_REQUEST_VERSION,
        },
        cookie,
      ),
      env,
    );
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ error: "offer_expired" });
    const status = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await status.json()).toMatchObject({
      offerEmailRequested: false,
      offerEmailRequestAvailable: false,
    });
  });
  it.each(["paused", null, "unexpected"])(
    "blocks direct single and bundle POSTs when CMS sales state is %s",
    async (state) => {
      const cookie = await firstPaid();
      cmsSalesState = state;
      const catalogResponse = await handleCheckout(
        request("/api/checkout/catalog"),
        env,
      );
      expect(await catalogResponse.json()).toMatchObject({ enabled: false });
      const first = await handleCheckout(
        request("/api/checkout/orders", single("ebook-02"), cookie),
        env,
      );
      expect(first.status).toBe(503);
      expect(await first.json()).toEqual({ error: "sales_not_enabled" });
      const bundle = await handleCheckout(
        request(
          "/api/checkout/bundle",
          {
            parentSessionId: "cs_test_1",
            consentAccepted: true,
            consentVersion: CONSENT_VERSION,
            requestId: crypto.randomUUID(),
          },
          cookie,
        ),
        env,
      );
      expect(bundle.status).toBe(503);
      expect(await bundle.json()).toEqual({ error: "sales_not_enabled" });
      expect(createdBodies).toHaveLength(1);
    },
  );
  it.each(["planned", "paused"])(
    "blocks a direct first purchase of a %s ebook while CMS sales are ready",
    async (availability) => {
      const selected = cmsCatalog[0];
      if (!selected) throw new Error("missing fixture");
      selected.availability = availability;
      const result = await handleCheckout(
        request("/api/checkout/orders", single()),
        env,
      );
      expect(result.status).toBe(409);
      expect(await result.json()).toEqual({ error: "product_unavailable" });
      expect(createdBodies).toHaveLength(0);
    },
  );
  it.each(["available", "presale"])(
    "allows a direct first purchase of an %s ebook when both gates are open",
    async (availability) => {
      const selected = cmsCatalog[0];
      if (!selected) throw new Error("missing fixture");
      selected.availability = availability;
      const result = await handleCheckout(
        request("/api/checkout/orders", single()),
        env,
      );
      expect(result.status).toBe(200);
      expect(createdBodies).toHaveLength(1);
    },
  );
  it("keeps an accepted pair snapshot eligible after CMS product availability changes", async () => {
    const cookie = await firstPaid();
    cmsCatalog.forEach((product) => {
      product.availability = "paused";
    });
    const status = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      env,
    );
    expect(await status.json()).toMatchObject({
      status: "paid",
      bundleAvailable: true,
    });
    const result = await handleCheckout(
      request(
        "/api/checkout/bundle",
        {
          parentSessionId: "cs_test_1",
          consentAccepted: true,
          consentVersion: CONSENT_VERSION,
          requestId: crypto.randomUUID(),
        },
        cookie,
      ),
      env,
    );
    expect(result.status).toBe(200);
    expect(createdBodies).toHaveLength(2);
  });
  it("does not offer email-request submission while its runtime gate rejects writes", async () => {
    const cookie = await firstPaid();
    const pausedEnv = { ...env, CHECKOUT_ENABLED: "false" };
    const before = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      pausedEnv,
    );
    expect(await before.json()).toMatchObject({
      offerEmailRequested: false,
      offerEmailRequestAvailable: false,
    });
    const payload = {
      parentSessionId: "cs_test_1",
      requestAccepted: true,
      requestVersion: OFFER_EMAIL_REQUEST_VERSION,
    };
    const blocked = await handleCheckout(
      request("/api/checkout/offer-email-request", payload, cookie),
      pausedEnv,
    );
    expect(blocked.status).toBe(503);
    expect(await blocked.json()).toEqual({ error: "sales_not_enabled" });
    const accepted = await handleCheckout(
      request("/api/checkout/offer-email-request", payload, cookie),
      env,
    );
    expect(accepted.status).toBe(200);
    const after = await handleCheckout(
      request("/api/checkout/status?session_id=cs_test_1", undefined, cookie),
      pausedEnv,
    );
    expect(await after.json()).toMatchObject({
      offerEmailRequested: true,
      offerEmailRequestAvailable: false,
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
