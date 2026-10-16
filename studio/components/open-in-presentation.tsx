import { EyeOpenIcon } from "@sanity/icons/EyeOpen";
import { useFormValue, defineDocumentFieldAction, definePlugin } from "sanity";
import type { DocumentFieldActionItem, DocumentFieldActionProps } from "sanity";
import { useRouter } from "sanity/router";

import { presentationResolve } from "../presentation";
import {
  hasPresentationLocations,
  presentationEditIntent,
  type PreviewSelection,
} from "../presentation-intent";

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function previewSelection(value: unknown): PreviewSelection | null {
  if (!value || typeof value !== "object") return null;
  const slugValue = "slug" in value ? value.slug : undefined;
  const slug =
    slugValue && typeof slugValue === "object" && "current" in slugValue
      ? stringValue(slugValue.current)
      : undefined;
  return {
    title: "title" in value ? stringValue(value.title) : undefined,
    slug,
    language: "language" in value ? stringValue(value.language) : undefined,
  };
}

function useOpenInPresentation(
  props: DocumentFieldActionProps,
): DocumentFieldActionItem {
  const router = useRouter();
  const selected = previewSelection(useFormValue());
  const intent =
    props.path.length === 0
      ? presentationEditIntent({
          documentId: props.documentId,
          documentType: props.documentType,
          selected,
          locations: presentationResolve.locations,
        })
      : null;

  return {
    type: "action",
    icon: EyeOpenIcon,
    title: "Otwórz podgląd",
    renderAsButton: true,
    hidden: intent === null,
    onAction: () => {
      if (!intent) return;
      router.navigateIntent(intent.intent, intent.params);
    },
  };
}

// renderAsButton on a root field action is the document pane header slot in Sanity 6.18.
const openInPresentation = defineDocumentFieldAction({
  name: "open-in-presentation",
  useAction: useOpenInPresentation,
});

export const openInPresentationPlugin = definePlugin({
  name: "open-in-presentation",
  document: {
    unstable_fieldActions: (previous, context) => {
      if (
        !hasPresentationLocations(
          context.documentType,
          presentationResolve.locations,
        )
      ) {
        return previous;
      }
      if (previous.some((action) => action.name === openInPresentation.name)) {
        return previous;
      }
      return [...previous, openInPresentation];
    },
  },
});
