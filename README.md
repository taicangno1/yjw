# 放置三国

Q版三国题材放置挂机游戏，支持微信小程序和抖音小程序。

## 技术栈

- **游戏引擎**: Cocos Creator 3.8.0
- **开发语言**: TypeScript
- **目标平台**: 微信小程序、抖音小程序

## 项目结构

```
assets/
├── scenes/              # 游戏场景
├── prefabs/             # 预制体
├── scripts/             # 脚本代码
│   ├── core/            # 核心系统
│   ├── data/            # 数据结构
│   ├── entity/          # 实体类
│   ├── ui/              # UI逻辑
│   └── utils/           # 工具类
├── resources/           # 游戏资源
│   ├── hero/            # 武将资源
│   ├── audio/           # 音频资源
│   └── data/            # 配置数据表
└── textures/            # 图片资源
```

## 核心系统

- **GameManager**: 游戏主管理器
- **DataManager**: 数据管理器（存储、存档）
- **BattleManager**: 战斗管理器（回合制战斗）
- **OfflineManager**: 离线收益管理器
- **AudioManager**: 音频管理器
- **AdManager**: 广告管理器

## 开发指南

### 环境要求

- Cocos Creator 3.8.0+
- Node.js 16+
- npm 或 yarn

### 运行项目

1. 安装 Cocos Creator 3.8.0
2. 打开 Cocos Creator
3. 选择 "打开项目"
4. 选择本项目根目录
5. 在 Cocos Creator 中打开 "MainCity" 场景
6. 点击运行按钮预览

### 构建发布

1. 在 Cocos Creator 中选择 "项目" -> "构建发布"
2. 选择目标平台（微信小游戏/抖音小游戏）
3. 配置相关参数
4. 点击构建
5. 使用对应平台的开发者工具打开构建目录

## 游戏玩法

- **放置挂机**: 武将从动自动战斗，离线也能获得收益
- **武将养成**: 升级、升星、装备穿戴
- **兵种克制**: 步、骑、弓三种兵种相互克制
- **章节剧情**: 跟随三国历史剧情推进关卡

## 许可证

MIT License
