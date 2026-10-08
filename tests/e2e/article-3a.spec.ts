import { expect, test, type Page } from "@playwright/test";

const articlePath = "/blog/przygotowanie-do-konsultacji-pcos/";
const articleHeading =
  "Jak przygotować się do konsultacji dietetycznej przy PCOS?";

async function openArticle(page: Page, path = articlePath) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

async function scrollToReadingProgress(page: Page, progress: number) {
  await page.evaluate((value) => {
    const body = document.querySelector(".article-richtext")!;
    const rect = body.getBoundingClientRect();
    window.scrollTo({
      top:
        window.scrollY +
        rect.top +
        rect.height * value -
        window.innerHeight / 2,
      behavior: "instant",
    });
  }, progress);
}

test("production article heading, deck and TOC match the 3a template", async ({
  page,
}) => {
  await openArticle(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    articleHeading,
  );
  await expect(
    page.getByRole("navigation", { name: "W tym artykule" }),
  ).toBeVisible();
  await expect(page.locator(".article3a")).toHaveCount(1);
  await expect(page.locator(".article-deck")).toContainText(
    "Bez perfekcyjnego dzienniczka",
  );
  await expect(
    page.locator('.article-toc a[href="#punkt-wyjscia"]'),
  ).toBeVisible();
  const images = page.locator("main img");
  const count = await images.count();
  expect(count).toBeGreaterThan(3);
  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    await expect
      .poll(async () =>
        image.evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  const nutritionCover = page.locator(".ao-book-art--nutrition img");
  await expect(nutritionCover).toHaveCount(1);
  await expect
    .poll(async () =>
      nutritionCover.evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const nutritionBox = await nutritionCover.boundingBox();
  expect(nutritionBox?.height).toBeGreaterThan(60);
  expect(nutritionBox?.height).toBeLessThan(100);
});

test("related articles appear at half of the text and can be collapsed", async ({
  page,
}) => {
  await openArticle(page);
  const panel = page.locator(".article-recommendations");
  await expect(panel).toBeHidden();
  await scrollToReadingProgress(page, 0.49);
  await expect(panel).toBeHidden();
  await scrollToReadingProgress(page, 0.51);
  await expect(panel).toBeVisible();
  await expect(panel.locator("a")).toHaveCount(2);
  await panel
    .getByRole("button", { name: "Sprawdź również" })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.locator("#recommended-articles")).toBeHidden();
  await expect(
    panel.getByRole("button", { name: "Sprawdź również" }),
  ).toBeFocused();
  await scrollToReadingProgress(page, 0.1);
  await expect(panel).toBeVisible();
  await panel
    .getByRole("button", { name: "Sprawdź również" })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.locator("#recommended-articles")).toBeVisible();
  const outsideTrigger = page.locator(".article-toc summary");
  await outsideTrigger.focus();
  await expect(outsideTrigger).toBeFocused();
  await scrollToReadingProgress(page, 0.1);
  await expect(panel).toBeHidden();
});

test("sharing supports hover, keyboard, safe URLs and clipboard fallback", async ({
  page,
}) => {
  await openArticle(page);
  const trigger = page.getByRole("button", { name: "Udostępnij", exact: true });
  const panel = page.getByRole("dialog", { name: "Udostępnij artykuł" });
  await trigger.hover();
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Kopiuj link" }).hover();
  await expect(panel).toBeVisible();
  await page.mouse.move(700, 20);
  await expect(panel).toBeHidden();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(
    panel.getByRole("button", { name: "Kopiuj link" }),
  ).toBeFocused();
  await expect(
    panel.getByRole("link", { name: "Wyślij mailem" }),
  ).toHaveAttribute("href", /^mailto:\?subject=/);
  const shareUrl = new URL(page.url());
  shareUrl.hash = "";
  shareUrl.search = "";
  const facebook = new URL(
    (await panel
      .getByRole("link", { name: "Udostępnij na Facebooku" })
      .getAttribute("href"))!,
  );
  expect(facebook.searchParams.get("u")).toBe(shareUrl.href);
  const whatsapp = new URL(
    (await panel
      .getByRole("link", { name: "Prześlij przez WhatsApp" })
      .getAttribute("href"))!,
  );
  expect(whatsapp.searchParams.get("text")).toContain(shareUrl.href);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    });
  });
  await panel.getByRole("button", { name: "Kopiuj link" }).click();
  await expect(page.locator("#share-url")).toBeFocused();
  await expect(page.locator("#share-url")).toHaveValue(shareUrl.href);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("FAQ follows the books and its structured data matches visible answers", async ({
  page,
}) => {
  await openArticle(page);
  const content = await page.evaluate(() => {
    const faq = document.querySelector("#faq")!;
    const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
    const items = [...faq.querySelectorAll("details")].map((item) => ({
      question: normalize(item.querySelector("summary span")!.textContent!),
      answer: normalize(item.querySelector("p")!.textContent!),
    }));
    const raw = JSON.parse(
      document.querySelector("#article-faq-schema")!.textContent!,
    ) as {
      "@type"?: string;
      "@graph"?: {
        "@type": string;
        mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
      }[];
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    };
    const faqPage =
      raw["@type"] === "FAQPage"
        ? raw
        : raw["@graph"]?.find((node) => node["@type"] === "FAQPage");
    return {
      before: faq.previousElementSibling?.id,
      after: faq.nextElementSibling?.id,
      items,
      schemaType: faqPage?.["@type"],
      schemaItems: (faqPage?.mainEntity ?? []).map((item) => ({
        question: item.name,
        answer: item.acceptedAnswer.text,
      })),
    };
  });
  expect(content.before).toBe("ebooki");
  expect(content.after).toBe("newsletter");
  expect(content.items).toHaveLength(4);
  expect(content.schemaType).toBe("FAQPage");
  expect(content.schemaItems).toEqual(content.items);
});

test("English article keeps the 3a shell and translation link", async ({
  page,
}) => {
  await openArticle(
    page,
    "/en/blog/preparing-for-a-pcos-nutrition-consultation/",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "How to prepare for a nutrition consultation with PCOS?",
  );
  await expect(
    page.getByRole("navigation", { name: "In this article" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Polski" })).toHaveAttribute(
    "href",
    "/blog/przygotowanie-do-konsultacji-pcos/",
  );
});
