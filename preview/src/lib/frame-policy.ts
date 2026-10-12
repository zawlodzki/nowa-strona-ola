export function previewFramePolicy(studioOrigin: string): string {
  const origins = new Set(["'self'"]);
  try {
    const studio = new URL(studioOrigin);
    if (studio.protocol === "https:" || studio.protocol === "http:") {
      origins.add(studio.origin);
      origins.add("https://www.sanity.io");
    }
  } catch {
    // Without a configured Studio, only same-origin framing is allowed.
  }
  return `frame-ancestors ${[...origins].join(" ")}`;
}
