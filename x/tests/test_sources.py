from app.sources import filter_hits, parse_duckduckgo, search_public

DDG = """
<a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.xiaohongshu.com%2Fexplore%2Fabc123&amp;rut=1">女装代运营找主图视频</a>
<a class="result__snippet">每天20条，长期找剪辑</a>
<a class="result__a" href="https://example.com/nope">女装代运营找主图视频</a>
<a class="result__snippet">每天20条，长期找剪辑</a>
"""


def test_parser_keeps_xiaohongshu_and_drops_other_domains():
    hits = filter_hits(parse_duckduckgo(DDG), "xiaohongshu", "找剪辑")
    assert len(hits) == 1
    assert hits[0].url == "https://www.xiaohongshu.com/explore/abc123"
    assert "20条" in hits[0].snippet


def test_search_stops_after_the_first_engine_with_hits():
    calls = []

    def fake_get(url, params):
        calls.append(url)
        assert "site:xiaohongshu.com" in params["q"]
        return DDG

    hits = search_public("xiaohongshu", "找剪辑", get=fake_get)
    assert len(hits) == 1
    assert calls == ["https://html.duckduckgo.com/html/"]


def test_search_tries_the_next_engine_when_the_first_fails():
    def fake_get(url, params):
        if "duckduckgo" in url:
            raise RuntimeError("blocked")
        return """
        <li class="b_algo"><h2><a href="https://www.zhipin.com/job_detail/1.html">电商代运营招视频剪辑</a></h2>
        <p>每天20条主图视频</p></li>
        """

    hits = search_public("boss", "招视频", get=fake_get)
    assert hits[0].url == "https://www.zhipin.com/job_detail/1.html"
    assert hits[0].platform == "boss"
