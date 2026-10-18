export const CONSENT_VERSION = "pcos-d27-2026-10-18";
export const TERMS_VERSION = "2.4";
export const PRODUCTS = [
  { code: "ebook-01", title: "Suplementy w PMOS (PCOS)" },
  { code: "ebook-02", title: "Badania, które mają sens" },
  {
    code: "ebook-03",
    title: "Szczupła, a jednak PMOS (PCOS)",
  },
] as const;
type ProductCode = (typeof PRODUCTS)[number]["code"];
type Kind = "single" | "bundle";
type Status = "pending" | "paid" | "expired" | "revoked";
interface CheckoutStatement {
  bind(...values: unknown[]): CheckoutStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface CheckoutDatabase {
  prepare(query: string): CheckoutStatement;
}
export interface CheckoutEnvironment {
  CHECKOUT_DB?: CheckoutDatabase;
  CHECKOUT_ENABLED: string;
  CHECKOUT_SITE_ORIGIN: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_EBOOK_01: string;
  STRIPE_PRICE_EBOOK_02: string;
  STRIPE_PRICE_EBOOK_03: string;
  STRIPE_PAIR_COUPON: string;
}
interface Order {
  id: string;
  request_id: string;
  owner_hash: string;
  kind: Kind;
  parent_order_id: string | null;
  product_codes: string;
  customer_name: string;
  customer_email: string;
  consent_version: string;
  created_at: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  checkout_url: string | null;
  status: Status;
}
interface Submission {
  consentAccepted: true;
  consentVersion: typeof CONSENT_VERSION;
  requestId: string;
}
interface SingleSubmission extends Submission {
  productCode: ProductCode;
  customerName: string;
  email: string;
}
interface BundleSubmission extends Submission {
  parentSessionId: string;
}
interface StripeSession {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  client_reference_id: string | null;
  payment_intent: string | null;
}
class CheckoutError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
const COOKIE_NAME = "__Host-ola_checkout";
const MAX_BODY = 64 * 1024;
const UUID =
  /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const encoder = new TextEncoder();

export function consentText(kind: Kind): string {
  const noun = kind === "single" ? "e-booka" : "e-booków";
  return `Akceptuję Regulamin i oświadczam, że mam ukończone 18 lat. Zgadzam się na dostarczenie ${noun} przed upływem 14 dni na odstąpienie od umowy i przyjmuję do wiadomości, że po dostarczeniu ${noun} utracę prawo odstąpienia od umowy.`;
}
export function remainingProducts(
  code: ProductCode,
): [ProductCode, ProductCode] {
  switch (code) {
    case "ebook-01":
      return ["ebook-02", "ebook-03"];
    case "ebook-02":
      return ["ebook-01", "ebook-03"];
    case "ebook-03":
      return ["ebook-01", "ebook-02"];
  }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function productCode(value: unknown): ProductCode {
  if (value === "ebook-01" || value === "ebook-02" || value === "ebook-03")
    return value;
  throw new CheckoutError("invalid_product");
}
function submission(value: unknown): Submission {
  if (
    !isRecord(value) ||
    value.consentAccepted !== true ||
    value.consentVersion !== CONSENT_VERSION ||
    typeof value.requestId !== "string" ||
    !UUID.test(value.requestId)
  )
    throw new CheckoutError("invalid_consent_or_request");
  return {
    consentAccepted: true,
    consentVersion: CONSENT_VERSION,
    requestId: value.requestId,
  };
}
function singleSubmission(value: unknown): SingleSubmission {
  const base = submission(value);
  if (
    !isRecord(value) ||
    typeof value.customerName !== "string" ||
    typeof value.email !== "string"
  )
    throw new CheckoutError("invalid_customer");
  const customerName = value.customerName.trim();
  const email = value.email.trim();
  if (
    !customerName ||
    customerName.length > 160 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    throw new CheckoutError("invalid_customer");
  return {
    ...base,
    productCode: productCode(value.productCode),
    customerName,
    email,
  };
}
function bundleSubmission(value: unknown): BundleSubmission {
  const base = submission(value);
  if (
    !isRecord(value) ||
    typeof value.parentSessionId !== "string" ||
    !/^cs_[a-zA-Z0-9_]+$/.test(value.parentSessionId)
  )
    throw new CheckoutError("invalid_parent");
  return { ...base, parentSessionId: value.parentSessionId };
}
function orderCodes(order: Order): ProductCode[] {
  const value: unknown = JSON.parse(order.product_codes);
  if (!Array.isArray(value)) throw new CheckoutError("invalid_order", 500);
  return value.map(productCode);
}
async function bodyText(request: Request): Promise<string> {
  if (!request.body) throw new CheckoutError("empty_body");
  const reader = request.body.getReader();
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > MAX_BODY) {
      await reader.cancel();
      throw new CheckoutError("body_too_large", 413);
    }
    chunks.push(value);
  }
  const payload = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    payload.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(payload);
}
async function jsonBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new CheckoutError("invalid_content_type", 415);
  try {
    return JSON.parse(await bodyText(request));
  } catch (error) {
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError("invalid_json");
  }
}
async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
function cookieToken(request: Request): string | null {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  return token && /^[a-f\d]{64}$/.test(token) ? token : null;
}
function newToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
function response(data: unknown, status = 200, cookie?: string): Response {
  const headers = new Headers({
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  if (cookie)
    headers.set(
      "set-cookie",
      `${COOKIE_NAME}=${cookie}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`,
    );
  return new Response(JSON.stringify(data), { status, headers });
}
function priceId(env: CheckoutEnvironment, code: ProductCode): string {
  switch (code) {
    case "ebook-01":
      return env.STRIPE_PRICE_EBOOK_01;
    case "ebook-02":
      return env.STRIPE_PRICE_EBOOK_02;
    case "ebook-03":
      return env.STRIPE_PRICE_EBOOK_03;
  }
}
function database(env: CheckoutEnvironment): CheckoutDatabase {
  if (!env.CHECKOUT_DB) throw new CheckoutError("checkout_unconfigured", 503);
  return env.CHECKOUT_DB;
}
function configured(env: CheckoutEnvironment): boolean {
  return Boolean(
    env.CHECKOUT_DB &&
    env.STRIPE_SECRET_KEY &&
    env.STRIPE_WEBHOOK_SECRET &&
    env.STRIPE_PRICE_EBOOK_01 &&
    env.STRIPE_PRICE_EBOOK_02 &&
    env.STRIPE_PRICE_EBOOK_03 &&
    env.STRIPE_PAIR_COUPON &&
    /^https:\/\//.test(env.CHECKOUT_SITE_ORIGIN),
  );
}
function parseSession(value: unknown): StripeSession {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !(value.url === null || typeof value.url === "string") ||
    !(
      value.status === "open" ||
      value.status === "complete" ||
      value.status === "expired"
    ) ||
    typeof value.payment_status !== "string" ||
    !(value.amount_total === null || typeof value.amount_total === "number") ||
    !(value.currency === null || typeof value.currency === "string") ||
    !(
      value.client_reference_id === null ||
      typeof value.client_reference_id === "string"
    )
  )
    throw new CheckoutError("invalid_stripe_response", 502);
  return {
    id: value.id,
    url: value.url,
    status: value.status,
    payment_status: value.payment_status,
    amount_total: value.amount_total,
    currency: value.currency,
    client_reference_id: value.client_reference_id,
    payment_intent:
      typeof value.payment_intent === "string" ? value.payment_intent : null,
  };
}
async function stripe(
  env: CheckoutEnvironment,
  path: string,
  body?: URLSearchParams,
  key?: string,
): Promise<unknown> {
  const headers = new Headers({
    authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Stripe-Version": "2026-08-26.dahlia",
  });
  if (body) headers.set("content-type", "application/x-www-form-urlencoded");
  if (key) headers.set("Idempotency-Key", key);
  const result = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers,
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok) throw new CheckoutError("payment_provider_unavailable", 502);
  return result.json();
}
async function findOrder(
  db: CheckoutDatabase | undefined,
  field: "id" | "stripe_session_id",
  value: string,
  owner?: string,
): Promise<Order | null> {
  if (!db) throw new CheckoutError("checkout_unconfigured", 503);
  const query = `SELECT * FROM checkout_orders WHERE ${field} = ?${owner ? " AND owner_hash = ?" : ""}`;
  return db
    .prepare(query)
    .bind(...(owner ? [value, owner] : [value]))
    .first<Order>();
}
async function reconcile(
  env: CheckoutEnvironment,
  order: Order,
  session: StripeSession,
): Promise<Order> {
  if (
    session.id !== order.stripe_session_id ||
    session.client_reference_id !== order.id ||
    session.currency !== "pln" ||
    session.amount_total !== 9700
  )
    throw new CheckoutError("payment_mismatch", 409);
  if (order.status === "revoked") return order;
  if (session.payment_status === "paid" && session.status === "complete") {
    if (!session.payment_intent)
      throw new CheckoutError("payment_requires_review", 409);
    if (await paymentRevoked(env, session.payment_intent)) {
      await database(env)
        .prepare(
          "UPDATE checkout_orders SET stripe_payment_intent = ? WHERE id = ?",
        )
        .bind(session.payment_intent, order.id)
        .run();
      await revokeOrder(env, order);
      return {
        ...order,
        status: "revoked",
        stripe_payment_intent: session.payment_intent,
      };
    }
    await database(env)
      .prepare(
        "UPDATE checkout_orders SET status = 'paid', paid_at = COALESCE(paid_at, ?), stripe_payment_intent = ? WHERE id = ? AND status != 'revoked'",
      )
      .bind(Date.now(), session.payment_intent, order.id)
      .run();
    const current = await findOrder(env.CHECKOUT_DB, "id", order.id);
    if (!current) throw new CheckoutError("order_not_found", 404);
    return current;
  }
  if (session.status === "expired" && order.status !== "paid") {
    await database(env)
      .prepare(
        "UPDATE checkout_orders SET status = 'expired' WHERE id = ? AND status = 'pending'",
      )
      .bind(order.id)
      .run();
    const current = await findOrder(env.CHECKOUT_DB, "id", order.id);
    if (!current) throw new CheckoutError("order_not_found", 404);
    return current;
  }
  return order;
}
async function refreshed(
  env: CheckoutEnvironment,
  order: Order,
): Promise<Order> {
  if (!order.stripe_session_id || order.status !== "pending") return order;
  return reconcile(
    env,
    order,
    parseSession(
      await stripe(
        env,
        `checkout/sessions/${encodeURIComponent(order.stripe_session_id)}`,
      ),
    ),
  );
}
async function createSession(
  env: CheckoutEnvironment,
  order: Order,
): Promise<string> {
  if (order.status === "pending" && Date.now() >= order.created_at + 3600000) {
    await expireOrder(env, order);
    throw new CheckoutError("order_expired", 409);
  }
  if (order.checkout_url) {
    if (order.status !== "pending")
      throw new CheckoutError("order_already_finished", 409);
    return order.checkout_url;
  }
  if (Date.now() - order.created_at > 30 * 60000)
    throw new CheckoutError("order_requires_review", 409);
  if (order.parent_order_id) {
    const parent = await findOrder(
      env.CHECKOUT_DB,
      "id",
      order.parent_order_id,
    );
    if (parent?.status !== "paid")
      throw new CheckoutError("parent_not_paid", 409);
  }
  const successPath =
    order.kind === "single" ? "/po-zakupie/" : "/zamowienie/potwierdzenie/";
  const params = new URLSearchParams({
    mode: "payment",
    locale: "pl",
    submit_type: "pay",
    customer_email: order.customer_email,
    client_reference_id: order.id,
    success_url: `${env.CHECKOUT_SITE_ORIGIN}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CHECKOUT_SITE_ORIGIN}${order.kind === "single" ? `/zamowienie/?produkt=${orderCodes(order)[0]}` : `/po-zakupie/?session_id=${await parentSession(env, order)}`}`,
    "metadata[order_id]": order.id,
  });
  params.set("expires_at", String(Math.floor(order.created_at / 1000) + 3600));
  params.set("adaptive_pricing[enabled]", "false");
  params.set(
    "custom_text[submit][message]",
    "Płacisz za zamówienie złożone w Wellbiz sp. z o.o. Potwierdzenie wyślemy na Twój adres e-mail.",
  );
  const integrationSuffix = order.id
    .replaceAll("-", "")
    .slice(0, 8)
    .split("")
    .map((digit) => String.fromCharCode(97 + Number.parseInt(digit, 16)))
    .join("");
  params.set("integration_identifier", `ola-checkout-${integrationSuffix}`);
  params.set("metadata[regulamin_version]", TERMS_VERSION);
  params.set("metadata[z2]", "true");
  params.set("metadata[z2_text_version]", CONSENT_VERSION);
  params.set("metadata[consent_ts]", new Date(order.created_at).toISOString());
  for (const [index, code] of orderCodes(order).entries()) {
    params.set(`line_items[${index}][price]`, priceId(env, code));
    params.set(`line_items[${index}][quantity]`, "1");
  }
  if (order.kind === "bundle")
    params.set("discounts[0][coupon]", env.STRIPE_PAIR_COUPON);
  const session = parseSession(
    await stripe(env, "checkout/sessions", params, `checkout-${order.id}`),
  );
  if (!session.url || !session.url.startsWith("https://checkout.stripe.com/"))
    throw new CheckoutError("invalid_checkout_url", 502);
  if (
    session.amount_total !== 9700 ||
    session.currency !== "pln" ||
    session.client_reference_id !== order.id
  )
    throw new CheckoutError("payment_configuration_mismatch", 502);
  await database(env)
    .prepare(
      "UPDATE checkout_orders SET stripe_session_id = ?, checkout_url = ? WHERE id = ? AND stripe_session_id IS NULL",
    )
    .bind(session.id, session.url, order.id)
    .run();
  if (order.parent_order_id) {
    const parent = await findOrder(
      env.CHECKOUT_DB,
      "id",
      order.parent_order_id,
    );
    if (parent?.status !== "paid") {
      await expireOrder(env, {
        ...order,
        stripe_session_id: session.id,
        checkout_url: session.url,
      });
      throw new CheckoutError("parent_not_paid", 409);
    }
  }
  return session.url;
}
async function expireOrder(
  env: CheckoutEnvironment,
  order: Order,
): Promise<void> {
  if (!order.stripe_session_id) {
    await database(env)
      .prepare(
        "UPDATE checkout_orders SET status='expired' WHERE id=? AND status='pending'",
      )
      .bind(order.id)
      .run();
    return;
  }
  let session: StripeSession;
  try {
    session = parseSession(
      await stripe(
        env,
        `checkout/sessions/${encodeURIComponent(order.stripe_session_id)}/expire`,
        new URLSearchParams(),
        `expire-${order.id}`,
      ),
    );
  } catch {
    session = parseSession(
      await stripe(
        env,
        `checkout/sessions/${encodeURIComponent(order.stripe_session_id)}`,
      ),
    );
  }
  const updated = await reconcile(env, order, session);
  if (updated.status === "pending")
    throw new CheckoutError("payment_requires_review", 409);
}
async function revokeOrder(
  env: CheckoutEnvironment,
  order: Order,
): Promise<void> {
  await database(env)
    .prepare("UPDATE checkout_orders SET status='revoked' WHERE id=?")
    .bind(order.id)
    .run();
  const child = await database(env)
    .prepare(
      "SELECT * FROM checkout_orders WHERE parent_order_id=? AND status!='expired'",
    )
    .bind(order.id)
    .first<Order>();
  if (!child) return;
  if (child.status === "pending") await expireOrder(env, child);
  const current = await findOrder(env.CHECKOUT_DB, "id", child.id);
  if (current?.status === "paid")
    await database(env)
      .prepare(
        "UPDATE checkout_orders SET review_reason='parent_revoked_after_bundle_payment' WHERE id=?",
      )
      .bind(child.id)
      .run();
}
async function paymentRevoked(
  env: CheckoutEnvironment,
  paymentIntentId: string,
): Promise<boolean> {
  const payment = await stripe(
    env,
    `payment_intents/${encodeURIComponent(paymentIntentId)}?expand[]=latest_charge`,
  );
  if (
    !isRecord(payment) ||
    !isRecord(payment.latest_charge) ||
    typeof payment.latest_charge.amount_refunded !== "number" ||
    typeof payment.latest_charge.disputed !== "boolean"
  )
    throw new CheckoutError("invalid_stripe_response", 502);
  return (
    payment.status !== "succeeded" ||
    payment.latest_charge.amount_refunded > 0 ||
    payment.latest_charge.disputed
  );
}
async function validatePayment(
  env: CheckoutEnvironment,
  order: Order,
): Promise<Order> {
  if (order.status !== "paid") return order;
  const current = await findOrder(env.CHECKOUT_DB, "id", order.id);
  if (!current?.stripe_payment_intent)
    throw new CheckoutError("payment_requires_review", 409);
  if (current.status !== "paid") return current;
  if (await paymentRevoked(env, current.stripe_payment_intent)) {
    await revokeOrder(env, order);
    return { ...order, status: "revoked" };
  }
  return order;
}
async function parentSession(
  env: CheckoutEnvironment,
  order: Order,
): Promise<string> {
  if (!order.parent_order_id) throw new CheckoutError("invalid_parent", 500);
  const parent = await findOrder(env.CHECKOUT_DB, "id", order.parent_order_id);
  if (!parent?.stripe_session_id)
    throw new CheckoutError("invalid_parent", 500);
  return parent.stripe_session_id;
}
async function insertOrder(
  env: CheckoutEnvironment,
  owner: string,
  input: SingleSubmission | BundleSubmission,
  parent: Order | null,
): Promise<Order> {
  const kind = parent ? "bundle" : "single";
  let codes: ProductCode[];
  let name: string;
  let email: string;
  if ("productCode" in input) {
    codes = [input.productCode];
    name = input.customerName;
    email = input.email;
  } else if (parent) {
    codes = remainingProducts(productCode(orderCodes(parent)[0]));
    name = parent.customer_name;
    email = parent.customer_email;
  } else throw new CheckoutError("invalid_parent");
  const previous = await database(env)
    .prepare(
      "SELECT * FROM checkout_orders WHERE owner_hash=? AND request_id=?",
    )
    .bind(owner, input.requestId)
    .first<Order>();
  if (previous?.status === "expired")
    throw new CheckoutError("order_expired", 409);
  const id = crypto.randomUUID();
  const snapshot = JSON.stringify({
    products: codes.map((code) => ({
      code,
      title: PRODUCTS.find((product) => product.code === code)?.title,
      amount: kind === "single" ? 9700 : 4850,
    })),
    amount: 9700,
    currency: "pln",
    consentText: consentText(kind),
    termsVersion: TERMS_VERSION,
  });
  await database(env)
    .prepare(
      "INSERT INTO checkout_orders (id, request_id, owner_hash, kind, parent_order_id, product_codes, customer_name, customer_email, consent_version, consent_text, terms_version, amount, currency, snapshot, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 9700, 'pln', ?, ?) ON CONFLICT DO NOTHING",
    )
    .bind(
      id,
      input.requestId,
      owner,
      kind,
      parent?.id ?? null,
      JSON.stringify(codes),
      name,
      email,
      CONSENT_VERSION,
      consentText(kind),
      TERMS_VERSION,
      snapshot,
      Date.now(),
    )
    .run();
  const order = parent
    ? await database(env)
        .prepare(
          "SELECT * FROM checkout_orders WHERE parent_order_id = ? AND owner_hash = ? AND status != 'expired'",
        )
        .bind(parent.id, owner)
        .first<Order>()
    : await database(env)
        .prepare(
          "SELECT * FROM checkout_orders WHERE owner_hash = ? AND request_id = ?",
        )
        .bind(owner, input.requestId)
        .first<Order>();
  if (
    !order ||
    order.kind !== kind ||
    order.product_codes !== JSON.stringify(codes) ||
    order.customer_email !== email ||
    order.customer_name !== name ||
    order.consent_version !== CONSENT_VERSION
  )
    throw new CheckoutError("request_conflict", 409);
  return order;
}
export async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  const parts = signature.split(",");
  const time = parts.find((part) => part.startsWith("t="))?.slice(2);
  if (!time || !/^\d+$/.test(time) || Math.abs(now / 1000 - Number(time)) > 300)
    return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  for (const part of parts.filter((part) => part.startsWith("v1="))) {
    const hex = part.slice(3);
    if (!/^[a-f\d]{64}$/i.test(hex)) continue;
    const bytes = Uint8Array.from(hex.match(/../g) ?? [], (byte) =>
      Number.parseInt(byte, 16),
    );
    if (
      await crypto.subtle.verify(
        "HMAC",
        key,
        bytes,
        encoder.encode(`${time}.${payload}`),
      )
    )
      return true;
  }
  return false;
}
async function webhook(
  request: Request,
  env: CheckoutEnvironment,
): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.CHECKOUT_DB)
    throw new CheckoutError("checkout_unconfigured", 503);
  const text = await bodyText(request);
  if (
    !(await verifyStripeSignature(
      text,
      request.headers.get("stripe-signature") ?? "",
      env.STRIPE_WEBHOOK_SECRET,
    ))
  )
    throw new CheckoutError("invalid_signature", 400);
  let event: unknown;
  try {
    event = JSON.parse(text);
  } catch {
    throw new CheckoutError("invalid_event");
  }
  if (
    !isRecord(event) ||
    typeof event.type !== "string" ||
    !isRecord(event.data)
  )
    throw new CheckoutError("invalid_event");
  if (["charge.refunded", "charge.dispute.created"].includes(event.type)) {
    const object = event.data.object;
    if (!isRecord(object) || typeof object.payment_intent !== "string")
      throw new CheckoutError("invalid_event");
    const order = await database(env)
      .prepare("SELECT * FROM checkout_orders WHERE stripe_payment_intent = ?")
      .bind(object.payment_intent)
      .first<Order>();
    if (order) await revokeOrder(env, order);
    return response({ received: true });
  }
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.expired",
    ].includes(event.type)
  )
    return response({ received: true });
  const session = parseSession(event.data.object);
  const order = await findOrder(
    env.CHECKOUT_DB,
    "stripe_session_id",
    session.id,
  );
  if (!order) throw new CheckoutError("order_not_ready", 503);
  await reconcile(env, order, session);
  return response({ received: true });
}
export async function handleCheckout(
  request: Request,
  env: CheckoutEnvironment,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/webhooks/stripe" && request.method === "POST")
      return await webhook(request, env);
    if (url.pathname === "/api/checkout/catalog" && request.method === "GET")
      return response(
        {
          enabled: env.CHECKOUT_ENABLED === "true" && configured(env),
          consentVersion: CONSENT_VERSION,
          singleAmount: 9700,
          bundleAmount: 9700,
          currency: "pln",
          products: PRODUCTS.map(({ code, title }) => ({ code, title })),
        },
        200,
        cookieToken(request) ?? newToken(),
      );
    if (!configured(env)) throw new CheckoutError("checkout_unconfigured", 503);
    const existing = cookieToken(request);
    const owner = existing ? await sha256(existing) : null;
    if (url.pathname === "/api/checkout/status" && request.method === "GET") {
      const sessionId = url.searchParams.get("session_id");
      if (!owner || !sessionId) throw new CheckoutError("order_not_found", 404);
      const stored = await findOrder(
        env.CHECKOUT_DB,
        "stripe_session_id",
        sessionId,
        owner,
      );
      if (!stored) throw new CheckoutError("order_not_found", 404);
      const refreshedOrder = await refreshed(env, stored);
      const order = await validatePayment(env, refreshedOrder);
      const codes = orderCodes(order);
      const bundle = await database(env)
        .prepare(
          "SELECT status FROM checkout_orders WHERE parent_order_id = ? AND status != 'expired'",
        )
        .bind(order.id)
        .first<{ status: Status }>();
      return response({
        status: order.status,
        kind: order.kind,
        productCodes: codes,
        remainingProductCodes:
          order.kind === "single"
            ? remainingProducts(productCode(codes[0]))
            : [],
        bundleAvailable:
          order.kind === "single" &&
          order.status === "paid" &&
          (!bundle || bundle.status === "pending"),
      });
    }
    if (
      request.method !== "POST" ||
      !["/api/checkout/orders", "/api/checkout/bundle"].includes(url.pathname)
    )
      return response({ error: "not_found" }, 404);
    if (
      request.headers.get("origin") !== env.CHECKOUT_SITE_ORIGIN ||
      url.origin !== env.CHECKOUT_SITE_ORIGIN
    )
      throw new CheckoutError("invalid_origin", 403);
    if (env.CHECKOUT_ENABLED !== "true")
      throw new CheckoutError("sales_not_enabled", 503);
    const payload = await jsonBody(request);
    if (url.pathname === "/api/checkout/orders") {
      const input = singleSubmission(payload);
      if (!existing || !owner)
        throw new CheckoutError("checkout_session_required", 409);
      const token = existing;
      const order = await insertOrder(
        env,
        owner ?? (await sha256(token)),
        input,
        null,
      );
      return response(
        { checkoutUrl: await createSession(env, order) },
        200,
        token,
      );
    }
    const input = bundleSubmission(payload);
    if (!owner) throw new CheckoutError("order_not_found", 404);
    const stored = await findOrder(
      env.CHECKOUT_DB,
      "stripe_session_id",
      input.parentSessionId,
      owner,
    );
    if (!stored || stored.kind !== "single")
      throw new CheckoutError("order_not_found", 404);
    const parent = await validatePayment(env, await refreshed(env, stored));
    if (parent.status !== "paid")
      throw new CheckoutError("parent_not_paid", 409);
    const active = await database(env)
      .prepare(
        "SELECT * FROM checkout_orders WHERE parent_order_id=? AND status='pending'",
      )
      .bind(parent.id)
      .first<Order>();
    if (active && Date.now() >= active.created_at + 3600000)
      await expireOrder(env, active);
    const order = await insertOrder(env, owner, input, parent);
    return response({ checkoutUrl: await createSession(env, order) });
  } catch (error) {
    return response(
      {
        error:
          error instanceof CheckoutError ? error.code : "checkout_unavailable",
      },
      error instanceof CheckoutError ? error.status : 503,
    );
  }
}
