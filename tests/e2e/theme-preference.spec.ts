import { expect, test } from "@playwright/test";
import { dismissConsentBanner } from "./helpers/consent-banner";

for (const preference of ["light", "dark"] as const) {
  test(`${preference} choice survives link navigation and reload`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: preference === "dark" ? "light" : "dark",
    });
    await page.goto("/");
    await dismissConsentBanner(page);
    const toggle = page.getByRole("button", {
      name: "Ciemny motyw",
      exact: true,
    });
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute(
      "aria-pressed",
      String(preference === "dark"),
    );
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      preference,
    );
    expect(await page.evaluate(() => localStorage.getItem("ao-theme"))).toBe(
      preference,
    );
    await page
      .getByRole("navigation", { name: "Nawigacja główna", exact: true })
      .getByRole("link", { name: "O mnie", exact: true })
      .click();
    await expect(page).toHaveURL(/\/o-mnie\/$/);
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      preference,
    );
    await expect(
      page.getByRole("button", { name: "Ciemny motyw", exact: true }),
    ).toHaveAttribute("aria-pressed", String(preference === "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      preference,
    );
    await page.emulateMedia({ colorScheme: preference });
    await page.emulateMedia({
      colorScheme: preference === "dark" ? "light" : "dark",
    });
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      preference,
    );
  });

  test(`saved ${preference} is applied before the body appears`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: preference === "dark" ? "light" : "dark",
    });
    await page.addInitScript((theme) => {
      localStorage.setItem("ao-theme", theme);
      const observer = new MutationObserver(() => {
        if (!document.body) return;
        sessionStorage.setItem(
          "theme-at-body",
          document.documentElement.dataset.theme ?? "unset",
        );
        observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    }, preference);
    await page.goto("/");
    expect(
      await page.evaluate(() => sessionStorage.getItem("theme-at-body")),
    ).toBe(preference);
  });
}

test("system changes control the theme until a manual choice", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await dismissConsentBanner(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Ciemny motyw", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => localStorage.getItem("ao-theme")),
  ).toBeNull();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Ciemny motyw", exact: true }).click();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("invalid saved value falls back to the system", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ao-theme", "invalid"));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const blockedOperation of ["getItem", "setItem"] as const) {
  test(`blocked storage ${blockedOperation} keeps theme control usable`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((operation) => {
      Object.defineProperty(Storage.prototype, operation, {
        value: () => {
          throw new DOMException("Storage blocked", "SecurityError");
        },
      });
    }, blockedOperation);
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await dismissConsentBanner(page);
    const toggle = page.getByRole("button", {
      name: "Ciemny motyw",
      exact: true,
    });
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(errors).toEqual([]);
  });
}
