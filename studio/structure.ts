import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentIcon } from "@sanity/icons/Document";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { TagIcon } from "@sanity/icons/Tag";
import { UndoIcon } from "@sanity/icons/Undo";
import { UserIcon } from "@sanity/icons/User";
import type { StructureResolver } from "sanity/structure";

export const SINGLETON_TYPES = ["siteSettings"];

function settingsItem(S: Parameters<StructureResolver>[0]) {
  return S.listItem()
    .title("Ustawienia witryny")
    .icon(CogIcon)
    .child(
      S.list()
        .title("Ustawienia witryny")
        .items([
          S.listItem()
            .title("Polski")
            .id("siteSettings-pl")
            .icon(CogIcon)
            .child(
              S.document()
                .schemaType("siteSettings")
                .documentId("siteSettings-pl")
                .initialValueTemplate("siteSettings-pl")
                .title("Ustawienia PL"),
            ),
          S.listItem()
            .title("English")
            .id("siteSettings-en")
            .icon(CogIcon)
            .child(
              S.document()
                .schemaType("siteSettings")
                .documentId("siteSettings-en")
                .initialValueTemplate("siteSettings-en")
                .title("Site settings EN"),
            ),
        ]),
    );
}

function languageList(
  S: Parameters<StructureResolver>[0],
  schemaType: string,
  title: string,
) {
  return S.listItem()
    .title(title)
    .child(
      S.list()
        .title(title)
        .items([
          S.listItem()
            .title("Polski")
            .child(
              S.documentTypeList(schemaType)
                .title(`${title} · PL`)
                .filter('_type == $type && language == "pl"')
                .params({ type: schemaType })
                .initialValueTemplates([
                  S.initialValueTemplateItem(`${schemaType}-pl`),
                ]),
            ),
          S.listItem()
            .title("English")
            .child(
              S.documentTypeList(schemaType)
                .title(`${title} · EN`)
                .filter('_type == $type && language == "en"')
                .params({ type: schemaType })
                .initialValueTemplates([
                  S.initialValueTemplateItem(`${schemaType}-en`),
                ]),
            ),
        ]),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Treści")
    .items([
      settingsItem(S),
      S.divider(),
      languageList(S, "page", "Strony").icon(DocumentIcon),
      languageList(S, "article", "Artykuły").icon(DocumentTextIcon),
      languageList(S, "legalPage", "Strony prawne").icon(DocumentTextIcon),
      languageList(S, "category", "Kategorie bloga").icon(TagIcon),
      languageList(S, "author", "Autorzy").icon(UserIcon),
      S.divider(),
      languageList(S, "service", "Oferta konsultacji").icon(CaseIcon),
      languageList(S, "ebook", "E-booki").icon(DocumentTextIcon),
      languageList(S, "testimonial", "Opinie").icon(CommentIcon),
      languageList(S, "form", "Formularze").icon(EnvelopeIcon),
      S.listItem()
        .title("Przekierowania")
        .icon(UndoIcon)
        .child(S.documentTypeList("redirect").title("Przekierowania")),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return (
          id !== undefined &&
          !SINGLETON_TYPES.includes(id) &&
          ![
            "page",
            "article",
            "legalPage",
            "category",
            "author",
            "service",
            "ebook",
            "testimonial",
            "form",
            "redirect",
          ].includes(id)
        );
      }),
    ]);
