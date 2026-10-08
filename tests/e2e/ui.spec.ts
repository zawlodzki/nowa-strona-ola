import { expect, test, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectDecodedWidth(locator: Locator, width: number) {
  await locator.scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      locator.evaluate(async (img: HTMLImageElement) => {
        if (!img.complete || img.naturalWidth === 0) {
          try {
            await img.decode();
          } catch {
            return 0;
          }
        }
        return img.naturalWidth;
      }),
    )
    .toBe(width);
}

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
  const primaryNav = page.getByRole("navigation", { name: "Nawigacja główna" });
  await expect(primaryNav.getByRole("link", { name: "E-booki" })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "English" })).toHaveCount(
    0,
  );
  const submit = page.getByRole("button", {
    name: "Chcę otrzymywać newsletter",
    exact: true,
  });
  await submit.click();
  await expect(
    page.getByLabel("Twój adres e-mail", { exact: true }),
  ).toBeFocused();
  await expect(page.locator("#email-error")).toBeVisible();
  await page.getByLabel("Twój adres e-mail", { exact: true }).fill("wrong");
  await submit.click();
  await expect(
    page.getByLabel("Twój adres e-mail", { exact: true }),
  ).toBeFocused();
  await page
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("test@example.com");
  await submit.click();
  await expect(
    page.getByText("Zaznacz zgodę, aby sprawdzić formularz."),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: /Wyrażam zgodę na otrzymywanie newslettera/,
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
    const heroImage = page.locator(".home3a-portrait img");
    const heroBox = await heroImage.evaluate((img) => {
      const style = getComputedStyle(img);
      const lead = document.querySelector(".home3a .ao-hero .ao-lead");
      const leadStyle = lead ? getComputedStyle(lead) : null;
      const logo = document.querySelector(".home3a-partners img");
      const logoStyle = logo ? getComputedStyle(logo) : null;
      return {
        fit: style.objectFit,
        position: style.objectPosition,
        height: Math.round(img.getBoundingClientRect().height),
        leadSize: leadStyle?.fontSize ?? "",
        leadLine: leadStyle ? parseFloat(leadStyle.lineHeight) : 0,
        logoFilter: logoStyle?.filter ?? "",
        logoHeight: logo ? Math.round(logo.getBoundingClientRect().height) : 0,
      };
    });
    expect(heroBox.fit).toBe("contain");
    expect(heroBox.position).toBe("50% 100%");
    if (width === 1440) {
      expect(heroBox.height).toBe(550);
      expect(heroBox.leadSize).toBe("18px");
      expect(heroBox.leadLine).toBe(27);
      expect(heroBox.logoHeight).toBe(43);
    }
    if (width === 390 || width === 320) {
      expect(heroBox.leadSize).toBe("16px");
      expect(heroBox.leadLine).toBe(24);
    }
    if (width === 390) {
      expect(heroBox.height).toBe(410);
      expect(heroBox.logoHeight).toBe(32);
    }
    expect(heroBox.logoFilter).toContain("grayscale");
    const metric = await page
      .locator(".home3a-count strong")
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        return {
          text: (element.textContent ?? "").replace(/\s+/g, ""),
          oneLine: element.getBoundingClientRect().height <= fontSize * 1.25,
        };
      });
    expect(metric.text).toBe("450+");
    expect(metric.oneLine).toBe(true);
    await expectDecodedWidth(page.locator(".home3a-about__food"), 1536);
    await expectDecodedWidth(page.locator("#konsultacje-panel img"), 1536);
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
  const aboutPortrait = page.locator(".about3a-portrait img");
  await expect(aboutPortrait).toHaveCSS("object-fit", "cover");
  await expect(aboutPortrait).toHaveCSS("border-radius", "24px");
  await expect(aboutPortrait).toHaveCSS("height", "540px");
  const approachGrid = await page
    .locator(".about3a-panels")
    .evaluate((element) => {
      const articles = [...element.querySelectorAll(":scope > article")];
      const grid = element.getBoundingClientRect();
      const boxes = articles.map((article) => article.getBoundingClientRect());
      const [first, second, third] = boxes;
      return {
        count: articles.length,
        firstFillsRow:
          first !== undefined && Math.abs(first.width - grid.width) < 4,
        pairSharesRow:
          second !== undefined &&
          third !== undefined &&
          Math.abs(second.top - third.top) < 2 &&
          third.left >= second.right - 1,
      };
    });
  expect(approachGrid.count).toBeGreaterThanOrEqual(3);
  expect(approachGrid.firstFillsRow).toBe(true);
  expect(approachGrid.pairSharesRow).toBe(true);
  await expectDecodedWidth(page.locator("#konsultacja-panel img"), 1536);
  await expect(
    page.getByRole("heading", { name: "Wiedza, którą możesz sprawdzić." }),
  ).toBeVisible();
  const diplomaPl = page.locator("#wyksztalcenie img");
  await expect(diplomaPl).toHaveCount(1);
  await expect(diplomaPl).toHaveAttribute(
    "alt",
    "Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu",
  );
  await expect
    .poll(async () =>
      diplomaPl.evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const diplomaPlSize = await diplomaPl.evaluate((img) => {
    const el = img as HTMLImageElement;
    return { width: el.naturalWidth, height: el.naturalHeight };
  });
  expect(diplomaPlSize.height).toBeGreaterThan(0);
  expect(
    Math.abs(diplomaPlSize.width / diplomaPlSize.height - 340 / 380),
  ).toBeLessThan(0.02);
  await expect(page.getByText("Miejsce na skan dyplomu")).toHaveCount(0);
  await expect(page.locator("#wyksztalcenie figcaption")).toContainText(
    "Dyplom ukończenia dietetyki klinicznej",
  );
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
    page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", {
        name: "English",
      }),
  ).toHaveCount(0);

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
  const diplomaEn = page.locator("#wyksztalcenie img");
  await expect(diplomaEn).toHaveCount(1);
  await expect(diplomaEn).toHaveAttribute(
    "alt",
    "Aleksandra Olesiewicz with her diploma outside the Faculty of Public Health, Medical University of Silesia in Bytom",
  );
  await expect
    .poll(async () =>
      diplomaEn.evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.getByText("Space for the diploma scan")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", {
        name: "Polski",
      }),
  ).toHaveCount(0);

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
  await expect(page.locator(".ao-hero")).not.toContainText("Podgląd oferty");
  await expect(page.locator("#cena")).toContainText(
    "Podgląd oferty: przycisk prowadzi tymczasowo do Cal.com. Właściwy kalendarz tej konsultacji zostanie dodany później.",
  );
  await expect(page.getByText("To nie jest potwierdzenie wizyty.")).toHaveCount(
    0,
  );
  await expect(page.locator(".consult3a-portrait strong")).toHaveText(
    "Ola Olesiewicz",
  );
  await expect(page.locator(".consult3a-portrait img")).toHaveCSS(
    "object-fit",
    "contain",
  );
  const processImage = page.locator(".consult3a-process img");
  await expect(processImage).toHaveCSS("object-fit", "cover");
  await expectDecodedWidth(processImage, 1536);
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
    page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", {
        name: "English",
      }),
  ).toHaveCount(0);

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
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Polski" }),
  ).toHaveCount(0);

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
    page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", {
        name: "English",
      }),
  ).toHaveCount(0);
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
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Polski" }),
  ).toHaveCount(0);

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
  await expect(
    page
      .getByRole("navigation", { name: "Profile społecznościowe" })
      .getByRole("link", { name: "Instagram" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Informacje prawne" })
      .getByRole("link", { name: "Polityka prywatności" }),
  ).toHaveAttribute("href", "/polityka-prywatnosci/");

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
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Polski" }),
  ).toHaveCount(0);

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
    page.getByRole("heading", { name: "Blog. Po Twojemu." }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Kategorie" })).toHaveCount(
    0,
  );
  await expect(page.getByText("Wpisy 2–7 z 11")).toBeVisible();
  await page.goto("/blog/strona/2/");
  await expect(page.getByText("Wpisy 8–11 z 11")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Najnowszy wpis" }),
  ).toHaveCount(0);
  await page.goto("/blog/kategoria/perimenopauza/");
  await expect(
    page.getByText("W tej kategorii nie ma jeszcze wpisów"),
  ).toBeVisible();
  await page.goto("/en/blog/");
  await expect(
    page.getByRole("heading", { name: "Blog. On your terms." }),
  ).toBeVisible();
  await page.goto("/blog/");
  await page
    .getByRole("link", {
      name: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
      exact: true,
    })
    .first()
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "W tym artykule" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Nawigacja główna" })
      .getByRole("link", {
        name: "English",
      }),
  ).toHaveCount(0);

  await page.goto("/tylko-pl/");
  await expect(
    page.getByRole("heading", { name: "Ta strona nie ma wersji angielskiej." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveCount(0);

  const missing = await page.goto("/en/tylko-pl/");
  expect(missing?.status()).toBe(404);
});

const FOOTER_SOCIAL_HREFS = [
  "https://www.instagram.com/aleksandra_olesiewicz",
  "https://www.facebook.com/dietetykolesiewicz/",
  "https://www.tiktok.com/@aleksandra_olesiewicz",
] as const;

for (const [path, instagramName] of [
  ["/", "Instagram Aleksandry Olesiewicz"],
  ["/en/", "Instagram of Aleksandra Olesiewicz"],
] as const) {
  test(`footer social profiles on ${path}`, async ({ page }) => {
    await page.goto(path);
    const social = page.locator("footer .ao-footer__social a");
    await expect(social).toHaveCount(3);
    expect(
      await social.evaluateAll((links) =>
        links.map((link) => ({
          href: link.getAttribute("href"),
          rel: link.getAttribute("rel"),
          target: link.getAttribute("target"),
        })),
      ),
    ).toEqual(
      FOOTER_SOCIAL_HREFS.map((href) => ({
        href,
        rel: "noopener noreferrer",
        target: "_blank",
      })),
    );
    await expect(
      page.getByRole("link", { name: instagramName, exact: true }),
    ).toHaveAttribute("href", FOOTER_SOCIAL_HREFS[0]);
  });
}
