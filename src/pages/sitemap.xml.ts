import type { APIRoute } from "astro";

import {
  articlePath,
  blogPath,
  ebookCollectionPath,
  ebookPath,
  enabledLocales,
  homePath,
  isLocaleEnabled,
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
  const urls = new Set<string>(
    enabledLocales.flatMap((language) => [
      loc(homePath(language)),
      loc(blogPath(language)),
      loc(ebookCollectionPath(language)),
    ]),
  );
  for (const page of pages) {
    if (!page.slug || !page.language || !isLocaleEnabled(page.language))
      continue;
    urls.add(loc(pagePath(page.language, page.slug)));
  }
  for (const article of articles) {
    if (
      !article.slug ||
      !article.language ||
      !isLocaleEnabled(article.language)
    )
      continue;
    urls.add(loc(articlePath(article.language, article.slug)));
  }
  for (const ebook of ebooks) {
    if (!ebook.slug || !ebook.language || !isLocaleEnabled(ebook.language))
      continue;
    urls.add(loc(ebookPath(ebook.language, ebook.slug)));
  }
  for (const page of legal) {
    if (!page.slug || !page.language || !isLocaleEnabled(page.language))
      continue;
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
