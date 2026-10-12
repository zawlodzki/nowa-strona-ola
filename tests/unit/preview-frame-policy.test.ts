import { describe, expect, it } from "vitest";

import { previewFramePolicy } from "../../preview/src/lib/frame-policy";

describe("preview frame policy", () => {
  it("allows the hosted Studio and its Sanity dashboard ancestor", () => {
    expect(
      previewFramePolicy(
        "https://studio.aleksandraolesiewicz.com/presentation",
      ),
    ).toBe(
      "frame-ancestors 'self' https://studio.aleksandraolesiewicz.com https://www.sanity.io",
    );
  });

  it("fails closed for missing, malformed or non-HTTP Studio origins", () => {
    for (const origin of ["", "not-a-url", "javascript:alert(1)"]) {
      expect(previewFramePolicy(origin)).toBe("frame-ancestors 'self'");
    }
  });
});
