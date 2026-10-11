import type { APIRoute } from "astro";

import { getInventory } from "@/lib/seo/inventory";
import { buildRss } from "@/lib/seo/rss";

export const GET: APIRoute = async () => {
  const entries = await getInventory("pl");
  const blog = entries.find((entry) => entry.kind === "blog");
  if (!blog) throw new Error("Brak strony bloga w spisie stron.");
  return new Response(
    buildRss(
      blog,
      entries.filter((entry) => entry.kind === "article"),
    ),
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
};
