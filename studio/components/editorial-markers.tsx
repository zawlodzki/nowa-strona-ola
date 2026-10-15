import { CloseIcon } from "@sanity/icons/Close";
import { TaskIcon } from "@sanity/icons/Task";
import { Badge, Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useMemo } from "react";
import {
  defineDocumentInspector,
  definePlugin,
  type DocumentInspectorMenuItem,
  type DocumentInspectorProps,
  type Path,
} from "sanity";
import { useDocumentPane } from "sanity/structure";

import {
  scanEditorialMarkers,
  type EditorialMarker,
} from "../schema-types/shared/editorial-markers";

const DOCUMENT_TYPES = new Set(["article", "legalPage"]);
const SNIPPET_LIMIT = 140;

function snippet(text: string): string {
  const single = text.replace(/\s+/g, " ").trim();
  return single.length > SNIPPET_LIMIT
    ? `${single.slice(0, SNIPPET_LIMIT - 1)}…`
    : single;
}

function markerKey(marker: EditorialMarker, index: number): string {
  return `${index}:${marker.label}:${marker.text.slice(0, 24)}`;
}

function useEditorialMarkers(): EditorialMarker[] {
  const { formState } = useDocumentPane();
  const value = formState?.value;
  const body =
    value && typeof value === "object" && "body" in value
      ? value.body
      : undefined;
  return useMemo(() => scanEditorialMarkers(body, ["body"]), [body]);
}

function useMenuItem(): DocumentInspectorMenuItem {
  const count = useEditorialMarkers().length;
  return {
    icon: TaskIcon,
    showAsAction: true,
    title: "Do uzupełnienia",
    tone: count > 0 ? "caution" : undefined,
  };
}

function EditorialMarkersPane(props: DocumentInspectorProps) {
  const markers = useEditorialMarkers();
  const { onFocus, onPathOpen } = useDocumentPane();

  const open = (path: Path) => {
    onFocus(path);
    onPathOpen(path);
  };

  return (
    <Flex direction="column" height="fill" overflow="hidden">
      <Card flex="none" padding={3} borderBottom>
        <Flex align="center" gap={2}>
          <Box flex={1}>
            <Flex align="center" gap={2}>
              <Text as="h1" size={1} weight="medium">
                Do uzupełnienia
              </Text>
              <Badge tone={markers.length > 0 ? "caution" : "default"}>
                {markers.length}
              </Badge>
            </Flex>
          </Box>
          <Button
            aria-label="Zamknij panel znaczników"
            icon={CloseIcon}
            mode="bleed"
            onClick={props.onClose}
          />
        </Flex>
      </Card>
      <Card flex={1} overflow="auto" padding={3}>
        {markers.length === 0 ? (
          <Text muted size={1}>
            W tej treści nie ma znaczników do uzupełnienia.
          </Text>
        ) : (
          <Stack as="ul" gap={2}>
            {markers.map((marker, index) => (
              <Card as="li" key={markerKey(marker, index)}>
                <Button
                  mode="bleed"
                  width="fill"
                  justify="flex-start"
                  padding={3}
                  onClick={() => open(marker.path)}
                >
                  <Stack gap={2}>
                    <Text size={0} weight="medium">
                      {marker.label}
                    </Text>
                    {marker.text ? (
                      <Text muted size={1}>
                        {snippet(marker.text)}
                      </Text>
                    ) : null}
                  </Stack>
                </Button>
              </Card>
            ))}
          </Stack>
        )}
      </Card>
    </Flex>
  );
}

const editorialMarkersInspector = defineDocumentInspector({
  name: "editorialMarkers",
  component: EditorialMarkersPane,
  useMenuItem,
});

export const editorialMarkersPlugin = definePlugin({
  name: "editorial-markers",
  document: {
    inspectors: (previous, context) => {
      if (!DOCUMENT_TYPES.has(context.documentType)) return previous;
      return [...previous, editorialMarkersInspector];
    },
  },
});
