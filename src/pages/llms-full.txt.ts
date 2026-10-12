import type { APIRoute } from "astro";

import { getInventory } from "@/lib/seo/inventory";
import { buildLlmsFullTxt } from "@/lib/seo/llms";

export const GET: APIRoute = async () =>
  new Response(await buildLlmsFullTxt(await getInventory("pl")), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
