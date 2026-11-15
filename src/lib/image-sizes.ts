// Layouts switch on `page3a` container queries, which exclude a classic
// scrollbar; `sizes` media queries see the whole viewport. Where a column
// narrows, the threshold sits 16px higher, so the misfit band overstates the
// slot (extra bytes) instead of understating it (a blurry image).
const from768 = "(min-width: 784px)";
const from880 = "(min-width: 896px)";
const from1000 = "(min-width: 1016px)";

/** `sizes` per image slot, measured on the 3a layouts. */
export const IMAGE_SIZES = {
  heroPortrait: `${from768} min(43vw, 592px), calc(100vw - 48px)`,
  sidePortrait: `${from880} min(44vw, 620px), calc(100vw - 48px)`,
  consultationCard: `${from880} min(43vw, 605px), calc(100vw - 96px)`,
  consultationProcess: `${from880} min(48vw, 672px), calc(100vw - 48px)`,
  consultationExpert: `${from768} min(39vw, 537px), calc(100vw - 48px)`,
  diploma: `${from880} min(33vw, 340px), min(calc(100vw - 96px), 340px)`,
  aboutFood: "(min-width: 880px) 220px, 176px",
  blogFeatured: `${from768} min(49vw, 685px), calc(100vw - 48px)`,
  blogCard: `${from768} min(46vw, 640px), calc(100vw - 48px)`,
  articleHero: `${from880} min(calc(100vw - 80px), 1320px), calc(100vw - 48px)`,
  bylineAvatar: "48px",
  authorAvatar: "(min-width: 768px) 96px, 64px",
  ebookAuthor: `${from768} min(45vw, 610px), min(calc(100vw - 48px), 470px)`,
  ebookShelf: `${from1000} min(calc(45vw - 72px), 538px), ${from768} calc(45vw - 40px), calc(100vw - 88px)`,
  ebookSample: `${from768} min(48vw, 641px), min(calc(100vw - 30px), 536px)`,
  ebookStageCover: "300px",
  bookCover: "252px",
  bookCoverArt: "204px",
} as const;

export type ImageSizes = (typeof IMAGE_SIZES)[keyof typeof IMAGE_SIZES];
