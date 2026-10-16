import { createRequire } from "node:module";
import { createElement, type ReactElement } from "react";
import type { DocumentFieldActionProps } from "sanity";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { renderToStaticMarkup } = createRequire(import.meta.url)(
  "react-dom/server",
) as {
  renderToStaticMarkup: (element: ReactElement) => string;
};

import { openInPresentation } from "../../studio/components/open-in-presentation";

const { navigateIntent, pane } = vi.hoisted(() => ({
  navigateIntent: vi.fn(),
  pane: {
    value: {
      title: "Magnez",
      slug: { current: "magnez" },
      language: "pl",
    } as unknown,
  },
}));

vi.mock("sanity/router", () => ({
  useRouter: () => ({ navigateIntent }),
}));

vi.mock("sanity/structure", () => ({
  useDocumentPane: () => ({ value: pane.value }),
}));

function headerProps(
  documentType: string,
  documentId: string,
  path: DocumentFieldActionProps["path"] = [],
): DocumentFieldActionProps {
  return {
    documentId,
    documentType,
    path,
    schemaType: {
      name: documentType,
    } as DocumentFieldActionProps["schemaType"],
  };
}

function renderHeaderAction(props: DocumentFieldActionProps) {
  let item: ReturnType<typeof openInPresentation.useAction> | undefined;

  function HeaderAction() {
    item = openInPresentation.useAction(props);
    return null;
  }

  renderToStaticMarkup(createElement(HeaderAction));
  if (!item || item.type !== "action") {
    throw new Error("header action did not render");
  }
  return item;
}

describe("open in presentation header action", () => {
  beforeEach(() => {
    navigateIntent.mockReset();
    pane.value = {
      title: "Magnez",
      slug: { current: "magnez" },
      language: "pl",
    };
  });

  it("opens the article preview from the pane document without a form provider", () => {
    const action = renderHeaderAction(headerProps("article", "article-1"));

    expect(action.hidden).toBe(false);
    expect(action.title).toBe("Otwórz podgląd");
    action.onAction();
    expect(navigateIntent).toHaveBeenCalledWith("edit", {
      id: "article-1",
      type: "article",
      mode: "presentation",
      preview: "/blog/magnez/",
    });
  });

  it("stays hidden when the pane document has no slug", () => {
    pane.value = { title: "Szkic", language: "pl" };

    const action = renderHeaderAction(headerProps("article", "article-1"));

    expect(action.hidden).toBe(true);
    action.onAction();
    expect(navigateIntent).not.toHaveBeenCalled();
  });

  it("stays hidden on a nested field", () => {
    const action = renderHeaderAction(
      headerProps("article", "article-1", ["body"]),
    );

    expect(action.hidden).toBe(true);
  });

  it("opens an ebook and a legal page from the same pane document", () => {
    pane.value = {
      title: "Poradnik",
      slug: { current: "poradnik" },
      language: "pl",
    };
    const ebook = renderHeaderAction(headerProps("ebook", "ebook-1"));
    expect(ebook.hidden).toBe(false);
    ebook.onAction();

    pane.value = {
      title: "Polityka",
      slug: { current: "polityka-prywatnosci" },
      language: "en",
    };
    const legal = renderHeaderAction(headerProps("legalPage", "legal-1"));
    expect(legal.hidden).toBe(false);
    legal.onAction();

    expect(navigateIntent).toHaveBeenNthCalledWith(1, "edit", {
      id: "ebook-1",
      type: "ebook",
      mode: "presentation",
      preview: "/ebooki/poradnik/",
    });
    expect(navigateIntent).toHaveBeenNthCalledWith(2, "edit", {
      id: "legal-1",
      type: "legalPage",
      mode: "presentation",
      preview: "/en/polityka-prywatnosci/",
    });
  });
});
