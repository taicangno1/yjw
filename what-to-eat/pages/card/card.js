Page({
  data: {
    merchants: [],
    flippedCount: 0,
    totalCount: 0,
    currentMerchant: null,
    isAnimating: false
  },

  onLoad() {
    this.initCards();
  },

  onShow() {
    const app = getApp();
    if (app.globalData.currentMerchant === null && this.data.flippedCount > 0) {
      this.initCards();
    }
  },

  initCards() {
    const app = getApp();
    const merchants = app.globalData.merchants.map(m => ({
      ...m,
      flipped: false
    }));
    
    app.globalData.flippedCards = [];
    
    this.setData({
      merchants,
      totalCount: merchants.length,
      flippedCount: 0,
      currentMerchant: null
    });
  },

  flipCard(e) {
    const index = e.currentTarget.dataset.index;
    const merchant = this.data.merchants[index];

    if (this.data.isAnimating) return;
    if (merchant.flipped) return;

    this.setData({ isAnimating: true });

    const newMerchants = [...this.data.merchants];
    newMerchants[index].flipped = true;
    
    const flippedCount = this.data.flippedCount + 1;
    const currentMerchant = newMerchants[index];

    this.setData({
      merchants: newMerchants,
      flippedCount,
      currentMerchant,
      isAnimating: false
    });

    getApp().globalData.flippedCards.push(index);
    getApp().globalData.currentMerchant = currentMerchant;
  },

  showConfirm() {
    wx.navigateTo({
      url: '/pages/result/result'
    });
  },

  goBack() {
    wx.navigateBack();
  }
});