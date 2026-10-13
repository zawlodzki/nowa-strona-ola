import { expect, test } from "@playwright/test";
import {
  dismissConsentBanner,
  mockConsentPolicy,
} from "./helpers/consent-banner";

const routes = [
  "/",
  "/o-mnie/",
  "/konsultacje/",
  "/ebooki/",
  "/ebooki/suplementy-w-pcos/",
  "/blog/",
  "/blog/przygotowanie-do-konsultacji-pcos/",
  "/polityka-prywatnosci/",
];

test("larger preferred text reflows every 3a template", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await test.step(`${route} at ${width}px`, async () => {
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        for (const size of [20, 32]) {
          await page.evaluate(
            (value) => (document.documentElement.style.fontSize = `${value}px`),
            size,
          );
          await expect(page.locator("body")).toHaveCSS(
            "font-size",
            `${size}px`,
          );
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
        }
      });
    }
  }
});

test("legacy input and button keep keyboard outlines in forced colors", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/ui/");
  await page.keyboard.press("Tab");
  for (const selector of ['[data-slot="input"]', '[data-slot="button"]']) {
    const control = page.locator(selector).first();
    await control.focus();
    const outline = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(outline.style).toBe("solid");
    expect(outline.width).toBeGreaterThanOrEqual(2);
  }
});

test("reduced motion leaves hover icons static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/o-mnie/");
  const resource = page.locator(".about3a-resource").first();
  await resource.hover();
  await expect(resource.locator(".ao-icon")).toHaveCSS("transform", "none");
  await expect(resource.locator(".ao-icon")).toHaveCSS(
    "transition-duration",
    "0s",
  );
});

test.describe("touch feedback", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 900 } });
  test("touch keeps hover off and supplies feedback on press", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => matchMedia("(hover: hover) and (pointer: fine)").matches,
      ),
    ).toBe(false);
    const control = page.locator(".ao-mobile-menu summary");
    const box = await control.boundingBox();
    if (!box) throw new Error("Menu trigger has no hit area.");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(control).toHaveCSS("opacity", "0.75");
    await page.mouse.up();
    await expect(control).toHaveCSS("opacity", "1");
    await expect(page.locator(".ao-mobile-menu")).toHaveAttribute("open", "");
  });

  test("Instagram keeps its resting color on a coarse pointer", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    await mockConsentPolicy(page);
    await page.goto("/kontakt/");
    await dismissConsentBanner(page);
    expect(
      await page.evaluate(
        () => matchMedia("(hover: hover) and (pointer: fine)").matches,
      ),
    ).toBe(false);
    const link = page.getByRole("link", { name: "Instagram", exact: true });
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    if (!box) throw new Error("Instagram link has no hit area.");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(link).toHaveCSS("color", "rgb(112, 40, 63)");
    await page.mouse.down();
    await expect(link).toHaveCSS("color", "rgb(136, 47, 72)");
    await page.mouse.up();
    await expect(link).toHaveCSS("color", "rgb(112, 40, 63)");
  });
});

test("count and contact eyebrow follow the root font size", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  const cases = [
    { width: 320, countAt16: "64px", countAt32: 128 },
    { width: 390, countAt16: "78px", countAt32: 156 },
    { width: 768, countAt16: "92px", countAt32: 184 },
    { width: 1280, countAt16: "92px", countAt32: 184 },
  ];
  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const count = page.locator(".home3a-count strong");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "16px";
    });
    await expect(count).toHaveCSS("font-size", item.countAt16);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "32px";
    });
    const grown = Number.parseFloat(
      await count.evaluate((element) => getComputedStyle(element).fontSize),
    );
    expect(grown).toBeGreaterThan(Number.parseFloat(item.countAt16));
    expect(grown).toBeLessThanOrEqual(item.countAt32);
    const visible = await count.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.left >= -1 && box.right <= innerWidth + 1;
    });
    expect(visible).toBe(true);
    await page.goto("/kontakt/");
    await page.evaluate(() => document.fonts.ready);
    const eyebrow = page.locator(".contact3a-eyebrow");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "16px";
    });
    await expect(eyebrow).toHaveCSS("font-size", "14px");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "32px";
    });
    await expect(eyebrow).toHaveCSS("font-size", "28px");
  }
});

test("Instagram hover color stays on a fine pointer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await mockConsentPolicy(page);
  await page.goto("/kontakt/");
  await dismissConsentBanner(page);
  expect(
    await page.evaluate(
      () => matchMedia("(hover: hover) and (pointer: fine)").matches,
    ),
  ).toBe(true);
  const link = page.getByRole("link", { name: "Instagram", exact: true });
  await link.scrollIntoViewIfNeeded();
  const box = await link.boundingBox();
  if (!box) throw new Error("Instagram link has no hit area.");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(link).toHaveCSS("color", "rgb(136, 47, 72)");
});
