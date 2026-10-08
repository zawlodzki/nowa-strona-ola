import { defineDocuments, defineLocations } from "sanity/presentation";

export const presentationResolve = {
  mainDocuments: defineDocuments([
    {
      route: "/",
      filter: `_type == "page" && language == "pl" && slug.current == "home"`,
    },
    {
      route: "/en/",
      filter: `_type == "page" && language == "en" && slug.current == "home"`,
    },
    {
      route: "/blog/:slug",
      filter: `_type == "article" && language == "pl" && slug.current == $slug`,
    },
    {
      route: "/en/blog/:slug",
      filter: `_type == "article" && language == "en" && slug.current == $slug`,
    },
    {
      route: "/ebooki",
      filter: `_type == "page" && language == "pl" && slug.current == "ebooki"`,
    },
    {
      route: "/en/ebooks",
      filter: `_type == "page" && language == "en" && slug.current == "ebooks"`,
    },
    {
      route: "/ebooki/:slug",
      filter: `_type == "ebook" && language == "pl" && slug.current == $slug`,
    },
    {
      route: "/en/ebooks/:slug",
      filter: `_type == "ebook" && language == "en" && slug.current == $slug`,
    },
    {
      route: "/:slug",
      filter: `_type == "legalPage" && language == "pl" && slug.current == $slug`,
    },
    {
      route: "/en/:slug",
      filter: `_type == "legalPage" && language == "en" && slug.current == $slug`,
    },
    {
      route: "/:slug",
      filter: `_type == "page" && language == "pl" && slug.current == $slug`,
    },
    {
      route: "/en/:slug",
      filter: `_type == "page" && language == "en" && slug.current == $slug`,
    },
  ]),
  locations: {
    page: defineLocations({
      select: { title: "title", slug: "slug.current", language: "language" },
      resolve: (document) => {
        const slug = document?.slug;
        const language = document?.language;
        if (!slug || (language !== "pl" && language !== "en")) return null;
        const href =
          slug === "home"
            ? language === "pl"
              ? "/"
              : "/en/"
            : language === "pl"
              ? `/${slug}/`
              : `/en/${slug}/`;
        return {
          locations: [{ title: document.title || "Strona", href }],
        };
      },
    }),
    ebook: defineLocations({
      select: { title: "title", slug: "slug.current", language: "language" },
      resolve: (document) => {
        const slug = document?.slug;
        const language = document?.language;
        if (!slug || (language !== "pl" && language !== "en")) return null;
        const href =
          language === "pl" ? `/ebooki/${slug}/` : `/en/ebooks/${slug}/`;
        return {
          locations: [{ title: document.title || "E-book", href }],
        };
      },
    }),
    legalPage: defineLocations({
      select: { title: "title", slug: "slug.current", language: "language" },
      resolve: (document) => {
        const slug = document?.slug;
        const language = document?.language;
        if (!slug || (language !== "pl" && language !== "en")) return null;
        const href = language === "pl" ? `/${slug}/` : `/en/${slug}/`;
        return {
          locations: [{ title: document.title || "Strona prawna", href }],
        };
      },
    }),
    article: defineLocations({
      select: { title: "title", slug: "slug.current", language: "language" },
      resolve: (document) => {
        const slug = document?.slug;
        const language = document?.language;
        if (!slug || (language !== "pl" && language !== "en")) return null;
        const href = language === "pl" ? `/blog/${slug}/` : `/en/blog/${slug}/`;
        return {
          locations: [
            { title: document.title || "Artykuł", href },
            {
              title: language === "pl" ? "Blog" : "Blog",
              href: language === "pl" ? "/blog/" : "/en/blog/",
            },
          ],
        };
      },
    }),
    siteSettings: defineLocations({
      message: "Te ustawienia wpływają na nawigację i stopkę wszystkich stron.",
      tone: "caution",
    }),
  },
};
