import type { FilterDefault } from "@sanity/client/stega";

const technicalFields = new Set([
  "availability",
  "bookingStatus",
  "category",
  "coverArt",
  "coverTone",
  "emphasis",
  "formKey",
  "input",
  "issuerKind",
  "level",
  "listItem",
  "mediaPosition",
  "occupationCode",
  "problemVisual",
  "rasterKey",
  "scope",
  "style",
  "testimonialsScope",
  "tone",
  "topic",
]);

export const previewStegaFilter: FilterDefault = (props) => {
  const field = props.sourcePath.at(-1);
  return (
    !props.sourcePath.includes("marks") &&
    !(typeof field === "string" && technicalFields.has(field)) &&
    props.filterDefault(props)
  );
};
