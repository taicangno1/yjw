const { RANGE_OPTIONS, MEITUAN_APP_ID } = require('./constants');

describe('constants', () => {
  describe('RANGE_OPTIONS', () => {
    test('包含4个范围选项', () => {
      expect(RANGE_OPTIONS).toHaveLength(4);
    });

    test('范围值正确', () => {
      expect(RANGE_OPTIONS[0]).toEqual({ label: '2km', value: 2 });
      expect(RANGE_OPTIONS[1]).toEqual({ label: '5km', value: 5 });
      expect(RANGE_OPTIONS[2]).toEqual({ label: '10km', value: 10 });
      expect(RANGE_OPTIONS[3]).toEqual({ label: '15km', value: 15 });
    });

    test('标签格式正确', () => {
      RANGE_OPTIONS.forEach(option => {
        expect(option.label).toMatch(/^\d+km$/);
        expect(typeof option.value).toBe('number');
      });
    });
  });

  describe('MEITUAN_APP_ID', () => {
    test('美团小程序AppID存在', () => {
      expect(MEITUAN_APP_ID).toBeTruthy();
      expect(typeof MEITUAN_APP_ID).toBe('string');
    });
  });
});
