import { ebookCopy } from "./ebook-seed";

type EditableCopy<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? EditableCopy<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: EditableCopy<T[Key]> }
      : T;

export type EbookLandingSeed = EditableCopy<
  Pick<
    (typeof ebookCopy)["pl"],
    | "seoTitle"
    | "seoDescription"
    | "heroTitle"
    | "heroLead"
    | "primaryLabel"
    | "secondaryLabel"
    | "facts"
    | "problemTitle"
    | "problemParagraphs"
    | "problemQuestions"
    | "audienceTitle"
    | "audienceLead"
    | "audienceItems"
    | "educationNote"
    | "contentsTitle"
    | "contentsLead"
    | "ingredients"
    | "chapters"
    | "sampleTitle"
    | "sampleLead"
    | "sampleFields"
    | "sampleCaption"
    | "materials"
    | "outcomesTitle"
    | "outcomesLead"
    | "comparison"
    | "outcomesNote"
    | "authorTitle"
    | "authorParagraphs"
    | "sourceLabel"
    | "sourceHref"
    | "sourceScope"
    | "offerTitle"
    | "offerLead"
    | "purchaseLabel"
    | "offerNote"
    | "testimonialsTitle"
    | "testimonialsContext"
    | "faqTitle"
    | "faqLead"
    | "faq"
    | "coverTopic"
    | "coverArt"
    | "coverCaption"
    | "problemCaption"
    | "sampleKicker"
    | "sampleSheetTitle"
    | "sampleSheetLead"
    | "sampleSheetFooter"
    | "beforeLabel"
    | "afterLabel"
  >
> & {
  problemVisual: "results" | "plate" | "measurements" | "journal" | "evening";
};
