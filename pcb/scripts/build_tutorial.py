#!/usr/bin/env python3
"""Build the offline tutorial site using only the Python standard library."""

from __future__ import annotations

import argparse
import html
import json
import posixpath
import re
from collections import OrderedDict
from html.parser import HTMLParser
from pathlib import Path
from string import Template
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


TUTORIAL_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = TUTORIAL_ROOT / "src"
MANIFEST_PATH = SOURCE_ROOT / "page_manifest.json"
TOC_PATH = TUTORIAL_ROOT / "toc.md"
BASE_TEMPLATE_PATH = SOURCE_ROOT / "templates" / "base.html"
SEARCH_JSON_PATH = TUTORIAL_ROOT / "assets" / "data" / "search-index.json"
SEARCH_JS_PATH = TUTORIAL_ROOT / "assets" / "js" / "search-index.js"


class FragmentParser(HTMLParser):
    """Extract searchable text and headings from a trusted local fragment."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.text: List[str] = []
        self.headings: List[Tuple[int, str, str]] = []
        self._heading_level: Optional[int] = None
        self._heading_id = ""
        self._heading_text: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        if tag in {"h2", "h3"}:
            self._heading_level = int(tag[1])
            self._heading_id = dict(attrs).get("id") or ""
            self._heading_text = []

    def handle_endtag(self, tag: str) -> None:
        if self._heading_level and tag == "h{}".format(self._heading_level):
            heading_text = " ".join(self._heading_text).strip()
            self.headings.append((self._heading_level, self._heading_id, heading_text))
            self._heading_level = None
            self._heading_id = ""
            self._heading_text = []

    def handle_data(self, data: str) -> None:
        cleaned = " ".join(data.split())
        if not cleaned:
            return
        self.text.append(cleaned)
        if self._heading_level:
            self._heading_text.append(cleaned)


def load_manifest() -> Dict[str, object]:
    with MANIFEST_PATH.open(encoding="utf-8") as stream:
        manifest = json.load(stream, object_pairs_hook=OrderedDict)
    validate_manifest_shape(manifest)
    return manifest


def validate_manifest_shape(manifest: Dict[str, object]) -> None:
    pages = manifest.get("pages")
    if not isinstance(pages, list) or len(pages) != 50:
        raise ValueError("page manifest must contain About + 37 chapters + 12 appendices")

    ids = [page["id"] for page in pages]
    outputs = [page["output"] for page in pages]
    sources = [page["source"] for page in pages]
    if len(set(ids)) != len(ids) or len(set(outputs)) != len(outputs) or len(set(sources)) != len(sources):
        raise ValueError("manifest ids, outputs, and sources must be unique")

    expected_ids = (
        ["about"]
        + ["chapter-{:02d}".format(number) for number in range(1, 38)]
        + ["appendix-{}".format(letter) for letter in "abcdefghijkl"]
    )
    if ids != expected_ids:
        raise ValueError("manifest order must be About, Chapters 1-37, Appendices A-L")


def toc_page_entries() -> List[Tuple[str, str]]:
    """Return authoritative (part, title) entries from toc.md."""

    entries: List[Tuple[str, str]] = []
    current_part = "关于本教程（About This Tutorial）"
    for raw_line in TOC_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        part_match = re.fullmatch(r"## (第[一二三四五六七八]部分.+|附录（Appendices）)", line)
        if part_match:
            current_part = part_match.group(1)
            continue
        if line == "### 关于本教程（About This Tutorial）":
            entries.append((current_part, line[4:]))
        elif re.fullmatch(r"### \d+\. .+", line):
            entries.append((current_part, line[4:]))
        elif re.fullmatch(r"### 附录 [A-L]：.+", line):
            entries.append((current_part, line[4:]))
    return entries


def verify_manifest_against_toc(manifest: Dict[str, object]) -> None:
    manifest_entries = [(page["part"], page["title"]) for page in manifest["pages"]]
    toc_entries = toc_page_entries()
    if manifest_entries != toc_entries:
        raise ValueError("page manifest does not exactly match tutorial/toc.md")


def relative_url(from_output: str, to_output: str) -> str:
    from_directory = posixpath.dirname(from_output) or "."
    return posixpath.relpath(to_output, from_directory)


def root_prefix(output: str) -> str:
    directory = posixpath.dirname(output)
    if not directory:
        return ""
    return "../" * len(Path(directory).parts)


def render_search_form() -> str:
    return """<form class="search-form" role="search">
  <label for="site-search">站内搜索</label>
  <div class="search-row">
    <input id="site-search" name="q" type="search" autocomplete="off">
    <button type="submit">搜索</button>
  </div>
  <noscript><p>搜索需要 JavaScript；完整目录和顺序导航不需要。</p></noscript>
  <ul class="search-results" id="search-results" aria-live="polite"></ul>
</form>"""


def grouped_pages(pages: Sequence[Dict[str, str]]) -> Iterable[Tuple[str, List[Dict[str, str]]]]:
    groups: "OrderedDict[str, List[Dict[str, str]]]" = OrderedDict()
    for page in pages:
        groups.setdefault(page["part"], []).append(page)
    return groups.items()


def render_site_navigation(
    pages: Sequence[Dict[str, str]], current_output: str, current_id: str
) -> str:
    index_href = relative_url(current_output, "index.html")
    index_current = ' aria-current="page"' if current_id == "index" else ""
    chunks = ['<nav aria-label="全站目录"><ul>']
    chunks.append(
        '<li><a href="{}"{}>首页 / 总目录</a></li>'.format(
            html.escape(index_href, quote=True), index_current
        )
    )
    for part, part_pages in grouped_pages(pages):
        chunks.append('<li class="part-item"><span class="part-title">{}</span><ul>'.format(html.escape(part)))
        for page in part_pages:
            href = relative_url(current_output, page["output"])
            current = ' aria-current="page"' if page["id"] == current_id else ""
            chunks.append(
                '<li><a href="{}"{}>{}</a></li>'.format(
                    html.escape(href, quote=True), current, html.escape(page["title"])
                )
            )
        chunks.append("</ul></li>")
    chunks.append("</ul></nav>")
    return "".join(chunks)


def render_breadcrumbs(output: str, part: str, title: str, is_index: bool = False) -> str:
    if is_index:
        return '<nav class="breadcrumbs" aria-label="面包屑"><ol><li aria-current="page">首页</li></ol></nav>'
    return (
        '<nav class="breadcrumbs" aria-label="面包屑"><ol>'
        '<li><a href="{}">首页</a></li><li>{}</li><li aria-current="page">{}</li>'
        "</ol></nav>"
    ).format(
        html.escape(relative_url(output, "index.html"), quote=True),
        html.escape(part),
        html.escape(title),
    )


def render_page_toc(headings: Sequence[Tuple[int, str, str]]) -> str:
    usable = [(level, anchor, title) for level, anchor, title in headings if anchor and title]
    if not usable:
        return ""
    items = [
        '<li class="toc-level-{}"><a href="#{}">{}</a></li>'.format(
            level, html.escape(anchor, quote=True), html.escape(title)
        )
        for level, anchor, title in usable
    ]
    return (
        '<nav class="on-this-page" aria-labelledby="on-this-page-title">'
        '<h2 id="on-this-page-title">本页目录</h2><ul>{}</ul></nav>'
    ).format("".join(items))


def render_page_navigation(
    pages: Sequence[Dict[str, str]], index: int, current_output: str
) -> str:
    previous = pages[index - 1] if index > 0 else None
    following = pages[index + 1] if index + 1 < len(pages) else None
    chunks = ['<nav class="page-navigation" aria-label="顺序导航">']
    if previous:
        chunks.append(
            '<a class="previous" rel="prev" href="{}"><small>上一页</small>{}</a>'.format(
                html.escape(relative_url(current_output, previous["output"]), quote=True),
                html.escape(previous["title"]),
            )
        )
    else:
        chunks.append(
            '<a class="previous" rel="prev" href="{}"><small>上一页</small>首页 / 总目录</a>'.format(
                html.escape(relative_url(current_output, "index.html"), quote=True)
            )
        )
    if following:
        chunks.append(
            '<a class="next" rel="next" href="{}"><small>下一页</small>{}</a>'.format(
                html.escape(relative_url(current_output, following["output"]), quote=True),
                html.escape(following["title"]),
            )
        )
    else:
        chunks.append(
            '<a class="next" href="{}"><small>完成</small>返回首页 / 总目录</a>'.format(
                html.escape(relative_url(current_output, "index.html"), quote=True)
            )
        )
    chunks.append("</nav>")
    return "".join(chunks)


def fragment_details(fragment: str) -> Tuple[List[Tuple[int, str, str]], str]:
    parser = FragmentParser()
    parser.feed(fragment)
    return parser.headings, " ".join(parser.text)


def render_index_content(pages: Sequence[Dict[str, str]]) -> str:
    chunks = [
        '<section aria-labelledby="site-introduction">',
        '<h2 id="site-introduction">离线教材目录</h2>',
        "<p>本页是教程的固定入口。全部内容、样式和脚本均保存在本地；关闭 JavaScript 后仍可使用以下链接阅读。</p>",
        "</section>",
    ]
    for group_number, (part, part_pages) in enumerate(grouped_pages(pages), start=1):
        part_id = "part-{}".format(group_number)
        chunks.append('<section aria-labelledby="{}"><h2 id="{}">{}</h2><ol class="index-list">'.format(
            part_id, part_id, html.escape(part)
        ))
        for page in part_pages:
            chunks.append(
                '<li><a href="{}">{}</a></li>'.format(
                    html.escape(page["output"], quote=True), html.escape(page["title"])
                )
            )
        chunks.append("</ol></section>")
    return "".join(chunks)


def render_document(template: Template, values: Dict[str, str]) -> str:
    return template.substitute(values).rstrip() + "\n"


def write_if_changed(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(content)


def build() -> List[Path]:
    manifest = load_manifest()
    verify_manifest_against_toc(manifest)
    pages: List[Dict[str, str]] = manifest["pages"]
    site_title = manifest["site_title"]
    template = Template(BASE_TEMPLATE_PATH.read_text(encoding="utf-8"))
    written: List[Path] = []
    search_entries: List[Dict[str, str]] = []

    index_content = render_index_content(pages)
    index_headings, index_text = fragment_details(index_content)
    index_html = render_document(
        template,
        {
            "root_prefix": "",
            "description": "USB GPIO PCB 离线教程总目录",
            "document_title": site_title,
            "page_id": "index",
            "site_title": site_title,
            "search_form": render_search_form(),
            "site_navigation": render_site_navigation(pages, "index.html", "index"),
            "breadcrumbs": render_breadcrumbs("index.html", "总览", site_title, is_index=True),
            "part": "总览",
            "page_title": site_title,
            "page_toc": render_page_toc(index_headings),
            "content": index_content,
            "page_navigation": (
                '<nav class="page-navigation" aria-label="开始阅读">'
                '<a class="next" rel="next" href="about.html"><small>开始</small>{}</a></nav>'.format(
                    html.escape(pages[0]["title"])
                )
            ),
        },
    )
    write_if_changed(TUTORIAL_ROOT / "index.html", index_html)
    written.append(TUTORIAL_ROOT / "index.html")

    for index, page in enumerate(pages):
        source_path = SOURCE_ROOT / page["source"]
        if not source_path.is_file():
            raise FileNotFoundError("missing source fragment: {}".format(source_path))
        fragment = source_path.read_text(encoding="utf-8").strip()
        headings, searchable_text = fragment_details(fragment)
        output = page["output"]
        page_html = render_document(
            template,
            {
                "root_prefix": root_prefix(output),
                "description": "{} — USB GPIO PCB 离线教程".format(page["title"]),
                "document_title": "{} | {}".format(page["title"], site_title),
                "page_id": page["id"],
                "site_title": site_title,
                "search_form": render_search_form(),
                "site_navigation": render_site_navigation(pages, output, page["id"]),
                "breadcrumbs": render_breadcrumbs(output, page["part"], page["title"]),
                "part": page["part"],
                "page_title": page["title"],
                "page_toc": render_page_toc(headings),
                "content": fragment,
                "page_navigation": render_page_navigation(pages, index, output),
            },
        )
        output_path = TUTORIAL_ROOT / output
        write_if_changed(output_path, page_html)
        written.append(output_path)
        search_entries.append(
            {
                "id": page["id"],
                "part": page["part"],
                "title": page["title"],
                "url": output,
                "text": searchable_text,
            }
        )

    search_json = json.dumps(search_entries, ensure_ascii=False, indent=2) + "\n"
    search_js = "window.TUTORIAL_SEARCH_INDEX = {};\n".format(
        json.dumps(search_entries, ensure_ascii=False, separators=(",", ":"))
    )
    write_if_changed(SEARCH_JSON_PATH, search_json)
    write_if_changed(SEARCH_JS_PATH, search_js)
    written.extend([SEARCH_JSON_PATH, SEARCH_JS_PATH])
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    written = build()
    print("Built {} HTML pages and search indexes.".format(len(written) - 2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
