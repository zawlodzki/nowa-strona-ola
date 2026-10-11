import { expect, test } from "@playwright/test";

import { renderedColor } from "./helpers/color";

const articlePath = "/blog/przygotowanie-do-konsultacji-pcos/";
const legalPath = "/polityka-prywatnosci/";

for (const width of [1440, 390, 320]) {
  test(`navigation stays visible scrolling down and up at ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 720 });
    for (const path of ["/", articlePath, legalPath]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      for (const top of [1200, 500]) {
        await page.evaluate((y) => window.scrollTo(0, y), top);
        await expect
          .poll(async () => (await page.locator(".ao-header").boundingBox())?.y)
          .toBe(0);
        await expect(page.locator(".ao-header .ao-wordmark")).toBeInViewport();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      }
    }
    if (width < 1200) {
      await page.getByText("Menu", { exact: true }).click();
      const mobile = page.getByRole("navigation", {
        name: "Nawigacja mobilna",
      });
      await expect(mobile).toBeVisible();
      await mobile.getByRole("link", { name: "O mnie", exact: true }).click();
      await expect(page).toHaveURL(/\/o-mnie\/$/);
    }
  });
}

test("sticky navigation and its menu work without JS in dark mode", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
    reducedMotion: "reduce",
    viewport: { width: 320, height: 400 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/");
  await page.mouse.wheel(0, 1000);
  await expect
    .poll(async () => (await page.locator(".ao-header").boundingBox())?.y)
    .toBe(0);
  expect(
    await renderedColor(page.locator(".ao-header"), "background-color"),
  ).toBe("rgb(41, 26, 33)");
  await page.getByText("Menu", { exact: true }).click();
  const links = page.locator(".ao-mobile-menu nav a");
  await links.last().scrollIntoViewIfNeeded();
  await expect(links.last()).toBeInViewport();
  await links.first().click();
  await expect(page).toHaveURL(/\/ebooki\/$/);
  await context.close();
});

test("article and legal anchors clear the header with enlarged text and zoom", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const layout of [
    { width: 1440, fontSize: "16px", zoom: "1" },
    { width: 320, fontSize: "32px", zoom: "1" },
    { width: 1280, fontSize: "16px", zoom: "2" },
  ]) {
    await page.setViewportSize({ width: layout.width, height: 900 });
    for (const path of [articlePath, legalPath]) {
      await page.goto(path);
      await page.evaluate(({ fontSize, zoom }) => {
        document.documentElement.style.fontSize = fontSize;
        document.body.style.zoom = zoom;
      }, layout);
      await page.evaluate(() => document.fonts.ready);
      const link = page.locator(".article-toc a, .legal-toc a").nth(1);
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      await link.click();
      const target = page.locator(`[id="${href!.slice(1)}"]`);
      await expect(target).toBeInViewport();
      const header = await page.locator(".ao-header").boundingBox();
      const heading = await target.boundingBox();
      expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height + 5);
      if (layout.fontSize === "16px" && layout.zoom === "1") {
        const toc = await page
          .locator(".article-toc, .legal-toc")
          .boundingBox();
        expect(toc!.y).toBeGreaterThanOrEqual(header!.height + 5);
      }
      await target.focus();
      await expect(target).toBeFocused();
      const focused = await target.boundingBox();
      expect(focused!.y).toBeGreaterThanOrEqual(header!.height + 5);
    }
  }
});

test("text links and small accents share matcha while main CTAs stay cherry", async ({
  page,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    const matcha =
      colorScheme === "light" ? "rgb(83, 103, 27)" : "rgb(216, 231, 138)";
    for (const path of ["/", "/o-mnie/", "/konsultacje/", "/blog/"]) {
      await page.goto(path);
      const links = page.locator(".ao-text-link");
      expect(await links.count()).toBeGreaterThan(0);
      for (const link of await links.all()) {
        expect(await renderedColor(link, "color")).toBe(matcha);
        expect(await renderedColor(link, "border-bottom-color")).toBe(matcha);
      }
      const suffix = page.locator(
        ".home3a-count strong span, .about3a-count strong span, .consult3a-proof strong span",
      );
      if (await suffix.count()) {
        expect(await renderedColor(suffix.first(), "color")).toBe(matcha);
      }
      expect(
        await renderedColor(
          page.locator(".ao-button--primary").first(),
          "background-color",
        ),
      ).toBe(
        colorScheme === "light" ? "rgb(136, 47, 72)" : "rgb(237, 184, 203)",
      );
    }
  }
});

for (const width of [1440, 390]) {
  test(`tabbing through the sticky header keeps the scroll position at ${width}px`, async ({
    page,
    browserName,
  }) => {
    // WebKit, like Safari by default, moves Tab only between form controls;
    // Option+Tab reaches links, which is how Safari keyboard users navigate.
    const nextFocus = browserName === "webkit" ? "Alt+Tab" : "Tab";
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 800 });
    for (const path of ["/", articlePath]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() =>
        window.scrollTo(
          0,
          Math.round(
            (document.documentElement.scrollHeight - window.innerHeight) / 2,
          ),
        ),
      );
      const start = await page.evaluate(() => window.scrollY);
      expect(start).toBeGreaterThan(1000);

      await page.keyboard.press(nextFocus);
      await expect(page.locator(".ao-skip")).toBeFocused();
      await expect(page.locator(".ao-skip")).toBeInViewport();

      const visited: string[] = [];
      for (let step = 0; step < 20; step++) {
        const state = await page.evaluate(() => {
          const active = document.activeElement as HTMLElement | null;
          return {
            inHeader: Boolean(
              active?.matches(".ao-skip") || active?.closest(".ao-header"),
            ),
            label: active?.textContent?.trim().slice(0, 30) ?? "",
            scrollY: window.scrollY,
          };
        });
        if (!state.inHeader) break;
        visited.push(state.label);
        expect(
          Math.abs(state.scrollY - start),
          `${path} ${width}px: "${state.label}"`,
        ).toBeLessThanOrEqual(1);
        await page.keyboard.press(nextFocus);
      }
      // Skip link, wordmark and at least the menu or one nav link.
      expect(visited.length).toBeGreaterThanOrEqual(3);
    }
  });
}
