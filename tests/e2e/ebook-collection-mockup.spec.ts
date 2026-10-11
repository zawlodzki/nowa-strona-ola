import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
async function serveMockup(page: Page) {
  await page.route("**/mockup-regression/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/mockup-regression/",
      "",
    );
    const allowed =
      path.startsWith("mockups/homepage/") ||
      path.startsWith("src/assets/") ||
      path === "design-system/tokens.css" ||
      path === "design-system/legacy-tokens.css";
    if (!allowed) return route.abort();
    const types: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".woff2": "font/woff2",
    };
    await route.fulfill({
      body: await readFile(resolve(path)),
      contentType: types[extname(path)] ?? "application/octet-stream",
    });
  });
}
const collectionPath = "/mockup-regression/mockups/homepage/ebooks-3a.html";

test("ebook categories support keyboard, URL reload and browser history", async ({
  page,
}) => {
  await serveMockup(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(collectionPath);
  await expect(page.locator(".nav-inner")).toHaveCSS("width", "1320px");
  const cards = page.locator(".ebook-grid .book-card:visible");
  await expect(cards).toHaveCount(6);
  const all = page.getByRole("radio", { name: "Wszystkie" });
  await all.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "PCOS", exact: false }),
  ).toBeChecked();
  await expect(cards).toHaveCount(3);
  await expect(page).toHaveURL(/kategoria=pcos/);
  await page.reload();
  await expect(cards).toHaveCount(3);
  await page.getByRole("radio", { name: "Perimenopauza" }).check();
  await expect(cards).toHaveCount(3);
  await expect(
    page.locator('.book-card[data-book-topic="pcos"]:visible'),
  ).toHaveCount(0);
  await page.goBack();
  await expect(
    page.getByRole("radio", { name: "PCOS", exact: false }),
  ).toBeChecked();
  await all.check();
  await expect(cards).toHaveCount(6);
  await expect(page).not.toHaveURL(/kategoria=/);
  await page.goto(collectionPath + "?kategoria=unknown");
  await expect(all).toBeChecked();
  await expect(cards).toHaveCount(6);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(async () => {
    document.body.style.zoom = "2";
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test("ebook categories also work without JavaScript", async ({ browser }) => {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  await serveMockup(page);
  await page.goto(collectionPath);
  await expect(page.locator(".ebook-grid .book-card:visible")).toHaveCount(6);
  await page.getByRole("radio", { name: "Perimenopauza" }).check();
  await expect(page.locator(".ebook-grid .book-card:visible")).toHaveCount(3);
  await expect(page.locator('[data-count="perimenopause"]')).toBeVisible();
  await page.getByRole("radio", { name: "Wszystkie" }).check();
  await expect(page.locator(".ebook-grid .book-card:visible")).toHaveCount(6);
  await page.close();
});
