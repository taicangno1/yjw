import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.sources import Hit


@pytest.fixture()
def client(tmp_path):
    app = create_app(tmp_path / "x.sqlite3", search=fake_search)
    with TestClient(app) as test_client:
        yield test_client


def fake_search(platform, keyword):
    if platform != "xiaohongshu" or keyword != "找剪辑 电商":
        return []
    return [
        Hit(
            platform="xiaohongshu",
            title="女装代运营找主图视频",
            snippet="每天20条，长期找剪辑",
            url="https://www.xiaohongshu.com/explore/abc",
        )
    ]


def test_scan_queues_a_high_intent_post_and_skips_duplicates(client):
    first = client.post("/api/scans", json={"keywords": ["找剪辑 电商"], "platforms": ["xiaohongshu"]})
    assert first.status_code == 200
    board = client.get("/api/board").json()
    assert board["scan"]["status"] == "done"
    assert board["scan"]["added"] == 1
    queued = [lead for lead in board["leads"] if lead["status"] == "queued"]
    assert len(queued) == 1
    assert queued[0]["daily_volume"] == 20

    second = client.post("/api/scans", json={"keywords": ["找剪辑 电商"], "platforms": ["xiaohongshu"]})
    assert second.status_code == 200
    board = client.get("/api/board").json()
    assert board["scan"]["added"] == 0
    assert board["scan"]["skipped"] == 1


def test_human_send_then_sample_request_creates_a_handoff(client):
    pushed = {}

    def notify(url, payload):
        pushed["url"] = url
        pushed["payload"] = payload
        return True, "HTTP 200"

    client.app.state.notify = notify
    client.put("/api/settings", json={"handoff_webhook": "https://example.test/hook"})
    imported = client.post(
        "/api/leads/import",
        json={
            "platform": "小红书",
            "author": "杭州代运营",
            "url": "https://www.xiaohongshu.com/explore/need-video",
            "text": "杭州女装代运营，长期找主图视频，每天30条",
        },
    )
    assert imported.status_code == 200
    lead_id = imported.json()["lead"]["id"]
    assert imported.json()["lead"]["status"] == "queued"

    sent = client.post(f"/api/leads/{lead_id}/sent")
    assert sent.status_code == 200
    reply = client.post(
        f"/api/leads/{lead_id}/reply",
        json={"text": "女装每天20条，先出个样片 https://item.taobao.com/item.htm?id=9"},
    )
    assert reply.status_code == 200
    body = reply.json()
    assert body["action"] == "handoff"
    assert body["reason"] == "sample"
    assert pushed["url"] == "https://example.test/hook"
    assert pushed["payload"]["daily_volume"] == 20
    assert pushed["payload"]["product_url"].endswith("id=9")
    handoffs = client.get("/api/board").json()["handoffs"]
    assert handoffs[0]["notified"] is True


def test_low_volume_reply_closes_and_does_not_page_a_human(client):
    imported = client.post(
        "/api/leads/import",
        json={
            "platform": "douyin",
            "author": "小店",
            "url": "https://www.douyin.com/video/1",
            "text": "代运营长期招主图视频剪辑，每天15条",
        },
    )
    lead_id = imported.json()["lead"]["id"]
    client.post(f"/api/leads/{lead_id}/sent")
    reply = client.post(f"/api/leads/{lead_id}/reply", json={"text": "一天就1条"})
    assert reply.json()["action"] == "close"
    assert client.get("/api/board").json()["handoffs"] == []


def test_reply_before_send_is_rejected(client):
    imported = client.post(
        "/api/leads/import",
        json={
            "platform": "boss",
            "author": "工作室",
            "url": "https://www.zhipin.com/job_detail/9.html",
            "text": "电商代运营工作室长期招视频剪辑",
        },
    )
    lead_id = imported.json()["lead"]["id"]
    reply = client.post(f"/api/leads/{lead_id}/reply", json={"text": "我们每天20条"})
    assert reply.status_code == 409


def test_wecom_inbound_sends_the_reply_and_hands_off(client):
    sent = []
    client.app.state.wecom_send = lambda *args: sent.append(args)
    saved = client.put(
        "/api/settings",
        json={
            "inbox_token": "secret",
            "wecom_corpid": "ww1",
            "wecom_secret": "sec",
            "wecom_open_kfid": "kf1",
        },
    )
    assert saved.status_code == 200
    denied = client.post(
        "/api/inbound",
        json={"external_id": "wm1", "text": "先出样片", "platform": "wecom", "author": "王店长"},
    )
    assert denied.status_code == 401
    accepted = client.post(
        "/api/inbound",
        headers={"X-Inbox-Token": "secret"},
        json={
            "external_id": "wm1",
            "platform": "wecom",
            "author": "王店长",
            "text": "我们女装代运营每天20条主图视频，先出样片",
        },
    )
    assert accepted.status_code == 200
    body = accepted.json()
    assert body["action"] == "handoff"
    assert body["delivery"] == "sent"
    assert sent and sent[0][3] == "wm1"
    assert "同事" in sent[0][4]
