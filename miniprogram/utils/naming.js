const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const WUXING_RELATION = {
  '木': { '生': '火', '克': '土' },
  '火': { '生': '土', '克': '金' },
  '土': { '生': '金', '克': '水' },
  '金': { '生': '水', '克': '木' },
  '水': { '生': '木', '克': '火' }
};

const STROKES = {
  '王': 4, '李': 7, '张': 11, '刘': 6, '陈': 16, '杨': 13, '赵': 9, '黄': 12,
  '周': 8, '吴': 7, '徐': 11, '孙': 6, '胡': 11, '朱': 6, '高': 10, '林': 8,
  '何': 7, '郭': 10, '马': 10, '罗': 20, '梁': 11, '宋': 7, '郑': 8, '谢': 12,
  '韩': 12, '唐': 10, '冯': 12, '于': 3, '董': 12, '萧': 11, '程': 12, '曹': 11,
  '袁': 10, '邓': 12, '许': 11, '傅': 12, '沈': 7, '曾': 12, '彭': 12, '吕': 7,
  '苏': 7, '卢': 16, '蒋': 15, '蔡': 15, '贾': 13, '丁': 2, '魏': 16, '薛': 15,
  '叶': 12, '阎': 11, '余': 7, '潘': 12, '杜': 7, '戴': 17, '夏': 10, '钟': 17,
  '汪': 7, '田': 5, '任': 6, '姜': 9, '范': 8, '方': 4, '石': 5, '姚': 9,
  '谭': 19, '廖': 14, '邹': 12, '熊': 14, '金': 8, '陆': 16, '郝': 10, '孔': 4,
  '白': 5, '崔': 11, '康': 11, '毛': 4, '邱': 12, '秦': 10, '江': 7, '史': 5,
  '顾': 16, '侯': 9, '邵': 8, '孟': 8, '龙': 16, '万': 3, '段': 9, '漕': 16,
  '钱': 13, '汤': 12, '尹': 4, '黎': 16, '易': 8, '常': 11, '武': 8, '乔': 12,
  '贺': 12, '赖': 16, '龚': 11, '文': 4, '博': 12, '雅': 12, '慧': 15, '欣': 8,
  '怡': 9, '婷': 12, '琪': 13, '莹': 13, '琳': 13, '瑶': 14, '倩': 10,
  '敏': 11, '静': 16, '丽': 19, '芳': 10, '兰': 5, '梅': 11, '菊': 14, '竹': 6,
  '松': 8, '柏': 9, '桐': 10, '枫': 11, '桦': 12, '榕': 14, '槐': 14, '柳': 9,
  '桂': 10, '桃': 10, '樱': 16, '森': 12, '林': 8, '荣': 12, '华': 12, '建': 9,
  '材': 7, '春': 9, '秋': 9, '月': 4, '阳': 17, '风': 4, '云': 4, '天': 4,
  '章': 11, '炎': 8, '焱': 12, '灿': 7, '烂': 12, '光': 6, '辉': 15, '耀': 20,
  '明': 8, '亮': 9, '晶': 12, '娜': 10, '昕': 8, '昭': 9, '熙': 13, '丹': 4,
  '红': 6, '赤': 7, '朱': 6, '映': 9, '炜': 8, '炳': 9, '熠': 15, '荧': 11,
  '煜': 13, '灵': 7, '暖': 13, '晴': 12, '坤': 8, '厚': 9, '坦': 8, '城': 10,
  '坚': 11, '培': 11, '增': 15, '墨': 15, '圣': 13, '均': 7, '垣': 9, '基': 11,
  '域': 11, '堂': 11, '堆': 11, '塞': 13, '壁': 16, '士': 3, '诚': 13, '锋': 13,
  '锐': 15, '铭': 14, '锦': 16, '钦': 12, '钰': 10, '铁': 13, '银': 14, '铜': 14,
  '锡': 14, '镜': 19, '钟': 17, '钧': 9, '泽': 8, '润': 15, '洲': 10,
  '海': 10, '波': 8, '涛': 10, '洁': 9, '洋': 10, '潮': 16, '汐': 7, '渊': 11,
  '泉': 9, '溪': 14, '涵': 11, '清': 11, '淳': 11, '冷': 7, '冽': 8, '永': 5,
  '泳': 8, '瀚': 20, '学': 16, '雨': 8, '诗': 8, '珊': 10, '浩': 10, '宇': 6,
  '子': 3, '涵': 11, '轩': 10, '霖': 16, '晨': 11, '睿': 14, '哲': 10, '祥': 11,
  '瑞': 14, '康': 11, '宁': 14, '安': 6, '文': 4, '武': 8, '英': 11, '俊': 9,
  '豪': 14, '杰': 12, '峰': 10, '岚': 12, '峻': 10, '贤': 15, '德': 15, '义': 13,
  '礼': 18, '智': 12, '信': 9, '忠': 8, '孝': 7, '仁': 4, '和': 8, '平': 5,
  '顺': 12, '通': 10, '达': 12, '思': 9, '悦': 11, '乐': 6, '欢': 6, '慕': 14,
  '忆': 17, '念': 8, '惜': 11, '恋': 10, '懿': 22, '彤': 7, '玲': 10, '环': 8,
  '玮': 8, '佩': 8, '佳': 8, '俊': 9, '伟': 6, '嘉': 14, '彦': 9, '昊': 8,
  '皓': 12, '晖': 13, '昌': 8, '晟': 10, '昀': 8, '望': 11, '星': 9, '辰': 7,
  '霞': 17, '露': 21, '雯': 12, '霏': 16, '霜': 17, '凌': 10, '冰': 6, '寒': 12,
  '冬': 5, '雪': 11
};

const CHAR_WUXING = {
  '木': ['森', '林', '荣', '华', '建', '材', '春', '秋', '松', '柏', '桐', '榕', '槐', '柳', '桂', '枫', '桃', '梅', '兰', '菊', '竹', '萱', '莹', '婷', '妍', '倩', '雅', '欣', '怡', '慧', '材', '栋', '梁', '柱', '桥', '楠', '榆', '樟', '樱', '楷', '桓', '棉', '棕', '棚', '枚', '杨', '桦', '槿', '松'],
  '火': ['炎', '焱', '灿', '烂', '光', '辉', '耀', '明', '亮', '晶', '婷', '娜', '昕', '昭', '熙', '丹', '红', '赤', '朱', '阳', '映', '炜', '炳', '熠', '荧', '煜', '灵', '暖', '晴', '昌', '昊', '昀', '晖', '晟', '晔', '晨', '曦', '皓', '日', '照', '然'],
  '土': ['坤', '厚', '坦', '城', '坚', '培', '增', '墨', '圣', '均', '垣', '基', '域', '堂', '堆', '塞', '壁', '士', '诚', '博', '雅', '慧', '灵', '吉', '埕', '塔', '坏', '坊', '坚'],
  '金': ['锋', '锐', '铭', '锦', '钦', '钰', '铁', '银', '铜', '锡', '镜', '钟', '鑫', '钧', '铎', '雨', '诗', '倩', '雅', '婷', '慧', '敏', '珊', '静', '瑞', '珍', '珠', '玉', '珉', '琳', '瑶', '瑾', '璇', '瑟', '珩', '珏', '玺', '璧', '环', '玖', '瑄'],
  '水': ['泽', '润', '洲', '海', '波', '涛', '洁', '洋', '潮', '汐', '渊', '泉', '溪', '涵', '清', '淳', '冷', '冽', '永', '泳', '瀚', '墨', '学', '文', '慧', '润']
};

const POINTS = {
  '1': 100, '2': 90, '3': 98, '4': 90, '5': 100, '6': 95, '7': 98, '8': 90,
  '9': 97, '10': 90, '11': 100, '12': 92, '13': 100, '14': 92, '15': 100,
  '16': 98, '17': 95, '18': 100, '19': 92, '20': 90, '21': 100, '22': 92,
  '23': 100, '24': 100, '25': 97, '26': 95, '27': 100, '28': 92, '29': 100,
  '30': 95, '31': 100, '32': 100, '33': 100, '34': 92, '35': 100, '36': 92,
  '37': 100, '38': 95, '39': 100, '40': 92, '41': 100, '42': 95, '43': 100,
  '44': 92, '45': 100, '46': 98, '47': 100, '48': 100, '49': 92, '50': 95,
  '51': 100, '52': 100, '53': 92, '54': 92, '55': 100, '56': 92, '57': 100,
  '58': 95, '59': 92, '60': 92, '61': 100, '62': 92, '63': 100, '64': 92,
  '65': 100, '66': 92, '67': 100, '68': 100, '69': 92, '70': 92, '71': 100,
  '72': 92, '73': 100, '74': 92, '75': 100, '76': 92, '77': 95, '78': 95,
  '79': 100, '80': 92, '81': 100
};

const POEMS = [
  { title: '《春望》', author: '杜甫', content: '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。' },
  { title: '《静夜思》', author: '李白', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
  { title: '《登鹳雀楼》', author: '王之涣', content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
  { title: '《相思》', author: '王维', content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。' },
  { title: '《鹿柴》', author: '王维', content: '空山不见人，但闻人语响。返景入深林，复照青苔上。' },
  { title: '《竹里馆》', author: '王维', content: '独坐幽篁里，弹琴复长啸。深林人不知，明月来相照。' },
  { title: '《山中》', author: '王维', content: '荆溪白石出，天寒红叶稀。山路元无雨，空翠湿人衣。' },
  { title: '《鸟鸣涧》', author: '王维', content: '人闲桂花落，夜静春山空。月出惊山鸟，时鸣春涧中。' },
  { title: '《望庐山瀑布》', author: '李白', content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。' },
  { title: '《早发白帝城》', author: '李白', content: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。' },
  { title: '《出塞》', author: '王昌龄', content: '秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。' },
  { title: '《枫桥夜泊》', author: '张继', content: '月落乌啼霜满天，江枫渔火对愁眠。姑苏城外寒山寺，夜半钟声到客船。' },
  { title: '《清明》', author: '杜牧', content: '清明时节雨纷纷，路上行人欲断魂。借问酒家何处有，牧童遥指杏花村。' },
  { title: '《山行》', author: '杜牧', content: '远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。' },
  { title: '《泊秦淮》', author: '杜牧', content: '烟笼寒水月笼沙，夜泊秦淮近酒家。商女不知亡国恨，隔江犹唱后庭花。' },
  { title: '《江南春》', author: '杜牧', content: '千里莺啼绿映红，水村山郭酒旗风。南朝四百八十寺，多少楼台烟雨中。' },
  { title: '《元日》', author: '王安石', content: '爆竹声中一岁除，春风送暖入屠苏。千门万户曈曈日，总把新桃换旧符。' },
  { title: '《梅花》', author: '王安石', content: '墙角数枝梅，凌寒独自开。遥知不是雪，为有暗香来。' },
  { title: '《春江花月夜》', author: '张若虚', content: '春江潮水连海平，海上明月共潮生。滟滟随波千万里，何处春江无月明。' },
  { title: '《凉州词》', author: '王翰', content: '葡萄美酒夜光杯，欲饮琵琶马上催。醉卧沙场君莫笑，古来征战几人回。' }
];

const NAME_POOL_MALE = ['浩', '宇', '杰', '涛', '明', '超', '勇', '俊', '豪', '峰', '磊', '鹏', '飞', '龙', '凯', '晨', '睿', '哲', '祥', '瑞', '康', '宁', '安', '文', '武', '英', '敏', '博', '雅', '嘉', '彦', '昊', '皓', '晖', '昌', '晟', '俊', '伟'];
const NAME_POOL_FEMALE = ['欣', '怡', '婷', '琪', '雅', '静', '敏', '娜', '丽', '芳', '兰', '梅', '菊', '凤', '英', '华', '红', '玉珍', '秀英', '桂英', '婷婷', '欣怡', '思雨', '欣悦', '梦琪', '雅静', '诗涵', '子墨', '思琪', '雨桐', '梓萱', '雅', '静', '婷', '慧', '敏', '珊', '琳', '瑶', '琪'];

const NAME_RANK = {
  '伟': 85, '磊': 78, '超': 72, '勇': 68, '俊': 75, '豪': 65, '峰': 70, '杰': 82, '涛': 68, '明': 72,
  '婷': 80, '欣': 78, '怡': 75, '静': 72, '雅': 82, '慧': 78, '敏': 70, '娜': 68, '丽': 65, '芳': 62,
  '琪': 85, '琳': 82, '瑶': 78, '雪': 72, '梅': 68, '兰': 70, '玉珍': 88, '秀英': 65, '桂英': 62,
  '婷婷': 78, '思雨': 82, '欣悦': 80, '梦琪': 85, '诗涵': 88, '子涵': 82, '梓萱': 85, '浩然': 82, '天佑': 80
};

function getCharStrokes(c) {
  return STROKES[c] || 8;
}

function calcBazi(year, month, day, hour) {
  const tgIndex = (year - 4) % 10;
  const ganZhiYear = TIANGAN[tgIndex] + DIZHI[(year - 4) % 12];
  let monthIdx = DIZHI.indexOf(month);
  let ganZhiMonth = TIANGAN[(tgIndex + monthIdx + 2) % 10] + DIZHI[monthIdx];
  let dayGanIdx = (year * 365 + month * 30 + day + 6) % 10;
  let dayZhiIdx = (year * 365 + month * 30 + day + 9) % 12;
  let ganZhiDay = TIANGAN[dayGanIdx] + DIZHI[dayZhiIdx];
  let hourZhiIdx = DIZHI.indexOf(hour);
  let ganZhiHour = TIANGAN[(dayGanIdx * 2 + hourZhiIdx) % 10] + DIZHI[hourZhiIdx];
  return { year: ganZhiYear, month: ganZhiMonth, day: ganZhiDay, hour: ganZhiHour };
}

function getWuxing(gan) {
  const idx = TIANGAN.indexOf(gan);
  return idx >= 0 ? WUXING[idx] : '';
}

function analyzeWuxing(bazi) {
  const wuxingCounts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const bazis = [bazi.year[0], bazi.month[0], bazi.day[0], bazi.hour[0]];
  bazis.forEach(g => {
    const w = getWuxing(g);
    if (w) wuxingCounts[w]++;
  });
  return wuxingCounts;
}

function getXiYongShen(wuxingCounts) {
  let max = 0, min = Infinity, strong = '', weak = '';
  for (let w in wuxingCounts) {
    if (wuxingCounts[w] > max) { max = wuxingCounts[w]; strong = w; }
    if (wuxingCounts[w] < min) { min = wuxingCounts[w]; weak = w; }
  }
  for (let w in wuxingCounts) {
    if (w !== strong && wuxingCounts[w] === min) { weak = w; break; }
  }
  const buyong = WUXING_RELATION[strong] ? WUXING_RELATION[strong]['生'] : '';
  const xiyong = WUXING_RELATION[weak] ? WUXING_RELATION[weak]['克'] : '';
  return { buyong, xiyong, strong, weak };
}

function calcSanCai(surname, name1, name2) {
  const tiange = getCharStrokes(surname) + 1;
  const renge = getCharStrokes(surname) + getCharStrokes(name1);
  const dige = getCharStrokes(name2) + 1;
  const waige = getCharStrokes(name1) + getCharStrokes(name2);
  const zongge = getCharStrokes(surname) + getCharStrokes(name1) + getCharStrokes(name2);
  return { tiange, renge, dige, waige, zongge };
}

function calcTotalScore(santi) {
  let score = 0;
  for (let key in santi) { score += POINTS[santi[key]] || 90; }
  return Math.round(score / 5);
}

function calcYinYun(name1, name2) {
  const pinyinMap = {
    '浩': 'hao', '宇': 'yu', '杰': 'jie', '涛': 'tao', '明': 'ming', '超': 'chao',
    '勇': 'yong', '俊': 'jun', '豪': 'hao', '峰': 'feng', '磊': 'lei', '鹏': 'peng',
    '飞': 'fei', '龙': 'long', '凯': 'kai', '晨': 'chen', '睿': 'rui', '哲': 'zhe',
    '祥': 'xiang', '瑞': 'rui', '欣': 'xin', '怡': 'yi', '婷': 'ting', '琪': 'qi',
    '雅': 'ya', '静': 'jing', '敏': 'min', '娜': 'na', '丽': 'li', '芳': 'fang',
    '兰': 'lan', '梅': 'mei', '菊': 'ju', '竹': 'zhu', '松': 'song', '柏': 'bai',
    '桐': 'tong', '枫': 'feng', '桃': 'tao', '桂': 'gui', '森': 'sen', '林': 'lin',
    '荣': 'rong', '华': 'hua', '建': 'jian', '材': 'cai', '春': 'chun', '秋': 'qiu',
    '焱': 'yan', '灿': 'can', '光': 'guang', '辉': 'hui', '耀': 'yao', '亮': 'liang',
    '晶': 'jing', '丹': 'dan', '红': 'hong', '阳': 'yang', '暖': 'nuan', '晴': 'qing',
    '坤': 'kun', '厚': 'hou', '坦': 'tan', '城': 'cheng', '坚': 'jian', '培': 'pei',
    '墨': 'mo', '均': 'jun', '锋': 'feng', '锐': 'rui', '铭': 'ming', '锦': 'jin',
    '钦': 'qin', '钰': 'yu', '铁': 'tie', '银': 'yin', '钟': 'zhong', '钧': 'jun',
    '泽': 'ze', '润': 'run', '洲': 'zhou', '海': 'hai', '波': 'bo', '洁': 'jie',
    '洋': 'yang', '潮': 'chao', '渊': 'yuan', '泉': 'quan', '溪': 'xi', '涵': 'han',
    '清': 'qing', '淳': 'chun', '永': 'yong', '泳': 'yong', '瀚': 'han', '学': 'xue',
    '文': 'wen', '博': 'bo', '慧': 'hui'
  };
  const py1 = pinyinMap[name1] || name1;
  const py2 = pinyinMap[name2] || name2;
  let score = 50;
  const last1 = py1.slice(-1), last2 = py2.slice(-1);
  if (last1 === last2) score -= 20;
  if (py1.length > 1 && py2.length > 1) {
    if (py1[0] === py2[0]) score -= 10;
  }
  return Math.max(0, Math.min(100, score + 50));
}

function getZodiacAnimal(birthDate) {
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const year = parseInt(birthDate.split('-')[0]);
  return animals[(year - 4) % 12];
}

function generateNameSuggestions(wuxingInfo, gender, count = 12) {
  const suggestions = [];
  const preferWX = wuxingInfo.xiyong;
  const baseChars = CHAR_WUXING[preferWX] || CHAR_WUXING['木'];
  const pool = gender === '女' ? NAME_POOL_FEMALE : NAME_POOL_MALE;
  const usedNames = new Set();

  for (let i = 0; i < pool.length * 3; i++) {
    const name1 = pool[Math.floor(Math.random() * pool.length)];
    const name2 = baseChars[Math.floor(Math.random() * baseChars.length)];
    const fullName = name1 + name2;
    if (usedNames.has(fullName)) continue;
    usedNames.add(fullName);

    const santi = calcSanCai('张', name1, name2);
    const santiScore = calcTotalScore(santi);
    const yinYunScore = calcYinYun(name1, name2);
    const rankScore = NAME_RANK[name1] || 70;
    const totalScore = Math.round(santiScore * 0.4 + yinYunScore * 0.3 + rankScore * 0.3);

    suggestions.push({
      name: fullName,
      score: totalScore,
      santiScore,
      yinYunScore,
      wuxing: preferWX + preferWX,
      strokes1: getCharStrokes(name1),
      strokes2: getCharStrokes(name2)
    });

    if (suggestions.length >= count * 2) break;
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, count);
}

function getScoreText(score) {
  if (score >= 85) return '吉';
  if (score >= 60) return '平';
  return '凶';
}

module.exports = {
  calcBazi,
  analyzeWuxing,
  getXiYongShen,
  calcSanCai,
  calcTotalScore,
  calcYinYun,
  getZodiacAnimal,
  generateNameSuggestions,
  getScoreText,
  POEMS,
  getCharStrokes,
  POINTS
};
