import { describe, expect, it } from "vitest";

import { alternatePath, catalogPath, homePath } from "../../src/lib/paths";

describe("localized paths", () => {
  it("keeps Polish at the root and English under /en/", () => {
    expect(homePath("pl")).toBe("/");
    expect(homePath("en")).toBe("/en/");
    expect(catalogPath("pl")).toBe("/ui/");
    expect(catalogPath("en")).toBe("/en/ui/");
  });

  it("switches language without a Polish fallback on English routes", () => {
    expect(alternatePath("pl", "home")).toBe("/en/");
    expect(alternatePath("en", "home")).toBe("/");
    expect(alternatePath("pl", "catalog")).toBe("/en/ui/");
    expect(alternatePath("en", "catalog")).toBe("/ui/");
  });
});
