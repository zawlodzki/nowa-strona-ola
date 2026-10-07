import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const mockups = [
  "cherry-white",
  "about-3a",
  "consultation-3a",
  "ebook-3a",
  "ebooks-3a",
  "blog-3a",
  "blog-3a-page-2",
  "article-3a",
];
const prefix = "/consistency-mockup/";
async function serveMockups(page: Page) {
  await page.route("**/consistency-mockup/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(prefix, "");
    if (
      !path.startsWith("mockups/homepage/") &&
      !path.startsWith("src/assets/") &&
      path !== "design-system/tokens.css"
    )
      return route.abort();
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

// Regression: a wide reserved logo column pushed Menu outside the viewport.
test("3a header keeps keyboard navigation reachable at 200% zoom", async ({
  page,
}) => {
  await serveMockups(page);
  for (const name of mockups) {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}mockups/homepage/${name}.html`);
      await page.evaluate(async () => {
        document.documentElement.style.zoom = "2";
        await document.fonts.ready;
      });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        )
        .toBe(true);
      const trigger = page.locator(".mobile-menu summary");
      await expect(trigger).toBeInViewport();
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".mobile-menu")).toHaveAttribute("open", "");
      await expect(page.locator(".mobile-menu nav a").first()).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator(".mobile-menu")).not.toHaveAttribute(
        "open",
        "",
      );
      await expect(trigger).toBeFocused();
    }
  }
});

test("3a footer connects the product landing to collections and global pages", async ({
  page,
}) => {
  await serveMockups(page);
  await page.goto(`${prefix}mockups/homepage/consultation-3a.html`);
  await page
    .locator(".footer-navigation")
    .getByRole("link", { name: "E-booki", exact: true })
    .click();
  await expect(page).toHaveURL(/ebooks-3a\.html$/);
  await expect(page.locator(".ebook-grid .book-card:visible")).toHaveCount(6);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.locator(".mobile-menu summary").click();
  await page
    .locator(".mobile-menu")
    .getByRole("link", { name: "Blog", exact: true })
    .click();
  await expect(page).toHaveURL(/blog-3a\.html$/);
  await page
    .locator(".footer-navigation")
    .getByRole("link", { name: "O mnie", exact: true })
    .click();
  await expect(page).toHaveURL(/about-3a\.html$/);
  await page
    .locator(".footer-navigation")
    .getByRole("link", { name: "Konsultacje", exact: true })
    .click();
  await expect(page).toHaveURL(/consultation-3a\.html$/);
});
