# 本地加密档案

这是个人版 P0 和企业版 E0–E3 的可运行切片，不是行为延续体。

磁盘上只有密文。口令只在本进程使用。个人库和企业库互不可见。没有放入的内容会回答“资料里没有”。企业长期约束命中时，草稿被拦截，不能确认。

## 运行

```bash
export VAULT_PASSPHRASE='自己保管的口令'
python3 -m personal_agent.cli init --path vault.enc
python3 -m personal_agent.cli add --path vault.enc --realm personal --clearance secret --title 备忘 --text '只放有权使用的文字'
python3 -m personal_agent.cli ask --path vault.enc --realm personal --clearance secret --q 备忘
python3 -m personal_agent.cli constrain --path vault.enc --text 不得对外承诺收益
python3 -m personal_agent.cli draft --path vault.enc --realm enterprise --clearance secret --q 对外口径
python3 -m personal_agent.cli confirm --path vault.enc --id 草稿编号
```

## 测试

```bash
python3 -m unittest personal_agent.test_vault
```

## 这一版没有做

不采集摄像头、麦克风和屏幕。不训练模型。不代发邮件。不实现死后冻结。P1 的采纳率和后悔率需要真实使用记录，这一版只把草稿停在“待确认”。
