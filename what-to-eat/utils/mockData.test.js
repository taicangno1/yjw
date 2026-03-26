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

    test('不同范围生成不同距离分布', () => {
      const merchants2km = generateMerchants(2);
      const merchants10km = generateMerchants(10);
      
      merchants2km.forEach(m => expect(m.distance).toBeLessThanOrEqual(2));
      merchants10km.forEach(m => expect(m.distance).toBeLessThanOrEqual(10));
    });
  });

  describe('MERCHANT_NAMES', () => {
    test('包含足够数量的店名', () => {
      expect(MERCHANT_NAMES.length).toBeGreaterThanOrEqual(20);
    });

    test('店名不重复', () => {
      const uniqueNames = new Set(MERCHANT_NAMES);
      expect(uniqueNames.size).toBe(MERCHANT_NAMES.length);
    });
  });
});
