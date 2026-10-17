export type TemplateRegion = {
  id: string;
  path: string | null;
  classes: readonly string[];
  seedField: string;
};

export const templateRegions = [
  {
    id: "home",
    path: "index.html",
    classes: [
      "home3a",
      "home3a-portrait",
      "home3a-audience",
      "home3a-about",
      "home3a-results",
    ],
    seedField: "heroLine",
  },
  {
    id: "about",
    path: "o-mnie/index.html",
    classes: [
      "about3a",
      "about3a-portrait",
      "about3a-story",
      "about3a-diploma",
    ],
    seedField: "aboutLine",
  },
  {
    id: "consultation",
    path: "konsultacje/index.html",
    classes: [
      "consult3a",
      "consult3a-portrait",
      "consult3a-audience",
      "consult3a-process",
    ],
    seedField: "consultationLine",
  },
  {
    id: "ebooks",
    path: "ebooki/index.html",
    classes: ["ebooks3a", "ebooks3a-intro", "ebooks3a-catalog"],
    seedField: "collectionNote",
  },
  {
    id: "ebook",
    path: null,
    classes: ["ebook3a", "ebook3a-stage", "ebook3a-offer"],
    seedField: "offerNote",
  },
  {
    id: "blog",
    path: "blog/index.html",
    classes: ["blog3a", "blog3a-heading", "blog3a-collection"],
    seedField: "blogTitle",
  },
  {
    id: "article",
    path: null,
    classes: ["article3a", "article-heading", "article-main-image"],
    seedField: "featuredTitle",
  },
  {
    id: "legal",
    path: "polityka-prywatnosci/index.html",
    classes: ["legal3a", "legal-heading", "legal-layout"],
    seedField: "privacyTitle",
  },
  {
    id: "contact",
    path: "kontakt/index.html",
    classes: ["contact3a", "contact3a-intro", "contact3a-grid"],
    seedField: "contactLine",
  },
  {
    id: "withdrawal",
    path: "odstapienie/index.html",
    classes: ["withdrawal3a", "withdrawal3a-intro", "withdrawal3a-form"],
    seedField: "withdrawalLine",
  },
] as const satisfies readonly TemplateRegion[];

export function regionById(id: (typeof templateRegions)[number]["id"]) {
  const region = templateRegions.find((item) => item.id === id);
  if (!region) throw new Error(`unknown template region ${id}`);
  return region;
}
