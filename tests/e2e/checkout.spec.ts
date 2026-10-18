import { expect, test } from "@playwright/test";
import { PCOS_PRODUCTS } from "../../src/lib/checkout-products";

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
        },
      }),
    );
    await page.goto(`/po-zakupie/?session_id=cs_test_${purchased.code}`);
    await expect(page.locator("[data-product-code]:visible")).toHaveCount(2);
    await expect(
      page.locator(`[data-product-code="${purchased.code}"]`),
    ).toBeHidden();
    await expect(
      page.getByText(
        "Oferta obejmuje wyłącznie zakup obu pozostałych e-booków razem.",
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("97 zł brutto za oba e-booki", { exact: true }),
    ).toBeVisible();
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
