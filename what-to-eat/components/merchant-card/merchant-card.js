Component({
  properties: {
    merchant: {
      type: Object,
      value: {}
    },
    flipped: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('flip');
    }
  }
});