const UNPUBLISHABLE_MARKERS = ["{{", "[do sprawdzenia"] as const;

function texts(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      key.startsWith("_") ? [] : texts(child),
    );
  }
  return [];
}

/**
 * Fragments of a legalPage body that must not be published: unresolved
 * `{{PLACEHOLDER}}`s and `[do sprawdzenia …]` notes from the legal drafts.
 */
export function unpublishableLegalText(body: unknown): string[] {
  return texts(body).flatMap((text) =>
    UNPUBLISHABLE_MARKERS.flatMap((marker) => {
      const at = text.indexOf(marker);
      return at === -1 ? [] : [text.slice(at, at + 60)];
    }),
  );
}
