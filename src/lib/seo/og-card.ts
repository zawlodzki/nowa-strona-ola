/**
 * Build-time share image (1200×630 PNG) in the 3a palette (SEO-5, decision D7:
 * generated). Switzer comes from the official static OTF files read from disk,
 * so the font never enters the bundle or `dist/` (FFL 2.0, see font README).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { OG_HEIGHT, OG_WIDTH } from "@/lib/seo/og-size";

/** Light-theme 3a tokens (design-system/tokens.css). */
const palette = {
  background: "#882f48", // --ao-primary
  text: "#fff4f6", // --ao-on-primary
  accent: "#D8E78A", // --ao-accent-on-primary
};

const root = process.cwd();
const fontDir = path.join(root, "src/assets/fonts/switzer/og");
const wordmarkFile = path.join(root, "src/assets/brand/logo-wordmark.svg");

type Weight = 400 | 600 | 700;
let assets:
  | Promise<{
      fonts: { name: string; data: Buffer; weight: Weight; style: "normal" }[];
      wordmark: string;
    }>
  | undefined;

function loadAssets() {
  assets ??= (async () => {
    const files: [string, Weight][] = [
      ["Switzer-Regular.otf", 400],
      ["Switzer-Semibold.otf", 600],
      ["Switzer-Bold.otf", 700],
    ];
    const fonts = await Promise.all(
      files.map(async ([file, weight]) => ({
        name: "Switzer",
        data: await readFile(path.join(fontDir, file)),
        weight,
        style: "normal" as const,
      })),
    );
    const svg = (await readFile(wordmarkFile, "utf8"))
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/fill="currentColor"/, `fill="${palette.text}"`);
    const wordmark = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    return { fonts, wordmark };
  })();
  return assets;
}

/** Longer titles get a smaller size so they fit in at most four lines. */
export function titleSize(title: string): number {
  if (title.length <= 34) return 84;
  if (title.length <= 60) return 70;
  if (title.length <= 90) return 58;
  return 48;
}

interface Node {
  type: string;
  props: Record<string, unknown> & { children?: unknown };
}

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra: Record<string, unknown> = {},
): Node => ({ type, props: { style, children, ...extra } });

export async function renderOgCard({
  kicker,
  title,
  footer,
}: {
  kicker: string;
  title: string;
  footer: string;
}): Promise<Buffer> {
  const { fonts, wordmark } = await loadAssets();
  const heading = title.replace(/\s*\n\s*/g, " ").trim();
  const tree = el(
    "div",
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      backgroundColor: palette.background,
      color: palette.text,
      fontFamily: "Switzer",
    },
    [
      el("img", { width: 400, height: 40 }, undefined, {
        src: wordmark,
        width: 400,
        height: 40,
      }),
      el("div", { display: "flex", flexDirection: "column", gap: 24 }, [
        el(
          "div",
          {
            fontSize: 28,
            fontWeight: 600,
            color: palette.accent,
            letterSpacing: "0.01em",
          },
          kicker,
        ),
        el(
          "div",
          {
            fontSize: titleSize(heading),
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 1000,
          },
          heading,
        ),
      ]),
      el(
        "div",
        { fontSize: 24, fontWeight: 400, opacity: 0.8, display: "flex" },
        footer,
      ),
    ],
  );
  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } })
    .render()
    .asPng();
}
