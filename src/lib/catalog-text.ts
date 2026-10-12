/** Search, meta and JSON-LD keep a normal space. Visitor copy may use U+00A0. */
export function catalogText(value: string): string {
  return value.replaceAll("\u00A0", " ");
}
