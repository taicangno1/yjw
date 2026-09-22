"""SQLite storage for leads, messages, handoffs, and scans."""

from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path

from app.dialogue import FIRST_MESSAGE, REASON_LABEL, decide
from app.scoring import score_text
from app.slots import Slots

DEFAULTS = {
    "threshold": "60",
    "handoff_webhook": "",
    "inbox_token": "",
    "keywords": "找剪辑 电商\n主图视频\n代运营 招视频\n带货视频 外包",
    "platforms": "xiaohongshu,douyin,boss",
    "wecom_corpid": "",
    "wecom_secret": "",
    "wecom_open_kfid": "",
}


def utcnow() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class StoreError(Exception):
    pass


class Database:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._init()

    def _init(self) -> None:
        self._conn.executescript(
            """
            create table if not exists settings (
                key text primary key,
                value text not null
            );
            create table if not exists leads (
                id integer primary key,
                platform text not null,
                author text not null default '',
                url text not null unique,
                external_id text unique,
                keyword text not null default '',
                text text not null,
                score integer not null,
                score_reason text not null default '',
                daily_volume integer,
                category text,
                product_url text,
                status text not null,
                first_message text not null default '',
                created_at text not null,
                updated_at text not null
            );
            create table if not exists messages (
                id integer primary key,
                lead_id integer not null,
                role text not null,
                text text not null,
                delivery text not null default '',
                delivery_error text not null default '',
                created_at text not null
            );
            create table if not exists handoffs (
                id integer primary key,
                lead_id integer not null unique,
                reason text not null,
                summary_json text not null,
                notified integer not null default 0,
                notify_detail text not null default '',
                created_at text not null,
                updated_at text not null
            );
            create table if not exists scans (
                id integer primary key,
                status text not null,
                keywords text not null,
                platforms text not null,
                added integer not null default 0,
                skipped integer not null default 0,
                detail text not null default '',
                created_at text not null,
                finished_at text
            );
            """
        )
        for key, value in DEFAULTS.items():
            self._conn.execute(
                "insert or ignore into settings(key, value) values (?, ?)",
                (key, value),
            )
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()

    def settings(self) -> dict[str, str]:
        with self._lock:
            return self._settings()

    def _settings(self) -> dict[str, str]:
        rows = self._conn.execute("select key, value from settings").fetchall()
        data = dict(DEFAULTS)
        data.update({row["key"]: row["value"] for row in rows})
        return data

    def update_settings(self, values: dict[str, str]) -> dict[str, str]:
        allowed = set(DEFAULTS)
        with self._lock:
            for key, value in values.items():
                if key not in allowed:
                    continue
                self._conn.execute(
                    "insert into settings(key, value) values (?, ?) "
                    "on conflict(key) do update set value = excluded.value",
                    (key, value),
                )
            self._conn.commit()
            return self._settings()

    def board(self) -> dict:
        with self._lock:
            lead_rows = self._conn.execute(
                "select * from leads order by updated_at desc, id desc limit 200"
            ).fetchall()
            message_rows = self._conn.execute(
                "select * from messages order by id asc"
            ).fetchall()
            handoff_rows = self._conn.execute(
                "select * from handoffs order by updated_at desc, id desc limit 100"
            ).fetchall()
            scan = self._conn.execute(
                "select * from scans order by id desc limit 1"
            ).fetchone()
            settings = self._settings()
        grouped: dict[int, list[dict]] = {}
        for row in message_rows:
            grouped.setdefault(row["lead_id"], []).append(_message(row))
        leads = []
        for row in lead_rows:
            item = _lead(row)
            item["messages"] = grouped.get(row["id"], [])
            leads.append(item)
        return {
            "leads": leads,
            "handoffs": [_handoff(row) for row in handoff_rows],
            "scan": _scan(scan) if scan else None,
            "settings": settings,
        }

    def import_lead(
        self,
        *,
        platform: str,
        author: str,
        url: str,
        text: str,
        keyword: str = "",
        external_id: str | None = None,
        status: str | None = None,
    ) -> tuple[bool, dict]:
        scored = score_text(text)
        with self._lock:
            settings = self._settings()
            threshold = _threshold(settings)
            existing = self._conn.execute("select * from leads where url = ?", (url,)).fetchone()
            if existing:
                return False, self._lead_with_messages(existing["id"])
            chosen = status or ("queued" if scored.score >= threshold else "watching")
            first = FIRST_MESSAGE if chosen == "queued" else ""
            now = utcnow()
            cursor = self._conn.execute(
                """
                insert into leads (
                    platform, author, url, external_id, keyword, text, score, score_reason,
                    daily_volume, category, product_url, status, first_message, created_at, updated_at
                ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    platform,
                    author[:80],
                    url,
                    external_id,
                    keyword[:80],
                    text[:4000],
                    scored.score,
                    scored.reason,
                    scored.slots.daily_volume,
                    scored.slots.category,
                    scored.slots.product_url,
                    chosen,
                    first,
                    now,
                    now,
                ),
            )
            self._conn.commit()
            return True, self._lead_with_messages(int(cursor.lastrowid))

    def queue_lead(self, lead_id: int) -> dict:
        with self._lock:
            lead = self._must_lead(lead_id)
            if lead["status"] in ("handoff", "closed", "qualifying", "awaiting_reply"):
                raise StoreError("这条线索已经离开待发送")
            now = utcnow()
            self._conn.execute(
                "update leads set status = 'queued', first_message = ?, updated_at = ? where id = ?",
                (FIRST_MESSAGE, now, lead_id),
            )
            self._conn.commit()
            return self._lead_with_messages(lead_id)

    def mark_sent(self, lead_id: int) -> dict:
        with self._lock:
            lead = self._must_lead(lead_id)
            if lead["status"] != "queued":
                raise StoreError("只有待发送的线索可以标记为已发送")
            now = utcnow()
            self._conn.execute(
                """
                insert into messages (lead_id, role, text, delivery, created_at)
                values (?, 'operator', ?, 'manual', ?)
                """,
                (lead_id, lead["first_message"] or FIRST_MESSAGE, now),
            )
            self._conn.execute(
                "update leads set status = 'awaiting_reply', updated_at = ? where id = ?",
                (now, lead_id),
            )
            self._conn.commit()
            return self._lead_with_messages(lead_id)

    def get_lead(self, lead_id: int) -> dict:
        with self._lock:
            self._must_lead(lead_id)
            return self._lead_with_messages(lead_id)

    def find_by_external(self, external_id: str) -> dict | None:
        with self._lock:
            row = self._conn.execute(
                "select * from leads where external_id = ?",
                (external_id,),
            ).fetchone()
            if not row:
                return None
            return self._lead_with_messages(row["id"])

    def customer_message(self, lead_id: int, text: str) -> tuple[dict, dict | None]:
        """Apply one customer reply. Returns the API payload and an optional webhook body."""
        with self._lock:
            self._conn.execute("BEGIN IMMEDIATE")
            try:
                lead = self._must_lead(lead_id)
                now = utcnow()
                if lead["status"] in ("queued", "watching"):
                    raise StoreError("还没有发送第一条，不能录入回复")
                self._conn.execute(
                    """
                    insert into messages (lead_id, role, text, delivery, created_at)
                    values (?, 'customer', ?, '', ?)
                    """,
                    (lead_id, text[:4000], now),
                )
                if lead["status"] == "closed":
                    self._conn.execute(
                        "update leads set updated_at = ? where id = ?",
                        (now, lead_id),
                    )
                    self._conn.commit()
                    return {"action": "ignored", "lead": self._lead_with_messages(lead_id)}, None
                if lead["status"] == "handoff":
                    self._refresh_slots(lead_id, now)
                    payload = self._rewrite_handoff(lead_id, now)
                    self._conn.commit()
                    return {"action": "noted", "lead": self._lead_with_messages(lead_id)}, payload
                messages = self._messages(lead_id)
                turn = decide(messages)
                self._apply_slots(lead_id, turn.slots, now)
                webhook = None
                delivery = ""
                if turn.action == "reply":
                    self._conn.execute(
                        "update leads set status = 'qualifying', updated_at = ? where id = ?",
                        (now, lead_id),
                    )
                    delivery = "copy"
                elif turn.action == "close":
                    self._conn.execute(
                        "update leads set status = 'closed', updated_at = ? where id = ?",
                        (now, lead_id),
                    )
                    delivery = "copy"
                elif turn.action == "handoff":
                    self._conn.execute(
                        "update leads set status = 'handoff', updated_at = ? where id = ?",
                        (now, lead_id),
                    )
                    delivery = "copy"
                    webhook = self._ensure_handoff(lead_id, turn.reason, now)
                else:
                    raise StoreError(f"未知动作 {turn.action}")
                self._conn.execute(
                    """
                    insert into messages (lead_id, role, text, delivery, created_at)
                    values (?, 'bot', ?, ?, ?)
                    """,
                    (lead_id, turn.text, delivery, now),
                )
                bot_id = int(self._conn.execute("select last_insert_rowid() as id").fetchone()["id"])
                self._conn.commit()
                result = {
                    "action": turn.action,
                    "reply": turn.text,
                    "reason": turn.reason,
                    "bot_message_id": bot_id,
                    "lead": self._lead_with_messages(lead_id),
                }
                return result, webhook
            except Exception:
                self._conn.rollback()
                raise

    def set_delivery(self, message_id: int, delivery: str, error: str = "") -> None:
        with self._lock:
            self._conn.execute(
                "update messages set delivery = ?, delivery_error = ? where id = ?",
                (delivery, error[:300], message_id),
            )
            self._conn.commit()

    def mark_handoff_notified(self, lead_id: int, ok: bool, detail: str) -> None:
        with self._lock:
            self._conn.execute(
                "update handoffs set notified = ?, notify_detail = ?, updated_at = ? where lead_id = ?",
                (1 if ok else 0, detail[:300], utcnow(), lead_id),
            )
            self._conn.commit()

    def ingest_hit(self, *, platform: str, title: str, snippet: str, url: str, keyword: str) -> str:
        text = f"{title}\n{snippet}".strip()
        scored = score_text(text)
        with self._lock:
            existing = self._conn.execute("select id from leads where url = ?", (url,)).fetchone()
            if existing:
                return "skipped"
            threshold = _threshold(self._settings())
            status = "queued" if scored.score >= threshold else "watching"
            now = utcnow()
            self._conn.execute(
                """
                insert into leads (
                    platform, author, url, keyword, text, score, score_reason,
                    daily_volume, category, product_url, status, first_message, created_at, updated_at
                ) values (?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    platform,
                    url,
                    keyword[:80],
                    text[:4000],
                    scored.score,
                    scored.reason,
                    scored.slots.daily_volume,
                    scored.slots.category,
                    scored.slots.product_url,
                    status,
                    FIRST_MESSAGE if status == "queued" else "",
                    now,
                    now,
                ),
            )
            self._conn.commit()
            return "added"

    def create_scan(self, keywords: list[str], platforms: list[str]) -> int:
        with self._lock:
            running = self._conn.execute(
                "select id from scans where status = 'running' order by id desc limit 1"
            ).fetchone()
            if running:
                raise StoreError("上一轮巡检还在跑")
            now = utcnow()
            cursor = self._conn.execute(
                """
                insert into scans (status, keywords, platforms, created_at)
                values ('running', ?, ?, ?)
                """,
                ("\n".join(keywords), ",".join(platforms), now),
            )
            self._conn.commit()
            return int(cursor.lastrowid)

    def finish_scan(self, scan_id: int, status: str, added: int, skipped: int, detail: str) -> None:
        with self._lock:
            self._conn.execute(
                """
                update scans
                set status = ?, added = ?, skipped = ?, detail = ?, finished_at = ?
                where id = ?
                """,
                (status, added, skipped, detail[:2000], utcnow(), scan_id),
            )
            self._conn.commit()

    def wecom_credentials(self) -> tuple[str, str, str]:
        settings = self.settings()
        return (
            settings.get("wecom_corpid", ""),
            settings.get("wecom_secret", ""),
            settings.get("wecom_open_kfid", ""),
        )

    def _must_lead(self, lead_id: int) -> sqlite3.Row:
        row = self._conn.execute("select * from leads where id = ?", (lead_id,)).fetchone()
        if not row:
            raise StoreError("找不到这条线索")
        return row

    def _messages(self, lead_id: int) -> list[dict]:
        rows = self._conn.execute(
            "select * from messages where lead_id = ? order by id asc",
            (lead_id,),
        ).fetchall()
        return [_message(row) for row in rows]

    def _lead_with_messages(self, lead_id: int) -> dict:
        row = self._conn.execute("select * from leads where id = ?", (lead_id,)).fetchone()
        item = _lead(row)
        item["messages"] = self._messages(lead_id)
        return item

    def _apply_slots(self, lead_id: int, slots: Slots, now: str) -> None:
        self._conn.execute(
            """
            update leads
            set daily_volume = ?, category = ?, product_url = ?, updated_at = ?
            where id = ?
            """,
            (slots.daily_volume, slots.category, slots.product_url, now, lead_id),
        )

    def _refresh_slots(self, lead_id: int, now: str) -> None:
        turn = decide(self._messages(lead_id))
        self._apply_slots(lead_id, turn.slots, now)

    def _ensure_handoff(self, lead_id: int, reason: str, now: str) -> dict:
        summary = self._summary(lead_id, reason)
        existing = self._conn.execute(
            "select id from handoffs where lead_id = ?",
            (lead_id,),
        ).fetchone()
        if existing:
            self._conn.execute(
                "update handoffs set reason = ?, summary_json = ?, updated_at = ? where lead_id = ?",
                (reason, json.dumps(summary, ensure_ascii=False), now, lead_id),
            )
        else:
            self._conn.execute(
                """
                insert into handoffs (lead_id, reason, summary_json, created_at, updated_at)
                values (?, ?, ?, ?, ?)
                """,
                (lead_id, reason, json.dumps(summary, ensure_ascii=False), now, now),
            )
        summary["event"] = "created"
        return summary

    def _rewrite_handoff(self, lead_id: int, now: str) -> dict | None:
        row = self._conn.execute(
            "select * from handoffs where lead_id = ?",
            (lead_id,),
        ).fetchone()
        if not row:
            return None
        summary = self._summary(lead_id, row["reason"])
        summary["event"] = "updated"
        self._conn.execute(
            "update handoffs set summary_json = ?, updated_at = ? where lead_id = ?",
            (json.dumps(summary, ensure_ascii=False), now, lead_id),
        )
        return summary

    def _summary(self, lead_id: int, reason: str) -> dict:
        lead = self._must_lead(lead_id)
        messages = self._messages(lead_id)
        return {
            "lead_id": lead_id,
            "platform": lead["platform"],
            "author": lead["author"],
            "profile_url": lead["url"],
            "external_id": lead["external_id"] or "",
            "daily_volume": lead["daily_volume"],
            "category": lead["category"] or "",
            "product_url": lead["product_url"] or "",
            "reason": reason,
            "reason_label": REASON_LABEL.get(reason, reason),
            "post": lead["text"],
            "recent": [{"role": item["role"], "text": item["text"]} for item in messages[-8:]],
        }


def _threshold(settings: dict[str, str]) -> int:
    try:
        value = int(settings.get("threshold", "60"))
    except ValueError:
        return 60
    return max(0, min(100, value))


def _lead(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "platform": row["platform"],
        "author": row["author"],
        "url": row["url"],
        "external_id": row["external_id"] or "",
        "keyword": row["keyword"],
        "text": row["text"],
        "score": row["score"],
        "score_reason": row["score_reason"],
        "daily_volume": row["daily_volume"],
        "category": row["category"] or "",
        "product_url": row["product_url"] or "",
        "status": row["status"],
        "first_message": row["first_message"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def _message(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "role": row["role"],
        "text": row["text"],
        "delivery": row["delivery"],
        "delivery_error": row["delivery_error"],
        "created_at": row["created_at"],
    }


def _handoff(row: sqlite3.Row) -> dict:
    summary = json.loads(row["summary_json"])
    summary.update(
        {
            "id": row["id"],
            "notified": bool(row["notified"]),
            "notify_detail": row["notify_detail"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
    )
    return summary


def _scan(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "status": row["status"],
        "keywords": row["keywords"],
        "platforms": row["platforms"],
        "added": row["added"],
        "skipped": row["skipped"],
        "detail": row["detail"],
        "created_at": row["created_at"],
        "finished_at": row["finished_at"],
    }


def execute_scan(db: Database, search, scan_id: int, keywords: list[str], platforms: list[str]) -> None:
    added = 0
    skipped = 0
    warnings: list[str] = []
    try:
        for platform in platforms:
            for keyword in keywords:
                try:
                    hits = search(platform, keyword)
                except Exception as exc:
                    warnings.append(f"{platform}/{keyword}: {exc}")
                    continue
                for hit in hits:
                    outcome = db.ingest_hit(
                        platform=hit.platform,
                        title=hit.title,
                        snippet=hit.snippet,
                        url=hit.url,
                        keyword=keyword,
                    )
                    if outcome == "added":
                        added += 1
                    else:
                        skipped += 1
        status = "failed" if added == 0 and skipped == 0 and warnings else "done"
        db.finish_scan(scan_id, status, added, skipped, "\n".join(warnings))
    except Exception as exc:
        db.finish_scan(scan_id, "failed", added, skipped, str(exc))
