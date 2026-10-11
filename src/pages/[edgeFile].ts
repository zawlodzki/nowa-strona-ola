import type { APIRoute, GetStaticPaths } from "astro";

import { buildHeadersFile, buildRedirectsFile } from "@/lib/seo/edge-files";
import { getInventory } from "@/lib/seo/inventory";
import { isIndexingEnabled } from "@/lib/seo/site";
import { listRedirects } from "@/sanity/repository";

/** Cloudflare Workers Static Assets `_headers` and `_redirects` (SEO-3). */
export const getStaticPaths = (() => [
  { params: { edgeFile: "_headers" } },
  { params: { edgeFile: "_redirects" } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const body =
    params.edgeFile === "_headers"
      ? buildHeadersFile({ indexing: isIndexingEnabled() })
      : buildRedirectsFile(
          await listRedirects(),
          (await getInventory("pl")).map((entry) => entry.path),
        );
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
