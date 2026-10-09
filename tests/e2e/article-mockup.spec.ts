import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { expect, test, type Page } from "@playwright/test";

async function openArticle(page: Page) {
  await page.route("**/article-mockup/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/article-mockup/",
      "",
    );
    if (
      !path.startsWith("mockups/homepage/") &&
      !path.startsWith("src/assets/") &&
      path !== "design-system/tokens.css" &&
      path !== "design-system/legacy-tokens.css"
    )
      return route.abort();
    const types: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".woff2": "font/woff2",
    };
    await route.fulfill({
      body: await readFile(resolve(path)),
      contentType: types[extname(path)] ?? "application/octet-stream",
    });
  });
  await page.goto(
    "/article-mockup/mockups/homepage/article-3a.html?campaign=example#start",
  );
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
  const bounds = await panel.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const sidebar = element
      .closest(".article-sidebar")!
      .getBoundingClientRect();
    const newsletter = document
      .querySelector(".sidebar-panel")!
      .getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      sidebarLeft: sidebar.left,
      sidebarRight: sidebar.right,
      newsletterBottom: newsletter.bottom,
      position: getComputedStyle(element).position,
    };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(bounds.sidebarLeft);
  expect(bounds.right).toBeLessThanOrEqual(bounds.sidebarRight);
  expect(bounds.top).toBeGreaterThanOrEqual(bounds.newsletterBottom);
  expect(bounds.position).toBe("static");
  await panel.getByRole("button", { name: "Sprawdź również" }).click();
  await expect(page.locator("#recommended-articles")).toBeHidden();
  await expect(
    panel.getByRole("button", { name: "Sprawdź również" }),
  ).toBeFocused();
  await scrollToReadingProgress(page, 0.1);
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Sprawdź również" }).click();
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
  const panelBox = (await panel.boundingBox())!;
  const triggerBox = (await trigger.boundingBox())!;
  expect(
    panelBox.y + panelBox.height <= triggerBox.y ||
      panelBox.y >= triggerBox.y + triggerBox.height,
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedUrl = text;
        },
      },
    });
  });
  await trigger.click();
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Kopiuj link" }).click();
  await expect(page.locator(".share-status")).toHaveText("Link skopiowany.");
  await expect(page.locator("html")).toHaveAttribute(
    "data-copied-url",
    shareUrl.href,
  );
  await expect(page.locator(".share-copy-fallback")).toBeHidden();
  await page.mouse.click(700, 20);
  await expect(panel).toBeHidden();
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
    const schema = JSON.parse(
      document.querySelector("#article-faq-schema")!.textContent!,
    ) as {
      "@type": string;
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    return {
      before: faq.previousElementSibling?.id,
      after: faq.nextElementSibling?.id,
      items,
      schemaType: schema["@type"],
      schemaItems: schema.mainEntity.map((item) => ({
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
  const firstQuestion = page.locator("#faq summary").first();
  await firstQuestion.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#faq details").first()).not.toHaveAttribute(
    "open",
  );
  await page.keyboard.press("Space");
  await expect(page.locator("#faq details").first()).toHaveAttribute("open");
});
