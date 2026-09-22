from app.dialogue import FIRST_MESSAGE, decide


def test_first_message_is_the_agreed_opener():
    assert "20秒" in FIRST_MESSAGE
    assert "样片" in FIRST_MESSAGE


def test_asks_volume_then_category_then_link_then_hands_off():
    messages = [{"role": "customer", "text": "你好，想了解一下"}]
    turn = decide(messages)
    assert turn.action == "reply"
    assert "多少条" in turn.text

    messages += [{"role": "bot", "text": turn.text}, {"role": "customer", "text": "每天20条"}]
    turn = decide(messages)
    assert turn.action == "reply"
    assert "品类" in turn.text

    messages += [{"role": "bot", "text": turn.text}, {"role": "customer", "text": "女装"}]
    turn = decide(messages)
    assert turn.action == "reply"
    assert "链接" in turn.text

    messages += [
        {"role": "bot", "text": turn.text},
        {"role": "customer", "text": "https://item.taobao.com/item.htm?id=1"},
    ]
    turn = decide(messages)
    assert turn.action == "handoff"
    assert turn.reason == "sample"
    assert turn.slots.daily_volume == 20
    assert turn.slots.category == "女装"
    assert turn.slots.product_url.startswith("https://item.taobao.com/")


def test_quote_request_hands_off_immediately():
    turn = decide([{"role": "customer", "text": "你们怎么收费？"}])
    assert turn.action == "handoff"
    assert turn.reason == "quote"


def test_sample_request_hands_off_immediately():
    turn = decide([{"role": "customer", "text": "先出个样片看看"}])
    assert turn.action == "handoff"
    assert turn.reason == "sample"


def test_tiny_volume_closes_without_handoff():
    turn = decide([{"role": "customer", "text": "一天就1条"}])
    assert turn.action == "close"


def test_quote_wins_over_tiny_volume():
    turn = decide([{"role": "customer", "text": "一天就1条，多少钱"}])
    assert turn.action == "handoff"
    assert turn.reason == "quote"
    assert turn.slots.daily_volume == 1
