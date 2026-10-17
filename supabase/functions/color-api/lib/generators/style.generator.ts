import type {
  QuizAnswer,
  SeasonResult,
  FacialResult,
  StyleResult,
  StyleType,
  CelebrityRef,
} from '../types.ts';

const styleImages: Record<string, string> = {
  koreanMature: 'https://picsum.photos/seed/style-korean/400/500',
  french: 'https://picsum.photos/seed/style-french/400/500',
  intellectual: 'https://picsum.photos/seed/style-intel/400/500',
  magazine: 'https://picsum.photos/seed/style-magazine/400/500',
  richGirl: 'https://picsum.photos/seed/style-rich/400/500',
  hkCool: 'https://picsum.photos/seed/style-hkcool/400/500',
  americanRetro: 'https://picsum.photos/seed/style-american/400/500',
  minimalist: 'https://picsum.photos/seed/style-minimal/400/500',
  pure: 'https://picsum.photos/seed/style-pure/400/500',
  newChinese: 'https://picsum.photos/seed/style-chinese/400/500',
  salt: 'https://picsum.photos/seed/style-salt/400/500',
  sweetCool: 'https://picsum.photos/seed/style-sweetcool/400/500',
};

const celebImages: Record<string, string> = {
  songHyeKyo: 'https://picsum.photos/seed/celeb-shk/300/400',
  iu: 'https://picsum.photos/seed/celeb-iu/300/400',
  junJiHyun: 'https://picsum.photos/seed/celeb-jjh/300/400',
  sonYeJin: 'https://picsum.photos/seed/celeb-syj/300/400',
  zhaoLiYing: 'https://picsum.photos/seed/celeb-zly/300/400',
  liuYiFei: 'https://picsum.photos/seed/celeb-lyf/300/400',
  shuQi: 'https://picsum.photos/seed/celeb-shuqi/300/400',
  zhangZiYi: 'https://picsum.photos/seed/celeb-zzfy/300/400',
  jolin: 'https://picsum.photos/seed/celeb-jolin/300/400',
  audrey: 'https://picsum.photos/seed/celeb-audrey/300/400',
  marion: 'https://picsum.photos/seed/celeb-marion/300/400',
  jeonDoYeon: 'https://picsum.photos/seed/celeb-jdy/300/400',
};

export function generateStyleResult(
  season: SeasonResult,
  facial: FacialResult,
  answers: QuizAnswer[],
): StyleResult {
  // Detect style preference from style-related dimensions
  const styleDimIds = ['style', 'fashion', 'personal-style', '風格', '氣質'];
  const styleAnswers = answers.filter(
    (a) => a.dimensionId && styleDimIds.some((id) => a.dimensionId?.includes(id)),
  );

  let feminineScore = 0;
  let coolScore = 0;

  if (styleAnswers.length > 0) {
    styleAnswers.forEach((a) => {
      if (a.scoreSeason) {
        // Spring + Summer skew more feminine/soft
        feminineScore += (a.scoreSeason.spring ?? 0) + (a.scoreSeason.summer ?? 0);
        // Autumn + Winter skew more cool/sharp
        coolScore += (a.scoreSeason.autumn ?? 0) + (a.scoreSeason.winter ?? 0);
      }
    });
  }

  // Fallback to overall season balance
  if (feminineScore === 0 && coolScore === 0) {
    feminineScore = season.scores.spring + season.scores.summer;
    coolScore = season.scores.autumn + season.scores.winter;
  }

  const isFeminine = feminineScore >= coolScore;
  const isWarm = season.primarySeason === 'spring' || season.primarySeason === 'autumn';

  let mainStyleName = '';
  let mainKeywords: string[] = [];

  if (isWarm && isFeminine && season.primarySeason === 'spring') {
    mainStyleName = '柔光氛圍型知性美人';
    mainKeywords = ['溫柔', '知性', '靈動', '優雅', '空氣感'];
  } else if (!isWarm && isFeminine) {
    mainStyleName = '清冷仙氣型氣質美人';
    mainKeywords = ['清冷', '仙氣', '高級', '靈動', '不食人間煙火'];
  } else if (isWarm && !isFeminine && season.primarySeason === 'autumn') {
    mainStyleName = '濃郁御姐型知性美人';
    mainKeywords = ['成熟', '知性', '高級', '氣場', '優雅'];
  } else if (!isWarm && !isFeminine) {
    mainStyleName = '冷豔個性型時髦美人';
    mainKeywords = ['個性', '高級', '冷冽', '氣場強大', '與眾不同'];
  } else if (season.primarySeason === 'summer' && isFeminine) {
    mainStyleName = '柔霧溫柔型氣質美人';
    mainKeywords = ['溫柔', '氣質', '親和力', '空氣感', '耐看型'];
  } else {
    mainStyleName = '法式優雅型精緻美人';
    mainKeywords = ['優雅', '隨性', '高級', '不費力', '精緻'];
  }

  const allStyles: StyleType[] = [
    { name: '韓系輕熟', imageUrl: styleImages.koreanMature, description: '溫柔幹練 職場必備' },
    { name: '法式溫柔', imageUrl: styleImages.french, description: '慵懶隨性 高級感' },
    { name: '知性姐姐風', imageUrl: styleImages.intellectual, description: '成熟穩重 氣質出眾' },
    { name: '日雜氧氣感', imageUrl: styleImages.magazine, description: '清新自然 元氣滿滿' },
    { name: '溫柔千金', imageUrl: styleImages.richGirl, description: '名媛氣質 高貴優雅' },
    { name: '清冷港風', imageUrl: styleImages.hkCool, description: '冷豔復古 氣場強大' },
    { name: '美式復古', imageUrl: styleImages.americanRetro, description: '個性前衛 自由不羈' },
    { name: '極簡性冷淡', imageUrl: styleImages.minimalist, description: '簡約高級 品味獨特' },
    { name: '少女純欲', imageUrl: styleImages.pure, description: '甜美清純 初戀感' },
    { name: '新中式', imageUrl: styleImages.newChinese, description: '東方韻味 古典優雅' },
    { name: '鹽系', imageUrl: styleImages.salt, description: '清爽自然 獨立灑脫' },
    { name: '甜酷', imageUrl: styleImages.sweetCool, description: '又甜又酷 反差魅力' },
  ];

  let topStyleIndexes: number[];
  if (isFeminine && isWarm) {
    topStyleIndexes = [0, 1, 2, 3, 4];
  } else if (isFeminine && !isWarm) {
    topStyleIndexes = [1, 3, 7, 5, 9];
  } else if (!isFeminine && isWarm) {
    topStyleIndexes = [2, 6, 10, 5, 11];
  } else {
    topStyleIndexes = [7, 5, 6, 10, 11];
  }

  const subStyles = topStyleIndexes.map((i) => allStyles[i]);

  const celebrities: CelebrityRef[] = [
    { name: '宋慧喬', imageUrl: celebImages.songHyeKyo, style: '韓系溫柔' },
    { name: 'IU 李知恩', imageUrl: celebImages.iu, style: '少女靈動' },
    { name: '全智賢', imageUrl: celebImages.junJiHyun, style: '氣場御姐' },
    { name: '孫藝珍', imageUrl: celebImages.sonYeJin, style: '清純氣質' },
    { name: '劉亦菲', imageUrl: celebImages.liuYiFei, style: '仙氣清冷' },
    { name: '舒淇', imageUrl: celebImages.shuQi, style: '性感嫵媚' },
  ];

  const checklist = [
    {
      category: '妝容',
      items: ['自然提氣色，強調清透感', '底妝薄透，保留肌膚質感', '腮紅是重點'],
    },
    {
      category: '髮型',
      items: ['大波浪 / 法式層次 / 偏分瀏海', '保持蓬鬆感與光澤', '避免貼頭皮'],
    },
    {
      category: '穿搭',
      items: [
        `${isWarm ? '柔和色系' : '冷色調'}，質感面料為主`,
        '簡約高級感',
        '適當露膚更顯輕盈',
      ],
    },
    {
      category: '配飾',
      items: ['珍珠 / 翡翠 / 玫瑰金首飾', '小巧精緻', '避免誇張大飾品'],
    },
    {
      category: '風格',
      items: ['溫柔知性，輕熟優雅路線', '耐看型 > 驚艷型', '越簡單越高級'],
    },
    {
      category: '氛圍',
      items: ['乾淨 · 溫柔 · 有親和力', '自帶柔光濾鏡', '低調中的高級感'],
    },
  ];

  const colorPalette = [
    { name: '奶油白', mainColor: '#FFF8DC', matchColor: '#F5DEB3' },
    { name: '米杏色', mainColor: '#F5DEB3', matchColor: '#DEB887' },
    { name: '豆沙粉', mainColor: '#BC8F8F', matchColor: '#DB7093' },
    { name: '霧霾藍', mainColor: '#778899', matchColor: '#708090' },
    { name: '薄荷綠', mainColor: '#98D8C8', matchColor: '#7CCD7C' },
    { name: '香芋紫', mainColor: '#B39EB5', matchColor: '#9370DB' },
    { name: '暖橘色', mainColor: '#FF8C69', matchColor: '#CD5C5C' },
  ];

  const clothingRecommendItems = [
    { name: '針織開衫', imageUrl: 'https://picsum.photos/seed/item-cardigan/200/250' },
    { name: '真絲襯衫', imageUrl: 'https://picsum.photos/seed/item-silk/200/250' },
    { name: '西裝外套', imageUrl: 'https://picsum.photos/seed/item-blazer/200/250' },
    { name: '連衣裙', imageUrl: 'https://picsum.photos/seed/item-dress/200/250' },
    { name: '半身裙', imageUrl: 'https://picsum.photos/seed/item-skirt/200/250' },
    { name: '直筒褲', imageUrl: 'https://picsum.photos/seed/item-pants/200/250' },
    { name: '珍珠項鍊', imageUrl: 'https://picsum.photos/seed/item-pearl/200/250' },
  ];

  const clothingCategories = [
    {
      level: 'recommend' as const,
      items: [
        { name: '針織上衣', imageUrl: 'https://picsum.photos/seed/cloth-knit/150/200' },
        { name: '絲質襯衫', imageUrl: 'https://picsum.photos/seed/cloth-silk/150/200' },
        { name: 'A字裙', imageUrl: 'https://picsum.photos/seed/cloth-askirt/150/200' },
        { name: '西裝外套', imageUrl: 'https://picsum.photos/seed/cloth-blazer/150/200' },
      ],
    },
    {
      level: 'normal' as const,
      items: [
        { name: '牛仔外套', imageUrl: 'https://picsum.photos/seed/cloth-denim/150/200' },
        { name: 'T卹', imageUrl: 'https://picsum.photos/seed/cloth-tee/150/200' },
        { name: '吊帶裙', imageUrl: 'https://picsum.photos/seed/cloth-slip/150/200' },
        { name: '闊腿褲', imageUrl: 'https://picsum.photos/seed/cloth-wide/150/200' },
      ],
    },
    {
      level: 'not-recommend' as const,
      items: [
        { name: '運動套裝', imageUrl: 'https://picsum.photos/seed/cloth-sport/150/200' },
        { name: '熒光色單品', imageUrl: 'https://picsum.photos/seed/cloth-neon/150/200' },
        { name: '過於暴露', imageUrl: 'https://picsum.photos/seed/cloth-reveal/150/200' },
        { name: '廉價蕾絲', imageUrl: 'https://picsum.photos/seed/cloth-lace/150/200' },
      ],
    },
  ];

  const beautyGuide = [
    {
      category: '妝容重點',
      items: ['奶油肌底妝', '自然眉形', '內眼線 + 纖長睫毛', '眼下腮紅', '水潤唇妝'],
    },
    {
      category: '穿搭重點',
      items: [
        `${isWarm ? '柔和色系為主' : '冷色調為主'}`,
        '質感面料',
        '簡約高級感',
        '適當露膚更顯輕盈',
        '配色不超過3種',
      ],
    },
    {
      category: '配飾重點',
      items: ['珍珠 / 翡翠首飾', '小巧精緻', '玫瑰金更適合你', '避免誇張大飾品', '注重整體協調'],
    },
    {
      category: '提升重點',
      items: ['保持皮膚水潤', '提升氣色', '體態管理', '自信微笑', '培養溫柔氣質'],
    },
  ];

  const closingQuotes: Record<string, string> = {
    spring: '你是春日暖陽般的女孩，溫暖而有力量，越綻放越美麗！',
    summer: '你是夏日清風般的女孩，溫柔而有力量，越簡單越高級！',
    autumn: '你是秋日紅葉般的女孩，濃郁而有底蘊，越沉澱越有味道！',
    winter: '你是冬日寒梅般的女孩，冷冽而有傲骨，越獨特越閃耀！',
  };

  return {
    mainStyle: mainStyleName,
    subStyles,
    keywords: mainKeywords,
    celebrities,
    checklist,
    colorPalette,
    clothingCategories,
    recommendedItems: clothingRecommendItems,
    beautyGuide,
    closingQuote: closingQuotes[season.primarySeason],
  };
}
