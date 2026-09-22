"""X local console and HTTP API."""

from __future__ import annotations

import os
from pathlib import Path

import httpx
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator

from app.sources import DOMAINS, search_public
from app.store import Database, StoreError, execute_scan
from app.wecom import send_text

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"
DATA = ROOT / "data" / "x.sqlite3"


class ImportIn(BaseModel):
    platform: str
    author: str = ""
    url: str
    text: str
    keyword: str = ""

    @field_validator("url")
    @classmethod
    def check_url(cls, value: str) -> str:
        value = value.strip()
        if not value.startswith(("http://", "https://")):
            raise ValueError("链接需要以 http:// 或 https:// 开头")
        return value[:1000]

    @field_validator("text")
    @classmethod
    def check_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("帖子内容是空的")
        return value[:4000]


class ReplyIn(BaseModel):
    text: str


class InboundIn(BaseModel):
    platform: str = "wecom"
    author: str = ""
    external_id: str
    text: str
    url: str = ""


class ScanIn(BaseModel):
    keywords: list[str] | None = None
    platforms: list[str] | None = None


class SettingsIn(BaseModel):
    threshold: int | None = None
    handoff_webhook: str | None = None
    inbox_token: str | None = None
    keywords: str | None = None
    platforms: list[str] | None = None
    wecom_corpid: str | None = None
    wecom_secret: str | None = None
    wecom_open_kfid: str | None = None


def create_app(db_path: Path | None = None, search=None) -> FastAPI:
    database = Database(db_path or DATA)
    app = FastAPI(title="X")
    app.state.db = database
    app.state.search = search or search_public
    app.state.wecom_send = send_text
    app.state.notify = notify_webhook

    @app.middleware("http")
    async def require_token(request: Request, call_next):
        token = os.environ.get("X_AUTH_TOKEN", "")
        if token and request.url.path.startswith("/api/") and request.url.path != "/api/inbound":
            header = request.headers.get("authorization", "")
            if header != f"Bearer {token}":
                return JSONResponse({"detail": "未授权"}, status_code=401)
        return await call_next(request)

    @app.get("/api/health")
    def health() -> dict:
        return {"ok": True}

    @app.get("/api/board")
    def board(request: Request) -> dict:
        return request.app.state.db.board()

    @app.post("/api/leads/import")
    def import_lead(body: ImportIn, request: Request) -> dict:
        created, lead = request.app.state.db.import_lead(
            platform=normalize_platform(body.platform),
            author=body.author.strip(),
            url=body.url,
            text=body.text,
            keyword=body.keyword.strip(),
        )
        return {"created": created, "lead": lead}

    @app.post("/api/leads/{lead_id}/queue")
    def queue_lead(lead_id: int, request: Request) -> dict:
        return _run(request.app.state.db.queue_lead, lead_id)

    @app.post("/api/leads/{lead_id}/sent")
    def mark_sent(lead_id: int, request: Request) -> dict:
        return _run(request.app.state.db.mark_sent, lead_id)

    @app.post("/api/leads/{lead_id}/reply")
    def reply(lead_id: int, body: ReplyIn, request: Request) -> dict:
        text = body.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="回复是空的")
        return _accept_customer(request, lead_id, text)

    @app.post("/api/inbound")
    def inbound(body: InboundIn, request: Request) -> dict:
        database: Database = request.app.state.db
        expected = os.environ.get("X_INBOX_TOKEN") or database.settings().get("inbox_token") or ""
        if expected and request.headers.get("x-inbox-token", "") != expected:
            raise HTTPException(status_code=401, detail="进线口令不对")
        external_id = body.external_id.strip()
        text = body.text.strip()
        if not external_id or not text:
            raise HTTPException(status_code=400, detail="进线缺少人或内容")
        existing = database.find_by_external(external_id)
        if not existing:
            _, existing = database.import_lead(
                platform=normalize_platform(body.platform),
                author=body.author.strip(),
                url=body.url.strip() or f"x-wecom:{external_id}",
                text=text,
                external_id=external_id,
                status="awaiting_reply",
            )
        return _accept_customer(request, existing["id"], text)

    @app.post("/api/scans")
    def start_scan(body: ScanIn, background: BackgroundTasks, request: Request) -> dict:
        database: Database = request.app.state.db
        current = database.settings()
        keywords = body.keywords if body.keywords is not None else current["keywords"].splitlines()
        platforms = body.platforms if body.platforms is not None else current["platforms"].split(",")
        keywords = [item.strip() for item in keywords if item and item.strip()][:8]
        platforms = [item.strip() for item in platforms if item and item.strip() in DOMAINS]
        if not keywords or not platforms:
            raise HTTPException(status_code=400, detail="请填写关键词和平台")
        try:
            scan_id = database.create_scan(keywords, platforms)
        except StoreError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        background.add_task(
            execute_scan,
            database,
            request.app.state.search,
            scan_id,
            keywords,
            platforms,
        )
        return {"id": scan_id, "status": "running"}

    @app.put("/api/settings")
    def update_settings(body: SettingsIn, request: Request) -> dict:
        values: dict[str, str] = {}
        if body.threshold is not None:
            values["threshold"] = str(max(0, min(100, body.threshold)))
        if body.handoff_webhook is not None:
            webhook = body.handoff_webhook.strip()
            if webhook and not webhook.startswith(("http://", "https://")):
                raise HTTPException(status_code=400, detail="交接地址需要以 http:// 或 https:// 开头")
            values["handoff_webhook"] = webhook
        if body.inbox_token is not None:
            values["inbox_token"] = body.inbox_token.strip()
        if body.keywords is not None:
            values["keywords"] = body.keywords.strip()
        if body.platforms is not None:
            picked = [item for item in body.platforms if item in DOMAINS]
            values["platforms"] = ",".join(picked)
        for key in ("wecom_corpid", "wecom_secret", "wecom_open_kfid"):
            value = getattr(body, key)
            if value is not None:
                values[key] = value.strip()
        return request.app.state.db.update_settings(values)

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(STATIC / "index.html")

    app.mount("/static", StaticFiles(directory=STATIC), name="static")
    return app


def _run(func, *args):
    try:
        return func(*args)
    except StoreError as exc:
        status = 404 if "找不到" in str(exc) else 409
        raise HTTPException(status_code=status, detail=str(exc)) from exc


def _accept_customer(request: Request, lead_id: int, text: str) -> dict:
    database: Database = request.app.state.db
    try:
        result, webhook = database.customer_message(lead_id, text)
    except StoreError as exc:
        status = 404 if "找不到" in str(exc) else 409
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    result = _deliver(request.app, result)
    if webhook:
        _push(request.app, lead_id, webhook)
        result["lead"] = database.get_lead(lead_id)
    return result


def _deliver(app: FastAPI, result: dict) -> dict:
    if result.get("action") not in {"reply", "close", "handoff"}:
        return result
    lead = result["lead"]
    database: Database = app.state.db
    corpid, secret, open_kfid = database.wecom_credentials()
    if lead["platform"] != "wecom" or not lead.get("external_id") or not all((corpid, secret, open_kfid)):
        return result
    try:
        app.state.wecom_send(corpid, secret, open_kfid, lead["external_id"], result["reply"])
    except Exception as exc:
        database.set_delivery(result["bot_message_id"], "copy", str(exc))
        result["delivery"] = "copy"
        result["delivery_error"] = str(exc)
    else:
        database.set_delivery(result["bot_message_id"], "sent", "")
        result["delivery"] = "sent"
    result["lead"] = database.get_lead(lead["id"])
    return result


def _push(app: FastAPI, lead_id: int, payload: dict) -> None:
    database: Database = app.state.db
    url = os.environ.get("X_HANDOFF_WEBHOOK") or database.settings().get("handoff_webhook") or ""
    ok, detail = app.state.notify(url, payload)
    if url:
        database.mark_handoff_notified(lead_id, ok, detail)


def notify_webhook(url: str, payload: dict) -> tuple[bool, str]:
    if not url:
        return False, ""
    if not url.startswith(("http://", "https://")):
        return False, "webhook 需要 http(s) 地址"
    try:
        response = httpx.post(url, json=payload, timeout=5.0)
    except Exception as exc:
        return False, str(exc)
    if response.status_code >= 300:
        return False, f"HTTP {response.status_code}"
    return True, f"HTTP {response.status_code}"


def normalize_platform(value: str) -> str:
    text = value.strip().lower()
    if "xiaohongshu" in text or "xhs" in text or "小红书" in value:
        return "xiaohongshu"
    if "douyin" in text or "抖音" in value:
        return "douyin"
    if "zhipin" in text or "boss" in text:
        return "boss"
    if "wecom" in text or "wechat" in text or "微信" in value:
        return "wecom"
    return "other"


app = create_app()
