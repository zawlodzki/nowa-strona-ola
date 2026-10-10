import { expect, test } from "@playwright/test";

// Wersja EN wyłączona 10.10.2026 (docs/IMPLEMENTATION-PLAN.md, sekcja PL/EN).
for (const path of [
  "/en/",
  "/en/about/",
  "/en/consultations/",
  "/en/contact/",
  "/en/ebooks/",
  "/en/ebooks/supplements-in-pcos/",
  "/en/blog/",
  "/en/blog/preparing-for-a-pcos-nutrition-consultation/",
  "/en/privacy/",
  "/en/ui/",
]) {
  test(`${path} is not published`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  });
}

for (const path of ["/", "/ui/", "/warsztat/", "/ebooki/suplementy-w-pcos/"]) {
  test(`${path} links only to Polish pages`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    await expect(page.locator('a[href*="/en/"]')).toHaveCount(0);
    await expect(page.locator("[hreflang]")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "English" })).toHaveCount(0);
  });
}
