export const PCOS_PRODUCTS = [
  { code: "ebook-01", slug: "suplementy-w-pcos" },
  { code: "ebook-02", slug: "badania-ktore-maja-sens" },
  { code: "ebook-03", slug: "szczupla-a-jednak-pcos" },
] as const;

export type CheckoutProductCode = string;
export type PcosProductCode = CheckoutProductCode;

export function toCheckoutProductCode(
  value: unknown,
): CheckoutProductCode | undefined {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{1,63}$/.test(value)
    ? value
    : undefined;
}
export const toPcosProductCode = toCheckoutProductCode;

export interface CheckoutOfferProduct {
  productCode: CheckoutProductCode;
  title: string;
  stripePriceId: string;
  priceGross: number;
}
export interface CheckoutOffer {
  products: readonly [CheckoutOfferProduct, CheckoutOfferProduct];
  kicker: string;
  title: string;
  lead: string;
  stripeCouponId: string;
}
export interface CheckoutCatalogProduct extends CheckoutOfferProduct {
  availability?: "planned" | "presale" | "available" | "paused";
  crossSell: CheckoutOffer | null;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`Brak pola katalogu płatności: ${field}.`);
  return value;
}
function product(value: unknown): CheckoutOfferProduct {
  if (!record(value))
    throw new Error("Niepoprawny produkt katalogu płatności.");
  const productCode = toCheckoutProductCode(value.productCode);
  const stripePriceId = text(value.stripePriceId, "stripePriceId");
  if (
    !productCode ||
    !/^price_[A-Za-z0-9]+$/.test(stripePriceId) ||
    value.priceGross !== 97
  )
    throw new Error("Niepoprawna konfiguracja ceny produktu.");
  return {
    productCode,
    stripePriceId,
    priceGross: 97,
    title: text(value.title, "title"),
  };
}
export function parseCheckoutCatalog(value: unknown): CheckoutCatalogProduct[] {
  if (!Array.isArray(value)) throw new Error("Niepoprawny katalog płatności.");
  const catalog = value
    .filter((item) => record(item) && !!item.stripePriceId)
    .map((item): CheckoutCatalogProduct => {
      const parsed = product(item);
      const availability: CheckoutCatalogProduct["availability"] =
        record(item) &&
        (item.availability === "planned" ||
          item.availability === "presale" ||
          item.availability === "available" ||
          item.availability === "paused")
          ? item.availability
          : undefined;
      const base = { ...parsed, availability };
      if (!record(item) || !item.crossSell) return { ...base, crossSell: null };
      const offer = item.crossSell;
      if (
        !record(offer) ||
        !Array.isArray(offer.products) ||
        offer.products.length !== 2
      )
        throw new Error("Oferta wymaga dokładnie dwóch e-booków.");
      const first = product(offer.products[0]);
      const second = product(offer.products[1]);
      if (
        new Set([base.productCode, first.productCode, second.productCode])
          .size !== 3
      )
        throw new Error(
          "Oferta wymaga dwóch różnych, komplementarnych e-booków.",
        );
      return {
        ...base,
        crossSell: {
          products: [first, second],
          kicker: text(offer.kicker, "kicker"),
          title: text(offer.title, "title"),
          lead: text(offer.lead, "lead"),
          stripeCouponId: text(offer.stripeCouponId, "stripeCouponId"),
        },
      };
    });
  const codes = new Set(catalog.map((item) => item.productCode));
  if (codes.size !== catalog.length)
    throw new Error("Powtórzony kod produktu płatności.");
  for (const item of catalog)
    for (const child of item.crossSell?.products ?? []) {
      const canonical = catalog.find(
        (entry) => entry.productCode === child.productCode,
      );
      if (
        !canonical ||
        canonical.stripePriceId !== child.stripePriceId ||
        canonical.title !== child.title
      )
        throw new Error("Oferta wskazuje produkt spoza katalogu płatności.");
    }
  return catalog;
}
