"""Score a public post by how likely it is to need videos every day."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.slots import Slots, extract_slots

_RULES = (
    (30, re.compile(r"代运营|MCN|mcn|工作室|美工|详情页"), "像代运营或制作公司"),
    (25, re.compile(r"每天|日更|天天|批量|大量|长期"), "在找长期或按天的量"),
    (20, re.compile(r"招剪辑|找剪辑|视频外包|外包视频|包月"), "在找剪辑或包月"),
    (15, re.compile(r"主图视频|带货视频|产品视频|短视频|主图"), "在提电商视频"),
)
_LEARNING = re.compile(r"免费学|学生|课程作业|学剪辑|求教程")


@dataclass
class Score:
    score: int
    reason: str
    slots: Slots


def score_text(text: str) -> Score:
    slots = extract_slots(text)
    points = 0
    reasons: list[str] = []
    for weight, pattern, label in _RULES:
        if pattern.search(text):
            points += weight
            reasons.append(label)
    if slots.daily_volume is not None and slots.daily_volume >= 10:
        points += 25
        reasons.append(f"日需求{slots.daily_volume}条")
    elif slots.daily_volume is not None and slots.daily_volume >= 5:
        points += 10
        reasons.append(f"日需求{slots.daily_volume}条")
    elif slots.daily_volume is not None and slots.daily_volume < 5:
        points -= 30
        reasons.append("日需求低于5条")
    if _LEARNING.search(text):
        points -= 40
        reasons.append("像个人学习")
    points = max(0, min(100, points))
    return Score(score=points, reason="、".join(reasons) or "公开帖里没有明确的日需求", slots=slots)
