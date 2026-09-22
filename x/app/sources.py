"""Collect public posts from search engines. No platform login, no messaging."""

from __future__ import annotations

import re
from dataclasses import dataclass
from html.parser import HTMLParser
from urllib.parse import parse_qs, unquote, urlparse

import httpx

UA = "XLeadBot/0.1 (+local; public search pages only)"
DDG_URL = "https://html.duckduckgo.com/html/"
BING_URL = "https://www.bing.com/search"
DOMAINS = {
    "xiaohongshu": "xiaohongshu.com",
    "douyin": "douyin.com",
    "boss": "zhipin.com",
}
_INTENT_RE = re.compile(r"视频|剪辑|主图|代运营|带货|外包|短视频")


class SearchError(Exception):
    pass


@dataclass
class Hit:
    platform: str
    title: str
    snippet: str
    url: str


class _DDGParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hits: list[tuple[str, str, str]] = []
        self._capture: str | None = None
        self._capture_tag = ""
        self._href = ""
        self._buf: list[str] = []
        self._title = ""
        self._pending_href = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {key: value or "" for key, value in attrs}
        classes = attr.get("class", "")
        if tag == "a" and "result__a" in classes:
            self._capture = "title"
            self._capture_tag = tag
            self._href = attr.get("href", "")
            self._buf = []
        elif "result__snippet" in classes:
            self._capture = "snippet"
            self._capture_tag = tag
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if not self._capture or tag != self._capture_tag:
            return
        text = "".join(self._buf).strip()
        if self._capture == "title":
            self._title = text
            self._pending_href = _clean_ddg_url(self._href)
        elif self._capture == "snippet" and self._pending_href and self._title:
            self.hits.append((self._pending_href, self._title, text))
            self._title = ""
            self._pending_href = ""
        self._capture = None

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buf.append(data)


class _BingParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hits: list[tuple[str, str, str]] = []
        self._in_algo = False
        self._in_title = False
        self._in_snippet = False
        self._href = ""
        self._title = ""
        self._snippet = ""
        self._buf: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {key: value or "" for key, value in attrs}
        classes = attr.get("class", "")
        if tag == "li" and "b_algo" in classes.split():
            self._in_algo = True
            self._href = ""
            self._title = ""
            self._snippet = ""
        elif self._in_algo and tag == "h2":
            self._in_title = True
        elif self._in_title and tag == "a":
            self._href = attr.get("href", "")
            self._buf = []
        elif self._in_algo and tag == "p" and not self._snippet and not self._in_title:
            self._in_snippet = True
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._in_title and self._href:
            self._title = "".join(self._buf).strip()
        elif tag == "h2":
            self._in_title = False
        elif tag == "p" and self._in_snippet:
            self._snippet = "".join(self._buf).strip()
            self._in_snippet = False
        elif tag == "li" and self._in_algo:
            if self._href and self._title:
                self.hits.append((self._href, self._title, self._snippet))
            self._in_algo = False

    def handle_data(self, data: str) -> None:
        if self._in_title or self._in_snippet:
            self._buf.append(data)


def _clean_ddg_url(href: str) -> str:
    if "uddg=" in href:
        parsed = urlparse(href if "://" in href else f"https:{href}" if href.startswith("//") else href)
        values = parse_qs(parsed.query).get("uddg")
        if values:
            return unquote(values[0])
    if href.startswith("//"):
        return "https:" + href
    return href


def parse_duckduckgo(html: str) -> list[tuple[str, str, str]]:
    parser = _DDGParser()
    parser.feed(html)
    return parser.hits


def parse_bing(html: str) -> list[tuple[str, str, str]]:
    parser = _BingParser()
    parser.feed(html)
    return parser.hits


def _relevant(title: str, snippet: str, keyword: str) -> bool:
    blob = f"{title}\n{snippet}"
    tokens = [part for part in re.split(r"\s+", keyword.strip()) if len(part) >= 2]
    if any(token in blob for token in tokens):
        return True
    return bool(_INTENT_RE.search(blob))


def filter_hits(raw: list[tuple[str, str, str]], platform: str, keyword: str) -> list[Hit]:
    domain = DOMAINS[platform]
    hits: list[Hit] = []
    seen: set[str] = set()
    for url, title, snippet in raw:
        if not url.startswith(("http://", "https://")):
            continue
        host = urlparse(url).netloc.lower()
        if domain not in host or url in seen:
            continue
        if not _relevant(title, snippet, keyword):
            continue
        seen.add(url)
        hits.append(Hit(platform=platform, title=title.strip(), snippet=snippet.strip(), url=url))
    return hits


def default_get(url: str, params: dict[str, str]) -> str:
    response = httpx.get(
        url,
        params=params,
        headers={"User-Agent": UA},
        timeout=8.0,
        follow_redirects=True,
    )
    response.raise_for_status()
    return response.text


def search_public(platform: str, keyword: str, get=None) -> list[Hit]:
    if platform not in DOMAINS:
        raise SearchError(f"未知平台 {platform}")
    getter = get or default_get
    query = f"site:{DOMAINS[platform]} {keyword}"
    errors: list[str] = []
    found_empty = False
    for name, url, parser in (
        ("duckduckgo", DDG_URL, parse_duckduckgo),
        ("bing", BING_URL, parse_bing),
    ):
        try:
            html = getter(url, {"q": query})
            hits = filter_hits(parser(html), platform, keyword)
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            continue
        if hits:
            return hits[:8]
        found_empty = True
    if found_empty:
        return []
    raise SearchError("；".join(errors) or "搜索没有返回结果")
