"""Pull daily volume, category, and product links out of a message."""

from __future__ import annotations

import re
from dataclasses import dataclass

CATEGORIES = (
    "手机配件",
    "女装",
    "男装",
    "童装",
    "美妆",
    "护肤",
    "个护",
    "家居",
    "家纺",
    "食品",
    "零食",
    "母婴",
    "3C",
    "数码",
    "小商品",
    "鞋靴",
    "箱包",
    "百货",
    "珠宝",
    "配饰",
)

_VOLUME_PATTERNS = (
    re.compile(r"每天.{0,8}?(\d+)\s*条"),
    re.compile(r"一天.{0,8}?(\d+)\s*条"),
    re.compile(r"日更.{0,4}?(\d+)"),
    re.compile(r"日产.{0,4}?(\d+)\s*条"),
    re.compile(r"(\d+)\s*条\s*/\s*天"),
    re.compile(r"(\d+)\s*条\s*每天"),
    re.compile(r"(\d+)\s*条左右"),
)
_URL_RE = re.compile(r"https?://[^\s<>\]\)\"']+")


@dataclass
class Slots:
    daily_volume: int | None = None
    category: str | None = None
    product_url: str | None = None


def volume_in(text: str) -> int | None:
    for pattern in _VOLUME_PATTERNS:
        match = pattern.search(text)
        if not match:
            continue
        value = int(match.group(1))
        if 1 <= value <= 500:
            return value
    return None


def category_in(text: str) -> str | None:
    for name in CATEGORIES:
        if name in text:
            return name
    return None


def url_in(text: str) -> str | None:
    match = _URL_RE.search(text)
    if not match:
        return None
    return match.group(0).rstrip(".,;:，。；、）)")


def extract_slots(text: str) -> Slots:
    return Slots(
        daily_volume=volume_in(text),
        category=category_in(text),
        product_url=url_in(text),
    )


def extract_slots_from_messages(messages: list[dict]) -> Slots:
    slots = Slots()
    for message in messages:
        if message.get("role") != "customer":
            continue
        found = extract_slots(message.get("text") or "")
        if found.daily_volume is not None:
            slots.daily_volume = found.daily_volume
        if found.category:
            slots.category = found.category
        if found.product_url:
            slots.product_url = found.product_url
    return slots
