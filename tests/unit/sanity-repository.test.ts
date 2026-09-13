import { describe, expect, it, vi } from "vitest";

import { PUBLISHED_PAGE_QUERY } from "../../src/sanity/queries";
import { getPage, type PageContent } from "../../src/sanity/repository";

const page: PageContent = {
  id: "page-en",
  language: "en",
  slug: "home",
  title: "Title",
  eyebrow: "Eyebrow",
  lead: "Lead",
  seo: null,
};

describe("published page repository", () => {
  it("uses the matching demonstration page without Sanity configuration", async () => {
    await expect(
      getPage("pl", "home", { environment: {} }),
    ).resolves.toMatchObject({
      language: "pl",
      slug: "home",
    });
  });

  it("queries by language and slug and returns the published result", async () => {
    const fetch = vi.fn().mockResolvedValue(page);

    await expect(
      getPage("en", "home", {
        environment: {},
        client: { fetch },
      }),
    ).resolves.toEqual(page);
    expect(fetch).toHaveBeenCalledWith(PUBLISHED_PAGE_QUERY, {
      language: "en",
      slug: "home",
    });
    expect(PUBLISHED_PAGE_QUERY).toContain('path("drafts.**")');
  });

  it("fails the build when the published page is missing", async () => {
    const fetch = vi.fn().mockResolvedValue(null);

    await expect(
      getPage("en", "missing", { environment: {}, client: { fetch } }),
    ).rejects.toThrow("Brak opublikowanej strony en/missing.");
  });

  it("rejects a mismatched response", async () => {
    const fetch = vi.fn().mockResolvedValue({ ...page, language: "pl" });

    await expect(
      getPage("en", "home", { environment: {}, client: { fetch } }),
    ).rejects.toThrow("Sanity zwróciło stronę niezgodną");
  });
});
