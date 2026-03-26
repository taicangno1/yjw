const { MEITUAN_APP_ID } = require('../../utils/constants');

Page({
  data: {
    merchant: null
  },

  onLoad() {
    const app = getApp();
    const merchant = app.globalData.currentMerchant;
    
    if (!merchant) {
      wx.navigateBack();
      return;
    }

    this.setData({ merchant });
  },

  retry() {
    const app = getApp();
    app.globalData.currentMerchant = null;
    wx.navigateBack();
  },

  goToMeituan() {
    wx.navigateToMiniProgram({
      appId: MEITUAN_APP_ID,
      path: `pages/shop/shop?shopId=${this.data.merchant.id}`,
      extraData: {
        merchantName: this.data.merchant.name
      },
      fail: () => {
        wx.showToast({
          title: '跳转失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  }
});