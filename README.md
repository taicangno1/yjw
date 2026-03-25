# 放置三国

Q版三国题材放置挂机游戏，纯 HTML5 + Phaser.js 开发，支持浏览器直接运行。

## 在线体验

直接在浏览器打开 `index.html` 即可游玩。

## 技术栈

- **游戏引擎**: Phaser 3.60
- **开发语言**: JavaScript (ES6)
- **渲染模式**: WebGL + Canvas

## 项目结构

```
├── index.html              # 游戏入口页面
├── js/
│   ├── main.js            # Phaser 游戏配置
│   ├── scenes/            # 游戏场景
│   │   ├── BootScene.js          # 启动场景
│   │   ├── PreloadScene.js       # 预加载场景
│   │   ├── MainCityScene.js      # 主城场景
│   │   ├── LevelSelectScene.js   # 关卡选择场景
│   │   ├── BattleScene.js        # 战斗场景
│   │   ├── HeroListScene.js      # 武将列表场景
│   │   └── OfflineEarningsScene.js # 离线收益场景
│   ├── managers/          # 管理器
│   │   ├── GameManager.js        # 游戏主管理器
│   │   ├── DataManager.js        # 数据管理器
│   │   ├── BattleManager.js      # 战斗管理器
│   │   ├── OfflineManager.js     # 离线收益管理器
│   │   ├── AudioManager.js       # 音频管理器
│   │   └── AdManager.js          # 广告管理器
│   ├── entities/          # 实体类
│   │   └── Hero.js              # 武将从类
│   ├── utils/             # 工具类
│   │   ├── BattleUtils.js       # 战斗工具
│   │   └── Storage.js           # 存储工具
│   └── data/              # 数据
│       └── PlayerData.js        # 玩家数据结构
└── assets/                # 资源目录
    ├── images/            # 图片资源
    │   ├── backgrounds/  # 背景图
    │   ├── heroes/       # 武将立绘
    │   └── ui/          # UI图
    └── audio/            # 音频资源
        ├── bgm/         # 背景音乐
        └── sfx/         # 音效
```

## 游戏玩法

- **放置挂机**: 武将从动自动战斗，离线也能获得收益
- **武将养成**: 升级、升星、装备穿戴
- **兵种克制**: 步、骑、弓三种兵种相互克制
- **章节剧情**: 跟随三国历史剧情推进关卡

## 运行项目

### 浏览器运行

直接打开 `index.html` 即可。

### 本地服务器

```bash
python -m http.server 8080
# 或
node -e "require('http').createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(require('fs').readFileSync('index.html'));}).listen(8080)"
```

然后访问 http://localhost:8080

## 适配微信/抖音小程序

微信/抖音小程序需要将代码放入各自的小程序项目中：

1. 微信：使用微信开发者工具，将代码导入为"小游戏"项目
2. 抖音：使用抖音开发者工具，导入为"小游戏"项目

广告接入需要在小程序后台配置广告位并替换 `AdManager.js` 中的 adUnitId。

## 许可证

MIT License
