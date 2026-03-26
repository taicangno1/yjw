# 单元测试指南

## 测试框架

使用 Jest + miniprogram-simulate 进行单元测试

## 安装依赖

```bash
npm install --save-dev jest @vue/vue2-jest @babel/core @babel/preset-env babel-jest miniprogram-simulate
```

## 配置 Babel

创建 `babel.config.js`:

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ]
}
```

## 创建测试文件

示例: `utils/mockData.test.js`

```javascript
const { generateMerchants, MERCHANT_NAMES } = require('./mockData');

describe('mockData', () => {
  describe('generateMerchants', () => {
    test('生成指定数量的商家', () => {
      const merchants = generateMerchants(5);
      expect(merchants).toHaveLength(20);
    });

    test('商家距离在指定范围内', () => {
      const merchants = generateMerchants(5);
      merchants.forEach(m => {
        expect(m.distance).toBeGreaterThan(0);
        expect(m.distance).toBeLessThanOrEqual(5);
      });
    });

    test('商家评分在4.0-5.0之间', () => {
      const merchants = generateMerchants(5);
      merchants.forEach(m => {
        expect(m.rating).toBeGreaterThanOrEqual(4.0);
        expect(m.rating).toBeLessThanOrEqual(5.0);
      });
    });

    test('商家数据包含必要字段', () => {
      const merchants = generateMerchants(5);
      const requiredFields = ['id', 'name', 'logo', 'cover', 'rating', 'monthlySales', 'shippingFee', 'minOrder', 'distance', 'tags'];
      merchants.forEach(m => {
        requiredFields.forEach(field => {
          expect(m).toHaveProperty(field);
        });
      });
    });
  });

  describe('MERCHANT_NAMES', () => {
    test('包含足够数量的店名', () => {
      expect(MERCHANT_NAMES.length).toBeGreaterThanOrEqual(20);
    });
  });
});
```

## 运行测试

```bash
npx jest
```

## 覆盖率报告

```bash
npx jest --coverage
```
