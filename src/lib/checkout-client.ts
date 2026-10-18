import { checkoutCopy } from "@/content/checkout-copy";

interface Catalog {
  enabled: boolean;
  consentVersion: string;
}
interface PaymentStatus {
  status: "pending" | "paid" | "expired" | "revoked";
  kind: "single" | "bundle";
  productCodes: string[];
  remainingProductCodes: string[];
  bundleAvailable: boolean;
}
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function parseCatalog(value: unknown): Catalog {
  if (
    !object(value) ||
    typeof value.enabled !== "boolean" ||
    typeof value.consentVersion !== "string"
  )
    throw new Error("Nie udało się sprawdzić dostępności sprzedaży.");
  return { enabled: value.enabled, consentVersion: value.consentVersion };
}
function stringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
function parseStatus(value: unknown): PaymentStatus {
  if (
    !object(value) ||
    (value.status !== "pending" &&
      value.status !== "paid" &&
      value.status !== "expired" &&
      value.status !== "revoked") ||
    (value.kind !== "single" && value.kind !== "bundle") ||
    !stringArray(value.productCodes) ||
    !stringArray(value.remainingProductCodes) ||
    typeof value.bundleAvailable !== "boolean"
  )
    throw new Error("Nie udało się potwierdzić płatności.");
  return {
    status: value.status,
    kind: value.kind,
    productCodes: value.productCodes,
    remainingProductCodes: value.remainingProductCodes,
    bundleAvailable: value.bundleAvailable,
  };
}
class ExpiredCheckoutError extends Error {}

async function request(path: string, body?: object): Promise<unknown> {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : {},
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    if (response.status === 409) {
      const failure: unknown = await response.json();
      if (object(failure) && failure.error === "order_expired") {
        throw new ExpiredCheckoutError(
          "Termin poprzedniej płatności minął. Zaznacz ponownie pole, żeby otworzyć nową płatność.",
        );
      }
    }
    throw new Error(
      response.status === 503 || path === "/api/checkout/catalog"
        ? checkoutCopy.unavailable
        : "Nie udało się obsłużyć zamówienia. Odśwież stronę i spróbuj ponownie.",
    );
  }
  return response.json();
}
async function initCheckout(root: HTMLElement) {
  const kind = root.dataset.checkoutKind;
  const status = root.querySelector<HTMLElement>("[data-checkout-status]");
  const content = root.querySelector<HTMLElement>("[data-checkout-content]");
  const form = root.querySelector<HTMLFormElement>("[data-checkout-form]");
  const submit = form?.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  const consent = form?.querySelector<HTMLInputElement>(
    'input[name="consentAccepted"]',
  );
  const hint = form?.querySelector<HTMLElement>("[data-consent-hint]");
  const error = form?.querySelector<HTMLElement>("[data-checkout-error]");
  if (!status || !content) return;
  const orderContent = content;
  const query = new URLSearchParams(location.search);
  const incomingSessionId = query.get("session_id");
  let sessionId = incomingSessionId;
  try {
    if (incomingSessionId)
      sessionStorage.setItem("ola.checkout.session", incomingSessionId);
    else if (kind !== "single")
      sessionId = sessionStorage.getItem("ola.checkout.session");
  } catch {
    /* Session storage can be unavailable in private browser contexts. */
  }
  const productCode = query.get("produkt");
  if (incomingSessionId) history.replaceState(null, "", location.pathname);
  const skip = root.querySelector<HTMLAnchorElement>(".checkout__skip");
  if (skip && sessionId)
    skip.href = `/zamowienie/potwierdzenie/?session_id=${encodeURIComponent(sessionId)}`;
  let ready = false;
  let submitting = false;
  function updateSubmit() {
    if (submit) submit.disabled = !ready || !consent?.checked || submitting;
    if (hint) hint.hidden = Boolean(consent?.checked);
  }
  consent?.addEventListener("change", updateSubmit);
  function showProducts(codes: string[], bundle: boolean) {
    root
      .querySelectorAll<HTMLElement>("[data-product-code]")
      .forEach((card) => {
        card.hidden = !codes.includes(card.dataset.productCode ?? "");
        const price = card.querySelector("[data-product-price]");
        if (price)
          price.textContent = bundle
            ? "48,50 zł brutto w pakiecie dwóch e-booków"
            : "97 zł brutto";
      });
    orderContent.hidden = false;
  }
  try {
    const catalog = parseCatalog(await request("/api/checkout/catalog"));
    if (kind === "single") {
      if (
        !productCode ||
        !Array.from(
          root.querySelectorAll<HTMLElement>("[data-product-code]"),
        ).some((card) => card.dataset.productCode === productCode)
      ) {
        status.textContent =
          "Wybierz e-book w katalogu, żeby przejść do zamówienia.";
        return;
      }
      showProducts([productCode], false);
      ready = catalog.enabled && root.dataset.salesState === "ready";
      status.textContent = ready
        ? "Sprawdź zamówienie przed przejściem do płatności."
        : checkoutCopy.unavailable;
    } else {
      if (!sessionId) {
        status.textContent =
          "Otwórz tę stronę przez przekierowanie z płatności, żeby sprawdzić swoje zamówienie.";
        return;
      }
      const payment = parseStatus(
        await request(
          `/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
        ),
      );
      if (payment.status !== "paid") {
        status.textContent =
          payment.status === "revoked"
            ? "Ta płatność została wycofana. Oferta uzupełnienia serii nie jest dostępna."
            : payment.status === "expired"
              ? "Ta sesja płatności wygasła. Możesz wrócić do katalogu i złożyć nowe zamówienie."
              : "Płatność nie została jeszcze potwierdzona. Sprawdź ponownie za chwilę. Nie składaj ponownie tego samego zamówienia.";
        return;
      }
      if (kind === "confirmation") {
        showProducts(payment.productCodes, payment.kind === "bundle");
        status.textContent =
          "Płatność została potwierdzona. Informacje o realizacji zamówienia otrzymasz e-mailem.";
        return;
      }
      if (
        payment.kind !== "single" ||
        !payment.bundleAvailable ||
        payment.remainingProductCodes.length !== 2
      ) {
        status.textContent =
          "Płatność została potwierdzona. Oferta uzupełnienia serii nie jest dostępna dla tego zamówienia.";
        return;
      }
      showProducts(payment.remainingProductCodes, true);
      if (skip) skip.hidden = false;
      const paidLead = root.querySelector<HTMLElement>("[data-paid-lead]");
      if (paidLead) paidLead.hidden = false;
      ready = catalog.enabled && root.dataset.salesState === "ready";
      status.textContent = ready
        ? "Płatność za pierwszy e-book została potwierdzona. Możesz dokupić pozostałe dwa razem."
        : checkoutCopy.unavailable;
    }
    updateSubmit();
    let requestId = crypto.randomUUID();
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!ready || submitting || !consent?.checked || !form.reportValidity())
        return;
      submitting = true;
      updateSubmit();
      if (error) error.hidden = true;
      try {
        const fields = new FormData(form);
        const common = {
          consentAccepted: true,
          consentVersion: catalog.consentVersion,
          requestId,
        };
        const result = await request(
          kind === "single" ? "/api/checkout/orders" : "/api/checkout/bundle",
          kind === "single"
            ? {
                ...common,
                productCode,
                customerName: fields.get("customerName"),
                email: fields.get("email"),
              }
            : { ...common, parentSessionId: sessionId },
        );
        if (!object(result) || typeof result.checkoutUrl !== "string")
          throw new Error("Nie udało się otworzyć płatności.");
        const checkoutUrl = new URL(result.checkoutUrl);
        if (
          checkoutUrl.protocol !== "https:" ||
          checkoutUrl.hostname !== "checkout.stripe.com"
        )
          throw new Error("Nieprawidłowy adres płatności.");
        location.assign(checkoutUrl.href);
      } catch (cause) {
        if (cause instanceof ExpiredCheckoutError) {
          requestId = crypto.randomUUID();
          consent.checked = false;
        }
        if (error) {
          error.textContent =
            cause instanceof Error
              ? cause.message
              : "Nie udało się otworzyć płatności.";
          error.hidden = false;
        }
        submitting = false;
        updateSubmit();
      }
    });
  } catch (cause) {
    status.textContent =
      cause instanceof Error ? cause.message : checkoutCopy.unavailable;
  }
}
const checkoutRoot = document.querySelector<HTMLElement>(
  "[data-checkout-kind]",
);
if (checkoutRoot) void initCheckout(checkoutRoot);
