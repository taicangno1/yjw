const util = require('../../utils/naming.js');

Page({
  data: {
    compareList: [],
    bestIndex: -1
  },

  onShow() {
    const app = getApp();
    const list = app.globalData.compareList;
    let bestIndex = -1;
    if (list.length > 0) {
      bestIndex = list.reduce((best, item, idx) => item.score > list[best].score ? idx : best, 0);
    }
    this.setData({ compareList: list, bestIndex });
  },

  removeCompare(e) {
    const idx = e.currentTarget.dataset.index;
    const app = getApp();
    app.globalData.compareList.splice(idx, 1);
    wx.setStorageSync('compareList', app.globalData.compareList);
    this.onShow();
  },

  clearCompare() {
    const app = getApp();
    app.globalData.compareList = [];
    wx.setStorageSync('compareList', app.globalData.compareList);
    this.setData({ compareList: [], bestIndex: -1 });
  }
});
