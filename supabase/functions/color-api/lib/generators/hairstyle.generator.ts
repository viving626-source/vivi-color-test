import type { QuizAnswer, SeasonResult, HairstyleResult } from '../types.ts';

const hairImages = {
  longWave: 'https://picsum.photos/seed/long-wave/400/500',
  clavicle: 'https://picsum.photos/seed/clavicle-hair/400/500',
  frenchLayer: 'https://picsum.photos/seed/french-layer/400/500',
  bangsLong: 'https://picsum.photos/seed/bangs-long/400/500',
  sideWave: 'https://picsum.photos/seed/side-wave/400/500',
  mediumWave: 'https://picsum.photos/seed/medium-wave/400/500',
  shortHair: 'https://picsum.photos/seed/short-hair/400/500',
  straight: 'https://picsum.photos/seed/straight-hair/400/500',
};

const hairColorImages: Record<string, string> = {
  spring1: 'https://picsum.photos/seed/hair-spring1/400/500',
  spring2: 'https://picsum.photos/seed/hair-spring2/400/500',
  spring3: 'https://picsum.photos/seed/hair-spring3/400/500',
  spring4: 'https://picsum.photos/seed/hair-spring4/400/500',
  spring5: 'https://picsum.photos/seed/hair-spring5/400/500',
  spring6: 'https://picsum.photos/seed/hair-spring6/400/500',
  summer1: 'https://picsum.photos/seed/hair-summer1/400/500',
  summer2: 'https://picsum.photos/seed/hair-summer2/400/500',
  summer3: 'https://picsum.photos/seed/hair-summer3/400/500',
  summer4: 'https://picsum.photos/seed/hair-summer4/400/500',
  summer5: 'https://picsum.photos/seed/hair-summer5/400/500',
  summer6: 'https://picsum.photos/seed/hair-summer6/400/500',
  autumn1: 'https://picsum.photos/seed/hair-autumn1/400/500',
  autumn2: 'https://picsum.photos/seed/hair-autumn2/400/500',
  autumn3: 'https://picsum.photos/seed/hair-autumn3/400/500',
  autumn4: 'https://picsum.photos/seed/hair-autumn4/400/500',
  autumn5: 'https://picsum.photos/seed/hair-autumn5/400/500',
  autumn6: 'https://picsum.photos/seed/hair-autumn6/400/500',
  winter1: 'https://picsum.photos/seed/hair-winter1/400/500',
  winter2: 'https://picsum.photos/seed/hair-winter2/400/500',
  winter3: 'https://picsum.photos/seed/hair-winter3/400/500',
  winter4: 'https://picsum.photos/seed/hair-winter4/400/500',
  winter5: 'https://picsum.photos/seed/hair-winter5/400/500',
  winter6: 'https://picsum.photos/seed/hair-winter6/400/500',
};

export function generateHairstyleResult(
  season: SeasonResult,
  answers: QuizAnswer[],
): HairstyleResult {
  // Detect hair length preference from hair-related dimensions
  const hairDimIds = ['hair-length', 'hairstyle', 'hair-style', '髮型', 'hair'];
  const hairAnswers = answers.filter(
    (a) => a.dimensionId && hairDimIds.some((id) => a.dimensionId?.includes(id)),
  );

  let longScore = 0;
  let shortScore = 0;

  if (hairAnswers.length > 0) {
    hairAnswers.forEach((a) => {
      // If answer option id suggests length, use it; otherwise infer from season
      const ans = a.answer.toLowerCase();
      if (ans.includes('long') || a.answer === 'a') {
        longScore += 2;
      } else if (ans.includes('short') || a.answer === 'c') {
        shortScore += 2;
      } else {
        longScore += 1;
        shortScore += 1;
      }
    });
  }

  // Fallback: spring/summer lean toward longer soft hair; winter leans toward sleek
  if (longScore === 0 && shortScore === 0) {
    longScore = season.scores.spring + season.scores.summer;
    shortScore = season.scores.autumn + season.scores.winter;
  }

  const prefersLength = longScore >= shortScore ? 'long' : 'medium';

  const hairstyleData: Record<string, { name: string; image: string; desc: string }[]> = {
    spring: [
      { name: '大波浪長髮', image: hairImages.longWave, desc: '修飾臉型 顯氣質\n元氣靈動 甜美知性' },
      { name: '鎖骨中長髮', image: hairImages.clavicle, desc: '輕盈減齡 顯元氣\n日常百搭 清爽好打理' },
      { name: '法式層次長髮', image: hairImages.frenchLayer, desc: '慵懶隨性 顯高級\n自帶法式優雅氣質' },
      { name: '八字瀏海長髮', image: hairImages.bangsLong, desc: '修飾臉型 小臉感\n元氣減齡 活力滿滿' },
      { name: '側分大波浪', image: hairImages.sideWave, desc: '元氣優雅 顯活力\n春日氛圍感滿分' },
      { name: '微捲中長髮', image: hairImages.mediumWave, desc: '元氣自然 日常好打理\n清爽輕盈 自帶元氣' },
    ],
    summer: [
      { name: '大波浪長髮', image: hairImages.longWave, desc: '溫柔氣質 柔軟隨性\n空氣感十足' },
      { name: '鎖骨中長髮', image: hairImages.clavicle, desc: '減齡顯年輕 空氣感\n日系清新 溫柔甜美' },
      { name: '法式層次長髮', image: hairImages.frenchLayer, desc: '慵懶隨性 高級感\n法式慵懶氛圍' },
      { name: '八字瀏海長髮', image: hairImages.bangsLong, desc: '修飾臉型 小臉感\n溫柔減齡 氣質優雅' },
      { name: '側分大波浪', image: hairImages.sideWave, desc: '氣質優雅 顯溫柔\n知性大方 女人味' },
      { name: '微捲中長髮', image: hairImages.mediumWave, desc: '溫柔氣質 日常好打理\n輕盈自然 空氣感' },
    ],
    autumn: [
      { name: '大波浪長髮', image: hairImages.longWave, desc: '成熟嫵媚 氣場全開\n知性優雅 高級感' },
      { name: '鎖骨中長髮', image: hairImages.clavicle, desc: '幹練優雅 顯氣質\n通勤必備 自帶氣場' },
      { name: '法式層次長髮', image: hairImages.frenchLayer, desc: '慵懶高級 巴黎感\n復古優雅 女人味' },
      { name: '八字瀏海長髮', image: hairImages.bangsLong, desc: '修飾臉型 知性美\n優雅大方 氣質出眾' },
      { name: '側分大波浪', image: hairImages.sideWave, desc: '成熟優雅 御姐範\n氣場全開 高級感' },
      { name: '微捲中長髮', image: hairImages.mediumWave, desc: '知性優雅 日常百搭\n成熟穩重 自帶氣質' },
    ],
    winter: [
      { name: '大波浪長髮', image: hairImages.longWave, desc: '氣場強大 高冷御姐\n高級感滿分' },
      { name: '鎖骨中長髮', image: hairImages.clavicle, desc: '簡約幹練 氣質佳\n現代都市感 高冷範' },
      { name: '直髮長髮', image: hairImages.straight, desc: '順滑亮澤 高級感\n冷冽氣質 個性十足' },
      { name: '齊肩直髮', image: hairImages.shortHair, desc: '個性時髦 酷颯感\n灑脫不羈 氣場強大' },
      { name: '側分大波浪', image: hairImages.sideWave, desc: '成熟嫵媚 女人味\n冷豔高級 氣質出眾' },
      { name: '層次短髮', image: hairImages.shortHair, desc: '個性幹練 高級感\n灑脫有型 獨立自信' },
    ],
  };

  const hairstyles = hairstyleData[season.primarySeason].map((item) => ({
    name: item.name,
    imageUrl: item.image,
    description: item.desc,
  }));

  const hairColorData: Record<
    string,
    { name: string; image: string; desc: string; hex: string }[]
  > = {
    spring: [
      { name: '莓莓紅棕', image: hairColorImages.spring1, desc: '顯白提氣色', hex: '#A0522D' },
      { name: '蜜糖橘棕', image: hairColorImages.spring2, desc: '元氣滿滿', hex: '#CD853F' },
      { name: '奶茶栗棕', image: hairColorImages.spring3, desc: '自然溫柔', hex: '#8B7355' },
      { name: '楓葉紅棕', image: hairColorImages.spring4, desc: '氣質靈動', hex: '#B22222' },
      { name: '蜂蜜茶棕', image: hairColorImages.spring5, desc: '元氣少女感', hex: '#DEB887' },
      { name: '焦糖棕', image: hairColorImages.spring6, desc: '活力滿滿', hex: '#D2691E' },
    ],
    summer: [
      { name: '櫻花粉棕', image: hairColorImages.summer1, desc: '顯白提氣色', hex: '#BC8F8F' },
      { name: '酒釀櫻桃棕', image: hairColorImages.summer2, desc: '溫柔顯貴', hex: '#A04050' },
      { name: '紅茶棕', image: hairColorImages.summer3, desc: '自然溫柔', hex: '#8B4513' },
      { name: '玫瑰棕', image: hairColorImages.summer4, desc: '氣質靈動', hex: '#C08080' },
      { name: '奶茶栗棕', image: hairColorImages.summer5, desc: '溫柔奶油感', hex: '#A0826D' },
      { name: '霧感灰棕', image: hairColorImages.summer6, desc: '高級質感', hex: '#8B7D7B' },
    ],
    autumn: [
      { name: '焦糖栗棕', image: hairColorImages.autumn1, desc: '顯白高級', hex: '#8B4513' },
      { name: '楓葉紅棕', image: hairColorImages.autumn2, desc: '氣場強大', hex: '#A0522D' },
      { name: '深巧克力棕', image: hairColorImages.autumn3, desc: '濃郁知性', hex: '#654321' },
      { name: '蜜糖紅棕', image: hairColorImages.autumn4, desc: '氣質出眾', hex: '#CD5C5C' },
      { name: '亞麻茶棕', image: hairColorImages.autumn5, desc: '低調高級', hex: '#8B7355' },
      { name: '深棕紅', image: hairColorImages.autumn6, desc: '成熟穩重', hex: '#800000' },
    ],
    winter: [
      { name: '黑茶色', image: hairColorImages.winter1, desc: '高級質感', hex: '#2F2F2F' },
      { name: '深藍黑色', image: hairColorImages.winter2, desc: '冷冽個性', hex: '#1A2A3A' },
      { name: '紫黑色', image: hairColorImages.winter3, desc: '神秘高級', hex: '#3D1F3D' },
      { name: '酒紅棕', image: hairColorImages.winter4, desc: '氣場全開', hex: '#722F37' },
      { name: '冷棕色', image: hairColorImages.winter5, desc: '簡約高級', hex: '#505050' },
      { name: '鉛筆灰', image: hairColorImages.winter6, desc: '時髦前衛', hex: '#808080' },
    ],
  };

  const hairColors = hairColorData[season.primarySeason].map((item) => ({
    name: item.name,
    imageUrl: item.image,
    description: item.desc,
    colorHex: item.hex,
  }));

  const avoidColorData: Record<string, { name: string; reason: string; color: string }[]> = {
    spring: [
      { name: '純黑色', reason: '壓臉顯成熟，過於沉重', color: '#1A1A1A' },
      { name: '亞麻灰', reason: '顯髒，氣色差', color: '#909090' },
      { name: '熒光色', reason: '過於誇張，顯廉價', color: '#FF69B4' },
      { name: '淺金色', reason: '不適合東方膚色', color: '#FFD700' },
      { name: '冷灰棕', reason: '顯得氣色差，滄桑', color: '#708090' },
    ],
    summer: [
      { name: '藍黑色', reason: '顯髒灰，氣色差', color: '#1A2A3A' },
      { name: '亞麻灰', reason: '顯黑，沒精神', color: '#909090' },
      { name: '熒光色', reason: '過於誇張，顯廉價', color: '#FF1493' },
      { name: '淺金色', reason: '不適合東方膚色', color: '#FFD700' },
      { name: '純黑色', reason: '壓膚色，老氣', color: '#0A0A0A' },
    ],
    autumn: [
      { name: '淺金色', reason: '膚色顯黃，沒質感', color: '#FFD700' },
      { name: '亞麻淺棕', reason: '顯得沒精神', color: '#C4A574' },
      { name: '粉紅色', reason: '過於粉嫩，違和感', color: '#FFB6C1' },
      { name: '熒光色', reason: '廉價感滿滿', color: '#00FF7F' },
      { name: '灰白色', reason: '顯滄桑，老氣', color: '#808080' },
    ],
    winter: [
      { name: '亞麻黃', reason: '膚色顯蠟黃', color: '#DAA520' },
      { name: '橙紅色', reason: '過於張揚，俗氣', color: '#FF4500' },
      { name: '淺棕色', reason: '沒質感，廉價', color: '#CD853F' },
      { name: '粉棕色', reason: '氣質不搭', color: '#E8B4B8' },
      { name: '蜜糖金', reason: '膚色顯黃', color: '#FFD700' },
    ],
  };

  const keyPoints = [
    '明度選擇：5-7度最顯氣質',
    `色調選擇：${season.primarySeason === 'spring' || season.primarySeason === 'autumn' ? '暖調為主' : '冷調為主'}`,
    '關鍵要素：光澤感 + 柔霧感 + 空氣感',
    prefersLength === 'long' ? '髮型重點：長髮層次感，蓬鬆度' : '髮型重點：中長髮蓬鬆感，側分劉海',
  ];

  const correctName = season.primarySeason === 'spring'
    ? '紅棕色'
    : season.primarySeason === 'summer'
      ? '奶茶棕'
      : season.primarySeason === 'autumn'
        ? '深栗棕'
        : '黑茶色';

  return {
    hairstyles,
    hairColors,
    keyPoints,
    avoidColors: avoidColorData[season.primarySeason],
    compareCorrect: {
      name: `正確髮色（${correctName}）`,
      description: '提亮膚色\n氣色好 顯年輕',
      imageUrl: hairColorImages[`${season.primarySeason}1`],
    },
    compareCold: {
      name: '冷色髮色（灰棕）',
      description: '顯得膚色偏沉\n氣色暗淡 顯疲憊',
      imageUrl: hairColorImages.winter5,
    },
    compareDark: {
      name: '過深髮色（黑色）',
      description: '壓膚色顯老氣\n缺乏靈動感',
      imageUrl: hairColorImages.winter1,
    },
    blowDryTips: ['順著毛流吹蓬鬆', '保持自然弧度', '髮根蓬鬆是關鍵'],
    careTips: ['定期護髮精油', '增加光澤感', '避免頻繁燙染'],
    summary:
      season.primarySeason === 'spring'
        ? '大波浪長髮 + 莓莓紅棕 / 蜜糖橘棕，最能襯托你的元氣氣質！'
        : season.primarySeason === 'summer'
          ? '大波浪長髮 + 櫻花粉棕 / 玫瑰棕，最能襯托你的溫柔氣質！'
          : season.primarySeason === 'autumn'
            ? '大波浪長髮 + 焦糖栗棕 / 楓葉紅棕，最能襯托你的知性氣質！'
            : '黑茶直髮 + 黑茶色 / 酒紅棕，最能襯托你的高級氣質！',
  };
}
