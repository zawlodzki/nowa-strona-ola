import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const [path, openName, closeName] of [
  ["/ui/", "Jak pracujemy", "Zamknij"],
  ["/en/ui/", "How we work", "Close"],
]) {
  test(`dialog keyboard and focus ${path}`, async ({ page }) => {
    await page.goto(path);
    const trigger = page.getByRole("button", { name: openName, exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: closeName, exact: true });
    await expect(close).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(close).toBeFocused();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("form validation, error recovery and no network submission", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") requests.push(request.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Sprawdź formularz" }).click();
  await expect(page.getByLabel("Imię", { exact: true })).toBeFocused();
  await expect(page.locator("#name-error")).toBeVisible();
  await page.getByLabel("Imię", { exact: true }).fill("Łucja");
  await page.getByLabel("E-mail", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Sprawdź formularz" }).click();
  await expect(page.getByLabel("E-mail", { exact: true })).toBeFocused();
  await page.getByLabel("E-mail", { exact: true }).fill("test@example.com");
  await page.getByRole("button", { name: "Sprawdź formularz" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Dane poprawne. Nic nie wysłano.",
  );
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  expect(requests).toEqual([]);
});

for (const width of [320, 390, 1440]) {
  test(`layout and accessibility at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", {
        name: "Aleksandra Olesiewicz — strona główna",
      }),
    ).toBeVisible();
    const visibleLogos = await page
      .locator("header .site-logo")
      .evaluateAll(
        (elements) =>
          elements.filter(
            (element) => getComputedStyle(element).display !== "none",
          ).length,
      );
    expect(visibleLogos).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`wonderful-${width}.png`),
      fullPage: true,
    });
  });
}

test("no JavaScript preserves content and prevents accidental form navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sprawdź formularz" }),
  ).toBeDisabled();
  await expect(page.locator("noscript p").first()).toBeVisible();
  await context.close();
});

test("reduced motion and 200 percent CSS zoom", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ui/");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Jak pracujemy" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
});

test("catalog shows tokens, Polish glyphs and Switzer", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/ui/");
  await expect(
    page.getByRole("heading", { name: "Katalog komponentów" }),
  ).toBeVisible();
  await expect(page.getByText("Zażółć gęślą jaźń ąćęłńóśźż")).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveAttribute(
    "href",
    "/en/ui/",
  );
  await expect(
    page.getByRole("heading", { name: "Logo", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Gambarino Regular").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Fontshare · Gambarino" }),
  ).toHaveAttribute("href", "https://www.fontshare.com/fonts/gambarino");
  await expect(page.getByRole("img", { name: "ao" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Spis sekcji" }),
  ).toBeVisible();
  for (const name of [
    "Tekst ma rytm i szerokość do czytania.",
    "Pytania, które wracają",
    "Pakiety demonstracyjne",
    "Powiązane wpisy",
  ]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await page.evaluate(() => document.fonts.ready);
  const family = await page.evaluate(
    () => getComputedStyle(document.body).fontFamily,
  );
  expect(family).toMatch(/Switzer/);
  expect(await page.evaluate(() => document.fonts.check("16px Switzer"))).toBe(
    true,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.locator("#section-faq summary").first().click();
  await expect(
    page.getByText("Nie. To demonstracyjny układ sekcji", { exact: false }),
  ).toBeVisible();
  await page.goto("/en/ui/");
  await expect(
    page.getByRole("heading", { name: "Component catalog" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Polski" })).toHaveAttribute(
    "href",
    "/ui/",
  );
  await expect(
    page.getByRole("heading", { name: "Questions that return" }),
  ).toBeVisible();
});

test("cards nav scrolls on a narrow viewport and is hidden on a wide one", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/ui/");
  const nav = page.locator(".cards-nav");
  await expect(nav).toBeVisible();
  const scroller = page.locator("[data-scroller]");
  const before = await scroller.evaluate((element) => element.scrollLeft);
  await page.getByRole("button", { name: "Następne karty" }).click();
  await expect
    .poll(async () => scroller.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(nav).toBeHidden();
});

test("static primitives emit no scripts; no console errors on interactive page", async ({
  page,
}) => {
  await page.goto("/static/");
  await expect(page.locator("script")).toHaveCount(0);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/ui/");
  await page.getByRole("button", { name: "Jak pracujemy" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(errors).toEqual([]);
});

test("landing pages, blog and missing English translation", async ({
  page,
}) => {
  await page.goto("/warsztat/");
  await expect(
    page.getByRole("heading", { name: "Jeden dzień na wspólny porządek." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveAttribute(
    "href",
    "/en/workshop/",
  );
  await page.goto("/en/workshop/");
  await expect(
    page.getByRole("heading", {
      name: "One day to put the work in order.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Polski" })).toHaveAttribute(
    "href",
    "/warsztat/",
  );

  await page.goto("/blog/");
  await expect(
    page.getByRole("heading", { name: "Blog", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Najpierw proces, potem CRM" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Najpierw proces, potem CRM" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Spis treści" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveAttribute(
    "href",
    "/en/blog/process-before-crm/",
  );

  await page.goto("/tylko-pl/");
  await expect(
    page.getByRole("heading", { name: "Ta strona nie ma wersji angielskiej." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveCount(0);

  const missing = await page.goto("/en/tylko-pl/");
  expect(missing?.status()).toBe(404);
});
