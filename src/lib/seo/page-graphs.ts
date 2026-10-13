/**
 * Page graphs (docs/SEO-GEO-AEO-PLAN.md, section 4). Every node mirrors visible
 * content of the same view; references resolve inside the page graph.
 */
import type { Article3aView } from "@/content/map-article";
import type { BlogCollectionView } from "@/content/map-blog-collection";
import type { ConsultationView } from "@/content/map-consultation";
import { canPurchase, type EbookView } from "@/content/map-ebook";
import type { EbookCollectionView } from "@/content/map-ebook-collection";
import type { LegalPageView } from "@/content/map-legal";
import { schemaOfferAvailability } from "@/lib/offer";
import { blogPath } from "@/lib/paths";
import {
  blogNode,
  breadcrumbId,
  breadcrumbList,
  faqPage,
  itemList,
  ref,
  webPage,
  webPageId,
  type GraphContext,
  type JsonLdNode,
} from "@/lib/seo/graph";
import { absoluteUrl, entityId, htmlLang, pageEntityId } from "@/lib/seo/site";

export type PageGraph = (ctx: GraphContext) => JsonLdNode[];

const blogName = { pl: "Blog Aleksandry Olesiewicz", en: "Blog" } as const;

/** Site owner by `@id`; any other author as an inline Person. */
function authorRef(ctx: GraphContext, name: string, jobTitle?: string) {
  if (name === ctx.site.person.name) return ref(entityId.person);
  return { "@type": "Person", name, ...(jobTitle ? { jobTitle } : {}) };
}

export function homeGraph(): PageGraph {
  return (ctx) => [webPage(ctx, "WebPage", { about: ref(entityId.person) })];
}

export function aboutGraph(): PageGraph {
  return (ctx) => [
    webPage(ctx, "ProfilePage", {
      mainEntity: ref(entityId.person),
      about: ref(entityId.person),
    }),
  ];
}

export function contactGraph(): PageGraph {
  return (ctx) => [
    webPage(ctx, "ContactPage", { mainEntity: ref(entityId.person) }),
  ];
}

export function plainPageGraph(): PageGraph {
  return (ctx) => [webPage(ctx)];
}

export function consultationGraph(
  view: ConsultationView,
  formatLabel: string,
): PageGraph {
  return (ctx) => {
    const serviceId = pageEntityId(ctx.path, "service");
    const { price } = view;
    const nodes: JsonLdNode[] = [
      webPage(ctx, "WebPage", { about: ref(serviceId) }),
      {
        "@type": "Service",
        "@id": serviceId,
        name: price.name,
        ...(price.serviceType ? { serviceType: price.serviceType } : {}),
        description: view.hero.lead.replace(/\s*\n\s*/g, " "),
        url: absoluteUrl(ctx.path),
        provider: ref(entityId.person),
        ...(price.channel === "online"
          ? {
              availableChannel: {
                "@type": "ServiceChannel",
                name: "Online",
                serviceUrl: view.offer.action.href,
              },
            }
          : {}),
        ...(price.audience
          ? { audience: { "@type": "Audience", audienceType: price.audience } }
          : {}),
        ...(price.deliverables?.length
          ? {
              serviceOutput: price.deliverables.map((name) => ({
                "@type": "Thing",
                name,
              })),
            }
          : {}),
        ...(price.termsPath
          ? { termsOfService: absoluteUrl(price.termsPath) }
          : {}),
        offers: {
          "@type": "Offer",
          "@id": pageEntityId(ctx.path, "offer"),
          price: price.price,
          priceCurrency: price.currency,
          description: `${price.durationLabel} · ${formatLabel}`,
          url: absoluteUrl(ctx.path),
          seller: ref(entityId.seller),
        },
      },
    ];
    if (view.faq.items.length) {
      nodes.push(faqPage(ctx, view.faq.items, serviceId));
    }
    return nodes;
  };
}

export function ebookGraph(view: EbookView): PageGraph {
  return (ctx) => {
    const productId = pageEntityId(ctx.path, "product");
    const { landing } = view;
    const offer =
      canPurchase(view.availability) && view.checkoutUrl
        ? {
            "@type": "Offer",
            price: view.priceGross,
            priceCurrency: view.currency,
            availability: schemaOfferAvailability(view.availability),
            url: view.checkoutUrl,
            seller: ref(entityId.seller),
          }
        : undefined;
    const nodes: JsonLdNode[] = [
      webPage(ctx, "WebPage", { about: ref(productId) }),
      {
        "@type": offer ? ["Product", "Book"] : "Book",
        "@id": productId,
        name: view.title,
        description: landing.heroLead.replace(/\s*\n\s*/g, " "),
        url: absoluteUrl(ctx.path),
        bookFormat: "https://schema.org/EBook",
        ...(view.numberOfPages ? { numberOfPages: view.numberOfPages } : {}),
        ...(view.publishedAt ? { datePublished: view.publishedAt } : {}),
        inLanguage: htmlLang[ctx.lang],
        author: authorRef(ctx, view.author.name, view.author.role),
        publisher: ref(entityId.person),
        ...(ctx.imageUrl ? { image: ctx.imageUrl } : {}),
        ...(view.chapters.length
          ? {
              hasPart: view.chapters.map((chapter) => ({
                "@type": "Chapter",
                name: chapter.title,
              })),
            }
          : {}),
        ...(offer ? { offers: offer } : {}),
      },
    ];
    if (landing.faq.items.length) {
      nodes.push(faqPage(ctx, landing.faq.items, productId));
    }
    return nodes;
  };
}

export function ebookCollectionGraph(view: EbookCollectionView): PageGraph {
  return (ctx) => [
    webPage(ctx, "CollectionPage", {
      mainEntity: ref(pageEntityId(ctx.path, "itemlist")),
      breadcrumb: ref(breadcrumbId(ctx.path)),
    }),
    itemList(
      ctx.path,
      view.visibleItems.map((item) => ({ href: item.href, label: item.title })),
    ),
    breadcrumbList(ctx.path, view.breadcrumbs),
  ];
}

export function blogCollectionGraph(view: BlogCollectionView): PageGraph {
  return (ctx) => {
    const blogHref = blogPath(ctx.lang);
    const items = [...(view.latest ? [view.latest] : []), ...view.items];
    return [
      blogNode(ctx.lang, blogHref, blogName[ctx.lang]),
      ...(view.category
        ? [
            {
              "@type": "DefinedTerm",
              "@id": pageEntityId(ctx.path, "topic"),
              name: view.category.title,
              ...(view.category.description
                ? { description: view.category.description }
                : {}),
              ...(view.category.sameAs.length
                ? { sameAs: view.category.sameAs }
                : {}),
            } satisfies JsonLdNode,
          ]
        : []),
      webPage(ctx, "CollectionPage", {
        about: ref(
          view.category ? pageEntityId(ctx.path, "topic") : entityId.blog,
        ),
        mainEntity: ref(pageEntityId(ctx.path, "itemlist")),
        breadcrumb: ref(breadcrumbId(ctx.path)),
      }),
      itemList(
        ctx.path,
        items.map((item) => ({ href: item.href, label: item.title })),
      ),
      breadcrumbList(ctx.path, view.breadcrumbs),
    ];
  };
}

export function articleGraph(view: Article3aView): PageGraph {
  return (ctx) => {
    const articleId = pageEntityId(ctx.path, "article");
    const author = view.authors[0];
    const nodes: JsonLdNode[] = [
      blogNode(ctx.lang, blogPath(ctx.lang), blogName[ctx.lang]),
      webPage(ctx, "WebPage", {
        mainEntity: ref(articleId),
        breadcrumb: ref(breadcrumbId(ctx.path)),
        ...(view.review
          ? {
              reviewedBy: authorRef(ctx, view.review.name, view.review.role),
              lastReviewed: view.review.date,
            }
          : {}),
      }),
      {
        "@type": "BlogPosting",
        "@id": articleId,
        headline: view.title,
        description: view.lead,
        url: absoluteUrl(ctx.path),
        ...(ctx.imageUrl ? { image: ctx.imageUrl } : {}),
        datePublished: view.publishedAt,
        dateModified: view.updatedAt ?? view.publishedAt,
        wordCount: view.wordCount,
        timeRequired: `PT${view.readingMinutes}M`,
        inLanguage: htmlLang[ctx.lang],
        author: author
          ? authorRef(ctx, author.name, author.role)
          : ref(entityId.person),
        publisher: ref(entityId.person),
        isPartOf: ref(entityId.blog),
        ...(view.topics.length
          ? {
              about: view.topics.map((topic) =>
                topic.sameAs.length
                  ? {
                      "@type": "Thing",
                      name: topic.title,
                      sameAs: topic.sameAs,
                    }
                  : { "@type": "Thing", name: topic.title },
              ),
            }
          : {}),
        mainEntityOfPage: ref(webPageId(ctx.path)),
        ...(view.sources.length
          ? {
              citation: view.sources.map((source) => ({
                "@type": "CreativeWork",
                name: source.title,
                url: source.href,
              })),
            }
          : {}),
      },
      breadcrumbList(ctx.path, view.breadcrumbs),
    ];
    if (view.faq?.items.length) {
      nodes.push(faqPage(ctx, view.faq.items, articleId));
    }
    return nodes;
  };
}

export function legalGraph(view: LegalPageView): PageGraph {
  return (ctx) => [
    webPage(ctx, "WebPage", {
      name: view.title,
      version: view.version,
      ...(view.effective ? { datePublished: view.effective.datetime } : {}),
      breadcrumb: ref(breadcrumbId(ctx.path)),
    }),
    breadcrumbList(ctx.path, view.breadcrumbs),
  ];
}
