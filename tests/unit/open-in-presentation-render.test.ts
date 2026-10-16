// @vitest-environment jsdom

import { createRequire } from "node:module";
import {
  act,
  createElement,
  useEffect,
  useState,
  type ReactElement,
} from "react";
import deepEqual from "react-fast-compare";
import type { DocumentFieldActionProps } from "sanity";
import { afterEach, expect, it, vi } from "vitest";

import { openInPresentation } from "../../studio/components/open-in-presentation";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

const { createRoot } = createRequire(import.meta.url)("react-dom/client") as {
  createRoot: (container: Element) => {
    render: (element: ReactElement) => void;
    unmount: () => void;
  };
};

const headerProps: DocumentFieldActionProps = {
  documentId: "article-1",
  documentType: "article",
  path: [],
  schemaType: { name: "article" } as DocumentFieldActionProps["schemaType"],
};

function rememberFieldActionNode(value: unknown) {
  const [previous, setPrevious] = useState(value);
  if (deepEqual(previous, value)) return previous;
  setPrevious(value);
  return value;
}

it("keeps the header action inside the pane resolver's render budget", async () => {
  let renders = 0;
  let published: { onAction: () => void } | null = null;

  function HeaderFieldAction(props: {
    publish: (node: { onAction: () => void }) => void;
  }) {
    renders += 1;
    const action = openInPresentation.useAction(headerProps);
    const node = rememberFieldActionNode(action);
    useEffect(() => {
      if (
        !node ||
        typeof node !== "object" ||
        !("onAction" in node) ||
        typeof node.onAction !== "function"
      ) {
        return;
      }
      props.publish({ onAction: node.onAction });
    }, [node, props.publish]);
    return null;
  }

  function PaneHeader() {
    const [node, setNode] = useState<{ onAction: () => void } | null>(null);
    published = node;
    return createElement(HeaderFieldAction, { publish: setNode });
  }

  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(PaneHeader));
  });

  expect(renders).toBe(2);
  published?.onAction();
  expect(navigateIntent).toHaveBeenCalledTimes(1);
  expect(navigateIntent).toHaveBeenCalledWith("edit", {
    id: "article-1",
    type: "article",
    mode: "presentation",
    preview: "/blog/magnez/",
  });
  root.unmount();
});

afterEach(() => {
  navigateIntent.mockReset();
});
