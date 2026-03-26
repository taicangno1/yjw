Component({
  properties: {
    ranges: {
      type: Array,
      value: []
    },
    selected: {
      type: Number,
      value: 0
    }
  },

  methods: {
    selectRange(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('select', { index });
    }
  }
});