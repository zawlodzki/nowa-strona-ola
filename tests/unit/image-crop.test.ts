import { describe, expect, it } from "vitest";

import {
  imageCropPosition,
  sharpCropPosition,
} from "../../src/lib/site-images";

describe("imageCropPosition", () => {
  it("keeps a percentage pair as the visitor crop instruction", () => {
    expect(imageCropPosition("50% 15%")).toBe("50% 15%");
    expect(imageCropPosition("50% 55%")).toBe("50% 55%");
    expect(imageCropPosition("50% 0%")).toBe("50% 0%");
    expect(imageCropPosition("75% 70%")).toBe("75% 70%");
  });

  it("passes a keyword through unchanged", () => {
    expect(imageCropPosition("left bottom")).toBe("left bottom");
    expect(imageCropPosition("centre")).toBe("centre");
  });

  it("does not invent a sharp keyword for a percentage", () => {
    expect(sharpCropPosition("50% 15%")).toBeUndefined();
    expect(sharpCropPosition("50% 55%")).toBeUndefined();
    expect(sharpCropPosition("left bottom")).toBe("left bottom");
    expect(sharpCropPosition()).toBeUndefined();
  });
});
