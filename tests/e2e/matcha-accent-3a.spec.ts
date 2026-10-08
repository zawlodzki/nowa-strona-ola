import { expect, test, type Locator } from "@playwright/test";

const MATCHA_LIGHT = "rgb(83, 103, 27)";
const MATCHA_DARK = "rgb(216, 231, 138)";
const WHITE = "rgb(255, 255, 255)";
const CHERRY_FILL = "rgb(136, 47, 72)";
const SURFACE = "rgb(242, 220, 227)";
const DARK_BG = "rgb(41, 26, 33)";
const INK = "rgb(112, 40, 63)";

async function buttonColors(locator: Locator) {
  return locator.evaluate((el) => {
    const styles = getComputedStyle(el);
    return {
      background: styles.backgroundColor,
      color: styles.color,
      border: styles.borderTopColor,
    };
  });
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
  expect(
    await stage.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe(SURFACE);
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
  expect(await stage.evaluate((el) => getComputedStyle(el).color)).toBe(
    SURFACE,
  );
});

test("about secondary stays an ink text link, not a matcha button", async ({
  page,
}) => {
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
  expect(await secondary.evaluate((el) => getComputedStyle(el).color)).toBe(
    INK,
  );
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
  const sparkle = page.locator(".ebook3a-book .ao-deco-sparkle");
  await expect(sparkle).toHaveCount(1);
  expect(await sparkle.evaluate((el) => getComputedStyle(el).display)).toBe(
    "none",
  );
});

test("cherry ebook cover shows the matcha sparkle", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ebooki/");
  await page.evaluate(() => document.fonts.ready);
  const cherry = page
    .locator(".ao-book-cover--cherry .ao-deco-sparkle")
    .first();
  await expect(cherry).toHaveCount(1);
  expect(await cherry.evaluate((el) => getComputedStyle(el).display)).toBe(
    "block",
  );
});
