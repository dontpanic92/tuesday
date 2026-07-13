#!/usr/bin/env python3
"""Validate the generated offline tutorial site."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from urllib.parse import unquote, urlsplit


TUTORIAL_ROOT = Path(__file__).resolve().parents[1]
BUILD_SCRIPT = TUTORIAL_ROOT / "scripts" / "build_tutorial.py"


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: Set[str] = set()
        self.duplicate_ids: Set[str] = set()
        self.links: List[Tuple[str, str]] = []
        self.resources: List[Tuple[str, str]] = []
        self.images: List[Tuple[str, str]] = []
        self.data_figures: List[Tuple[str, bool]] = []
        self._figure_stack: List[Optional[Dict[str, object]]] = []
        self.has_main = False
        self.has_h1 = False
        self.lang = ""

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)
        if tag == "html":
            self.lang = values.get("lang") or ""
        elif tag == "main":
            self.has_main = True
        elif tag == "h1":
            self.has_h1 = True
        if tag == "figure":
            figure_name = values.get("data-figure")
            self._figure_stack.append(
                {"name": figure_name, "has_media": False} if figure_name else None
            )
        elif tag in {"img", "svg"}:
            for figure in reversed(self._figure_stack):
                if figure is not None:
                    figure["has_media"] = True
                    break
        if values.get("href"):
            self.links.append((tag, values["href"]))
        if tag in {"script", "img", "source"} and values.get("src"):
            self.resources.append((tag, values["src"]))
        if tag == "img":
            self.images.append((values.get("src") or "", values.get("alt") or ""))
        if tag == "link" and values.get("href"):
            self.resources.append((tag, values["href"]))

    def handle_endtag(self, tag: str) -> None:
        if tag == "figure" and self._figure_stack:
            figure = self._figure_stack.pop()
            if figure is not None:
                self.data_figures.append(
                    (str(figure["name"]), bool(figure["has_media"]))
                )


def load_build_module():
    spec = importlib.util.spec_from_file_location("tutorial_builder", BUILD_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load build script")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_remote(url: str) -> bool:
    parsed = urlsplit(url)
    return parsed.scheme not in {"", "file"} or url.startswith("//")


def resolve_local_link(page: Path, url: str) -> Tuple[Path, str]:
    parsed = urlsplit(url)
    target_path = unquote(parsed.path)
    target = page if not target_path else (page.parent / target_path).resolve()
    if target.is_dir():
        target = target / "index.html"
    return target, unquote(parsed.fragment)


def parse_document(path: Path) -> DocumentParser:
    content = path.read_text(encoding="utf-8")
    if not content.startswith("<!doctype html>"):
        raise ValueError("{}: missing HTML5 doctype".format(path.relative_to(TUTORIAL_ROOT)))
    parser = DocumentParser()
    parser.feed(content)
    return parser


def validate() -> List[str]:
    errors: List[str] = []
    builder = load_build_module()
    try:
        manifest = builder.load_manifest()
        builder.verify_manifest_against_toc(manifest)
    except Exception as error:
        return ["manifest/toc validation failed: {}".format(error)]

    pages = manifest["pages"]
    expected_html = [TUTORIAL_ROOT / "index.html"] + [TUTORIAL_ROOT / page["output"] for page in pages]
    expected_generated = expected_html + [builder.SEARCH_JSON_PATH, builder.SEARCH_JS_PATH]

    for page in pages:
        source = TUTORIAL_ROOT / "src" / page["source"]
        if not source.is_file():
            errors.append("missing source fragment: {}".format(source.relative_to(TUTORIAL_ROOT)))
    for path in expected_generated:
        if not path.is_file():
            errors.append("missing generated file: {}".format(path.relative_to(TUTORIAL_ROOT)))
    if errors:
        return errors

    before = {path: digest(path) for path in expected_generated}
    process = subprocess.run(
        [sys.executable, str(BUILD_SCRIPT)],
        cwd=str(TUTORIAL_ROOT),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if process.returncode:
        errors.append("build failed during determinism check: {}".format(process.stderr.strip()))
        return errors
    after = {path: digest(path) for path in expected_generated}
    if before != after:
        errors.append("build output was stale or non-deterministic; rebuild and validate again")

    parsed_documents: Dict[Path, DocumentParser] = {}
    for path in expected_html:
        try:
            document = parse_document(path)
            parsed_documents[path.resolve()] = document
        except Exception as error:
            errors.append(str(error))
            continue
        relative = path.relative_to(TUTORIAL_ROOT)
        if document.lang != "zh-CN":
            errors.append("{}: html lang must be zh-CN".format(relative))
        if not document.has_main or not document.has_h1:
            errors.append("{}: missing semantic main or h1".format(relative))
        if document.duplicate_ids:
            errors.append("{}: duplicate ids {}".format(relative, sorted(document.duplicate_ids)))
        for tag, resource in document.resources:
            if is_remote(resource):
                errors.append("{}: remote {} dependency {}".format(relative, tag, resource))
                continue
            target, _ = resolve_local_link(path, resource)
            if not target.is_file():
                suffix = " SVG asset" if target.suffix.lower() == ".svg" else " resource"
                errors.append("{}: missing{} {}".format(relative, suffix, resource))
        for source, alt in document.images:
            if not source:
                errors.append("{}: img missing src".format(relative))
            if not alt.strip():
                errors.append("{}: img {} has empty alt".format(relative, source or "(missing src)"))
            if source and not is_remote(source):
                target, _ = resolve_local_link(path, source)
                if not target.is_file():
                    errors.append("{}: img does not resolve locally {}".format(relative, source))
        for figure_name, has_media in document.data_figures:
            if not has_media:
                errors.append(
                    "{}: data-figure {} lacks img or svg".format(relative, figure_name)
                )
        content = path.read_text(encoding="utf-8")
        placeholder_patterns = (
            "当前任务只建立站点基础设施",
            "标记为占位",
            "当前占位页",
        )
        for placeholder_text in placeholder_patterns:
            if placeholder_text in content:
                errors.append(
                    "{}: generated placeholder text found: {}".format(
                        relative, placeholder_text
                    )
                )
        if re.search(r"<div\b[^>]*\brole\s*=\s*[\"']img[\"']", content, re.IGNORECASE):
            errors.append("{}: generated role=img placeholder found".format(relative))

    for path, document in parsed_documents.items():
        relative = path.relative_to(TUTORIAL_ROOT)
        for _, link in document.links:
            if not link or link.startswith(("mailto:", "tel:")) or is_remote(link):
                continue
            target, fragment = resolve_local_link(path, link)
            if not target.is_file():
                errors.append("{}: broken link {}".format(relative, link))
                continue
            if fragment and target.suffix.lower() == ".html":
                target_document = parsed_documents.get(target.resolve())
                if target_document is None:
                    try:
                        target_document = parse_document(target)
                    except Exception:
                        target_document = None
                if target_document and fragment not in target_document.ids:
                    errors.append("{}: missing anchor {}".format(relative, link))

    search_index = json.loads(builder.SEARCH_JSON_PATH.read_text(encoding="utf-8"))
    if len(search_index) != 50:
        errors.append("search index must contain 50 content pages")
    if [entry["id"] for entry in search_index] != [page["id"] for page in pages]:
        errors.append("search index order does not match page manifest")

    runtime_sources = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (TUTORIAL_ROOT / "assets" / "js").glob("*.js")
    )
    if re.search(r"\b(fetch|XMLHttpRequest)\s*\(", runtime_sources):
        errors.append("runtime search/navigation must not fetch files over file://")

    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("Tutorial validation failed:", file=sys.stderr)
        for error in errors:
            print("- {}".format(error), file=sys.stderr)
        return 1
    print("Validated 51 offline HTML pages, 50 source fragments, local assets, links, and search index.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
