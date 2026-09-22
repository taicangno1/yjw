"""Send a text reply through the official WeCom customer-service API."""

from __future__ import annotations

import time
from typing import Callable

import httpx

_cache: dict[str, tuple[str, float]] = {}


class WeComError(Exception):
    pass


def send_text(
    corpid: str,
    secret: str,
    open_kfid: str,
    external_userid: str,
    text: str,
    post: Callable | None = None,
    get: Callable | None = None,
) -> None:
    if not all((corpid, secret, open_kfid, external_userid, text)):
        raise WeComError("企业微信客服还没配齐")
    token = _token(corpid, secret, get)
    sender = post or _post_json
    data = sender(
        f"https://qyapi.weixin.qq.com/cgi-bin/kf/send_msg?access_token={token}",
        {
            "touser": external_userid,
            "open_kfid": open_kfid,
            "msgtype": "text",
            "text": {"content": text[:2048]},
        },
    )
    if data.get("errcode") not in (0, None):
        raise WeComError(data.get("errmsg") or "发送失败")


def _token(corpid: str, secret: str, get: Callable | None) -> str:
    cached = _cache.get(corpid)
    now = time.time()
    if cached and cached[1] > now:
        return cached[0]
    getter = get or _get_json
    data = getter(
        "https://qyapi.weixin.qq.com/cgi-bin/gettoken",
        {"corpid": corpid, "corpsecret": secret},
    )
    if data.get("errcode") not in (0, None) or not data.get("access_token"):
        raise WeComError(data.get("errmsg") or "拿不到 access_token")
    _cache[corpid] = (data["access_token"], now + max(60, int(data.get("expires_in", 7200)) - 120))
    return data["access_token"]


def _get_json(url: str, params: dict) -> dict:
    response = httpx.get(url, params=params, timeout=8.0)
    response.raise_for_status()
    return response.json()


def _post_json(url: str, payload: dict) -> dict:
    response = httpx.post(url, json=payload, timeout=8.0)
    response.raise_for_status()
    return response.json()
