import type { APIRoute } from "astro";

import { buildRobotsTxt } from "@/lib/seo/robots";
import { isIndexingEnabled } from "@/lib/seo/site";

export const GET: APIRoute = () =>
  new Response(buildRobotsTxt({ indexing: isIndexingEnabled() }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
