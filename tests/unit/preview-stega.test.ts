import { describe, expect, it } from "vitest";
import { stegaClean, stegaEncodeSourceMap } from "@sanity/client/stega";

import { previewStegaFilter } from "../../preview/src/lib/stega-filter";
import { toMedia } from "../../src/content/map-sections";

describe("preview source maps", () => {
  it("keeps technical values usable by the renderer while preserving editable text", () => {
    const result = {
      media: { tone: "portrait", rasterKey: "hero", alt: "Portret Oli" },
      formKey: "newsletter",
      coverArt: "art-pcos",
      availability: "comingSoon",
      body: [
        { style: "h2", children: [{ text: "Nagłówek", marks: ["strong"] }] },
      ],
    };
    const paths = [
      "$['media']['tone']",
      "$['media']['rasterKey']",
      "$['media']['alt']",
      "$['formKey']",
      "$['coverArt']",
      "$['availability']",
      "$['body'][0]['style']",
      "$['body'][0]['children'][0]['text']",
      "$['body'][0]['children'][0]['marks'][0]",
    ];
    const encoded = stegaEncodeSourceMap(
      result,
      {
        documents: [{ _id: "home", _type: "page" }],
        paths,
        mappings: Object.fromEntries(
          paths.map((path, index) => [
            path,
            {
              type: "value" as const,
              source: {
                type: "documentValue" as const,
                document: 0,
                path: index,
              },
            },
          ]),
        ),
      },
      {
        enabled: true,
        studioUrl: "https://studio.example.com",
        filter: previewStegaFilter,
      },
    );
    expect(encoded.media.tone).toBe("portrait");
    expect(encoded.media.rasterKey).toBe("hero");
    expect(encoded.formKey).toBe("newsletter");
    expect(encoded.coverArt).toBe("art-pcos");
    expect(encoded.availability).toBe("comingSoon");
    expect(encoded.media.alt).not.toBe("Portret Oli");
    expect(stegaClean(encoded.media.alt)).toBe("Portret Oli");
    expect(toMedia(encoded.media).tone).toBe("portrait");
    expect(encoded.body[0]?.style).toBe("h2");
    expect(encoded.body[0]?.children[0]?.marks).toEqual(["strong"]);
    expect(encoded.body[0]?.children[0]?.text).not.toBe("Nagłówek");
  });
});
