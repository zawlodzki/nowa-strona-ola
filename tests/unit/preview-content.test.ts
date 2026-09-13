import { describe, expect, it, vi } from "vitest";

import { getPreviewPage } from "../../preview/src/lib/content";
import { PREVIEW_PAGE_QUERY } from "../../preview/src/lib/queries";

const environment = {
  SANITY_PROJECT_ID: "project123",
  SANITY_DATASET: "production",
  SANITY_STUDIO_URL: "https://studio.example.com",
  SANITY_API_READ_TOKEN: "token",
};

describe("preview content repository", () => {
  it("uses the draft-capable query with locale parameters", async () => {
    const page = {
      id: "drafts.page-en",
      language: "en" as const,
      slug: "home",
      title: "Draft title",
      eyebrow: "Draft eyebrow",
      lead: "Draft lead",
      seo: null,
    };
    const fetch = vi.fn().mockResolvedValue(page);

    await expect(
      getPreviewPage("en", "home", environment, { fetch }),
    ).resolves.toEqual(page);
    expect(fetch).toHaveBeenCalledWith(PREVIEW_PAGE_QUERY, {
      language: "en",
      slug: "home",
    });
    expect(PREVIEW_PAGE_QUERY).not.toContain('path("drafts.**")');
  });

  it("fails instead of falling back when a preview document is missing", async () => {
    const fetch = vi.fn().mockResolvedValue(null);
    await expect(
      getPreviewPage("pl", "missing", environment, { fetch }),
    ).rejects.toThrow("Brak strony podglądu pl/missing.");
  });
});
