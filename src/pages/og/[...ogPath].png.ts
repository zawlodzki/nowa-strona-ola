import type { APIRoute, GetStaticPaths } from "astro";

import {
  getInventory,
  ogCard,
  ogCardPath,
  type InventoryEntry,
} from "@/lib/seo/inventory";
import { renderOgCard } from "@/lib/seo/og-card";

/** Generated share image of every inventory page (decision D7, 11.10.2026). */
export const getStaticPaths = (async () => {
  const entries = await getInventory("pl");
  return entries.map((entry) => ({
    params: {
      ogPath: ogCardPath(entry.path).slice("/og/".length, -".png".length),
    },
    props: { entry },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: InventoryEntry }> = async ({ props }) => {
  const png = await renderOgCard({
    ...ogCard(props.entry, "pl"),
    footer: "aleksandraolesiewicz.com",
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
