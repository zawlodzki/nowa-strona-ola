import { expect, type Page } from "@playwright/test";
import initFixture from "../../fixtures/c15t/init.json" with { type: "json" };

export async function mockConsentPolicy(page: Page) {
  await page.route("**/api/c15t/init", (route) =>
    route.fulfill({ json: initFixture }),
  );
}

export async function dismissConsentBanner(page: Page) {
  const banner = page.locator("[data-consent-banner]");
  await expect(banner).toBeVisible();
  await banner
    .getByRole("button", { name: "Zamknij bez zmiany zgód", exact: true })
    .click();
  await expect(banner).toBeHidden();
}
