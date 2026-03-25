const util = require('../../utils/naming.js');

Page({
  data: {
    history: []
  },

  onShow() {
    const app = getApp();
    this.setData({ history: app.globalData.history });
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  loadHistory(e) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.history[idx];
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        surname: item.surname,
        birthDate: item.date,
        hour: item.hour,
        gender: item.gender,
        showResult: true,
        bazi: item.bazi,
        wuxingInfo: item.wuxingInfo,
        suggestions: item.suggestions
      });
    }
    wx.navigateBack();
  }
});
