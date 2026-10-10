import { expect, test } from "@playwright/test";

const pages = [
  {
    path: "/polityka-prywatnosci/",
    title: "Polityka prywatności aleksandraolesiewicz.com",
    version: "Wersja 2.1 · data wejścia w życie do ustalenia",
    heading: "1. Kto jest administratorem Twoich danych",
  },
  {
    path: "/lista-cookies-i-identyfikatorow/",
    title: "Lista cookies i identyfikatorów aleksandraolesiewicz.com",
    version: "Wersja 2.0 · data wejścia w życie do ustalenia",
    heading: "Przed dokonaniem wyboru",
  },
  {
    path: "/regulamin/",
    title:
      "Regulamin sprzedaży e-booków i świadczenia konsultacji dietetycznych online — aleksandraolesiewicz.com",
    version: "Wersja 2.2 · data wejścia w życie do ustalenia",
    heading: "§ 1. Postanowienia ogólne",
  },
  {
    path: "/regulamin-newslettera/",
    title:
      "Regulamin newslettera i materiałów bezpłatnych — aleksandraolesiewicz.com",
    version: "Wersja 2.1 · data wejścia w życie do ustalenia",
    heading: "§ 1. Kto wysyła newsletter",
  },
] as const;

for (const entry of pages) {
  test(`${entry.path} renders title, version and first heading`, async ({
    page,
  }) => {
    await page.goto(entry.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      entry.title,
    );
    await expect(page.locator(".legal-effective")).toHaveText(entry.version);
    await expect(
      page.getByRole("heading", { level: 2, name: entry.heading }),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Metryka dokumentu");
    await expect(page.locator("main")).not.toContainText("Historia wersji");
  });
}

test("privacy and cookies link to each other", async ({ page }) => {
  await page.goto("/polityka-prywatnosci/");
  await page
    .getByRole("link", { name: "Lista cookies i identyfikatorów" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/lista-cookies-i-identyfikatorow\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Lista cookies i identyfikatorów aleksandraolesiewicz.com",
  );
  await page.getByRole("link", { name: "Politykę prywatności" }).click();
  await expect(page).toHaveURL(/\/polityka-prywatnosci\/$/);
});

test("terms appendices open at their anchors", async ({ page }) => {
  await page.goto("/regulamin/");
  await page
    .locator(".article-richtext")
    .getByRole("link", { name: "Pouczenie o prawie odstąpienia od umowy" })
    .click();
  await expect(page).toHaveURL(/\/regulamin\/#pouczenie$/);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Pouczenie o prawie odstąpienia od umowy",
    }),
  ).toHaveAttribute("id", "pouczenie");
  await expect(page.locator("#pouczenie")).toBeInViewport();
  await expect(page.locator("#formularz-odstapienia")).toHaveText(
    "Wzór formularza odstąpienia od umowy",
  );
  await expect(
    page.locator(".article-richtext blockquote").last(),
  ).toContainText("(*) Niepotrzebne skreślić.");
});

test("footer lists legal documents without seller data", async ({ page }) => {
  await page.goto("/regulamin/");
  const legal = page.getByRole("navigation", { name: "Informacje prawne" });
  await expect(legal.getByRole("link")).toHaveText([
    "Regulamin",
    "Polityka prywatności",
    "Lista cookies",
    "Regulamin newslettera",
    "Odstąpienie od umowy",
  ]);
  await expect(
    legal.getByRole("link", { name: "Odstąpienie od umowy" }),
  ).toHaveAttribute("href", "/odstapienie/");
  await expect(page.locator(".ao-footer__seller")).toHaveCount(0);
  await expect(page.locator(".ao-footer__bottom")).toContainText(
    "© 2026 Wellbiz sp. z o.o. · Treści: Aleksandra Olesiewicz-Zawłodzka",
  );
});

const reviewPages = [
  "/",
  "/konsultacje/",
  "/o-mnie/",
  "/ebooki/suplementy-w-pcos/",
];
for (const path of reviewPages) {
  test(`${path} explains how reviews are verified`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("#opinie .ao-review-disclosure")).toHaveText(
      "Publikujemy wyłącznie opinie osób, które skorzystały z konsultacji lub kupiły e-book — sprawdzamy to w naszej korespondencji i historii zamówień. Nie płacimy za opinie i nie zmieniamy ich treści. Efekty są indywidualne i nie są gwarantowane.",
    );
  });
}

test("newsletter notice links to privacy and newsletter terms", async ({
  page,
}) => {
  await page.goto("/");
  const notice = page.locator("#newsletter .ao-form-note");
  await expect(
    notice.getByRole("link", { name: "Polityka prywatności" }),
  ).toHaveAttribute("href", "/polityka-prywatnosci/");
  await expect(
    notice.getByRole("link", { name: "Regulamin newslettera" }),
  ).toHaveAttribute("href", "/regulamin-newslettera/");
});

test("legal content ordered lists show numbers, TOC and nav stay unstyled", async ({
  page,
}) => {
  await page.goto("/regulamin/");
  const styles = await page.evaluate(() => ({
    content: [...document.querySelectorAll(".article-richtext ol")].map(
      (el) => getComputedStyle(el).listStyleType,
    ),
    toc: [...document.querySelectorAll(".legal-toc ol")].map(
      (el) => getComputedStyle(el).listStyleType,
    ),
    breadcrumbs: [...document.querySelectorAll("nav[aria-label] ol")]
      .filter((el) => !el.closest(".legal-toc"))
      .map((el) => getComputedStyle(el).listStyleType),
  }));
  expect(styles.content.length).toBeGreaterThan(0);
  expect(new Set(styles.content)).toEqual(new Set(["decimal"]));
  expect(styles.toc.every((type) => type === "none")).toBe(true);
  expect(styles.breadcrumbs.every((type) => type === "none")).toBe(true);
});
