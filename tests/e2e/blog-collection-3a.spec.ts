import { expect, test, type Locator, type Page } from "@playwright/test";

type CardMetrics = {
  radius: number;
  aspectRatio: string;
  ratio: number;
  naturalWidth: number;
  naturalHeight: number;
  htmlWidth: number;
  htmlHeight: number;
  imgHeight: number;
  wrapHeight: number;
  src: string;
  opacity: string;
  visibility: string;
  objectPosition: string;
};

type ClipRect = { x: number; y: number; width: number; height: number };

async function cardMetrics(locator: Locator) {
  return locator.evaluate((el) => {
    const img = el.querySelector("img");
    const box = el.getBoundingClientRect();
    const imgBox = img?.getBoundingClientRect();
    const imgStyle = img ? getComputedStyle(img) : null;
    return {
      radius: parseFloat(getComputedStyle(el).borderTopLeftRadius),
      aspectRatio: (imgStyle?.aspectRatio ?? "").replaceAll(" ", ""),
      ratio: box.width / box.height,
      naturalWidth: img?.naturalWidth ?? 0,
      naturalHeight: img?.naturalHeight ?? 0,
      htmlWidth: Number(img?.getAttribute("width") ?? 0),
      htmlHeight: Number(img?.getAttribute("height") ?? 0),
      imgHeight: imgBox?.height ?? 0,
      wrapHeight: box.height,
      src: img?.getAttribute("src") ?? "",
      opacity: imgStyle?.opacity ?? "",
      visibility: imgStyle?.visibility ?? "",
      objectPosition: imgStyle?.objectPosition ?? "",
    };
  });
}

async function lumaFromPng(page: Page, png: Buffer, clip?: ClipRect) {
  return page.evaluate(
    async ({ b64, clip: region }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${b64}`;
      await image.decode();
      const x = region?.x ?? 0;
      const y = region?.y ?? 0;
      const width = region?.width ?? image.width;
      const height = region?.height ?? image.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return 0;
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
      const { data } = ctx.getImageData(0, 0, width, height);
      let min = 255;
      let max = 0;
      for (let index = 0; index < data.length; index += 4) {
        const luma =
          0.299 * data[index] +
          0.587 * data[index + 1] +
          0.114 * data[index + 2];
        min = Math.min(min, luma);
        max = Math.max(max, luma);
      }
      return max - min;
    },
    {
      b64: png.toString("base64"),
      clip,
    },
  );
}

async function documentBox(locator: Locator): Promise<ClipRect> {
  return locator.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return {
      x: Math.round(box.x + window.scrollX),
      y: Math.round(box.y + window.scrollY),
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
  });
}

async function lumaRange(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const png = await locator.screenshot({ animations: "disabled" });
  return lumaFromPng(locator.page(), png);
}

async function lumaRangeFullPage(locator: Locator) {
  const clip = await documentBox(locator);
  const png = await locator.page().screenshot({
    fullPage: true,
    animations: "disabled",
  });
  return lumaFromPng(locator.page(), png, clip);
}

async function assertEveryThumbPaints(page: {
  locator: (selector: string) => Locator;
}) {
  const thumbs = page.locator(".blog3a-card-image");
  const count = await thumbs.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const wrap = thumbs.nth(index);
    const img = wrap.locator("img");
    await expect(img).toHaveCount(1);
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
    const box = await wrap.boundingBox();
    expect(box?.width).toBeGreaterThan(10);
    expect(box?.height).toBeGreaterThan(10);
    expect(await lumaRange(wrap)).toBeGreaterThan(25);
  }
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
  const insulin = page
    .locator(".blog3a-card")
    .filter({
      hasText: "Insulinooporność: od czego zacząć rozmowę o odżywianiu?",
    })
    .locator(".blog3a-card-image");
  await expect
    .poll(() =>
      badania
        .locator("img")
        .evaluate((el: HTMLImageElement) => el.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      insulin
        .locator("img")
        .evaluate((el: HTMLImageElement) => el.naturalWidth),
    )
    .toBeGreaterThan(0);
  const metrics = (await cardMetrics(badania)) as CardMetrics;
  const insulinMetrics = (await cardMetrics(insulin)) as CardMetrics;
  expect(metrics.src).toMatch(/\/_astro\/about\.[^/]+\.webp$/);
  expect(insulinMetrics.src).toMatch(/\/_astro\/contact\.[^/]+\.webp$/);
  expect(metrics.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(metrics.aspectRatio);
  expect(metrics.ratio).toBeGreaterThan(1.7);
  expect(metrics.ratio).toBeLessThan(1.9);
  expect(metrics.naturalWidth).toBeGreaterThan(0);
  expect(metrics.naturalWidth).toBeGreaterThan(metrics.naturalHeight);
  expect(metrics.htmlWidth).toBeGreaterThan(metrics.htmlHeight);
  expect(metrics.opacity).toBe("1");
  expect(metrics.visibility).toBe("visible");
  expect(metrics.imgHeight).toBeGreaterThan(10);
  expect(insulinMetrics.opacity).toBe("1");
  expect(insulinMetrics.visibility).toBe("visible");
  expect(insulinMetrics.objectPosition).toBe(metrics.objectPosition);
  expect(metrics.objectPosition).toMatch(/15%/);
  expect(Math.abs(metrics.imgHeight - metrics.wrapHeight)).toBeLessThan(1);
  expect(await lumaRangeFullPage(badania)).toBeGreaterThan(25);
  expect(await lumaRange(badania)).toBeGreaterThan(25);

  await assertEveryThumbPaints(page);

  await expect(
    page.getByRole("link", { name: "Powrót na górę", exact: true }),
  ).toHaveAttribute("href", "#main");
  await expect(
    page.getByRole("button", { name: "Ciemny motyw", exact: true }),
  ).toBeVisible();

  await page.goto("/blog/strona/2/");
  const page2Card = page.locator(".blog3a-card-image").first();
  const page2 = (await cardMetrics(page2Card)) as CardMetrics;
  expect(page2.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(page2.aspectRatio);
  expect(page2.ratio).toBeGreaterThan(1.7);
  expect(page2.ratio).toBeLessThan(1.9);
  expect(page2.naturalWidth).toBeGreaterThan(0);
  expect(Math.abs(page2.imgHeight - page2.wrapHeight)).toBeLessThan(1);
  await assertEveryThumbPaints(page);
});

test("blog collection EN, category and mobile keep the same crop and footer arrow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/blog/");
  const mobileCard = page.locator(".blog3a-card-image").first();
  const mobile = (await cardMetrics(mobileCard)) as CardMetrics;
  expect(mobile.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(mobile.aspectRatio);
  expect(mobile.naturalWidth).toBeGreaterThan(0);
  expect(Math.abs(mobile.imgHeight - mobile.wrapHeight)).toBeLessThan(1);
  await expect(
    page.getByRole("link", { name: "Powrót na górę", exact: true }),
  ).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/blog/kategoria/pcos/");
  const categoryCard = page.locator(".blog3a-card-image").first();
  const category = (await cardMetrics(categoryCard)) as CardMetrics;
  expect(category.radius).toBe(24);
  expect(category.naturalWidth).toBeGreaterThan(0);

  await page.goto("/en/blog/");
  await expect(
    page.getByRole("heading", { name: "Blog. On your terms." }),
  ).toBeVisible();
  const enCard = page.locator(".blog3a-card-image").first();
  const en = (await cardMetrics(enCard)) as CardMetrics;
  expect(en.radius).toBe(24);
  expect(["1.8", "1.8/1"]).toContain(en.aspectRatio);
  expect(en.naturalWidth).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: "Back to top", exact: true }),
  ).toHaveAttribute("href", "#main");
});
