# 名字大宗师小程序

基于周易八字五行的智能起名应用，支持微信/支付宝小程序。

## 功能特性

- 八字五行分析
- 三才五格计算
- 周易卦象解读
- 音韵学名字打分
- 诗词古文起名
- 名字对比功能
- 历史记录保存

## 快速开始

### 微信小程序

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. 打开微信开发者工具，点击「导入项目」

3. 选择本项目中的 `miniprogram` 文件夹

4. AppID 可以使用测试号，或填写自己的小程序 AppID

5. 点击「导入」即可在开发者工具中预览

### 支付宝小程序

1. 下载并安装 [支付宝小程序开发者工具](https://opendocs.alipay.com/mini/ide/download)

2. 打开支付宝开发者工具，点击「导入项目」

3. 选择本项目中的 `miniprogram` 文件夹

4. 填写 AppID（需要去支付宝开放平台创建应用获取）

5. 点击「导入」即可预览

## 项目结构

```
miniprogram/
├── app.js          # 应用入口
├── app.json        # 应用配置
├── app.wxss       # 全局样式
├── pages/
│   ├── index/     # 起名主页
│   ├── history/    # 历史记录
│   ├── compare/    # 名字对比
│   └── poem/       # 诗词起名
├── utils/
│   └── naming.js  # 起名算法核心
└── assets/         # 图片资源（需自行添加图标）
```

## 添加图标

tabBar 图标需要自行添加到 `assets/` 目录：

- `icon_home.png` / `icon_home_active.png`
- `icon_history.png` / `icon_history_active.png`
- `icon_compare.png` / `icon_compare_active.png`
- `icon_poem.png` / `icon_poem_active.png`

图标尺寸：81px × 81px

## 发布小程序

### 微信小程序

1. 在微信开发者工具中完成开发
2. 点击「上传」按钮
3. 登录 [微信公众平台](https://mp.weixin.qq.com/)
4. 进入「版本管理」提交审核
5. 审核通过后即可发布

### 支付宝小程序

1. 在支付宝开发者工具中完成开发
2. 点击「上传」按钮
3. 登录 [支付宝开放平台](https://open.alipay.com/)
4. 进入「应用管理」提交审核
5. 审核通过后即可发布

## 技术栈

- WXML / WXSS / JavaScript
- 微信小程序框架
- 周易八字算法
- 三才五格算法
- 音韵学评分系统

## License

MIT
