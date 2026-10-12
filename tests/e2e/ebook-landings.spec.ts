import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const products = [
  { slug: "badania-ktore-maja-sens", title: "Badania, które mają sens" },
  {
    slug: "szczupla-a-jednak-pcos",
    title: "Szczupła, a jednak PMOS\u00A0(PCOS)",
  },
  { slug: "waga-cie-oklamuje", title: "Waga Cię okłamuje" },
  { slug: "czy-to-juz", title: "Czy to już?" },
  {
    slug: "noc-zaczyna-sie-o-osiemnastej",
    title: "Noc zaczyna się o osiemnastej",
  },
];

for (const product of products) {
  test(`${product.slug}: product content, keyboard, reflow and accessible sections`, async ({
    page,
  }) => {
    const submitted: string[] = [];
    await page.route("https://flows.zawlodzki.com/**", async (route) => {
      submitted.push(route.request().url());
      await route.abort();
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/ebooki/${product.slug}/`);
    await page
      .getByRole("button", { name: "Zamknij bez zmiany zgód", exact: true })
      .first()
      .click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("#start .ebook3a-eyebrow")).toHaveText(
      `E-book · ${product.title}`,
    );
    await expect(page.locator("main")).not.toContainText(
      "Zrób porządek z suplementami.",
    );
    await expect(page.locator("main")).not.toContainText("Moja półka.");
    await expect(page.locator("#cena")).toContainText("PDF + EPUB");
    await expect(page.locator("#cena")).toContainText("Wkrótce dostępny");
    await expect(
      page.locator("main a[href*=buy], main a[href*=checkout]"),
    ).toHaveCount(0);
    for (const id of [
      "start",
      "problem",
      "dla-kogo",
      "zawartosc",
      "podglad",
      "efekty",
      "cena",
      "opinie",
      "faq",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    const chapter = page.locator(".ebook3a-chapter").nth(1);
    await chapter.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(chapter).toHaveAttribute("open", "");
    const faq = page.locator("#faq details").nth(1);
    await faq.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(faq).toHaveAttribute("open", "");
    const waitlist = page.getByRole("button", {
      name: "Zapisz się na listę oczekujących",
      exact: true,
    });
    await waitlist.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#lista-oczekujacych")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(waitlist).toBeFocused();
    expect(submitted).toEqual([]);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => {
      document.body.style.zoom = "2";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => {
      document.body.style.zoom = "1";
    });
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      expect(
        (await new AxeBuilder({ page }).include("main").analyze()).violations,
      ).toEqual([]);
    }
  });

  test(`${product.slug}: complete content and disclosures without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "reduce",
      colorScheme: "dark",
      viewport: { width: 320, height: 640 },
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4321/ebooki/${product.slug}/`);
    await expect(page.locator("#start .ebook3a-eyebrow")).toContainText(
      product.title,
    );
    await expect(page.locator("main h1")).toBeVisible();
    const chapter = page.locator(".ebook3a-chapter").nth(1);
    await chapter.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(chapter.locator("p")).toBeVisible();
    const faq = page.locator("#faq details").nth(1);
    await faq.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(faq.locator("p")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await context.close();
  });
}
