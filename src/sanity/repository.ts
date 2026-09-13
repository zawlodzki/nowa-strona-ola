import { createClient } from "@sanity/client";
import type { Locale } from "@ola/shared";
import type { PUBLISHED_PAGE_QUERY_RESULT } from "../sanity.types";

import { sanityApiVersion, readSanityPublicConfig } from "./config";
import { demonstrationPages } from "./fixtures";
import { PUBLISHED_PAGE_QUERY } from "./queries";

export type PageContent = NonNullable<PUBLISHED_PAGE_QUERY_RESULT>;

interface PageFetcher {
  fetch: (
    query: string,
    parameters: { language: Locale; slug: string },
  ) => Promise<PageContent | null>;
}

export function createPublishedContentClient(config: {
  projectId: string;
  dataset: string;
}): PageFetcher {
  return createClient({
    ...config,
    apiVersion: sanityApiVersion,
    perspective: "published",
    useCdn: false,
  });
}

export async function getPage(
  language: Locale,
  slug: string,
  options: {
    environment?: Record<string, string | undefined>;
    client?: PageFetcher;
  } = {},
): Promise<PageContent> {
  const environment = options.environment ?? import.meta.env;
  const config = readSanityPublicConfig(environment);

  if (!config && !options.client) {
    const fixture = slug === "home" ? demonstrationPages[language] : undefined;
    if (!fixture)
      throw new Error(`Brak demonstracyjnej strony ${language}/${slug}.`);
    return fixture;
  }

  const client = options.client ?? createPublishedContentClient(config!);
  const page = await client.fetch(PUBLISHED_PAGE_QUERY, { language, slug });

  if (!page) throw new Error(`Brak opublikowanej strony ${language}/${slug}.`);
  if (page.language !== language || page.slug !== slug) {
    throw new Error(
      `Sanity zwróciło stronę niezgodną z żądaniem ${language}/${slug}.`,
    );
  }

  return page;
}
