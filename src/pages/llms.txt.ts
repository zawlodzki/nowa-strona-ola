import type { APIRoute } from "astro";

import { consultationCopy } from "@/content/consultation-seed";
import { mapConsultation } from "@/content/map-consultation";
import { getInventory } from "@/lib/seo/inventory";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { getPage } from "@/sanity/repository";

export const GET: APIRoute = async () => {
  const [entries, page] = await Promise.all([
    getInventory("pl"),
    getPage("pl", "konsultacje"),
  ]);
  const { price } = mapConsultation(page, "pl");
  return new Response(
    buildLlmsTxt(entries, { ...price, format: consultationCopy.pl.format }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
