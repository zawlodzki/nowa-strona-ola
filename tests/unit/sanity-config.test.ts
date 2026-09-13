import { describe, expect, it } from "vitest";

import { readSanityPublicConfig } from "../../src/sanity/config";

describe("readSanityPublicConfig", () => {
  it("uses fixture mode when both public values are absent", () => {
    expect(readSanityPublicConfig({})).toBeNull();
  });

  it("accepts a complete configuration", () => {
    expect(
      readSanityPublicConfig({
        PUBLIC_SANITY_PROJECT_ID: "project123",
        PUBLIC_SANITY_DATASET: "production",
      }),
    ).toEqual({ projectId: "project123", dataset: "production" });
  });

  it("rejects a partial configuration", () => {
    expect(() =>
      readSanityPublicConfig({ PUBLIC_SANITY_PROJECT_ID: "project123" }),
    ).toThrow(/PUBLIC_SANITY_PROJECT_ID/);
  });
});
