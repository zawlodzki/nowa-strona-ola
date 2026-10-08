#!/usr/bin/env python3
"""Serialize fixture legal pages to Markdown examples matching serializeLegalPage."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BODIES = ROOT / "src/content/legal-bodies"
EXAMPLES = ROOT / "src/content/examples"


def markdown_inline(block: dict) -> str:
    marks = {item.get("_key"): item for item in block.get("markDefs") or []}
    parts: list[str] = []
    for span in block.get("children") or []:
        text = span.get("text") or ""
        for mark in span.get("marks") or []:
            if mark == "strong":
                text = f"**{text}**"
            elif mark == "em":
                text = f"*{text}*"
            elif mark == "code":
                text = f"`{text}`"
            else:
                href = (marks.get(mark) or {}).get("href")
                if href:
                    text = f"[{text}]({href})"
        parts.append(text)
    return "".join(parts)


def article_body_to_markdown(blocks: list[dict]) -> str:
    lines: list[str] = []
    list_type: str | None = None
    list_index = 0

    def close_list() -> None:
        nonlocal list_type, list_index
        if list_type:
            lines.append("")
            list_type = None
            list_index = 0

    for block in blocks:
        kind = block.get("_type")
        if kind == "block":
            if block.get("listItem"):
                if list_type != block["listItem"]:
                    close_list()
                    list_type = block["listItem"]
                list_index += 1
                marker = f"{list_index}." if block["listItem"] == "number" else "-"
                lines.append(f"{marker} {markdown_inline(block)}")
                continue
            close_list()
            text = markdown_inline(block)
            style = block.get("style")
            if style == "h2":
                lines.extend([f"## {text}", ""])
            elif style == "h3":
                lines.extend([f"### {text}", ""])
            elif style == "blockquote":
                lines.extend([f"> {text}", ""])
            else:
                lines.extend([text, ""])
            continue
        close_list()
        if kind == "articleTable":
            headers = [header or "" for header in block.get("headers") or []]
            rows = [
                [cell or "" for cell in (row.get("cells") or [])]
                for row in block.get("rows") or []
            ]
            widths = [
                max([len(header)] + [len(row[index]) if index < len(row) else 0 for row in rows])
                for index, header in enumerate(headers)
            ]

            def format_row(cells: list[str]) -> str:
                padded = [
                    (cells[index] if index < len(cells) else "").ljust(widths[index])
                    for index in range(len(headers))
                ]
                return f"| {' | '.join(padded)} |"

            lines.append(format_row(headers))
            lines.append(f"| {' | '.join('-' * width for width in widths)} |")
            for row in rows:
                lines.append(format_row(row))
            caption = (block.get("caption") or "").strip()
            if caption:
                lines.extend(["", caption])
            lines.append("")
    close_list()
    return "\n".join(lines).strip()


def serialize(title: str, caption: str, label: str, body: list[dict]) -> str:
    parts = [f"# {title.replace(chr(10), ' ').strip()}", "", f"{caption} {label}", ""]
    parts.append(article_body_to_markdown(body))
    return "\n".join(parts).strip() + "\n"


def notice_body(href: str, link_label: str) -> list[dict]:
    return [
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "text": "This page does not include an English translation of the legal document. The binding version is the Polish text.",
                    "marks": [],
                }
            ],
            "markDefs": [],
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [{"text": link_label, "marks": ["to-pl"]}],
            "markDefs": [{"_type": "link", "_key": "to-pl", "href": href}],
        },
    ]


def load(slug: str) -> dict:
    return json.loads((BODIES / f"{slug}.json").read_text(encoding="utf-8"))


def main() -> None:
    EXAMPLES.mkdir(parents=True, exist_ok=True)
    privacy = load("polityka-prywatnosci")
    cookies = load("lista-cookies-i-identyfikatorow")
    terms = load("regulamin")
    newsletter = load("regulamin-newslettera")
    mapping = {
        "legal-privacy.md": serialize(
            privacy["title"],
            "obowiązuje od",
            "24.08.2026",
            privacy["body"],
        ),
        "legal-cookies.md": serialize(
            cookies["title"],
            "obowiązuje od",
            "26.07.2026",
            cookies["body"],
        ),
        "legal-terms.md": serialize(
            terms["title"],
            "obowiązuje od",
            "24.08.2026",
            terms["body"],
        ),
        "legal-newsletter.md": serialize(
            newsletter["title"],
            "obowiązuje od",
            "01.08.2026",
            newsletter["body"],
        ),
        "legal-privacy-en.md": serialize(
            "Privacy policy",
            "Effective from",
            "24.08.2026",
            notice_body(
                "/polityka-prywatnosci/",
                "Read the Polish privacy policy",
            ),
        ),
        "legal-terms-en.md": serialize(
            "Terms",
            "Effective from",
            "24.08.2026",
            notice_body("/regulamin/", "Read the Polish terms"),
        ),
    }
    for name, content in mapping.items():
        path = EXAMPLES / name
        path.write_text(content, encoding="utf-8")
        print(f"{path.relative_to(ROOT)} {len(content)} bytes")


if __name__ == "__main__":
    main()
