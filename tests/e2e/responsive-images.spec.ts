import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/o-mnie/",
  "/kontakt/",
  "/konsultacje/",
  "/blog/",
  "/blog/cel-konsultacji/",
  "/ebooki/",
  "/ebooki/czy-to-juz/",
  "/design-system/",
];

// Steers clear of the 16px bands above each layout breakpoint, where `sizes`
// deliberately overstates the slot (see src/lib/image-sizes.ts).
const viewports = [
  320, 375, 560, 767, 800, 879, 900, 999, 1100, 1199, 1280, 1440, 1920,
];

type SlotFit = { src: string; rendered: number; slot: number };

for (const width of viewports) {
  test(`sizes matches the rendered image width at ${width}px`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "layout is engine-independent");
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await test.step(`${route} at ${width}px`, async () => {
        await page.goto(route);
        const fits = await page.$$eval("img", (images): SlotFit[] => {
          function splitTopLevel(value: string): string[] {
            const parts: string[] = [];
            let depth = 0;
            let start = 0;
            for (let i = 0; i < value.length; i += 1) {
              if (value[i] === "(") depth += 1;
              if (value[i] === ")") depth -= 1;
              if (value[i] === "," && depth === 0) {
                parts.push(value.slice(start, i).trim());
                start = i + 1;
              }
            }
            parts.push(value.slice(start).trim());
            return parts;
          }
          function slotWidth(sizes: string): number {
            const entry = splitTopLevel(sizes).find((candidate) => {
              if (!candidate.startsWith("(")) return true;
              const end = candidate.indexOf(")") + 1;
              return matchMedia(candidate.slice(0, end)).matches;
            });
            const length = entry!.startsWith("(")
              ? entry!.slice(entry!.indexOf(")") + 1).trim()
              : entry!;
            const probe = document.createElement("div");
            probe.style.cssText = `position:absolute;inline-size:${length}`;
            document.body.append(probe);
            const measured = probe.getBoundingClientRect().width;
            probe.remove();
            return measured;
          }
          return images
            .filter((image) => /\/_astro\/.+\.webp/.test(image.src))
            .map((image) => ({
              src: image.getAttribute("src") ?? "",
              rendered: image.getBoundingClientRect().width,
              slot: image.sizes ? slotWidth(image.sizes) : 0,
            }))
            .filter((fit) => fit.rendered > 0);
        });
        expect(fits.length, "page renders optimised images").toBeGreaterThan(0);
        for (const fit of fits) {
          const ratio = fit.slot / fit.rendered;
          expect(ratio, `${fit.src} slot not understated`).toBeGreaterThan(
            0.95,
          );
          expect(ratio, `${fit.src} slot not overstated`).toBeLessThan(1.3);
        }
      });
    }
  });
}

test("optimised pictures offer the same responsive slots in AVIF and WebP", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "markup is engine-independent");
  for (const route of routes) {
    await page.goto(route);
    const invalid = await page.$$eval("img", (images) =>
      images
        .filter((image) => /\/_astro\/.+\.webp/.test(image.src))
        .filter((image) => {
          const avif = image
            .closest("picture")
            ?.querySelector('source[type="image/avif"]');
          const widths = (srcset: string) =>
            srcset
              .split(",")
              .map((entry) => entry.trim().split(/\s+/).at(-1))
              .join(",");
          return (
            !image.srcset ||
            !image.sizes ||
            !avif?.getAttribute("srcset") ||
            avif.getAttribute("sizes") !== image.sizes ||
            widths(avif.getAttribute("srcset") ?? "") !== widths(image.srcset)
          );
        })
        .map((image) => image.getAttribute("src")),
    );
    expect(
      invalid,
      `${route} pictures with missing or mismatched sources`,
    ).toEqual([]);
  }
});

test.describe("hero format negotiation without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  for (const format of ["avif", "webp"]) {
    test(`the browser downloads and decodes ${format.toUpperCase()}`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "format negotiation is covered in Chromium",
      );
      if (format === "webp") {
        await page.route("/", async (route) => {
          const response = await route.fetch();
          const body = (await response.text()).replaceAll(
            'type="image/avif"',
            'type="image/unsupported"',
          );
          await route.fulfill({ response, body });
        });
      }

      const [imageResponse] = await Promise.all([
        page.waitForResponse((response) =>
          /\/_astro\/hero\./.test(new URL(response.url()).pathname),
        ),
        page.goto("/"),
      ]);

      expect(imageResponse.ok()).toBe(true);
      expect(imageResponse.headers()["content-type"]).toBe(`image/${format}`);
      const hero = page.locator(".home3a-portrait img");
      const currentSource = await hero.evaluate(async (image) => {
        if (!(image instanceof HTMLImageElement))
          throw new Error("Expected hero image");
        await image.decode();
        return image.currentSrc;
      });
      expect(currentSource).toBe(imageResponse.url());
    });
  }
});
