import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const entry of [
  {
    path: "/kontakt/",
    title: "Porozmawiajmy.",
    button: "Sprawdź formularz",
    topic: "Temat rozmowy",
    phone: "Telefon (opcjonalnie)",
    success: "Dane poprawne. Nic nie wysłano.",
  },
]) {
  test(`${entry.path} validates three fields and keeps newsletter independent without sending data`, async ({
    page,
  }) => {
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto(entry.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      entry.title,
    );
    const contact = page.locator("#contact-demo-form");
    await expect(contact.locator("input")).toHaveCount(3);
    await contact.getByRole("button", { name: entry.button }).click();
    await expect(contact.getByLabel("E-mail", { exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      contact.getByLabel(entry.phone, { exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      contact.getByLabel(entry.topic, { exact: true }),
    ).toBeFocused();
    await contact.getByLabel("E-mail", { exact: true }).fill("ola@example.com");
    await contact
      .getByLabel(entry.topic, { exact: true })
      .fill("Pytanie o konsultację");
    await contact.getByLabel(entry.phone, { exact: true }).fill("abcdef");
    await contact.getByRole("button", { name: entry.button }).click();
    await expect(
      contact.getByLabel(entry.phone, { exact: true }),
    ).toBeFocused();
    await contact.getByLabel(entry.phone, { exact: true }).fill("");
    await contact.getByRole("button", { name: entry.button }).click();
    await expect(contact.getByRole("status")).toContainText(entry.success);
    await expect(
      page.locator("#newsletter-demo-form").getByRole("status"),
    ).toBeEmpty();
    await expect(
      page.getByRole("link", {
        name: "ola@aleksandraolesiewicz.com",
        exact: true,
      }),
    ).toHaveAttribute("href", "mailto:ola@aleksandraolesiewicz.com");
    await expect(page.locator(".contact3a-company")).toContainText(
      "NIP: 6793323800",
    );
    await expect(page.locator(".contact3a-social a svg")).toHaveCount(3);
    const newsletter = page.locator("#newsletter-demo-form");
    await newsletter.getByRole("button", { name: /newsletter/i }).click();
    await expect(newsletter.locator('input[type="email"]')).toBeFocused();
    await expect(contact.getByRole("status")).toContainText(entry.success);
    expect(posts).toEqual([]);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .getByRole("button", {
        name: entry.path === "/kontakt/" ? "Ciemny motyw" : "Dark theme",
      })
      .click();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("contact stays readable at 320px, CSS zoom 200%, reduced motion and without JS", async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kontakt/");
  const overflow = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
  expect(await overflow()).toBe(false);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  expect(await overflow()).toBe(false);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const nojs = await context.newPage();
  await nojs.goto("/kontakt/");
  await expect(nojs.getByRole("heading", { level: 1 })).toHaveText(
    "Porozmawiajmy.",
  );
  await expect(nojs.locator("#contact-demo-form button")).toBeDisabled();
  await expect(
    nojs.getByRole("link", {
      name: "ola@aleksandraolesiewicz.com",
      exact: true,
    }),
  ).toBeVisible();
  await context.close();
});
