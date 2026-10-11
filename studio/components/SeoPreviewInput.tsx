import { Badge, Card, Flex, Stack, Text } from "@sanity/ui";
import { useFormValue, type ObjectInputProps } from "sanity";

import { publicPath, siteOrigin } from "../schema-types/shared/public-path";

interface SeoValue {
  title?: string;
  description?: string;
  noindex?: boolean;
}

interface DocumentValue {
  _type?: string;
  title?: string;
  siteTitle?: string;
  lead?: string;
  summary?: string;
  cardDescription?: string;
  language?: string;
  slug?: { current?: string };
}

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;

function oneLine(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function LengthBadge({
  length,
  min = 1,
  max,
}: {
  length: number;
  min?: number;
  max: number;
}) {
  const tone =
    length === 0
      ? "caution"
      : length < min || length > max
        ? "critical"
        : "positive";
  return (
    <Badge tone={tone} fontSize={0}>
      {length}/{max}
    </Badge>
  );
}

/**
 * SEO fields plus a search-result and share-card preview. Fallbacks mirror the
 * frontend: SEO title → document title, SEO description → lead/summary.
 */
export function SeoPreviewInput(props: ObjectInputProps) {
  const document = (useFormValue([]) ?? {}) as DocumentValue;
  const value = (props.value ?? {}) as SeoValue;
  const title =
    oneLine(value.title) || oneLine(document.title ?? document.siteTitle);
  const description =
    oneLine(value.description) ||
    oneLine(document.lead ?? document.summary ?? document.cardDescription);
  const path = publicPath(
    document._type,
    document.slug?.current,
    document.language,
  );
  const url = path ? `${siteOrigin}${path}` : null;

  return (
    <Stack gap={4}>
      {props.renderDefault(props)}
      <Card padding={3} radius={2} border tone="transparent">
        <Stack gap={3}>
          <Flex gap={2} align="center" wrap="wrap">
            <Text size={1} weight="semibold">
              Podgląd w wynikach wyszukiwania
            </Text>
            <LengthBadge length={title.length} max={TITLE_MAX} />
            <LengthBadge
              length={description.length}
              min={DESCRIPTION_MIN}
              max={DESCRIPTION_MAX}
            />
            {value.noindex && (
              <Badge tone="caution" fontSize={0}>
                ukryta przed wyszukiwarkami
              </Badge>
            )}
          </Flex>
          <Text size={1} muted>
            {url ?? "Adres pojawi się po ustawieniu adresu dokumentu."}
          </Text>
          <Text size={2} weight="medium" style={{ color: "#1a0dab" }}>
            {title || "Brak tytułu"}
          </Text>
          <Text size={1}>
            {description ||
              "Brak opisu — wyszukiwarka sama wybierze fragment strony."}
          </Text>
          {(title.length > TITLE_MAX ||
            description.length > DESCRIPTION_MAX) && (
            <Text size={1} muted>
              Za długie teksty wyszukiwarka utnie.
            </Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
