const util = require('../../utils/naming.js');

Page({
  data: {
    poems: []
  },

  onLoad() {
    const poems = util.POEMS.map(p => {
      const chars = p.content.replace(/[，。、；：！？""''（）《》【】]/g, '').split('');
      const name1 = chars[Math.floor(Math.random() * chars.length)];
      const name2 = chars[Math.floor(Math.random() * chars.length)];
      return {
        ...p,
        suggestedName: name1 + name2
      };
    });
    this.setData({ poems });
  }
});
