import type {
  QuizAnswer,
  SeasonResult,
  FacialResult,
  SeasonScore,
} from '../types.ts';

export function generateSeasonResult(answers: QuizAnswer[]): SeasonResult {
  const scores: SeasonScore = {
    spring: 0,
    summer: 0,
    autumn: 0,
    winter: 0,
  };

  // Aggregate season scores from each answer's scoreSeason metadata
  answers.forEach((a) => {
    if (!a.scoreSeason) return;
    scores.spring += a.scoreSeason.spring ?? 0;
    scores.summer += a.scoreSeason.summer ?? 0;
    scores.autumn += a.scoreSeason.autumn ?? 0;
    scores.winter += a.scoreSeason.winter ?? 0;
  });

  // If no scoring data (legacy / empty answers), fall back to balanced defaults
  const totalScore = scores.spring + scores.summer + scores.autumn + scores.winter;
  if (totalScore === 0) {
    scores.spring = 35;
    scores.summer = 30;
    scores.autumn = 25;
    scores.winter = 20;
  }

  const warmTotal = scores.spring + scores.autumn;
  const coolTotal = scores.summer + scores.winter;
  const lightTotal = scores.spring + scores.summer;
  const deepTotal = scores.autumn + scores.winter;
  const softTotal = scores.summer + scores.autumn;
  const clearTotal = scores.spring + scores.winter;
  const allTotal = Math.max(warmTotal + coolTotal, 1);

  const warmRatio = warmTotal / allTotal;
  const coolRatio = coolTotal / allTotal;
  const lightRatio = lightTotal / allTotal;
  const deepRatio = deepTotal / allTotal;
  const softRatio = softTotal / allTotal;
  const clearRatio = clearTotal / allTotal;

  const seasonNames = ['spring', 'summer', 'autumn', 'winter'] as const;
  const sorted = seasonNames
    .map((name) => ({ name, score: scores[name] }))
    .sort((a, b) => b.score - a.score);

  const primarySeason = sorted[0].name;
  const secondarySeason = sorted[1].name;

  const seasonLabels: Record<string, string> = {
    spring: '暖春',
    summer: '淺夏',
    autumn: '深秋',
    winter: '冷冬',
  };

  const typeNameMap: Record<string, string> = {
    'spring-summer': '春夏型人（暖春偏夏）',
    'spring-autumn': '春秋型人（暖春偏秋）',
    'summer-spring': '夏春型人（淺夏偏春）',
    'summer-winter': '夏冬型人（淺夏偏冬）',
    'autumn-spring': '秋春型人（深秋偏春）',
    'autumn-winter': '秋冬型人（深秋偏冬）',
    'winter-summer': '冬夏型人（冷冬偏夏）',
    'winter-autumn': '冬秋型人（冷冬偏秋）',
  };

  const typeName =
    typeNameMap[`${primarySeason}-${secondarySeason}`] ||
    `${seasonLabels[primarySeason]}${seasonLabels[secondarySeason]}型人`;

  const conclusionMap: Record<string, string> = {
    spring: '你是春日暖陽型人，整體偏暖，適合明亮溫暖的色彩與風格。',
    summer: '你是夏日柔霧型人，整體偏冷，適合柔和優雅的色彩與風格。',
    autumn: '你是秋日濃郁型人，整體偏暖深，適合飽和成熟的色彩與風格。',
    winter: '你是冬日冷冽型人，整體偏冷深，適合高對比個性的色彩與風格。',
  };

  const keywordsMap: Record<string, string[]> = {
    spring: ['暖', '亮', '透', '清新', '活力'],
    summer: ['柔', '霧', '雅', '清透', '溫柔'],
    autumn: ['濃', '深', '醇', '成熟', '知性'],
    winter: ['冷', '冽', '銳', '個性', '高級'],
  };

  const colorPalettes = {
    spring: {
      warm: ['#FFE4C4', '#FFDAB9', '#DEB887', '#D2691E', '#8B4513'],
      neutral: ['#FFB6C1', '#FFA07A', '#F08080', '#98D8C8', '#7CCD7C'],
      cool: ['#B0E0E6', '#87CEEB', '#5F9EA0', '#9370DB', '#DDA0DD'],
    },
    summer: {
      warm: ['#F5DEB3', '#EED9C4', '#D8BFD8', '#BC8F8F', '#A0522D'],
      neutral: ['#FFC0CB', '#FF69B4', '#DB7093', '#90EE90', '#8FBC8F'],
      cool: ['#ADD8E6', '#87CEFA', '#6495ED', '#6A5ACD', '#BA55D3'],
    },
    autumn: {
      warm: ['#D2B48C', '#C4A574', '#A0826D', '#8B4513', '#654321'],
      neutral: ['#CD5C5C', '#B22222', '#A0522D', '#6B8E23', '#556B2F'],
      cool: ['#708090', '#4682B4', '#483D8B', '#800080', '#9932CC'],
    },
    winter: {
      warm: ['#BC8F8F', '#B8860B', '#CD853F', '#8B0000', '#800000'],
      neutral: ['#DC143C', '#C71585', '#8B008B', '#2E8B57', '#006400'],
      cool: ['#4682B4', '#1E90FF', '#000080', '#4B0082', '#9400D3'],
    },
  };

  return {
    scores,
    primarySeason,
    secondarySeason,
    typeName,
    conclusion: conclusionMap[primarySeason],
    keywords: keywordsMap[primarySeason],
    warmColors: colorPalettes[primarySeason].warm,
    neutralColors: colorPalettes[primarySeason].neutral,
    coolColors: colorPalettes[primarySeason].cool,
  };
}

export function generateFacialResult(
  season: SeasonResult,
  answers: QuizAnswer[],
): FacialResult {
  // Detect facial softness from face-feature / facial dimension answers
  // Use spring+summer score vs autumn+winter score in facial dimensions
  const facialDimIds = ['facial-features', 'face-shape', '五官分析', 'facial', 'face'];
  const facialAnswers = answers.filter(
    (a) => a.dimensionId && facialDimIds.some((id) => a.dimensionId?.includes(id)),
  );

  let softScore = 0;
  let strongScore = 0;

  if (facialAnswers.length > 0) {
    facialAnswers.forEach((a) => {
      if (a.scoreSeason) {
        softScore += (a.scoreSeason.spring ?? 0) + (a.scoreSeason.summer ?? 0);
        strongScore += (a.scoreSeason.autumn ?? 0) + (a.scoreSeason.winter ?? 0);
      }
    });
  } else {
    // Fallback: infer from overall season balance
    softScore = season.scores.spring + season.scores.summer;
    strongScore = season.scores.autumn + season.scores.winter;
  }

  const facialStyle = softScore >= strongScore ? '柔和' : '立體';

  const features = [
    {
      name: '眉毛',
      description: facialStyle === '柔和' ? '自然弧眉' : '立體劍眉',
      detail: facialStyle === '柔和' ? '柔和有型，線條流暢' : '眉峰明顯，英氣十足',
    },
    {
      name: '眼睛',
      description: facialStyle === '柔和' ? '大而有神' : '深邃內雙',
      detail: facialStyle === '柔和' ? '眼尾微揚，自帶溫柔感' : '眼型偏長，氣場強大',
    },
    {
      name: '鼻子',
      description: facialStyle === '柔和' ? '山根立體' : '高挺直鼻',
      detail: facialStyle === '柔和' ? '鼻頭圓潤，親和力強' : '鼻樑高聳，立體度佳',
    },
    {
      name: '嘴唇',
      description: facialStyle === '柔和' ? '唇形飽滿' : '唇線清晰',
      detail: facialStyle === '柔和' ? '唇色紅潤，性感甜美' : 'M字唇明顯，氣場全開',
    },
  ];

  const makeupAdvices = [
    {
      name: '底妝',
      description: season.primarySeason === 'spring' || season.primarySeason === 'autumn'
        ? '奶油肌光澤感'
        : '霧面啞光感',
      detail: season.primarySeason === 'winter' ? '輕薄自然，遮瑕為主' : '輕薄自然，提亮氣色',
    },
    { name: '眉妝', description: '自然眉形', detail: '填補空隙，根根分明' },
    {
      name: '眼妝',
      description: facialStyle === '柔和' ? '溫柔放大' : '深邃放大',
      detail: '柔和不凶，強調眼尾',
    },
    {
      name: '腮紅',
      description: '眼下 / 橫向',
      detail:
        season.primarySeason === 'spring'
          ? '蜜桃橘色'
          : season.primarySeason === 'summer'
            ? '蜜桃豆沙色'
            : season.primarySeason === 'autumn'
              ? '楓葉紅棕色'
              : '莓果酒紅色',
    },
    {
      name: '唇妝',
      description: season.primarySeason === 'winter' ? '霧面啞光' : '水潤飽滿',
      detail:
        season.primarySeason === 'spring'
          ? '珊瑚 / 西柚色'
          : season.primarySeason === 'summer'
            ? '豆沙 / 莓果色'
            : season.primarySeason === 'autumn'
              ? '楓葉 / 紅棕色'
              : '正紅 / 酒紅色',
    },
  ];

  const baseColorSets: Record<string, string[]> = {
    spring: ['#FFE4C4', '#FFDAB9', '#DEB887', '#CD853F', '#8B4513', '#654321'],
    summer: ['#F5DEB3', '#DEB887', '#BC8F8F', '#A0826D', '#8B7355', '#696969'],
    autumn: ['#D2B48C', '#C4A574', '#A0826D', '#8B4513', '#654321', '#3D2B1F'],
    winter: ['#E8E8E8', '#C0C0C0', '#808080', '#505050', '#2F2F2F', '#1A1A1A'],
  };

  const eyeshadowColorSets: Record<string, string[]> = {
    spring: ['#FFB6C1', '#FFA07A', '#F08080', '#CD5C5C', '#B22222', '#8B0000'],
    summer: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#DB7093', '#BC8F8F', '#8B7355'],
    autumn: ['#DEB887', '#D2691E', '#A0522D', '#8B4513', '#654321', '#3D2B1F'],
    winter: ['#DCDCDC', '#A9A9A9', '#808080', '#4B0082', '#800080', '#1A1A1A'],
  };

  const lipColorSets: Record<string, string[]> = {
    spring: ['#FF6B6B', '#EE5A52', '#E64A3E', '#CD5C5C', '#B22222', '#8B475D'],
    summer: ['#D4A5A5', '#C98A8A', '#BC8F8F', '#AB7474', '#9B6B6B', '#8B7355'],
    autumn: ['#B8860B', '#A0522D', '#8B4513', '#800000', '#654321', '#4A2C2A'],
    winter: ['#8B0000', '#800020', '#722F37', '#5C1E28', '#4A0E1C', '#2D0B11'],
  };

  const makeupTips = [
    { name: '眉毛', description: '輕描順貼，自然流暢' },
    { name: '眼妝', description: '眼尾微上揚，更顯精神' },
    { name: '腮紅', description: '橫向眼下，提升立體感' },
    { name: '唇妝', description: '水潤質地，更顯飽滿' },
  ];

  const jewelries = [
    {
      name: '珍珠',
      description: season.primarySeason === 'summer' || season.primarySeason === 'spring'
        ? '溫柔優雅'
        : '經典百搭',
      reason: season.primarySeason === 'winter' ? '冷色調珍珠更顯高級' : '提升氣質，柔和臉部線條',
      stars: season.primarySeason === 'summer' || season.primarySeason === 'spring' ? 5 : 4,
    },
    {
      name: '翡翠',
      description: '東方氣質',
      reason: season.primarySeason === 'autumn' ? '深綠與暖膚色相得益彰' : '溫婉知性，襯托氣質',
      stars: season.primarySeason === 'autumn' ? 5 : 4,
    },
    {
      name: '紅寶石',
      description: '氣色提亮',
      reason: season.primarySeason === 'winter' ? '強烈對比，氣場全開' : '顯白顯貴，點綴氣色',
      stars: season.primarySeason === 'winter' ? 5 : 4,
    },
    {
      name: '鑽石',
      description: '百搭高級',
      reason: '精緻閃耀，任何場合都適合',
      stars: 4,
    },
    {
      name: '黃金',
      description: season.primarySeason === 'spring' || season.primarySeason === 'autumn'
        ? '簡約溫暖'
        : '需注意搭配',
      reason:
        season.primarySeason === 'spring' || season.primarySeason === 'autumn'
          ? '暖色調肌膚的完美夥伴'
          : '款式不當易顯廉價',
      stars: season.primarySeason === 'spring' || season.primarySeason === 'autumn' ? 4 : 3,
    },
  ];

  return {
    features,
    makeupAdvices,
    baseColors: baseColorSets[season.primarySeason],
    eyeshadowColors: eyeshadowColorSets[season.primarySeason],
    lipColors: lipColorSets[season.primarySeason],
    makeupTips,
    jewelries,
    style: `${facialStyle}·提氣色·${season.keywords.slice(0, 2).join('·')}`,
  };
}
