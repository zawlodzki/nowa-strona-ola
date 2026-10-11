import type { APIRoute, GetStaticPaths } from "astro";

import {
  absolutizeMarkdownLinks,
  getInventory,
  markdownPath,
  type InventoryEntry,
} from "@/lib/seo/inventory";

/** Markdown alternate of every indexable page: `/o-mnie/` → `/o-mnie.md`. */
export const getStaticPaths = (async () => {
  const entries = await getInventory("pl");
  return entries.map((entry) => ({
    params: { mdPath: markdownPath(entry.path).slice(1, -".md".length) },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: InventoryEntry }> = async ({ props }) => {
  const body = absolutizeMarkdownLinks(
    await props.entry.markdown(),
    props.entry.path,
  );
  return new Response(`${body.trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
