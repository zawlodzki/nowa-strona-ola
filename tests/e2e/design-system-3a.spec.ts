import { expect, test } from "@playwright/test";
import { renderedColor } from "./helpers/color";
import AxeBuilder from "@axe-core/playwright";

for (const colorScheme of ["light", "dark"] as const) {
  for (const width of [320, 390, 1440]) {
    test(`3a catalog reflows with accessible ${colorScheme} states at ${width}px`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/design-system/");
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Design system 3a",
      );
      expect(
        await renderedColor(page.locator("body"), "background-color"),
      ).toBe(
        colorScheme === "light" ? "rgb(255, 255, 255)" : "rgb(41, 26, 33)",
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.evaluate(() => (document.documentElement.style.zoom = "2"));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      if (width < 1440)
        await expect(page.locator(".ao-mobile-menu summary")).toBeInViewport();
    });
  }
}

test("3a menu, FAQ, carousel and theme provide working controls", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/design-system/");
  const trigger = page.locator(".ao-mobile-menu summary");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ao-mobile-menu")).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator(".ao-mobile-menu")).not.toHaveAttribute("open", "");
  await page
    .getByText("Czy te komponenty działają bez JavaScript?", { exact: true })
    .click();
  await expect(
    page.getByText("Treść, linki, FAQ i menu mobilne są renderowane w HTML.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Następne elementy", exact: true })
    .click();
  await expect
    .poll(() => page.locator("#ds-books").evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  const theme = page.getByRole("button", { name: "Ciemny motyw", exact: true });
  await theme.click();
  await expect(theme).toHaveAttribute("aria-pressed", "true");
  expect(await renderedColor(page.locator("body"), "background-color")).toBe(
    "rgb(41, 26, 33)",
  );
});

test("3a catalog without JavaScript preserves native navigation and content", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/design-system/`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator(".ao-mobile-menu summary").click();
  await expect(
    page.getByRole("navigation", { name: "Nawigacja mobilna" }),
  ).toBeVisible();
  await page
    .getByText("Czy te komponenty działają bez JavaScript?", { exact: true })
    .click();
  await expect(
    page.getByText("Treść, linki, FAQ i menu mobilne są renderowane w HTML.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.locator(".ao-theme-toggle")).toBeHidden();
  await expect(
    page.getByRole("link", { name: "Powrót na górę", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".ao-carousel__controls")).toBeHidden();
  await expect(page.locator("#ds-books article")).toHaveCount(4);
  expect(await renderedColor(page.locator("body"), "background-color")).toBe(
    "rgb(41, 26, 33)",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await context.close();
});
