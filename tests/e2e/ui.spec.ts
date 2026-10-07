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
  await expect(
    page.getByRole("link", { name: "English", exact: true }).first(),
  ).toHaveAttribute("href", "/en/");
  const submit = page.getByRole("button", {
    name: "Chcę otrzymywać newsletter",
    exact: true,
  });
  await submit.click();
  await expect(page.getByLabel("Adres e-mail", { exact: true })).toBeFocused();
  await expect(page.locator("#email-error")).toBeVisible();
  await page.getByLabel("Adres e-mail", { exact: true }).fill("wrong");
  await submit.click();
  await expect(page.getByLabel("Adres e-mail", { exact: true })).toBeFocused();
  await page
    .getByLabel("Adres e-mail", { exact: true })
    .fill("test@example.com");
  await submit.click();
  await expect(
    page.getByText("Zaznacz zgodę, aby sprawdzić formularz."),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Wyrażam zgodę na otrzymywanie newslettera. To demonstracja — nic nie zostanie wysłane.",
    })
    .check();
  await submit.click();
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
      .locator("header .ao-wordmark")
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
    page.getByRole("button", { name: "Chcę otrzymywać newsletter" }),
  ).toBeDisabled();
  await expect(page.locator("noscript p").first()).toBeVisible();
  await page.goto("http://127.0.0.1:4321/ebooki/suplementy-w-pcos/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Zrób porządek/,
  );
  await expect(page.locator("#cena")).toContainText("97");
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

test("about page Polish and English plus missing Polish under English slug", async ({
  page,
}) => {
  await page.goto("/o-mnie/");
  await expect(page.getByRole("heading", { name: /Jestem Ola/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Wiedza, którą możesz sprawdzić." }),
  ).toBeVisible();
  await expect(page.getByText("Miejsce na skan dyplomu")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Zarezerwuj konsultację" }),
  ).toHaveAttribute("href", "https://cal.com");
  await expect(
    page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", {
        name: "O mnie",
        exact: true,
      }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("link", { name: "English" }).first(),
  ).toHaveAttribute("href", "/en/about/");

  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page
    .getByRole("button", { name: "Chcę otrzymywać newsletter" })
    .click();
  expect(posts).toEqual([]);

  await page.goto("/en/about/");
  await expect(page.getByRole("heading", { name: /I am Ola/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    /Jestem Ola/,
  );
  await expect(page.getByText("Space for the diploma scan")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Polski" }).first(),
  ).toHaveAttribute("href", "/o-mnie/");

  const missing = await page.goto("/en/o-mnie/");
  expect(missing?.status()).toBe(404);
});

test("consultation page Polish and English plus missing Polish under English slug", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/konsultacje/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Wiesz już dużo\.\s*Ustal, co dalej\./,
  );
  const booking = page.getByRole("link", { name: "Zarezerwuj konsultację" });
  await expect(booking).toHaveCount(2);
  for (const link of await booking.all()) {
    await expect(link).toHaveAttribute("href", "https://cal.com");
  }
  await expect(
    page.getByText(/To nie jest potwierdzenie wizyty\./).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Konsultacja · 450 zł" }),
  ).toHaveAttribute("href", "#cena");
  await expect(page.locator("#cena")).toContainText("450 zł");
  await expect(page.locator("#cena")).toContainText("60 minut");
  await expect(
    page
      .getByRole("navigation", { name: "Nawigacja w stopce" })
      .getByRole("link", { name: "Konsultacje", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("link", { name: "English" }).first(),
  ).toHaveAttribute("href", "/en/consultations/");

  const answer = page.getByText(/Konsultacja nie zobowiązuje Cię do pakietu/);
  await expect(answer).toBeHidden();
  await page.getByText("Czy to jest pojedyncze spotkanie?").click();
  await expect(answer).toBeVisible();
  expect(posts).toEqual([]);

  await page.goto("/en/consultations/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /You already know a lot\./,
  );
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    /Wiesz już dużo/,
  );
  await expect(page.locator("#cena")).toContainText("450 PLN");
  await expect(
    page.getByRole("link", { name: "Polski" }).first(),
  ).toHaveAttribute("href", "/konsultacje/");

  const missing = await page.goto("/en/konsultacje/");
  expect(missing?.status()).toBe(404);
});

test("ebook landing Polish and English plus missing Polish under English slug", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/");
  const card = page
    .locator("#ebook-suplementy-w-pcos")
    .getByRole("heading")
    .getByRole("link");
  await expect(card).toHaveAttribute("href", "/ebooki/suplementy-w-pcos/");
  await card.click();
  await expect(page).toHaveURL(/\/ebooki\/suplementy-w-pcos\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Zrób porządek\s*z suplementami\./,
  );
  await expect(page.locator("#cena")).toContainText("97");
  await expect(page.locator("#cena")).toContainText("zł");
  await expect(
    page.getByRole("link", { name: "E-book · 97 zł" }),
  ).toHaveAttribute("href", "#cena");
  await expect(page.getByText("Sprzedaż nie jest uruchomiona")).toBeHidden();
  await page.getByText("Chcę ebook · 97 zł").click();
  await expect(page.getByText("Sprzedaż nie jest uruchomiona")).toBeVisible();
  await expect(
    page.getByText(/nie pobiera płatności i nie potwierdza zakupu/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "English" }).first(),
  ).toHaveAttribute("href", "/en/ebooks/supplements-in-pcos/");
  expect(posts).toEqual([]);

  await page.goto("/en/ebooks/supplements-in-pcos/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Put your supplements/,
  );
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    /Zrób porządek/,
  );
  await expect(page.locator("#cena")).toContainText("97");
  await expect(page.locator("#cena")).toContainText("PLN");
  await expect(
    page.getByRole("link", { name: "Polski" }).first(),
  ).toHaveAttribute("href", "/ebooki/suplementy-w-pcos/");

  const missingPolish = await page.goto("/en/ebooki/suplementy-w-pcos/");
  expect(missingPolish?.status()).toBe(404);
});

test("ebook collection Polish and English with categories, empty URL and no POST", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Zobacz wszystkie e-booki" }),
  ).toHaveAttribute("href", "/ebooki/");
  await page.getByRole("link", { name: "Zobacz wszystkie e-booki" }).click();
  await expect(page).toHaveURL(/\/ebooki\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Więcej jasności\.\s*W Twoim tempie\./,
  );
  const cards = page.locator(".ebooks3a-grid .ebooks3a-card:visible");
  await expect(cards).toHaveCount(6);
  await expect(
    page.getByRole("link", { name: "Suplementy w PCOS" }).first(),
  ).toHaveAttribute("href", "/ebooki/suplementy-w-pcos/");
  await expect(
    page.getByRole("link", { name: "Badania, które mają sens" }).first(),
  ).toHaveAttribute("href", "/ebooki/badania-ktore-maja-sens/");
  await expect(page.getByText("97 zł").first()).toBeVisible();
  await expect(page.getByText(/materiały są w przygotowaniu/i)).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Nawigacja w stopce" })
      .getByRole("link", { name: "E-booki", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  const all = page.getByRole("radio", { name: /Wszystkie/ });
  await all.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /PCOS/ })).toBeChecked();
  await expect(cards).toHaveCount(3);
  await expect(page).toHaveURL(/kategoria=pcos|\/kategoria\/pcos\//);
  await page.getByRole("radio", { name: "Perimenopauza" }).check();
  await expect(cards).toHaveCount(3);
  await expect(
    page.locator('.ebooks3a-card[data-book-topic="pcos"]:visible'),
  ).toHaveCount(0);
  await all.check();
  await expect(cards).toHaveCount(6);
  expect(posts).toEqual([]);

  await page.goto("/ebooki/kategoria/pcos/");
  await expect(page.getByRole("radio", { name: /PCOS/ })).toBeChecked();
  await expect(cards).toHaveCount(3);

  await page.goto("/en/ebooks/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /More clarity\./,
  );
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    /Więcej jasności/,
  );
  await expect(
    page.getByRole("link", { name: "Polski" }).first(),
  ).toHaveAttribute("href", "/ebooki/");

  const missing = await page.goto("/en/ebooki/");
  expect(missing?.status()).toBe(404);
});

test("ebook collection categories work without JavaScript", async ({
  browser,
}) => {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  await page.goto("/ebooki/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Więcej jasności/,
  );
  await expect(
    page.locator(".ebooks3a-grid .ebooks3a-card:visible"),
  ).toHaveCount(6);
  await page.getByRole("radio", { name: "Perimenopauza" }).check();
  await expect(
    page.locator(".ebooks3a-grid .ebooks3a-card:visible"),
  ).toHaveCount(3);
  await expect(page.locator('[data-count="perimenopause"]')).toBeVisible();
  await page.goto("/ebooki/kategoria/pcos/");
  await expect(page.getByRole("radio", { name: /PCOS/ })).toBeChecked();
  await expect(
    page.locator(".ebooks3a-grid .ebooks3a-card:visible"),
  ).toHaveCount(3);
  await page.close();
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
