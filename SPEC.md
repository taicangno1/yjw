# 今天吃什么 - 微信小程序 Specification

## 1. Project Overview

- **Project Name**: 今天吃什么 (What to Eat Today)
- **Type**: WeChat Mini Program
- **Core Functionality**: 通过翻牌游戏的方式，随机帮助用户选择附近范围内的外卖商家
- **Target Users**: 每天纠结吃什么、需要快速做决定的用户

## 2. Technical Stack

- **Framework**: 微信原生框架 (Native WeChat Mini Program)
- **Language**: TypeScript + WXML + WXSS
- **State Management**: 原生 setData
- **Styling**: 活泼明快风格，圆角大，动画丰富

## 3. Functionality Specification

### 3.1 页面结构

```
pages/
├── index/          # 首页 - 定位确认 + 范围选择
├── card/           # 翻牌页 - 暗牌展示 + 翻牌操作
└── result/         # 结果页 - 确认选择 + 跳转
```

### 3.2 页面流程

```
首页(index) 
    ↓ 确认定位 + 选择范围
翻牌页(card) 
    ↓ 翻牌 → 确认
结果页(result)
    ├── 重新选择 → 返回翻牌页(已翻牌变明牌)
    └── 就选这家 → 跳转美团外卖小程序
```

### 3.3 首页 (index)

**功能**:
- 获取用户当前位置（需用户授权）
- 显示当前位置信息
- 范围选择器：2km / 5km / 10km / 15km（单选）
- 开始选择按钮

**UI**:
- 顶部：应用Logo和标题
- 中间：地图预览或定位信息卡片
- 下方：范围选择器（4个胶囊按钮）
- 底部：开始选择按钮

### 3.4 翻牌页 (card)

**功能**:
- 以网格/瀑布流形式展示商家卡片（暗牌状态）
- 点击卡片触发翻转动画
- 翻转后显示商家信息（店名、图片、评分、月销）
- 弹出确认对话框

**UI**:
- 顶部：返回按钮 + 已翻牌计数
- 中间：可滚动卡片网格（暗牌）
- 暗牌样式：背面朝上，显示问号或logo
- 明牌样式：正面朝上，显示商家信息
- 底部：当前翻开的商家预览条

### 3.5 结果页 (result)

**功能**:
- 展示已翻出的商家详情
- 左按钮：重新选择（返回翻牌页，牌背朝上）
- 右按钮：就选这家（跳转美团外卖小程序）

**UI**:
- 顶部：大图展示商家封面
- 中间：商家信息（店名、评分、起送价、运费等）
- 底部：两个大按钮
  - 左侧：重新选择（灰色/次要样式）
  - 右侧：就选这家（主色调/主要样式）

### 3.6 数据模拟

**商家卡片数据字段**:
```typescript
interface Merchant {
  id: string;
  name: string;
  logo: string;       // 商家logo URL
  cover: string;      // 封面图 URL
  rating: number;     // 评分 4.0-5.0
  monthlySales: number; // 月销量
  shippingFee: number;  // 配送费
  minOrder: number;     // 起送价
  distance: number;     // 距离(km)
  tags: string[];       // 标签 ["快餐", "川菜"]
}
```

**模拟数据**: 20个商家数据，随机打乱后展示

## 4. Interactions & Animations

### 4.1 翻牌动画
- 点击卡片 → 3D翻转动画(0.5s) → 显示正面
- 使用CSS transform: rotateY()

### 4.2 页面转场
- 首页 → 翻牌页: slideUp动画
- 翻牌页 → 结果页: fadeIn动画
- 结果页 → 首页: 重置状态

### 4.3 按钮反馈
- 点击时缩放动画(scale: 0.95)
- 防止重复点击(300ms防抖)

## 5. WeChat Mini Program Specifics

### 5.1 权限申请
- 位置授权: wx.getLocation() 需要 scope.userLocation

### 5.2 页面跳转
- 跳转美团外卖: wx.navigateToMiniProgram()
  - appId: wxf17dccd5cc2a8xxx (美团外卖小程序)
  - path: 从商家ID构建具体商家页面路径

### 5.3 组件
- 地图组件: 用于展示用户位置和范围
- 胶囊按钮: 范围选择器

## 6. File Structure

```
what-to-eat/
├── app.js
├── app.json
├── app.wxss
├── pages/
│   ├── index/
│   │   ├── index.js
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   ├── card/
│   │   ├── card.js
│   │   ├── card.wxml
│   │   ├── card.wxss
│   │   └── card.json
│   └── result/
│       ├── result.js
│       ├── result.wxml
│       ├── result.wxss
│       └── result.json
├── components/
│   ├── merchant-card/
│   │   ├── merchant-card.js
│   │   ├── merchant-card.wxml
│   │   └── merchant-card.wxss
│   └── range-picker/
│       ├── range-picker.js
│       ├── range-picker.wxml
│       └── range-picker.wxss
├── utils/
│   ├── mockData.js
│   └── constants.js
└── assets/
    └── images/
```

## 7. Mock Data Strategy

由于使用模拟数据：
- 商家图片使用 placeholder.com 或 picsum.photos
- 商家信息随机生成
- 商家数量: 每次展示20个不同商家
- 距离根据选择的范围随机生成(0.1 ~ 范围值 km)

## 8. Success Criteria

1. ✅ 用户可以授权定位并选择范围
2. ✅ 翻牌界面正常展示，所有暗牌可点击翻转
3. ✅ 翻转动画流畅，显示商家信息
4. ✅ 重新选择后，已翻牌以明牌形式展示
5. ✅ 就选这家后能触发跳转美团小程序
6. ✅ UI风格活泼明快，符合年轻用户审美
