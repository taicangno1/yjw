# X

X 把「找正在找电商短视频的人」做到你点发送之前，把「问清日需求、品类、商品链接」做到对方要报价或样片之前。样片、改片、报价和签约仍由你来。

## 它做什么

1. 用公开搜索引擎查看小红书、抖音、BOSS 上已经写出来的求购，打分后放进线索池。分数达到阈值的，进入待发送，并写好第一句。
2. 你复制第一句，在原平台发出去，回到 X 点「我已发送」。
3. 对方一回复，你把原话贴回来（企业微信客服可以自动进线）。X 只问三件事：一天多少条、什么品类、一个商品链接。每天少于 5 条的，X 自己结束，不叫你。
4. 对方要报价、要样片，或把商品链接发来时，X 停止跟进，生成一张工单。配了 Webhook 就会推到你的企业微信或飞书机器人。

小红书、抖音、BOSS 没有对陌生人开放自动私信。这些平台上，X 把下一句写好，你复制发送。企业微信客服配齐之后，对方先开口的对话由 X 直接回。

## 运行

```bash
cd x
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8787
```

浏览器打开 http://127.0.0.1:8787 。

放到服务器上时加上访问口令，并继续只监听内网地址：

```bash
X_AUTH_TOKEN='一段足够长的口令' python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8787
```

## 每天怎么用

1. 打开「巡检」，保留默认关键词，点「开始巡检」。搜索引擎打不开时，用「收录一条公开帖」把看到的求购贴进来。
2. 在「待发送」复制首句，到原帖私信发出去，点「我已发送」。
3. 对方回复后，贴进「对话」，点「录入回复」。页面上出现「下一句待你转发」时，复制后发回给对方。
4. 「待接手」里出现工单时，你来出样片和报价。

第一句是固定的：

> 我们做电商主图短视频，20秒、当天出。给代运营可以按天包量。方便的话发一个在卖的商品链接，我先免费出一条样片。

## 企业微信客服

在巡检页底部填 CorpID、客户联系 Secret、客服账号 ID。企业微信收到消息并解密后，把文本转发到：

```bash
curl -X POST http://127.0.0.1:8787/api/inbound \
  -H 'Content-Type: application/json' \
  -H 'X-Inbox-Token: 你的进线口令' \
  -d '{"platform":"wecom","author":"王店长","external_id":"wmXXXX","text":"女装每天20条，先出样片"}'
```

`external_id` 用客户的 external_userid。上面三项配齐后，X 会调用企业微信「发送消息」接口把回复发出去。

## 交接 Webhook

在设置里填一个企业微信或飞书机器人地址。有人要样片或报价时，X 发送：

```json
{
  "event": "created",
  "reason_label": "要样片",
  "author": "杭州代运营",
  "platform": "xiaohongshu",
  "daily_volume": 20,
  "category": "女装",
  "product_url": "https://item.taobao.com/item.htm?id=9",
  "profile_url": "https://www.xiaohongshu.com/explore/need-video",
  "recent": [{"role": "customer", "text": "女装每天20条，先出个样片"}]
}
```

对方后来补的链接会再推一次，`event` 为 `updated`。

## 测试

```bash
cd x
python3 -m pytest -q
```
