import { expect, test } from "@playwright/test";

async function cardMetrics(locator: {
  evaluate: (fn: (el: HTMLElement) => unknown) => Promise<unknown>;
}) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el);
    const img = el.querySelector("img");
    const box = el.getBoundingClientRect();
    return {
      radius: parseFloat(style.borderTopLeftRadius),
      aspectRatio: style.aspectRatio.replaceAll(" ", ""),
      ratio: box.width / box.height,
      naturalWidth: img?.naturalWidth ?? 0,
    };
  });
}

test("blog collection cards crop 1.8, round 24px and load every photo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/blog/");
  await page.evaluate(() => document.fonts.ready);

  const featured = page.locator(".blog3a-featured-post");
  await expect(featured).toBeVisible();
  expect(
    await featured.evaluate((el) =>
      parseFloat(getComputedStyle(el).borderTopLeftRadius),
    ),
  ).toBe(24);
  const featuredBox = await featured.boundingBox();
  const containerBox = await page
    .locator(".blog3a-featured .ao-container")
    .boundingBox();
  expect(featuredBox).toBeTruthy();
  expect(containerBox).toBeTruthy();
  expect(featuredBox!.x).toBeGreaterThanOrEqual(containerBox!.x - 1);
  expect(featuredBox!.x + featuredBox!.width).toBeLessThanOrEqual(
    containerBox!.x + containerBox!.width + 1,
  );

  const badania = page
    .locator(".blog3a-card")
    .filter({ hasText: "Wyniki badań: co zabrać na konsultację?" })
    .locator(".blog3a-card-image");
  const metrics = (await cardMetrics(badania)) as {
    radius: number;
    aspectRatio: string;
    ratio: number;
    naturalWidth: number;
  };
  expect(metrics.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(metrics.aspectRatio);
  expect(metrics.ratio).toBeGreaterThan(1.7);
  expect(metrics.ratio).toBeLessThan(1.9);
  expect(metrics.naturalWidth).toBeGreaterThan(0);

  await expect(
    page.getByRole("link", { name: "Powrót na górę", exact: true }),
  ).toHaveAttribute("href", "#main");
  await expect(
    page.getByRole("button", { name: "Ciemny motyw", exact: true }),
  ).toBeVisible();

  await page.goto("/blog/strona/2/");
  const page2Card = page.locator(".blog3a-card-image").first();
  const page2 = (await cardMetrics(page2Card)) as {
    radius: number;
    aspectRatio: string;
    ratio: number;
    naturalWidth: number;
  };
  expect(page2.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(page2.aspectRatio);
  expect(page2.ratio).toBeGreaterThan(1.7);
  expect(page2.ratio).toBeLessThan(1.9);
  expect(page2.naturalWidth).toBeGreaterThan(0);
});

test("blog collection EN, category and mobile keep the same crop and footer arrow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/blog/");
  const mobileCard = page.locator(".blog3a-card-image").first();
  const mobile = (await cardMetrics(mobileCard)) as {
    radius: number;
    aspectRatio: string;
    naturalWidth: number;
  };
  expect(mobile.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(mobile.aspectRatio);
  expect(mobile.naturalWidth).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: "Powrót na górę", exact: true }),
  ).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/blog/kategoria/pcos/");
  const categoryCard = page.locator(".blog3a-card-image").first();
  const category = (await cardMetrics(categoryCard)) as {
    radius: number;
    naturalWidth: number;
  };
  expect(category.radius).toBe(24);
  expect(category.naturalWidth).toBeGreaterThan(0);

  await page.goto("/en/blog/");
  await expect(
    page.getByRole("heading", { name: "Blog. On your terms." }),
  ).toBeVisible();
  const enCard = page.locator(".blog3a-card-image").first();
  const en = (await cardMetrics(enCard)) as {
    radius: number;
    aspectRatio: string;
    naturalWidth: number;
  };
  expect(en.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(en.aspectRatio);
  expect(en.naturalWidth).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: "Back to top", exact: true }),
  ).toHaveAttribute("href", "#main");
});
