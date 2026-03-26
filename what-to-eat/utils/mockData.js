const MERCHANT_NAMES = [
  '老成都川菜馆', '湘味小厨', '粤式茶餐厅', '北方水饺', '重庆小面',
  '沙县小吃', '黄焖鸡米饭', '兰州拉面', '桂林米粉', '过桥米线',
  '麻辣烫', '冒菜馆', '烧烤档', '日式料理', '韩式炸鸡',
  '越南粉', '泰国餐厅', '印度咖喱', '意大利披萨', '麦当劳',
  '肯德基', '华莱士', '德克士', '必胜客', '尊宝披萨'
];

const FOOD_TAGS = [
  ['川菜', '麻辣', '下饭'], ['湘菜', '家常', '辣'], ['粤菜', '早茶', '清淡'],
  ['饺子', '面食', '实惠'], ['小面', '重庆', '麻辣'], ['快餐', '小吃', '便捷'],
  ['米饭', '套餐', '量大'], ['拉面', '面食', '汤浓'], ['米粉', '广西', '酸辣'],
  ['米线', '云南', '过桥'], ['麻辣烫', '自选', '辣'], ['冒菜', '四川', '麻辣'],
  ['烧烤', '夜宵', '啤酒'], ['日料', '刺身', '寿司'], ['炸鸡', '韩式', '啤酒'],
  ['越南粉', '清淡', '牛肉'], ['泰餐', '咖喱', '香料'], ['印度菜', '咖喱', '飞饼'],
  ['披萨', '意大利', '芝士'], ['快餐', '汉堡', '炸鸡'],
  ['快餐', '汉堡', '炸鸡'], ['快餐', '汉堡', '实惠'], ['快餐', '汉堡', '炸鸡'],
  ['披萨', '西餐', '下午茶'], ['披萨', '外卖', '实惠']
];

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1529543544277-750e3ff2f3a8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503151-8453ef82dd5a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1528475775066-6b4f4f5a4e73?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1568711146549-603b9979dc0a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1604909052868-94e60e22c3c5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop'
];

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateMerchants(range) {
  const shuffledNames = shuffleArray(MERCHANT_NAMES);
  const shuffledTags = shuffleArray(FOOD_TAGS);
  const shuffledCovers = shuffleArray(COVER_IMAGES);
  
  return shuffledNames.slice(0, 20).map((name, index) => ({
    id: `merchant_${Date.now()}_${index}`,
    name,
    logo: shuffledCovers[index],
    cover: shuffledCovers[index],
    rating: randomFloat(4.0, 5.0, 1),
    monthlySales: randomInt(1000, 9999),
    shippingFee: randomFloat(0, 5, 1),
    minOrder: randomFloat(15, 40, 0),
    distance: randomFloat(0.3, range, 1),
    tags: shuffledTags[index % shuffledTags.length]
  }));
}

module.exports = {
  generateMerchants,
  MERCHANT_NAMES,
  FOOD_TAGS
};