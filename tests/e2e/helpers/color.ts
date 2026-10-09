import type { Locator } from "@playwright/test";

// Compare rendered sRGB pixels rather than the browser's CSS color serialization.
export async function renderedColor(locator: Locator, property: string) {
  return locator.evaluate((element, cssProperty) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable for color verification.");
    context.fillStyle = getComputedStyle(element).getPropertyValue(cssProperty);
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return a === 255
      ? `rgb(${r}, ${g}, ${b})`
      : `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }, property);
}
