const { RANGE_OPTIONS } = require('../../utils/constants');

Page({
  data: {
    locationText: '请选择您的位置',
    ranges: RANGE_OPTIONS,
    selectedRange: 1,
    canStart: true,
    showAddressModal: false,
    inputAddress: '',
    selectedCity: ''
  },

  onLoad() {
    const app = getApp();
    this.setData({
      canStart: true,
      selectedCity: app.globalData.selectedCity || ''
    });
  },

  openAddressModal() {
    this.setData({ showAddressModal: true });
  },

  closeAddressModal() {
    this.setData({ showAddressModal: false });
  },

  onAddressInput(e) {
    this.setData({ inputAddress: e.detail.value });
  },

  onCityChange(e) {
    this.setData({ selectedCity: e.detail.value });
  },

  confirmAddress() {
    const { inputAddress, selectedCity } = this.data;
    if (!selectedCity && !inputAddress) {
      wx.showToast({ title: '请选择城市或输入地址', icon: 'none' });
      return;
    }
    
    const locationText = inputAddress || selectedCity;
    this.setData({
      locationText,
      showAddressModal: false,
      canStart: true
    });
    
    const app = getApp();
    app.globalData.selectedCity = selectedCity;
    app.globalData.inputAddress = inputAddress;
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