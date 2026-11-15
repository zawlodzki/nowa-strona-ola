import { expect, test, type Page } from "@playwright/test";

async function hoverAndCollectPrefetches(page: Page, href: string, rel = "") {
  const prefetched: string[] = [];
  page.context().on("request", (request) => {
    const purpose = request.headers()["sec-purpose"] ?? "";
    if (purpose.includes("prefetch"))
      prefetched.push(new URL(request.url()).pathname);
  });
  await page.evaluate(
    ([target, relValue]) => {
      const link = document.createElement("a");
      link.href = target;
      if (relValue) link.rel = relValue;
      link.textContent = "speculation probe";
      link.id = "speculation-probe";
      link.style.cssText =
        "position:fixed;top:0;left:0;z-index:99999;padding:20px;background:#fff";
      document.body.append(link);
    },
    [href, rel] as const,
  );
  await page.hover("#speculation-probe");
  await page.waitForTimeout(1500);
  return prefetched;
}

test.describe("speculation rules", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "only Chromium speculates",
  );

  test("hovering a content link prefetches it", async ({ page }) => {
    await page.goto("/");
    expect(await hoverAndCollectPrefetches(page, "/blog/")).toContain("/blog/");
  });

  for (const href of [
    "/zamowienie/?produkt=x",
    "/po-zakupie/",
    "/api/checkout/catalog",
  ]) {
    test(`hovering ${href} does not prefetch`, async ({ page }) => {
      await page.goto("/");
      const prefetched = await hoverAndCollectPrefetches(page, href);
      expect(prefetched).toEqual([]);
    });
  }

  test("hovering a nofollow link does not prefetch", async ({ page }) => {
    await page.goto("/");
    expect(
      await hoverAndCollectPrefetches(
        page,
        "/blog/?probe=nofollow",
        "nofollow",
      ),
    ).toEqual([]);
  });
});
