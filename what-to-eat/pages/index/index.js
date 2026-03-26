const { RANGE_OPTIONS } = require('../../utils/constants');

Page({
  data: {
    locationText: '点击获取定位',
    ranges: RANGE_OPTIONS,
    selectedRange: 1,
    canStart: false
  },

  onLoad() {
    this.getLocation();
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          locationText: '未知位置（模拟数据）',
          canStart: true
        });
        getApp().globalData.location = res;
      },
      fail: () => {
        wx.showModal({
          title: '定位失败',
          content: '请允许定位权限，以便查找附近商家',
          confirmText: '重新获取',
          success: (res) => {
            if (res.confirm) {
              this.getLocation();
            } else {
              this.setData({
                locationText: '未获取定位（可继续使用）',
                canStart: true
              });
            }
          }
        });
      }
    });
  },

  onRangeSelect(e) {
    this.setData({
      selectedRange: e.detail.index
    });
    getApp().globalData.range = RANGE_OPTIONS[e.detail.index].value;
  },

  startChoosing() {
    const { generateMerchants } = require('../../utils/mockData');
    const range = getApp().globalData.range;
    const merchants = generateMerchants(range);
    
    getApp().globalData.merchants = merchants;
    getApp().globalData.flippedCards = [];
    getApp().globalData.currentMerchant = null;

    wx.navigateTo({
      url: '/pages/card/card'
    });
  }
});