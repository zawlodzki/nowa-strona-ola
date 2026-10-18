import { expect, test } from "@playwright/test";
import { PCOS_PRODUCTS } from "../../src/lib/checkout-products";

const defaultOffer = {
  kicker: "Pakiet dla Ciebie",
  title: "Uzupełnij swoją serię",
  lead: "Dwa komplementarne e-booki w jednym pakiecie.",
  originalAmount: 19400,
  bundleAmount: 9700,
  currency: "pln",
  expiresAt: "2099-10-25T12:00:00.000Z",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/checkout/catalog", (route) =>
    route.fulfill({
      json: {
        enabled: false,
        consentVersion: "pcos-d27-2026-10-18",
        singleAmount: 9700,
        bundleAmount: 9700,
        currency: "pln",
        products: [],
      },
    }),
  );
  await page.route("**/api/checkout/orders", (route) => {
    throw new Error(
      `Nieoczekiwane tworzenie płatności ${route.request().method()}`,
    );
  });
  await page.route("**/api/checkout/bundle", (route) => {
    throw new Error(
      `Nieoczekiwane tworzenie płatności ${route.request().method()}`,
    );
  });
});

test("wstrzymana sprzedaż nie pozwala utworzyć zamówienia", async ({
  page,
}) => {
  await page.goto("/zamowienie/?produkt=ebook-01");
  await expect(page.getByRole("status")).toContainText(
    "Sprzedaż nie jest jeszcze uruchomiona",
  );
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByRole("checkbox").check();
  await expect(
    page.getByRole("button", { name: "Zamawiam z obowiązkiem zapłaty" }),
  ).toBeDisabled();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,nofollow",
  );
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute(
    "content",
    "no-referrer",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://aleksandraolesiewicz.com/zamowienie/",
  );
});

for (const purchased of PCOS_PRODUCTS) {
  test(`po ${purchased.code} pokazuje wyłącznie dwa pozostałe razem`, async ({
    page,
  }) => {
    const remaining = PCOS_PRODUCTS.filter(
      (product) => product.code !== purchased.code,
    ).map((product) => product.code);
    await page.route("**/api/checkout/status?*", (route) =>
      route.fulfill({
        json: {
          status: "paid",
          kind: "single",
          productCodes: [purchased.code],
          remainingProductCodes: remaining,
          bundleAvailable: true,
          offer: defaultOffer,
          offerEmailRequested: false,
          offerEmailRequestAvailable: true,
        },
      }),
    );
    await page.goto(`/po-zakupie/?session_id=cs_test_${purchased.code}`);
    await expect(page.locator("[data-product-code]:visible")).toHaveCount(2);
    await expect(
      page.locator(`[data-product-code="${purchased.code}"]`),
    ).toBeHidden();
    await expect(
      page.getByText("Pakiet obejmuje oba wskazane e-booki.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("97 zł brutto za pakiet", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("[data-product-price]:visible")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("48,50");
    await expect(
      page.getByText("Sprzedaż nie jest jeszcze uruchomiona", { exact: false }),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(768);
    await expect(page.getByRole("checkbox")).toHaveCount(1);
    await expect(page.getByRole("checkbox")).not.toBeChecked();
    await expect(page.getByRole("combobox")).toHaveCount(0);
    await expect(page).toHaveURL(/\/po-zakupie\/$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://aleksandraolesiewicz.com/po-zakupie/",
    );
    if (purchased.code === "ebook-01")
      await page.screenshot({
        path: "/tmp/ola-checkout-paid-desktop.png",
        fullPage: true,
      });
    await page.setViewportSize({ width: 320, height: 700 });
    if (purchased.code === "ebook-01")
      await page.screenshot({
        path: "/tmp/ola-checkout-paid-320.png",
        fullPage: true,
      });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("bez potwierdzonej płatności nie pokazuje oferty", async ({ page }) => {
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "pending",
        kind: "single",
        productCodes: ["ebook-01"],
        remainingProductCodes: [],
        bundleAvailable: false,
      },
    }),
  );
  await page.goto("/po-zakupie/?session_id=cs_test_pending");
  await expect(page.getByRole("status")).toContainText(
    "Płatność nie została jeszcze potwierdzona",
  );
  await expect(page.locator("[data-checkout-content]")).toBeHidden();
  await expect(page.locator("[data-paid-lead]")).toBeHidden();
});

test("potwierdzenie nie udaje gotowego linku do pobrania", async ({ page }) => {
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "paid",
        kind: "bundle",
        productCodes: ["ebook-02", "ebook-03"],
        remainingProductCodes: [],
        bundleAvailable: false,
      },
    }),
  );
  await page.goto("/zamowienie/potwierdzenie/?session_id=cs_test_bundle");
  await expect(page.getByRole("status")).toContainText(
    "Płatność została potwierdzona",
  );
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://aleksandraolesiewicz.com/zamowienie/potwierdzenie/",
  );
  await expect(page.getByRole("link", { name: /pobierz/i })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "E-booki otrzymasz e-mailem." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Zapisuję się do newslettera" }),
  ).toHaveAttribute("href", "/#newsletter");
});

test("przekazuje pojedyncze zamówienie dopiero po zgodzie", async ({
  page,
}) => {
  await page.route("**/zamowienie/?produkt=ebook-01", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        'data-sales-state="paused"',
        'data-sales-state="ready"',
      ),
    });
  });
  await page.route("**/api/checkout/catalog", (route) =>
    route.fulfill({
      json: { enabled: true, consentVersion: "pcos-d27-2026-10-18" },
    }),
  );
  await page.route("**/api/checkout/orders", (route) =>
    route.fulfill({
      json: { checkoutUrl: "https://checkout.stripe.com/c/pay/test_checkout" },
    }),
  );
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({ body: "Płatność testowa" }),
  );
  await page.goto("/zamowienie/?produkt=ebook-01");
  const submit = page.getByRole("button", {
    name: "Zamawiam z obowiązkiem zapłaty",
  });
  await expect(submit).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Imię i nazwisko" })
    .fill("Anna Testowa");
  await page
    .getByRole("textbox", { name: "Adres e-mail" })
    .fill("anna@example.invalid");
  await page.getByRole("checkbox").check();
  const sent = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/checkout/orders") &&
      request.method() === "POST",
  );
  await submit.click();
  const payload: unknown = (await sent).postDataJSON();
  expect(payload).toMatchObject({
    productCode: "ebook-01",
    customerName: "Anna Testowa",
    email: "anna@example.invalid",
    consentAccepted: true,
    consentVersion: "pcos-d27-2026-10-18",
  });
  await expect(page).toHaveURL(
    "https://checkout.stripe.com/c/pay/test_checkout",
  );
});

test("zamawia pakiet przez powiązany zakup bez wyboru pojedynczej pozycji", async ({
  page,
}) => {
  await page.route("**/po-zakupie/?session_id=cs_test_pair", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        'data-sales-state="paused"',
        'data-sales-state="ready"',
      ),
    });
  });
  await page.route("**/api/checkout/catalog", (route) =>
    route.fulfill({
      json: { enabled: true, consentVersion: "pcos-d27-2026-10-18" },
    }),
  );
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "paid",
        kind: "single",
        productCodes: ["ebook-01"],
        remainingProductCodes: ["ebook-02", "ebook-03"],
        bundleAvailable: true,
        offer: defaultOffer,
        offerEmailRequested: false,
        offerEmailRequestAvailable: true,
      },
    }),
  );
  let attempts = 0;
  await page.route("**/api/checkout/bundle", (route) => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({ status: 409, json: { error: "order_expired" } })
      : route.fulfill({
          json: { checkoutUrl: "https://checkout.stripe.com/c/pay/test_pair" },
        });
  });
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({ body: "Płatność testowa" }),
  );
  await page.goto("/po-zakupie/?session_id=cs_test_pair");
  const submit = page.getByRole("button", {
    name: "Zamawiam z obowiązkiem zapłaty",
  });
  await expect(submit).toBeDisabled();
  await page.getByRole("checkbox").check();
  const sent = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/checkout/bundle") &&
      request.method() === "POST",
  );
  await submit.click();
  const payload: unknown = (await sent).postDataJSON();
  expect(payload).toMatchObject({
    parentSessionId: "cs_test_pair",
    consentAccepted: true,
    consentVersion: "pcos-d27-2026-10-18",
  });
  expect(payload).not.toHaveProperty("productCode");
  expect(payload).not.toHaveProperty("productCodes");
  await expect(page.getByRole("alert")).toContainText(
    "Termin poprzedniej płatności minął",
  );
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(submit).toBeDisabled();
  await page.getByRole("checkbox").check();
  const retry = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/checkout/bundle") &&
      request.method() === "POST",
  );
  await submit.click();
  const nextPayload: unknown = (await retry).postDataJSON();
  if (!payload || typeof payload !== "object" || !("requestId" in payload))
    throw new Error("Brak identyfikatora zamówienia testowego.");
  expect(nextPayload).not.toMatchObject({ requestId: payload.requestId });
  await expect(page).toHaveURL("https://checkout.stripe.com/c/pay/test_pair");
});

test("cofnięta płatność blokuje ofertę i ponowne obciążenie", async ({
  page,
}) => {
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "revoked",
        kind: "single",
        productCodes: ["ebook-01"],
        remainingProductCodes: [],
        bundleAvailable: false,
      },
    }),
  );
  await page.goto("/po-zakupie/?session_id=cs_test_revoked");
  await expect(page.getByRole("status")).toContainText(
    "Ta płatność została wycofana",
  );
  await expect(page.locator("[data-checkout-content]")).toBeHidden();
  await expect(page.locator("[data-paid-lead]")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Zamawiam z obowiązkiem zapłaty" }),
  ).toBeHidden();
});

test("pokazuje ofertę innej serii, panel matcha i cenę zakupu osobno", async ({
  page,
}) => {
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "paid",
        kind: "single",
        productCodes: ["ebook-04"],
        remainingProductCodes: ["ebook-05", "ebook-06"],
        bundleAvailable: true,
        offer: {
          ...defaultOffer,
          kicker: "Twoja wiedza o perimenopauzie",
          title: "Zadbaj o kolejny etap",
          lead: "Dobierz pakiet o żywieniu i codziennym samopoczuciu.",
        },
        offerEmailRequested: false,
        offerEmailRequestAvailable: true,
      },
    }),
  );
  await page.goto("/po-zakupie/?session_id=cs_test_perimenopause");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Zadbaj o kolejny etap",
  );
  await expect(page.locator("[data-offer-kicker]")).toHaveText(
    "Twoja wiedza o perimenopauzie",
  );
  await expect(page.locator("[data-paid-lead]")).toHaveText(
    "Dobierz pakiet o żywieniu i codziennym samopoczuciu.",
  );
  await expect(page.locator("[data-product-code]:visible")).toHaveCount(2);
  await expect(page.locator('[data-product-code="ebook-05"]')).toBeVisible();
  await expect(page.locator('[data-product-code="ebook-06"]')).toBeVisible();
  await expect(page.locator('[data-product-code="ebook-04"]')).toBeHidden();
  const panel = page.locator("[data-checkout-form]");
  await expect(panel).toHaveCSS("background-color", "rgb(216, 231, 138)");
  const original = page.locator("s[data-reference-price]");
  await expect(original).toHaveText(/194\s+zł/);
  await expect(
    page.getByText("Cena przy zakupie osobno", { exact: true }),
  ).toBeVisible();
  expect(
    await original.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeGreaterThanOrEqual(32);
  await expect(original).toHaveCSS("text-decoration-line", "line-through");
});

test("odmowa pozostawia siedem dni i wymaga osobnej prośby o e-mail", async ({
  page,
}) => {
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "paid",
        kind: "single",
        productCodes: ["ebook-01"],
        remainingProductCodes: ["ebook-02", "ebook-03"],
        bundleAvailable: true,
        offer: defaultOffer,
        offerEmailRequested: false,
        offerEmailRequestAvailable: true,
      },
    }),
  );
  const requests: unknown[] = [];
  await page.route("**/api/checkout/offer-email-request", (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ json: { requested: true, deliveryPending: true } });
  });
  await page.goto("/po-zakupie/?session_id=cs_test_later");
  await page.getByRole("link", { name: /Nie, dziękuję/ }).click();
  await expect(page).toHaveURL(/\/po-zakupie\/pozniej\/$/);
  await expect(
    page.getByRole("heading", { name: "Masz 7 dni od pierwszego zakupu." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Wracam do oferty" }),
  ).toHaveAttribute("href", /\/po-zakupie\//);
  const send = page.getByRole("button", {
    name: "Wyślij mi tę ofertę e-mailem",
  });
  await expect(send).toBeEnabled();
  expect(requests).toEqual([]);
  await send.click();
  await expect(page.locator("[data-offer-email-status]")).toHaveText(
    "Prośba zapisana. Wysyłka linków nie jest jeszcze uruchomiona.",
  );
  expect(requests).toEqual([
    {
      parentSessionId: "cs_test_later",
      requestAccepted: true,
      requestVersion: "offer-email-request-v1-2026-10-18",
    },
  ]);
  await expect(send).toBeDisabled();
});

test("podziękowanie działa przy niedostępnym katalogu płatności", async ({
  page,
}) => {
  await page.route("**/api/checkout/catalog", (route) =>
    route.fulfill({ status: 503, json: { error: "catalog_unavailable" } }),
  );
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "paid",
        kind: "bundle",
        productCodes: ["ebook-02", "ebook-03"],
        remainingProductCodes: [],
        bundleAvailable: false,
        offer: null,
        offerEmailRequested: false,
        offerEmailRequestAvailable: false,
      },
    }),
  );
  await page.goto(
    "/zamowienie/potwierdzenie/?session_id=cs_test_no_catalog_bundle",
  );
  await expect(
    page.getByRole("heading", { name: "E-booki otrzymasz e-mailem." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Zapisuję się do newslettera" }),
  ).toHaveAttribute("href", "/#newsletter");
  await expect(page.locator("[data-checkout-status]")).toContainText(
    "Płatność została potwierdzona",
  );
});

test("strona odłożonej oferty działa przy niedostępnym katalogu płatności", async ({
  page,
}) => {
  await page.route("**/api/checkout/catalog", (route) =>
    route.fulfill({ status: 503, json: { error: "catalog_unavailable" } }),
  );
  await page.route("**/api/checkout/status?*", (route) =>
    route.fulfill({
      json: {
        status: "paid",
        kind: "single",
        productCodes: ["ebook-01"],
        remainingProductCodes: ["ebook-02", "ebook-03"],
        bundleAvailable: true,
        offer: defaultOffer,
        offerEmailRequested: false,
        offerEmailRequestAvailable: true,
      },
    }),
  );
  await page.goto("/po-zakupie/pozniej/?session_id=cs_test_no_catalog_later");
  await expect(
    page.getByRole("heading", { name: "Masz 7 dni od pierwszego zakupu." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Wracam do oferty" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Wyślij mi tę ofertę e-mailem" }),
  ).toBeEnabled();
});

test("bez JavaScript wyjaśnia ograniczenie i ukrywa prywatną ofertę", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 320, height: 700 },
  });
  try {
    const page = await context.newPage();
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto("/po-zakupie/");
    await expect(page.locator("noscript p").first()).toContainText(
      "Włącz JavaScript",
    );
    await expect(page.locator("noscript p").first()).toBeVisible();
    await expect(page.locator("[data-checkout-content]")).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
    expect(posts).toEqual([]);
  } finally {
    await context.close();
  }
});
