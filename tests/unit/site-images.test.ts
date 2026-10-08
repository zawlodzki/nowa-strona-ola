import { describe, expect, it } from "vitest";

import { imageCropPosition, pickSiteImage } from "../../src/lib/site-images";

describe("pickSiteImage", () => {
  it("maps mockup keys to local raster files", () => {
    expect(pickSiteImage("hero")).toEqual({ type: "local", key: "hero" });
    expect(pickSiteImage("food", "about")).toEqual({
      type: "local",
      key: "food",
    });
  });

  it("keeps partner SVGs out of the raster pipeline", () => {
    expect(pickSiteImage("alab")).toEqual({ type: "svg", key: "alab" });
  });

  it("passes CMS and root URLs through as remote sources", () => {
    expect(
      pickSiteImage("https://cdn.sanity.io/images/dyuqkn8c/production/a.webp"),
    ).toEqual({
      type: "remote",
      src: "https://cdn.sanity.io/images/dyuqkn8c/production/a.webp",
    });
    expect(pickSiteImage("/images/uploaded.webp", "hero")).toEqual({
      type: "remote",
      src: "/images/uploaded.webp",
    });
  });

  it("uses the mockup fallback when CMS media is empty or unknown", () => {
    expect(pickSiteImage(undefined, "about")).toEqual({
      type: "local",
      key: "about",
    });
    expect(pickSiteImage("missing-key", "hero")).toEqual({
      type: "local",
      key: "hero",
    });
  });

  it("does not invent a file when there is no fallback", () => {
    expect(pickSiteImage(undefined)).toBeUndefined();
    expect(pickSiteImage("missing-scan")).toBeUndefined();
  });

  it("maps the graduation photo to the local diploma file", () => {
    expect(pickSiteImage("diploma")).toEqual({ type: "local", key: "diploma" });
  });
});

describe("imageCropPosition", () => {
  it("maps CSS hotspot percentages to Sharp gravity", () => {
    expect(imageCropPosition("50% 15%")).toBe("top");
    expect(imageCropPosition("50% 25%")).toBe("top");
    expect(imageCropPosition("0% 100%")).toBe("left bottom");
    expect(imageCropPosition("75% 70%")).toBe("right bottom");
    expect(imageCropPosition("50% 0%")).toBe("top");
    expect(imageCropPosition("50% 50%")).toBe("centre");
    expect(imageCropPosition()).toBeUndefined();
  });
});
