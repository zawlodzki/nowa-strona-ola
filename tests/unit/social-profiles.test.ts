import { describe, expect, it } from "vitest";

import {
  footerSocialLinks,
  socialProfileSameAs,
} from "../../src/content/social-profiles";

const PROFILE_HREFS = [
  "https://www.instagram.com/aleksandra_olesiewicz",
  "https://www.facebook.com/dietetykolesiewicz/",
  "https://www.tiktok.com/@aleksandra_olesiewicz",
];

describe("canonical social profiles", () => {
  it("exposes the three live profile hrefs for footer and JSON-LD", () => {
    expect(footerSocialLinks().map((link) => link.href)).toEqual(PROFILE_HREFS);
    expect(socialProfileSameAs()).toEqual(PROFILE_HREFS);
    expect(footerSocialLinks().map((link) => link.label)).toEqual([
      "Instagram",
      "Facebook",
      "TikTok",
    ]);
  });
});
