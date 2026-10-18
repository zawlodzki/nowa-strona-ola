export const PCOS_PRODUCTS = [
  { code: "ebook-01", slug: "suplementy-w-pcos" },
  { code: "ebook-02", slug: "badania-ktore-maja-sens" },
  { code: "ebook-03", slug: "szczupla-a-jednak-pcos" },
] as const;

export type PcosProductCode = (typeof PCOS_PRODUCTS)[number]["code"];

export function toPcosProductCode(value: unknown): PcosProductCode | undefined {
  return PCOS_PRODUCTS.find((product) => product.code === value)?.code;
}
