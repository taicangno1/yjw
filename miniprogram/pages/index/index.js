const util = require('../../utils/naming.js');

Page({
  data: {
    surname: '',
    birthDate: '',
    hour: '',
    hourIndex: -1,
    gender: '男',
    hours: ['子时 (23:00-00:59)', '丑时 (01:00-02:59)', '寅时 (03:00-04:59)', '卯时 (05:00-06:59)', '辰时 (07:00-08:59)', '巳时 (09:00-10:59)', '午时 (11:00-12:59)', '未时 (13:00-14:59)', '申时 (15:00-16:59)', '酉时 (17:00-18:59)', '戌时 (19:00-20:59)', '亥时 (21:00-22:59)'],
    hourValues: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    showResult: false,
    bazi: {},
    wuxingCounts: {},
    wuxingInfo: {},
    wuxingArray: [],
    animal: '',
    guaName: '',
    guaDesc: '',
    suggestions: [],
    filter: 'all'
  },

  onSurnameInput(e) {
    this.setData({ surname: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ birthDate: e.detail.value });
  },

  onHourChange(e) {
    const idx = e.detail.value;
    this.setData({
      hourIndex: idx,
      hour: this.data.hourValues[idx]
    });
  },

  onGenderChange(e) {
    this.setData({ gender: e.detail.value });
  },

  generateName() {
    const { surname, birthDate, hour, gender } = this.data;
    if (!surname || !birthDate || !hour) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const parts = birthDate.split('-');
    const birth = { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
    const bazi = util.calcBazi(birth.year, birth.month, birth.day, hour);
    const wuxingCounts = util.analyzeWuxing(bazi);
    const wuxingInfo = util.getXiYongShen(wuxingCounts);
    const animal = util.getZodiacAnimal(birthDate);

    const colors = { '木': '#4ade80', '火': '#ef4444', '土': '#facc15', '金': '#a78bfa', '水': '#38bdf8' };
    const total = Object.values(wuxingCounts).reduce((a, b) => a + b, 0);
    const wuxingArray = Object.keys(wuxingCounts).map(w => ({
      name: w,
      count: wuxingCounts[w],
      percent: Math.round((wuxingCounts[w] / total) * 100),
      color: colors[w]
    }));

    const suggestions = util.generateNameSuggestions(wuxingInfo, gender);
    const name1 = suggestions[0] ? suggestions[0].name[0] : '浩';
    const name2 = suggestions[0] ? suggestions[0].name[1] : '宇';
    const guaIndex = (util.getCharStrokes(surname) + util.getCharStrokes(name1) + util.getCharStrokes(name2)) % 64;
    const guaBinary = guaIndex.toString(2).padStart(6, '0');
    const GUA_NAMES = ['乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼', '地水师', '山水比', '风天小畜', '天泽履', '地天泰', '否', '天同人', '大有', '地谦', '地雷复', '天雷无妄', '山天大畜', '山泽损', '火雷噬嗑', '山蹇', '解', '山火贲', '山雷颐', '泽风大过', '坎为水', '离为火', '泽山咸', '雷风恒', '天山遁', '雷天大壮', '火地晋', '地火明夷', '风火家人', '火泽睽', '水山蹇', '雷水解', '山塞', '火水未济', '水火既济', '泽天夬', '泽地萃', '地风升', '泽水困', '水风井', '泽火革', '火风鼎', '震为雷', '艮为山', '山火贲', '山雷颐', '风山渐', '雷泽归妹', '雷火丰', '火山旅', '巽为风', '兑为泽', '泽水困', '水风井', '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐'];
    const GUA_DESCS = ['象曰：天行健，君子以自强不息。此卦刚健有力，象征天道的运行永不停歇。', '象曰：地势坤，君子以厚德载物。此卦柔顺宽广，象征大地的承载万物。', '象曰：屯者，物之始生也。此卦象征事物初生时的艰难。', '象曰：山下出泉，蒙。君子以果行育德。此卦山下有泉，象征蒙昧，君子应果断行动，培养德行。', '象曰：云上于天，需。君子以饮食宴乐。此卦云在天上，象征等待。', '象曰：天与水违行，讼。君子以作事谋始。此卦天与水相违，象征争讼。', '象曰：地中有水，师。君子以容民畜众。此卦地中有水，象征民众。', '象曰：地上有水，比。先王以建万国。此卦地上有水，象征亲密比附。', '象曰：风在天上，小畜。君子以懿文德。此卦风在天上，象征小的蓄积。', '象曰：上天下泽，履。君子以辨上下。此卦天在上泽在下，各安其位。', '象曰：天地交，泰。后以财成天地之道。此卦天地相交，象征通泰。', '象曰：天地不交，否。君子以俭德辟难。此卦天地不相交，象征闭塞。', '象曰：天与火，同人。君子以类族辨物。此卦天与火相同，象征同路人。', '象曰：火在天上，大有。君子以遏恶扬善。此卦火在天上，象征大有所获。', '象曰：地中有山，谦。君子以裒多益寡。此卦地下有山，象征君子谦逊的美德。', '象曰：雷在地中，复。先王以至日闭关。此卦雷在地下，象征回复。', '象曰：天下雷行，物与无妄。此卦象征雷行于天下，万物各守其正。', '象曰：天在山中，大畜。君子以多识前言往行。此卦山中有天，象征大的蓄积。', '象曰：山下有泽，损。君子以惩忿窒欲。此卦山下有泽，水深山损。', '象曰：雷电噬嗑，先王以明罚敕法。此卦雷电交合，象征咬合。', '象曰：山上有水，蹇。君子以反身修德。此卦山上有水，象征艰难。', '象曰：雷雨作，解。君子以赦过宥罪。此卦雷雨兴起，象征解除。', '象曰：山下有火，贲。君子以明庶政。此卦山下有火，象征文饰。', '象曰：山下有雷，颐。君子以慎言语。此卦山下有雷，象征颐养。', '象曰：泽灭木，大过。君子以独立不惧。此卦泽水淹没木，象征大的过度。', '象曰：水流而不盈，行险而不失其信。此卦水流行地而不盈满。', '象曰：明两作，离。大人以继明照于四方。此卦光明重叠，象征分离和依附。', '象曰：山上有泽，咸。君子以虚受人。此卦山上有泽，象征相互感应。', '象曰：雷风相与，恒。君子以立不易方。此卦雷风相伴，象征恒久。', '象曰：天下有山，遁。君子以远小人。此卦天下有山，象征退避。', '象曰：雷在天上，大壮。君子以非礼弗履。此卦雷声在天上，象征强盛。', '象曰：明出地上，晋。君子以自昭明德。此卦太阳从地面升起，象征前进。', '象曰：明入地中，明夷。君子以莅众。此卦日落地下，光明受损。', '象曰：风自火出，家人。君子以言有物而行有恒。此卦风从火出，象征一家人。', '象曰：上火下泽，睽。君子以同而异。此卦火在泽上，象征乖离。', '象曰：山上有水，蹇。君子以反身修德。此卦山上有水，象征艰难。', '象曰：雷雨作，解。君子以赦过宥罪。此卦雷雨兴起，象征解除。', '象曰：山上有水，蹇。君子以反身修德。此卦山上有水，象征艰难。', '象曰：火在水上，未济。君子以慎辨物居方。此卦火在水上，象征未完成。', '象曰：水在火上，既济。君子以思患而豫防之。此卦水在火上，象征完成。', '象曰：泽上于天，夬。君子以施禄及下。此卦泽水在天上，象征决断。', '象曰：地中萃聚万物，萃。君子以除戎器。此卦大地聚集，象征会聚。', '象曰：地中生木，升。君子以顺德积小。此卦地上生木，象征上升。', '象曰：泽无水，困。君子以致命遂志。此卦泽中无水，象征困顿。', '象曰：木上有水，井。君子以劳民劝相。此卦木上有水，象征井水养育万物。', '象曰：泽中有火，革。君子以治历明时。此卦泽中有火，象征变革。', '象曰：木上有火，鼎。君子以正位凝命。此卦木上有火，象征鼎立。', '象曰：洊雷震，君子以恐惧修身。此卦雷声连续不断。', '象曰：兼山，艮。君子以思不出其位。此卦两山重叠，象征静止。', '象曰：山下有火，贲。君子以明庶政。此卦山下有火，象征文饰。', '象曰：山下有雷，颐。君子以慎言语。此卦山下有雷，象征颐养。', '象曰：山上有木，渐。君子以居贤德善俗。此卦山上有木，逐渐成长。', '象曰：泽上有雷，归妹。君子以永终知敝。此卦泽上有雷，象征归妹。', '象曰：雷电皆至，丰。君子以折狱致刑。此卦雷电皆至，光明盛大。', '象曰：山上有火，旅。君子以明慎用刑。此卦山上有火，象征旅行。', '象曰：随风，巽。君子以申命行事。此卦随风而入，象征顺从。', '象曰：丽泽，兑。君子以朋友讲习。此卦两泽相连，喜悦。', '象曰：泽无水，困。君子以致命遂志。此卦泽中无水，象征困顿。', '象曰：木上有水，井。君子以劳民劝相。此卦木上有水，象征井水养育万物。', '象曰：泽中有火，革。君子以治历明时。此卦泽中有火，象征变革。', '象曰：木上有火，鼎。君子以正位凝命。此卦木上有火，象征鼎立。', '象曰：洊雷震，君子以恐惧修身。此卦雷声连续不断。', '象曰：兼山，艮。君子以思不出其位。此卦两山重叠，象征静止。', '象曰：山上有木，渐。君子以居贤德善俗。此卦山上有木，逐渐成长。'];

    this.setData({
      showResult: true,
      bazi,
      wuxingCounts,
      wuxingInfo,
      wuxingArray,
      animal,
      guaName: GUA_NAMES[guaIndex] || '乾为天',
      guaDesc: GUA_DESCS[guaIndex] || GUA_DESCS[0],
      suggestions
    });

    const app = getApp();
    const historyItem = {
      surname,
      date: birthDate,
      hour,
      gender,
      bazi,
      wuxingInfo,
      suggestions: suggestions.slice(0, 3),
      timestamp: Date.now()
    };
    app.globalData.history.unshift(historyItem);
    if (app.globalData.history.length > 20) app.globalData.history = app.globalData.history.slice(0, 20);
    wx.setStorageSync('nameHistory', app.globalData.history);
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ filter });
  },

  addToCompare(e) {
    const { name, score } = e.currentTarget.dataset;
    const app = getApp();
    if (app.globalData.compareList.length >= 5) {
      wx.showToast({ title: '最多对比5个名字', icon: 'none' });
      return;
    }
    app.globalData.compareList.push({
      surname: this.data.surname,
      name,
      score,
      timestamp: Date.now()
    });
    wx.setStorageSync('compareList', app.globalData.compareList);
    wx.showToast({ title: '已添加对比', icon: 'success' });
  },

  shareName(e) {
    const { name, score } = e.currentTarget.dataset;
    const text = `名字大宗师\n\n姓氏：${this.data.surname}\n推荐名字：${name}\n综合评分：${score}分\n\n三才五格卦象分析，周易起名。`;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  }
});
