import { expect, test, type Locator } from "@playwright/test";

import { renderedColor } from "./helpers/color";

const MATCHA_LIGHT = "rgb(83, 103, 27)";
const MATCHA_DARK = "rgb(216, 231, 138)";
const WHITE = "rgb(255, 255, 255)";
const CHERRY_FILL = "rgb(136, 47, 72)";
const SURFACE = "rgb(242, 220, 227)";
const DARK_BG = "rgb(41, 26, 33)";

async function buttonColors(locator: Locator) {
  const [background, color, border] = await Promise.all([
    renderedColor(locator, "background-color"),
    renderedColor(locator, "color"),
    renderedColor(locator, "border-top-color"),
  ]);
  return { background, color, border };
}

test("catalog secondary button is white with matcha stroke", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/design-system/");
  await page.evaluate(() => document.fonts.ready);
  const secondary = page.getByRole("link", {
    name: "Zobacz karty",
    exact: true,
  });
  await expect(secondary).toBeVisible();
  expect(await buttonColors(secondary)).toEqual({
    background: WHITE,
    color: MATCHA_LIGHT,
    border: MATCHA_LIGHT,
  });
  const primary = page.getByRole("link", {
    name: "Zobacz komponenty",
    exact: true,
  });
  expect(await buttonColors(primary)).toEqual({
    background: CHERRY_FILL,
    color: "rgb(255, 244, 246)",
    border: CHERRY_FILL,
  });
  const stage = page.locator(".ds-portrait__backdrop");
  expect(await renderedColor(stage, "background-color")).toBe(SURFACE);
});

test("homepage secondary CTA follows the same matcha outline", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const secondary = page.getByRole("link", {
    name: "Poznaj konsultacje",
    exact: true,
  });
  expect(await buttonColors(secondary)).toEqual({
    background: WHITE,
    color: MATCHA_LIGHT,
    border: MATCHA_LIGHT,
  });
  const stage = page.locator(".ao-deco-stage").first();
  expect(await renderedColor(stage, "color")).toBe(SURFACE);
});

test("about secondary uses a matcha text link", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/o-mnie/");
  await page.evaluate(() => document.fonts.ready);
  const secondary = page.getByRole("link", {
    name: "Poznaj moje materiały",
    exact: true,
  });
  await expect(secondary).toBeVisible();
  await expect(secondary).not.toHaveClass(/ao-button/);
  expect(await renderedColor(secondary, "color")).toBe(MATCHA_LIGHT);
});

test("dark catalog secondary uses light matcha on the dark canvas", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/design-system/");
  await page.evaluate(() => document.fonts.ready);
  const secondary = page.getByRole("link", {
    name: "Zobacz karty",
    exact: true,
  });
  expect(await buttonColors(secondary)).toEqual({
    background: DARK_BG,
    color: MATCHA_DARK,
    border: MATCHA_DARK,
  });
});

test("ebook orbit keeps a single matcha dot on the existing rings", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ebooki/suplementy-w-pcos/");
  await page.evaluate(() => document.fonts.ready);
  const dots = page.locator(".ao-deco-orbit circle[fill]");
  await expect(dots).toHaveCount(1);
  expect(await dots.getAttribute("fill")).toBe("var(--ao-accent-on-light)");
  await expect(
    page.locator(".ebook3a-book .ao-deco-cherry-accent"),
  ).toHaveCount(0);
});

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  slack = 1,
) {
  return !(
    a.x + a.width <= b.x + slack ||
    b.x + b.width <= a.x + slack ||
    a.y + a.height <= b.y + slack ||
    b.y + b.height <= a.y + slack
  );
}

test("cherry ebook cover shows a matcha arrow and sparkle", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ebooki/");
  await page.evaluate(() => document.fonts.ready);
  const cherry = page.locator(".ao-book-cover--cherry").first();
  const accent = cherry.locator(".ao-deco-cherry-accent");
  await expect(accent).toBeVisible();
  expect(await accent.getAttribute("viewBox")).toBe("0 0 72 20");
  const sparkle = accent.locator(".ao-deco-sparkle");
  expect(await sparkle.getAttribute("fill")).toBe(
    "var(--ao-accent-on-primary)",
  );
  expect(
    await accent.locator(".ao-deco-cherry-arrow-shaft").getAttribute("stroke"),
  ).toBe("var(--ao-accent-on-primary)");
  expect(await renderedColor(sparkle, "fill")).toBe(MATCHA_DARK);
  const sparkleBox = await sparkle.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { width: box.width, height: box.height };
  });
  expect(sparkleBox.width).toBeGreaterThanOrEqual(14);
  expect(sparkleBox.height).toBeGreaterThanOrEqual(14);
  const accentBox = await accent.boundingBox();
  expect(accentBox).toBeTruthy();
  expect(accentBox!.width).toBeGreaterThanOrEqual(48);
});

test("cherry cover accent does not collide with cover text", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of [
      "/",
      "/ebooki/",
      "/ebooki/kategoria/pcos/",
      "/blog/przygotowanie-do-konsultacji-pcos/",
      "/design-system/",
    ]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const covers = page.locator(".ao-book-cover--cherry").filter({
        visible: true,
      });
      const count = await covers.count();
      expect(count).toBeGreaterThan(0);
      let visibleChecked = 0;
      for (let index = 0; index < count; index += 1) {
        const cover = covers.nth(index);
        await cover.scrollIntoViewIfNeeded();
        const accent = cover.locator(".ao-deco-cherry-accent");
        if (!(await accent.isVisible())) continue;
        const accentBox = await accent.boundingBox();
        expect(accentBox).toBeTruthy();
        visibleChecked += 1;
        const textBoxes = await cover
          .locator(
            ":scope > strong, .ao-book-cover__author, .ao-book-cover__subtitle, .ao-book-cover__topic, .ao-book-art--route span, .ao-book-art--journal span, .ao-book-decisions span",
          )
          .evaluateAll((nodes) =>
            nodes
              .filter((node) => node.textContent?.trim())
              .map((node) => {
                const box = node.getBoundingClientRect();
                return {
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                  text: node.textContent?.trim() ?? "",
                };
              }),
          );
        for (const text of textBoxes) {
          expect(
            rectsOverlap(accentBox!, text),
            `${path} ${viewport.width}px overlap with “${text.text}”`,
          ).toBe(false);
        }
      }
      expect(visibleChecked).toBeGreaterThan(0);
    }
  }
});

test("decorative quote marks in reviews use the matcha accent", async ({
  page,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    const matcha = colorScheme === "light" ? MATCHA_LIGHT : MATCHA_DARK;
    for (const path of [
      "/",
      "/o-mnie/",
      "/konsultacje/",
      "/ebooki/suplementy-w-pcos/",
    ]) {
      await page.goto(path);
      const marks = page.locator(".ao-review__mark");
      expect(await marks.count(), path).toBeGreaterThan(0);
      for (const mark of await marks.all()) {
        await expect(mark).toHaveAttribute("aria-hidden", "true");
        expect(await renderedColor(mark, "color"), path).toBe(matcha);
      }
      // The quote itself keeps the regular ink colour.
      expect(
        await renderedColor(
          page.locator(".ao-review blockquote").first(),
          "color",
        ),
      ).not.toBe(matcha);
    }
  }
});
