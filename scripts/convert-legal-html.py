#!/usr/bin/env python3
"""Extract zw-legal / zw-cookie-list HTML into Portable Text JSON. Dry conversion only."""

from __future__ import annotations

import html as html_lib
import json
import re
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "scripts" / "legal-sources"
OUT_DIR = ROOT / "src" / "content" / "legal-bodies"

LEGAL_HREFS = {
    "/polityka-prywatnosci": "/polityka-prywatnosci/",
    "/polityka-prywatnosci/": "/polityka-prywatnosci/",
    "/lista-cookies-i-identyfikatorow": "/lista-cookies-i-identyfikatorow/",
    "/lista-cookies-i-identyfikatorow/": "/lista-cookies-i-identyfikatorow/",
    "/regulamin": "/regulamin/",
    "/regulamin/": "/regulamin/",
    "/regulamin-newslettera": "/regulamin-newslettera/",
    "/regulamin-newslettera/": "/regulamin-newslettera/",
}

SKIP_TAGS = {"style", "script", "svg"}
UNWRAP_TAGS = {
    "div",
    "span",
    "section",
    "article",
    "main",
    "header",
    "footer",
    "figure",
    "thead",
    "tbody",
    "tfoot",
}


def rewrite_href(href: str) -> str:
    value = href.strip()
    for prefix in (
        "https://www.zawlodzki.pl",
        "http://www.zawlodzki.pl",
        "https://zawlodzki.pl",
        "http://zawlodzki.pl",
    ):
        if value.startswith(prefix):
            value = value[len(prefix) :] or "/"
            break
    path = value.split("?", 1)[0].split("#", 1)[0]
    if path in LEGAL_HREFS:
        suffix = ""
        if "?" in value:
            suffix += "?" + value.split("?", 1)[1].split("#", 1)[0]
        if "#" in value:
            suffix += "#" + value.split("#", 1)[1]
        return LEGAL_HREFS[path] + suffix
    return href.strip()


class Node:
    def __init__(self, tag: str, attrs: dict[str, str]):
        self.tag = tag
        self.attrs = attrs
        self.children: list[Node | str] = []

    def append(self, child: Node | str) -> None:
        if isinstance(child, str) and self.children and isinstance(self.children[-1], str):
            self.children[-1] += child
        else:
            self.children.append(child)


class TreeParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node("root", {})
        self.stack = [self.root]
        self.skip = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.skip:
            if tag in SKIP_TAGS:
                self.skip += 1
            return
        if tag in SKIP_TAGS:
            self.skip = 1
            return
        node = Node(tag, {k: v or "" for k, v in attrs})
        self.stack[-1].append(node)
        voidish = {
            "br",
            "hr",
            "img",
            "meta",
            "link",
            "input",
            "col",
            "area",
            "base",
            "embed",
            "source",
            "wbr",
        }
        if tag not in voidish:
            self.stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        if self.skip:
            if tag in SKIP_TAGS:
                self.skip = max(0, self.skip - 1)
            return
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        if self.skip:
            return
        self.stack[-1].append(data)


def class_names(node: Node) -> set[str]:
    return set((node.attrs.get("class") or "").split())


def extract_region(html: str) -> str:
    match = re.search(
        r'<div class="(?:zw-legal|zw-cookie-list)"[^>]*>(.*)</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*<footer',
        html,
        re.S,
    )
    if match:
        return match.group(1)
    match = re.search(
        r'<div class="(?:zw-legal|zw-cookie-list)"[^>]*>(.*)</div>\s*</div></div></div></div></div><footer',
        html,
        re.S,
    )
    if not match:
        raise SystemExit("Nie znaleziono treści dokumentu prawnego.")
    return match.group(1)


def text_of(node: Node) -> str:
    parts: list[str] = []
    for child in node.children:
        if isinstance(child, str):
            parts.append(child)
        elif child.tag == "br":
            parts.append("\n")
        else:
            parts.append(text_of(child))
    return re.sub(r"[ \t]+", " ", "".join(parts)).replace("\n ", "\n").strip()


class Keygen:
    def __init__(self) -> None:
        self.n = 0

    def __call__(self, prefix: str = "b") -> str:
        self.n += 1
        return f"{prefix}{self.n:04d}"


def spans_from_inline(node: Node, keygen: Keygen, extra_marks: list[str] | None = None):
    children: list[dict] = []
    mark_defs: list[dict] = []
    extra = list(extra_marks or [])

    def add_text(text: str, marks: list[str]) -> None:
        if text == "":
            return
        children.append(
            {
                "_type": "span",
                "_key": keygen("s"),
                "text": text,
                "marks": marks,
            }
        )

    def walk(item: Node | str, marks: list[str]) -> None:
        if isinstance(item, str):
            add_text(item.replace("\xa0", " "), marks)
            return
        if item.tag == "br":
            add_text("\n", marks)
            return
        if item.tag in {"strong", "b"}:
            for child in item.children:
                walk(child, marks + ["strong"])
            return
        if item.tag in {"em", "i"}:
            for child in item.children:
                walk(child, marks + ["em"])
            return
        if item.tag == "code":
            for child in item.children:
                walk(child, marks + ["code"])
            return
        if item.tag == "a":
            href = rewrite_href(item.attrs.get("href") or "")
            mark_key = keygen("l")
            mark_defs.append({"_type": "link", "_key": mark_key, "href": href})
            for child in item.children:
                walk(child, marks + [mark_key])
            return
        for child in item.children:
            walk(child, marks)

    for child in node.children:
        walk(child, extra)
    if not children:
        children.append({"_type": "span", "_key": keygen("s"), "text": "", "marks": []})
    return children, mark_defs


def block_of(
    keygen: Keygen,
    node: Node,
    style: str,
    *,
    list_item: str | None = None,
    level: int | None = None,
    key: str | None = None,
    list_start: int | None = None,
) -> dict:
    children, mark_defs = spans_from_inline(node, keygen)
    data: dict = {
        "_type": "block",
        "_key": key or keygen("p"),
        "style": style,
        "children": children,
        "markDefs": mark_defs,
    }
    if list_item:
        data["listItem"] = list_item
        data["level"] = level or 1
    if list_start and list_start > 1:
        data["listStart"] = list_start
    return data


def table_cell_text(node: Node) -> str:
    parts: list[str] = []

    def walk(item: Node | str) -> None:
        if isinstance(item, str):
            parts.append(item.replace("\xa0", " "))
            return
        if item.tag == "br":
            parts.append("\n")
            return
        if item.tag == "code":
            parts.append(f"`{text_of(item)}`")
            return
        if item.tag in {"strong", "b"}:
            parts.append(f"**{text_of(item)}**")
            return
        if item.tag in {"em", "i"}:
            parts.append(f"*{text_of(item)}*")
            return
        if item.tag == "a":
            href = rewrite_href(item.attrs.get("href") or "")
            parts.append(f"[{text_of(item)}]({href})")
            return
        for child in item.children:
            walk(child)

    for child in node.children:
        walk(child)
    return re.sub(r"[ \t]+", " ", "".join(parts)).strip()


def convert_table(node: Node, keygen: Keygen, caption: str | None) -> dict:
    headers: list[str] = []
    rows: list[dict] = []
    header_row = None
    body_rows: list[Node] = []
    for child in flatten_table_parts(node):
        if child.tag != "tr":
            continue
        cells = [c for c in child.children if isinstance(c, Node) and c.tag in {"th", "td"}]
        if not cells:
            continue
        if header_row is None and all(c.tag == "th" for c in cells):
            header_row = cells
        else:
            body_rows.append(child)
    if header_row:
        headers = [table_cell_text(cell) for cell in header_row]
    for row in body_rows:
        cells = [c for c in row.children if isinstance(c, Node) and c.tag in {"th", "td"}]
        rows.append(
            {
                "_type": "object",
                "_key": keygen("r"),
                "cells": [table_cell_text(cell) for cell in cells],
            }
        )
    data: dict = {
        "_type": "articleTable",
        "_key": keygen("t"),
        "headers": headers,
        "rows": rows,
    }
    if caption:
        data["caption"] = caption
    return data


def flatten_table_parts(node: Node) -> list[Node]:
    out: list[Node] = []
    for child in node.children:
        if not isinstance(child, Node):
            continue
        if child.tag in {"thead", "tbody", "tfoot"}:
            out.extend(flatten_table_parts(child))
        else:
            out.append(child)
    return out


def node_has_table(node: Node) -> bool:
    if node.tag == "table":
        return True
    return any(isinstance(child, Node) and node_has_table(child) for child in node.children)


def find_table(node: Node) -> Node | None:
    if node.tag == "table":
        return node
    for child in node.children:
        if isinstance(child, Node):
            found = find_table(child)
            if found:
                return found
    return None


def clone_without_tables(node: Node) -> Node:
    copy = Node(node.tag, dict(node.attrs))
    for child in node.children:
        if isinstance(child, str):
            copy.append(child)
        elif child.tag == "table" or (
            child.tag == "div" and "zw-legal__scroll" in class_names(child)
        ):
            continue
        else:
            copy.append(clone_without_tables(child))
    return copy


def convert_list(node: Node, keygen: Keygen, blocks: list[dict], level: int) -> None:
    alpha = "zw-legal__alpha" in class_names(node) or (
        node.tag == "ol" and "lower-alpha" in (node.attrs.get("style") or "")
    )
    list_item = "number" if node.tag == "ol" and not alpha else "bullet"
    index = 0
    number = 0
    pending_start: int | None = None
    for child in node.children:
        if not isinstance(child, Node) or child.tag != "li":
            continue
        index += 1
        number += 1
        has_table = node_has_table(child)
        nested_lists = [
            c
            for c in child.children
            if isinstance(c, Node) and c.tag in {"ul", "ol"}
        ]
        inline_node = clone_without_tables(child)
        if alpha:
            letter = chr(ord("a") + index - 1)
            prefix = Node("span", {})
            prefix.append(f"{letter}) ")
            inline_node.children = [prefix, *inline_node.children]
        start = pending_start if list_item == "number" else None
        pending_start = None
        if has_table:
            text_block = block_of(
                keygen,
                inline_node,
                "normal",
                list_item=list_item,
                level=level,
                list_start=start,
            )
            if text_of(inline_node):
                blocks.append(text_block)
            table = find_table(child)
            heading_guess = text_of(inline_node).split(":")[0] if text_of(inline_node) else None
            if table:
                blocks.append(convert_table(table, keygen, heading_guess))
                if list_item == "number":
                    pending_start = number + 1
            for nested in nested_lists:
                convert_list(nested, keygen, blocks, level + 1)
            continue
        if nested_lists:
            blocks.append(
                block_of(
                    keygen,
                    inline_node,
                    "normal",
                    list_item=list_item,
                    level=level,
                    list_start=start,
                )
            )
            for nested in nested_lists:
                convert_list(nested, keygen, blocks, level + 1)
            continue
        blocks.append(
            block_of(
                keygen,
                inline_node,
                "normal",
                list_item=list_item,
                level=level,
                list_start=start,
            )
        )


def convert_children(nodes: list[Node | str], keygen: Keygen, blocks: list[dict], last_h2: list[str]) -> None:
    for child in nodes:
        if isinstance(child, str):
            if child.strip():
                dummy = Node("p", {})
                dummy.append(child)
                blocks.append(block_of(keygen, dummy, "normal"))
            continue
        classes = class_names(child)
        if child.tag in SKIP_TAGS:
            continue
        if "zw-legal__eff" in classes or "zw-cookie-list__eff" in classes:
            continue
        if child.tag in {"h2", "h3", "h4"}:
            style = child.tag
            heading_id = child.attrs.get("id") or ""
            text = text_of(child)
            if style == "h2":
                last_h2[:] = [text]
            normalized = "".join(
                ch
                for ch in unicodedata.normalize("NFD", text.lower())
                if unicodedata.category(ch) != "Mn"
            )
            slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
            key = heading_id if heading_id else slug or None
            blocks.append(
                block_of(
                    keygen,
                    child,
                    style if style != "h4" else "h3",
                    key=key,
                )
            )
            continue
        if child.tag == "p":
            if "zw-legal__eff" in classes or "zw-cookie-list__eff" in classes:
                continue
            if not text_of(child) and not any(
                isinstance(c, Node) and c.tag == "a" for c in child.children
            ):
                continue
            style = "blockquote" if "zw-cookie-list__note" in classes else "normal"
            blocks.append(block_of(keygen, child, style))
            continue
        if child.tag == "blockquote":
            inner = Node("p", {})
            for item in child.children:
                if isinstance(item, Node) and item.tag == "p":
                    for sub in item.children:
                        inner.append(sub)
                else:
                    inner.append(item)
            blocks.append(block_of(keygen, inner, "blockquote"))
            continue
        if child.tag in {"ul", "ol"}:
            convert_list(child, keygen, blocks, 1)
            continue
        if child.tag == "table":
            blocks.append(convert_table(child, keygen, last_h2[0] if last_h2 else None))
            continue
        if child.tag in UNWRAP_TAGS or child.tag in {"li"}:
            convert_children(child.children, keygen, blocks, last_h2)
            continue
        convert_children(child.children, keygen, blocks, last_h2)


def parse_effective(text: str) -> tuple[str, str]:
    match = re.search(r"obowiązuje od\s+(\d{2})\.(\d{2})\.(\d{4})", text)
    if not match:
        raise SystemExit(f"Brak daty obowiązywania: {text!r}")
    day, month, year = match.groups()
    iso = f"{year}-{month}-{day}"
    return iso, re.sub(r"\s+", " ", text).strip()


def convert_file(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", raw, re.S)
    title = re.sub("<[^>]+>", "", h1.group(1) if h1 else path.stem).strip()
    desc = re.search(r'<meta content="([^"]+)" name="description"', raw)
    region = extract_region(raw)
    eff_match = re.search(
        r'class="(?:zw-legal__eff|zw-cookie-list__eff)"[^>]*>(.*?)</p>',
        region,
        re.S,
    )
    if not eff_match:
        raise SystemExit(f"Brak daty w {path.name}")
    effective_from, effective_label = parse_effective(
        re.sub("<[^>]+>", "", eff_match.group(1))
    )
    parser = TreeParser()
    parser.feed(f"<root>{region}</root>")
    parser.close()
    keygen = Keygen()
    blocks: list[dict] = []
    convert_children(parser.root.children, keygen, blocks, [])
    cleaned = []
    for block in blocks:
        if block["_type"] == "block":
            text = "".join(span.get("text") or "" for span in block.get("children") or [])
            if not text.strip() and not block.get("listItem"):
                continue
        cleaned.append(block)
    return {
        "title": html_lib.unescape(title),
        "effectiveFrom": effective_from,
        "effectiveLabel": effective_label,
        "seoDescription": html_lib.unescape(desc.group(1)) if desc else "",
        "body": cleaned,
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mapping = {
        "polityka-prywatnosci": "polityka-prywatnosci.html",
        "lista-cookies-i-identyfikatorow": "lista-cookies-i-identyfikatorow.html",
        "regulamin": "regulamin.html",
        "regulamin-newslettera": "regulamin-newslettera.html",
    }
    for slug, name in mapping.items():
        data = convert_file(SOURCE_DIR / name)
        out = OUT_DIR / f"{slug}.json"
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(
            json.dumps(
                {
                    "slug": slug,
                    "title": data["title"],
                    "effectiveFrom": data["effectiveFrom"],
                    "blocks": len(data["body"]),
                    "tables": sum(1 for b in data["body"] if b["_type"] == "articleTable"),
                    "h2": sum(
                        1
                        for b in data["body"]
                        if b["_type"] == "block" and b.get("style") == "h2"
                    ),
                    "out": str(out.relative_to(ROOT)),
                },
                ensure_ascii=False,
            )
        )


if __name__ == "__main__":
    main()
