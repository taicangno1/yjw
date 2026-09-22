"""Conversation rules. The bot asks three things, then stops for a human."""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.slots import Slots, extract_slots, extract_slots_from_messages

MIN_DAILY = 5
FIRST_MESSAGE = (
    "我们做电商主图短视频，20秒、当天出。给代运营可以按天包量。"
    "方便的话发一个在卖的商品链接，我先免费出一条样片。"
)

_QUOTE_RE = re.compile(r"报价|多少钱|什么价|怎么收费|如何收费|收费标准|什么价格")
_SAMPLE_RE = re.compile(r"样片|样品|出一条|试一条|看看效果|免费出|看下效果")
_LOW_PHRASE_RE = re.compile(r"偶尔|就一条|单条试试")

REASON_LABEL = {
    "sample": "要样片",
    "quote": "要报价",
    "ready": "素材已齐",
}


@dataclass
class Turn:
    action: str
    text: str = ""
    reason: str = ""
    slots: Slots = field(default_factory=Slots)


def _ack(slots: Slots) -> str:
    if slots.product_url:
        return "链接收到了。样片和报价我让同事接，他看完直接回你。"
    return "好，样片和报价我让同事接。把一个正在卖的商品链接发在这里就行。"


def _low_volume(latest: str, slots: Slots) -> bool:
    latest_slots = extract_slots(latest)
    volume = latest_slots.daily_volume if latest_slots.daily_volume is not None else slots.daily_volume
    if volume is not None:
        return volume < MIN_DAILY
    return bool(_LOW_PHRASE_RE.search(latest))


def decide(messages: list[dict]) -> Turn:
    """Decide the next step from the full thread. Customer text drives the slots."""
    slots = extract_slots_from_messages(messages)
    latest = ""
    for message in reversed(messages):
        if message.get("role") == "customer":
            latest = message.get("text") or ""
            break

    wants_quote = bool(_QUOTE_RE.search(latest))
    wants_sample = bool(_SAMPLE_RE.search(latest))
    if wants_quote or wants_sample or slots.product_url:
        if wants_sample or (slots.product_url and not wants_quote):
            reason = "sample"
        else:
            reason = "quote"
        return Turn(action="handoff", text=_ack(slots), reason=reason, slots=slots)

    if _low_volume(latest, slots):
        return Turn(
            action="close",
            text="这个量我们暂时接不了。等你稳定到每天 5 条以上，再发我即可。",
            slots=slots,
        )

    if slots.daily_volume is None:
        return Turn(
            action="reply",
            text="一天大概做多少条？稳定在每天 5 条以上我们可以按天包量。",
            slots=slots,
        )
    if slots.category is None:
        return Turn(
            action="reply",
            text="主要是什么品类？比如女装、美妆、家居。",
            slots=slots,
        )
    if slots.product_url is None:
        return Turn(
            action="reply",
            text="发一个正在卖的商品链接，或三张商品主图。同事按这个出样片。",
            slots=slots,
        )
    return Turn(action="handoff", text=_ack(slots), reason="ready", slots=slots)
