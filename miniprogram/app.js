App({
  globalData: {
    history: [],
    compareList: []
  },
  onLaunch() {
    const history = wx.getStorageSync('nameHistory') || [];
    const compareList = wx.getStorageSync('compareList') || [];
    this.globalData.history = history;
    this.globalData.compareList = compareList;
  }
})
