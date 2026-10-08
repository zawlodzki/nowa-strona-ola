import type { APIRoute } from "astro";

import {
  articlePath,
  blogPath,
  ebookCollectionPath,
  ebookPath,
  homePath,
  pagePath,
} from "@/lib/paths";
import {
  getArticlePaths,
  getEbookPaths,
  getLegalPagePaths,
  getPagePaths,
} from "@/sanity/repository";

const origin = "https://aleksandraolesiewicz.com";

function loc(path: string): string {
  return `${origin}${path}`;
}

export const GET: APIRoute = async () => {
  const [pages, articles, ebooks, legal] = await Promise.all([
    getPagePaths(),
    getArticlePaths(),
    getEbookPaths(),
    getLegalPagePaths(),
  ]);
  const urls = new Set<string>([
    loc(homePath("pl")),
    loc(homePath("en")),
    loc(blogPath("pl")),
    loc(blogPath("en")),
    loc(ebookCollectionPath("pl")),
    loc(ebookCollectionPath("en")),
  ]);
  for (const page of pages) {
    if (!page.slug || !page.language) continue;
    urls.add(loc(pagePath(page.language, page.slug)));
  }
  for (const article of articles) {
    if (!article.slug || !article.language) continue;
    urls.add(loc(articlePath(article.language, article.slug)));
  }
  for (const ebook of ebooks) {
    if (!ebook.slug || !ebook.language) continue;
    urls.add(loc(ebookPath(ebook.language, ebook.slug)));
  }
  for (const page of legal) {
    if (!page.slug || !page.language) continue;
    urls.add(loc(pagePath(page.language, page.slug)));
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
  .sort()
  .map((url) => `  <url><loc>${url}</loc></url>`)
  .join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
