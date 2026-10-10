import { expect, test, type Page } from "@playwright/test";

const pages = [
  {
    path: "/",
    heading: "Z kim pracuję",
    titles: ["PCOS", "Insulinooporność", "Starania o ciążę", "Perimenopauza"],
  },
  {
    path: "/en/",
    heading: "Who I work with",
    titles: [
      "PCOS",
      "Insulin resistance",
      "Trying to conceive",
      "Perimenopause",
    ],
  },
] as const;

type Rgba = [number, number, number, number];

// Contrast of each card's text and icon against the card's painted background.
async function cardContrast(page: Page) {
  return page.locator("#z-kim-pracuje li").evaluateAll((cards) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas unavailable.");
    const rgba = (value: string): Rgba => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const over = (top: Rgba, bottom: Rgba): Rgba => [
      top[0] * top[3] + bottom[0] * (1 - top[3]),
      top[1] * top[3] + bottom[1] * (1 - top[3]),
      top[2] * top[3] + bottom[2] * (1 - top[3]),
      1,
    ];
    const background = (element: Element | null): Rgba => {
      const layers: Rgba[] = [];
      for (let node = element; node; node = node.parentElement) {
        const layer = rgba(getComputedStyle(node).backgroundColor);
        if (layer[3] > 0) layers.push(layer);
        if (layer[3] === 1) break;
      }
      return layers.reduceRight<Rgba>(
        (bottom, top) => over(top, bottom),
        [255, 255, 255, 1],
      );
    };
    const luminance = ([r, g, b]: Rgba) => {
      const channel = (value: number) => {
        const s = value / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const ratio = (a: Rgba, b: Rgba) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    return cards.map((card) => {
      const base = background(card);
      const title = card.querySelector("h3");
      const body = card.querySelector("p");
      const icon = card.querySelector(".home3a-audience__icon");
      const counter = rgba(getComputedStyle(card, "::after").color);
      return {
        title: title
          ? ratio(over(rgba(getComputedStyle(title).color), base), base)
          : 0,
        body: body
          ? ratio(over(rgba(getComputedStyle(body).color), base), base)
          : 0,
        counter: ratio(over(counter, base), base),
        icon: icon
          ? ratio(
              over(rgba(getComputedStyle(icon).color), background(icon)),
              background(icon),
            )
          : 3,
      };
    });
  });
}

for (const entry of pages) {
  test(`audience section replaces the logo strip on ${entry.path}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(entry.path);
    await expect(page.locator(".home3a-partners")).toHaveCount(0);
    const section = page.locator("#z-kim-pracuje");
    await expect(
      section.getByRole("heading", { level: 2, name: entry.heading }),
    ).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveText([
      ...entry.titles,
    ]);
    // The section sits directly after the hero, where the logos were.
    const order = await page.evaluate(() =>
      [...document.querySelectorAll("main.home3a > section")]
        .slice(0, 3)
        .map((element) => element.id),
    );
    expect(order).toEqual(["start", "z-kim-pracuje", "dlaczego-ja"]);
    const icons = section.locator(".home3a-audience__icon");
    await expect(icons).toHaveCount(entry.titles.length);
    for (const icon of await icons.all()) {
      await expect(icon).toHaveAttribute("aria-hidden", "true");
      await expect(icon.locator("svg")).toHaveCount(1);
      await expect(icon.locator("img")).toHaveCount(0);
    }
    await expect(section.locator("img")).toHaveCount(0);
  });
}

for (const { width, columns } of [
  { width: 1440, columns: 4 },
  { width: 820, columns: 2 },
  { width: 390, columns: 1 },
  { width: 360, columns: 1 },
]) {
  test(`audience cards use ${columns} column(s) at ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const lefts = await page
      .locator("#z-kim-pracuje li")
      .evaluateAll((cards) =>
        cards.map((card) => Math.round(card.getBoundingClientRect().left)),
      );
    expect(new Set(lefts).size).toBe(columns);
    const overflow = await page.evaluate(() => {
      const section = document.querySelector("#z-kim-pracuje");
      if (!section) return true;
      const cards = [...section.querySelectorAll("li, li *")];
      return (
        document.documentElement.scrollWidth > window.innerWidth ||
        cards.some(
          (element) =>
            element.getBoundingClientRect().right > window.innerWidth,
        )
      );
    });
    expect(overflow).toBe(false);
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`audience cards meet AA contrast in ${colorScheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const entry of pages) {
      await page.goto(entry.path);
      const results = await cardContrast(page);
      expect(results).toHaveLength(entry.titles.length);
      for (const result of results) {
        expect(result.title).toBeGreaterThanOrEqual(4.5);
        expect(result.body).toBeGreaterThanOrEqual(4.5);
        expect(result.counter).toBeGreaterThanOrEqual(4.5);
        expect(result.icon).toBeGreaterThanOrEqual(3);
      }
    }
  });
}
