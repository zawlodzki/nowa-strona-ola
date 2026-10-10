import { expect, test } from "@playwright/test";

const pages = [
  {
    path: "/polityka-prywatnosci/",
    title: "Polityka prywatności www.zawlodzki.pl",
    date: "24.08.2026",
    heading: "1. Administrator danych",
  },
  {
    path: "/lista-cookies-i-identyfikatorow/",
    title: "Lista cookies i identyfikatorów",
    date: "26.07.2026",
    heading: "Przed dokonaniem wyboru",
  },
  {
    path: "/regulamin/",
    title: "Regulamin sklepu www.zawlodzki.pl",
    date: "24.08.2026",
    heading: "§ 1. Postanowienia ogólne",
  },
  {
    path: "/regulamin-newslettera/",
    title: "Regulamin newslettera i materiałów bezpłatnych",
    date: "01.08.2026",
    heading: "§ 1. Kto wysyła newsletter",
  },
] as const;

for (const entry of pages) {
  test(`${entry.path} renders title, date and first heading`, async ({
    page,
  }) => {
    await page.goto(entry.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      entry.title,
    );
    await expect(page.locator(".legal-effective")).toContainText(entry.date);
    await expect(
      page.getByRole("heading", { level: 2, name: entry.heading }),
    ).toBeVisible();
  });
}

test("privacy and cookies link to each other", async ({ page }) => {
  await page.goto("/polityka-prywatnosci/");
  await page
    .getByRole("link", { name: "liście cookies i identyfikatorów" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/lista-cookies-i-identyfikatorow\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Lista cookies i identyfikatorów",
  );
  await page.getByRole("link", { name: "Politykę prywatności" }).click();
  await expect(page).toHaveURL(/\/polityka-prywatnosci\/$/);
});

test("newsletter consent links to privacy and newsletter terms", async ({
  page,
}) => {
  await page.goto("/");
  const consent = page.locator(".ao-checkbox");
  await expect(
    consent.getByRole("link", { name: "Polityka prywatności" }),
  ).toHaveAttribute("href", "/polityka-prywatnosci/");
  await expect(
    consent.getByRole("link", { name: "regulamin newslettera" }),
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
