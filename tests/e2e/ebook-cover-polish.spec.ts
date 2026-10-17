import { expect, test } from "./helpers/lead-webhook";
import { dismissConsentBanner } from "./helpers/consent-banner";
import { renderedColor } from "./helpers/color";

for (const width of [1280, 320]) {
  for (const theme of ["light", "dark"] as const) {
    test(`ebook badges stay above portrait covers at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });

      for (const path of ["/", "/ebooki/"]) {
        await page.goto(path);
        await dismissConsentBanner(page);
        await page.evaluate(() => document.fonts.ready);
        const card = page
          .locator(".ao-card, .ao-card-badged")
          .filter({ has: page.locator(".ao-book-cover") })
          .filter({ has: page.locator(".ao-badge") })
          .first();
        const cover = card.locator(".ao-book-cover");
        await cover.evaluate((element) => {
          if (!(element instanceof HTMLElement))
            throw new Error("Missing cover.");
          element.style.blockSize = "auto";
          element.style.aspectRatio = "2 / 3";
        });
        await card.scrollIntoViewIfNeeded();
        const badge = card.locator(".ao-badge");
        await expect(badge).toHaveText("Wkrótce dostępny");
        const aboveCover = await badge.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const hit = document.elementFromPoint(
            bounds.left + bounds.width * 0.75,
            bounds.bottom - 2,
          );
          return hit === element || element.contains(hit);
        });
        expect(aboveCover).toBe(true);
        expect(await renderedColor(badge, "background-color")).toBe(
          "rgb(216, 231, 138)",
        );
        expect(await renderedColor(badge, "color")).toBe("rgb(83, 103, 27)");
        await expect(cover).not.toHaveCSS("box-shadow", "none");
      }
    });
  }
}
