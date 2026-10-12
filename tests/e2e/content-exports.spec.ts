import { expect, test } from "@playwright/test";

test("RSS serves valid XML with complete readable article HTML", async ({
  page,
  request,
}) => {
  const response = await request.get("/blog/rss.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const parsed = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "application/xml");
    return {
      errors: document.querySelectorAll("parsererror").length,
      items: Array.from(document.querySelectorAll("item"), (item) => {
        const html =
          item.getElementsByTagNameNS(
            "http://purl.org/rss/1.0/modules/content/",
            "encoded",
          )[0]?.textContent ?? "";
        const content = new DOMParser().parseFromString(html, "text/html");
        return {
          link: item.querySelector("link")?.textContent,
          title: item.querySelector("title")?.textContent,
          heading: content.querySelector("h1")?.textContent,
          paragraphs: content.querySelectorAll("p").length,
          unsafe: content.querySelectorAll(
            "script, iframe, [onerror], [onclick]",
          ).length,
          relativeLinks: Array.from(
            content.querySelectorAll("a[href], img[src]"),
          ).filter(
            (element) =>
              !/^(https?:|mailto:|tel:)/.test(
                element.getAttribute("href") ??
                  element.getAttribute("src") ??
                  "",
              ),
          ).length,
        };
      }),
    };
  }, xml);
  expect(parsed.errors).toBe(0);
  expect(parsed.items.length).toBeGreaterThan(0);
  for (const item of parsed.items) {
    expect(item.link).toMatch(
      /^https:\/\/aleksandraolesiewicz.com\/blog\/[^/]+\/$/,
    );
    expect(item.heading).toBe(item.title);
    expect(item.paragraphs).toBeGreaterThan(1);
    expect(item.unsafe).toBe(0);
    expect(item.relativeLinks).toBe(0);
  }
});

test("full key-page export matches the standalone Markdown documents", async ({
  request,
}) => {
  const response = await request.get("/llms-full.txt");
  expect(response.status()).toBe(200);
  const text = await response.text();
  const documents = Array.from(
    text.matchAll(
      /^Źródło: (https:[^\n]+)\n\n([\s\S]*?)(?=\n\n---\n\nŹródło: |(?![\s\S]))/gm,
    ),
  );
  expect(documents.length).toBeGreaterThan(4);
  for (const [, url, body] of documents) {
    const path = new URL(url).pathname;
    const markdownPath =
      path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`;
    const markdown = await request.get(markdownPath);
    expect(markdown.status()).toBe(200);
    expect(body.trimEnd()).toBe((await markdown.text()).trimEnd());
  }
});
