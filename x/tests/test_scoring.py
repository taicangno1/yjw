from app.scoring import score_text


def test_agency_with_daily_volume_scores_high():
    scored = score_text("广州女装代运营，找长期主图视频剪辑，每天20条左右，稳定日更。")
    assert scored.score >= 60
    assert scored.slots.daily_volume == 20
    assert scored.slots.category == "女装"


def test_learning_post_scores_low():
    scored = score_text("学生免费学剪辑，求教程")
    assert scored.score < 60
    assert "个人学习" in scored.reason
