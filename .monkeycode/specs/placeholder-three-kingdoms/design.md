# 技术设计文档

## 引言

本文档为《放置三国》微信/抖音小程序游戏的技术设计方案，基于需求规格说明书编写。

## 1. 系统概述

### 1.1 项目背景

- **项目名称**：《放置三国》
- **游戏类型**：Q版放置挂机游戏
- **目标平台**：微信小程序 + 抖音小程序
- **跨端框架**：Cocos Creator 3.x
- **主要语言**：TypeScript

### 1.2 核心功能

- 武将自动战斗（回合制）
- 离线挂机收益
- 武将养成（升级、升星、装备）
- 章节关卡推进
- 兵种克制系统
- 广告变现（激励视频、插屏广告）
- 社交系统（好友、排行榜、联盟）

### 1.3 技术选型

| 类别 | 选择 | 说明 |
|------|------|------|
| 游戏引擎 | Cocos Creator 3.x | 跨平台支持好，性能优秀 |
| 开发语言 | TypeScript | 类型安全，代码质量有保障 |
| UI框架 | Cocos Creator 内置UI | 原生支持，数据驱动 |
| 存储 | LocalStorage | 小程序环境下的本地存储 |
| 网络 | HTTP RESTful | 排行榜、联盟等需要服务器功能 |
| 动画 | Cocos Creator 动画系统 | Spine骨骼动画 + 关键帧动画 |

## 2. 项目结构

```
assets/
├── scenes/                    # 游戏场景
│   ├── MainCity.fire          # 主城场景
│   ├── Battle.fire            # 战斗场景
│   ├── LevelSelect.fire       # 关卡选择场景
│   ├── HeroList.fire          # 武将列表场景
│   ├── HeroDetail.fire        # 武将详情场景
│   ├── FriendList.fire        # 好友列表场景
│   ├── RankList.fire          # 排行榜场景
│   ├── League.fire            # 联盟场景
│   └── Shop.fire              # 商店场景
├── prefabs/                   # 预制体
│   ├── ui/                    # UI组件
│   │   ├── HeroHead.prefab    # 武将头像
│   │   ├── EnemyHead.prefab   # 敌人头像
│   │   ├── HPBar.prefab       # 血条
│   │   ├── DamageNum.prefab   # 伤害数字
│   │   └── ItemIcon.prefab    # 物品图标
│   ├── battle/                # 战斗相关
│   │   ├── Hero.prefab        # 武将
│   │   └── Enemy.prefab       # 敌人
│   └── common/                # 通用
│       ├── Button.prefab      # 按钮
│       └── Toast.prefab       # 提示
├── scripts/                   # 脚本代码
│   ├── core/                  # 核心系统
│   │   ├── GameManager.ts     # 游戏主管理器
│   │   ├── DataManager.ts     # 数据管理器
│   │   ├── BattleManager.ts   # 战斗管理器
│   │   ├── OfflineManager.ts  # 离线收益管理器
│   │   ├── AudioManager.ts    # 音频管理器
│   │   └── AdManager.ts       # 广告管理器
│   ├── data/                  # 数据配置
│   │   ├── HeroData.ts        # 武将配置数据
│   │   ├── LevelData.ts       # 关卡配置数据
│   │   └── ItemData.ts        # 物品配置数据
│   ├── entity/                # 实体类
│   │   ├── Hero.ts            # 武将实体
│   │   ├── Enemy.ts           # 敌人实体
│   │   └── Bullet.ts          # 子弹/技能
│   ├── ui/                    # UI逻辑
│   │   ├── MainCityUI.ts      # 主城UI
│   │   ├── BattleUI.ts        # 战斗UI
│   │   ├── LevelSelectUI.ts   # 关卡选择UI
│   │   ├── HeroListUI.ts      # 武将列表UI
│   │   └── common/            # 通用UI
│   │       ├── ResourceBar.ts # 资源栏
│   │       └── Toast.ts       # 提示框
│   └── utils/                 # 工具类
│       ├── Storage.ts         # 本地存储
│       ├── MathUtils.ts      # 数学工具
│       └── StringUtils.ts     # 字符串工具
├── resources/                 # 资源配置
│   ├── hero/                  # 武将资源
│   ├── enemy/                 # 敌人资源
│   ├── ui/                   # UI图集
│   ├── effects/              # 特效资源
│   ├── audio/                # 音频资源
│   │   ├── sfx/              # 音效
│   │   └── bgm/              # 背景音乐
│   └── data/                 # 数据配置表
│       ├── hero.json         # 武将属性配置
│       ├── level.json        # 关卡配置
│       ├── skill.json        # 技能配置
│       ├── equipment.json    # 装备配置
│       └── chapter.json       # 章节配置
└── textures/                  # 图片资源
    ├── heroes/               # 武将立绘
    ├── backgrounds/          # 背景图
    └── icons/               # 图标
```

## 3. 核心模块设计

### 3.1 游戏主管理器 (GameManager)

**职责**：
- 管理游戏生命周期（启动、暂停、恢复、退出）
- 协调各子系统初始化
- 处理场景切换

**接口设计**：

```typescript
class GameManager {
    static getInstance(): GameManager;
    
    // 生命周期
    onGameStart(): void;
    onGamePause(): void;
    onGameResume(): void;
    onGameExit(): void;
    
    // 场景管理
    loadScene(sceneName: string): Promise<void>;
    getCurrentScene(): string;
    
    // 子系统访问
    getDataManager(): DataManager;
    getBattleManager(): BattleManager;
    getOfflineManager(): OfflineManager;
    getAudioManager(): AudioManager;
    getAdManager(): AdManager;
}
```

### 3.2 数据管理器 (DataManager)

**职责**：
- 玩家数据存储与读取
- 数据持久化（LocalStorage）
- 离线时间计算

**数据结构**：

```typescript
interface PlayerData {
    uid: string;              // 玩家唯一ID
    nickname: string;          // 昵称
    level: number;             // 玩家等级
    gold: number;             // 金币
    yuanbao: number;          // 元宝
    energy: number;           // 体力
    maxEnergy: number;        // 最大体力
    lastEnergyTime: number;   // 上次体力恢复时间戳
    lastOfflineTime: number;  // 上次离线时间戳
    
    // 武将数据
    heroes: HeroData[];
    formation: string[];      // 上阵武将ID列表（最多5个）
    
    // 装备数据
    equipments: EquipmentData[];
    
    // 背包数据
    heroFragments: {[heroId: string]: number};  // 武将碎片
    items: {[itemId: string]: number};          // 道具
    
    // 进度数据
    currentChapter: number;   // 当前章节
    currentLevel: number;    // 当前关卡
    unlockedLevels: string[];// 已解锁关卡列表
    sweepTickets: number;    // 扫荡券
    
    // 好友数据
    friends: string[];       // 好友UID列表
    friendRequests: string[];// 待处理好友请求
    
    // 联盟数据
    leagueId: string;        // 联盟ID
    leagueContribution: number; // 联盟贡献
}
```

**存储接口**：

```typescript
class DataManager {
    save(): void;
    load(): boolean;
    reset(): void;
    
    // 原子操作
    addGold(amount: number): void;
    spendGold(amount: number): boolean;
    addYuanbao(amount: number): void;
    addEnergy(amount: number): void;
    consumeEnergy(amount: number): boolean;
}
```

### 3.3 战斗管理器 (BattleManager)

**职责**：
- 管理回合制战斗流程
- 计算伤害（普攻、技能、暴击、连击、闪避）
- 触发兵种克制
- 判定战斗胜负

**战斗流程**：

```
1. 战斗初始化
   ├── 读取关卡配置（敌方武将、属性倍率）
   ├── 初始化我方武将属性（含装备加成）
   └── 排列行动顺序（按速度降序）

2. 回合循环
   ├── 当前武将行动
   │   ├── 判断行动类型（普攻/技能/防御）
   │   ├── 选择目标
   │   ├── 计算伤害
   │   ├── 应用伤害（扣血、触发死亡）
   │   └── 播放动画
   ├── 回合结束判定
   │   ├── 检查是否有人阵亡
   │   ├── 检查是否有人释放技能
   │   └── 更新行动顺序
   └── 回合结算
       ├── 判定胜负
       └── 触发回合结束事件

3. 战斗结束
   ├── 胜负判定
   ├── 计算奖励
   └── 发放奖励
```

**伤害计算公式**：

```typescript
function calculateDamage(attacker: Hero, defender: Hero, skillCoefficient: number = 1.0): DamageResult {
    let damage = attacker.attack * skillCoefficient - defender.defense;
    
    // 兵种克制
    const克制Bonus = getTroopRestraintBonus(attacker.troop, defender.troop);
    damage *= 克制Bonus;
    
    // 暴击判定（默认10%）
    const isCrit = Math.random() < 0.1;
    if (isCrit) {
        damage *= 2;
    }
    
    // 闪避判定（默认5%）
    const isDodge = Math.random() < 0.05;
    if (isDodge) {
        damage = 0;
    }
    
    // 连击判定（默认15%）
    const isCombo = Math.random() < 0.15;
    
    // 保底伤害
    damage = Math.max(damage, 1);
    
    return { damage, isCrit, isDodge, isCombo };
}
```

**兵种克制表**：

| 攻击方 \ 防御方 | 步 | 骑 | 弓 |
|---------------|-----|-----|-----|
| 步           | 1.0 | 1.1 | 0.9 |
| 骑           | 0.9 | 1.0 | 1.1 |
| 弓           | 1.1 | 0.9 | 1.0 |

### 3.4 离线收益管理器 (OfflineManager)

**职责**：
- 记录离线时间
- 计算离线收益
- 生成离线战斗报告

**接口设计**：

```typescript
class OfflineManager {
    // 计算离线时长（最大24小时）
    getOfflineDuration(): number;
    
    // 计算离线收益
    calculateOfflineEarnings(duration: number): OfflineEarnings;
    
    // 离线战斗模拟
    simulateOfflineBattles(duration: number, teamPower: number): BattleReport[];
    
    // 发放离线奖励
    claimOfflineEarnings(): Promise<OfflineEarnings>;
    
    // 激励视频双倍
    claimWithAd(): Promise<OfflineEarnings>;
}

interface OfflineEarnings {
    gold: number;
    exp: number;
    heroFragments: {[heroId: string]: number};
    equipmentFragments: number;
    duration: number;        // 离线时长（秒）
    battlesCount: number;    // 战斗场次
    victoriesCount: number;  // 胜利场次
}
```

### 3.5 广告管理器 (AdManager)

**职责**：
- 封装各平台广告API
- 管理广告播放状态
- 处理广告回调

**接口设计**：

```typescript
class AdManager {
    // 初始化（适配不同平台）
    init(platform: 'wechat' | 'douyin'): void;
    
    // 激励视频广告
    showRewardedVideo(scene: string): Promise<AdResult>;
    
    // 插屏广告
    showInterstitial(): Promise<void>;
    
    // 检查广告是否就绪
    isRewardedVideoReady(): boolean;
    isInterstitialReady(): boolean;
}

type AdScene = 'offline_double' | 'fragment_extra' | 'energy_full' | 'battle_speedup';
```

## 4. 数据配置

### 4.1 武将配置 (hero.json)

```json
{
    "heroes": [
        {
            "id": "hero_001",
            "name": "关羽",
            "quality": "orange",
            "troop": "cavalry",
            "baseAttack": 100,
            "baseDefense": 80,
            "baseHp": 1000,
            "baseSpeed": 50,
            "critRate": 0.1,
            "dodgeRate": 0.05,
            "comboRate": 0.15,
            "skills": ["skill_001", "skill_002"],
            "fragmentId": "fragment_001",
            "UnlockCost": {"gold": 1000}
        }
    ]
}
```

### 4.2 技能配置 (skill.json)

```json
{
    "skills": [
        {
            "id": "skill_001",
            "name": "普通攻击",
            "type": "normal",
            "coefficient": 1.0,
            "targetType": "single",
            "description": "对单个敌人造成100%攻击力伤害"
        },
        {
            "id": "skill_002",
            "name": "青龙偃月",
            "type": "active",
            "coefficient": 1.8,
            "targetType": "single",
            "cooldown": 3,
            "description": "对单个敌人造成180%攻击力伤害"
        }
    ]
}
```

### 4.3 关卡配置 (level.json)

```json
{
    "chapters": [
        {
            "id": "chapter_01",
            "name": "黄巾之乱",
            "levels": [
                {
                    "id": "level_01_01",
                    "name": "黄巾义军",
                    "difficulty": {
                        "easy": {"enemyLevel": 1, "enemyCount": 3, "rewardMultiplier": 1.0},
                        "normal": {"enemyLevel": 2, "enemyCount": 4, "rewardMultiplier": 1.5},
                        "hard": {"enemyLevel": 3, "enemyCount": 5, "rewardMultiplier": 2.0}
                    },
                    "energyCost": {"easy": 10, "normal": 20, "hard": 30},
                    "drop": {
                        "heroFragment": {"id": "fragment_001", "rate": 0.3},
                        "gold": 100
                    }
                }
            ]
        }
    ]
}
```

### 4.4 装备配置 (equipment.json)

```json
{
    "equipments": [
        {
            "id": "equip_001",
            "name": "偃月刀",
            "type": "weapon",
            "quality": "orange",
            "attackBonus": 50,
            "hpBonus": 100,
            "skills": []
        }
    ]
}
```

## 5. 场景设计

### 5.1 主城场景 (MainCity)

**布局**：
- 顶部：资源栏（头像、昵称、战力、元宝、体力、金币）
- 中部：主城背景 + 功能入口按钮
  - 战役按钮（进入关卡选择）
  - 武将按钮（进入武将列表）
  - 好友按钮（进入好友系统）
  - 联盟按钮（进入联盟界面）
  - 商店按钮（进入商店）
- 底部：设置按钮

**交互流程**：
1. 点击战役 → 切换到关卡选择场景
2. 点击武将 → 切换到武将列表场景
3. 点击好友 → 切换到好友列表场景
4. 点击联盟 → 切换到联盟场景
5. 点击商店 → 弹出商店界面
6. 点击设置 → 弹出设置界面

### 5.2 战斗场景 (Battle)

**布局**：
- 背景层：战斗背景图（横版）
- 战斗层：我方武将（右侧）+ 敌方武将（左侧）
- UI层：
  - 顶部：暂停按钮、战斗速度按钮
  - 底部：武将头像列表（血条、怒气条）
  - 中央：伤害数字飘字
  - 回合结束：回合结算弹窗

**战斗动画**：
- 武将待机动画（呼吸效果）
- 武将移动动画（冲刺到目标位置）
- 普攻动画（挥砍动作 + 击中特效）
- 技能动画（特效 + 动作）
- 受击动画（闪烁 + 后退）
- 死亡动画（倒地 + 消失）
- 伤害数字（白色普通伤害，黄色暴击，红色闪避）

### 5.3 关卡选择场景 (LevelSelect)

**布局**：
- 顶部：返回按钮、章节名称、玩家进度
- 中部：章节地图（节点连线式）
  - 每个关卡显示为节点
  - 已通关显示对勾
  - 当前可挑战高亮
  - 未解锁显示锁
- 底部：难度选择标签页（简单/普通/困难）

**交互**：
1. 点击关卡节点 → 弹出关卡详情
2. 点击挑战 → 加载战斗场景
3. 点击扫荡（已通关后） → 消耗扫荡券直接获得奖励

## 6. 美术资源规格

### 6.1 武将立绘规格

| 规格 | 尺寸 | 格式 | 说明 |
|------|------|------|------|
| 头像 | 128×128 | PNG透明 | 武将头像，用于战斗头像、列表 |
| 半身像 | 256×256 | PNG透明 | 武将详情页展示 |
| 全身立绘 | 512×512 | PNG透明 | Q版大头娃娃风格 |
| 战斗模型 | 256×256 | Spine JSON | 包含待机、普攻、技能、受伤、死亡动画 |

### 6.2 UI资源规格

| 类型 | 尺寸 | 格式 | 说明 |
|------|------|------|------|
| 按钮背景 | 200×80 | PNG9 | 可拉伸按钮 |
| 图标 | 64×64 | PNG透明 | 各类功能图标 |
| 资源图标 | 48×48 | PNG透明 | 金币、元宝、体力等 |
| 头像框 | 96×96 | PNG透明 | 玩家头像框 |
| 品质边框 | 128×128 | PNG透明 | 绿、蓝、紫、橙、红色边框 |

### 6.3 特效资源规格

| 类型 | 尺寸 | 格式 | 说明 |
|------|------|------|------|
| 技能特效 | 256×256 | PNG序列帧 | 技能释放特效 |
| 打击特效 | 128×128 | PNG序列帧 | 普攻命中特效 |
| Buff图标 | 64×64 | PNG透明 | 增益/减益状态图标 |

### 6.4 音频资源规格

| 类型 | 格式 | 时长 | 说明 |
|------|------|------|------|
| 背景音乐 | OGG | 循环 | 主城、战斗场景BGM |
| 普攻音效 | OGG | <1秒 | 挥砍、击中 |
| 技能音效 | OGG | 1-3秒 | 各武将独特技能音效 |
| UI音效 | OGG | <1秒 | 按钮点击、获得物品 |
| 胜利音效 | OGG | 3-5秒 | 战斗胜利 |
| 失败音效 | OGG | 2-3秒 | 战斗失败 |

## 7. 性能优化

### 7.1 资源加载策略

- 使用 `resources.load()` 动态加载资源
- 战斗场景资源在进入前预加载
- 非核心资源采用懒加载
- 图集打包减少DrawCall

### 7.2 内存管理

- 场景切换时释放上一个场景资源
- 及时销毁不需要的Node和Component
- 合理使用对象池复用粒子、特效节点

### 7.3 战斗性能

- 限制同屏敌人数量（最多5个）
- 伤害数字使用对象池
- 骨骼动画使用ArmatureDataCache缓存

## 8. 数据持久化

### 8.1 LocalStorage 结构

```json
{
    "playerData": {...},
    "settings": {
        "musicVolume": 0.8,
        "sfxVolume": 0.8,
        "pushEnabled": true
    },
    "lastSaveTime": 1710000000000
}
```

### 8.2 数据校验

- 使用 `JSON.parse` 时做好异常捕获
- 数据损坏时尝试回滚到上一个存档
- 必要时重置数据并补偿新手资源

## 9. 平台适配

### 9.1 微信小程序

- 使用 `wx.createRewardedVideoAd()` 创建激励视频
- 使用 `wx.createInterstitialAd()` 创建插屏广告
- 分享使用 `wx.showShareMenu()` + `onShareAppMessage()`
- 用户信息使用 `wx.getUserInfo()`

### 9.2 抖音小程序

- 使用 `tt.createRewardedVideoAd()` 创建激励视频
- 使用 `tt.createInterstitialAd()` 创建插屏广告
- 分享使用 `tt.showShareMenu()` + `onShareAppMessage()`
- 用户信息使用 `tt.getUserInfo()`

### 9.3 差异处理

```typescript
class PlatformAdapter {
    static getPlatform(): 'wechat' | 'douyin' {
        if (typeof wx !== 'undefined') return 'wechat';
        if (typeof tt !== 'undefined') return 'douyin';
        return 'unknown';
    }
    
    static createRewardedVideoAd(): any {
        const platform = this.getPlatform();
        if (platform === 'wechat') {
            return wx.createRewardedVideoAd({ adUnitId: 'xxx' });
        } else if (platform === 'douyin') {
            return tt.createRewardedVideoAd({ adUnitId: 'xxx' });
        }
    }
    
    // 其他平台API同理...
}
```

## 10. 附录

### 10.1 武将初始属性表

| 品质 | 攻击成长 | 防御成长 | 生命成长 | 速度基准 |
|------|----------|----------|----------|----------|
| 绿   | 5        | 4        | 50       | 40-60    |
| 蓝   | 7        | 5        | 70       | 40-60    |
| 紫   | 9        | 7        | 90       | 40-60    |
| 橙   | 12       | 9        | 120      | 40-60    |
| 红   | 15       | 12       | 150      | 40-60    |

### 10.2 升级经验表

| 等级 | 升级经验 |
|------|----------|
| 1→2  | 100      |
| 2→3  | 200      |
| 3→4  | 400      |
| ...  | 指数增长 |

### 10.3 体力恢复规则

- 恢复间隔：5分钟/点
- 上限：100点（可购买扩充）
- 激励视频：恢复至满
