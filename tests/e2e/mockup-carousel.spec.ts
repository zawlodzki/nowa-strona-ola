import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { expect, test } from "@playwright/test";

test("mockup initializes reviews when the book layout is not ready", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
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
  await page.addInitScript(() => {
    const original = window.getComputedStyle.bind(window);
    let initialRead = true;
    window.getComputedStyle = (element, pseudoElement) => {
      const style = original(element, pseudoElement);
      if (element.id !== "books-track" || !initialRead) return style;
      initialRead = false;
      return new Proxy(style, {
        get(target, property) {
          return property === "columnGap"
            ? "normal"
            : Reflect.get(target, property);
        },
      });
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/mockup-regression/mockups/homepage/cherry-white.html");
  await expect(page.locator("blockquote")).toHaveCount(6);
  await page.locator("#reviews-track").focus();
  await page.keyboard.press("End");
  await expect
    .poll(() => page.locator("#reviews-track").evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(500);
  await page.keyboard.press("Home");
  await expect
    .poll(() => page.locator("#reviews-track").evaluate((el) => el.scrollLeft))
    .toBeLessThan(2);
  await page.getByRole("button", { name: "Następne: opinie" }).click();
  await expect
    .poll(() => page.locator("#reviews-track").evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(100);
  expect(errors).toEqual([]);
});
