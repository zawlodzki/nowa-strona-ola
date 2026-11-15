import { expect, test, type Page } from "@playwright/test";

function collectPrefetches(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.headers()["sec-purpose"]?.includes("prefetch")) {
      urls.push(
        new URL(request.url()).pathname + new URL(request.url()).search,
      );
    }
  });
  return urls;
}

async function hoverInjectedLink(page: Page, href: string, rel?: string) {
  await page.evaluate(
    ({ href, rel }) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = `probe ${href}`;
      link.dataset.probe = "";
      if (rel) link.rel = rel;
      link.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:9999";
      document.querySelector("[data-probe]")?.remove();
      document.body.append(link);
    },
    { href, rel },
  );
  await page.hover("[data-probe]");
  await page.waitForTimeout(600);
}

test.describe("speculation rules", () => {
  test.beforeEach(({ browserName }) => {
    test.skip(
      browserName !== "chromium",
      "only Chromium implements speculation rules; others ignore the script",
    );
  });

  test("hovering an internal link prefetches it", async ({ page }) => {
    const prefetched = collectPrefetches(page);
    await page.goto("/");
    expect(
      await page.evaluate(() => HTMLScriptElement.supports("speculationrules")),
    ).toBe(true);
    await hoverInjectedLink(page, "/o-mnie/");
    await expect.poll(() => prefetched).toContain("/o-mnie/");
  });

  test("checkout, post-purchase, api and nofollow links are never prefetched", async ({
    page,
  }) => {
    const prefetched = collectPrefetches(page);
    await page.goto("/");
    for (const href of [
      "/zamowienie/",
      "/zamowienie/?ebook=czy-to-juz",
      "/zamowienie/potwierdzenie/",
      "/po-zakupie/",
      "/po-zakupie/pozniej/",
      "/api/lead",
    ]) {
      await hoverInjectedLink(page, href);
    }
    // Chromium groups candidates by URL, so this URL must not be linked
    // elsewhere on the page without nofollow.
    await hoverInjectedLink(page, "/nofollow-probe/", "nofollow");
    await hoverInjectedLink(page, "/blog/");
    await expect.poll(() => prefetched).toContain("/blog/");
    expect(prefetched).toEqual(["/blog/"]);
  });
});
