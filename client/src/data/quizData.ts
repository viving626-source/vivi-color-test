import type { QuizDimension } from '@shared/api.interface';
import { QUIZ_IMAGES } from './quizImages';

export const quizDimensions: QuizDimension[] = [
  // ===== 1. 膚色底色冷暖（PCS第一軸） =====
  {
    id: 'skin-tone',
    name: '膚色底色冷暖',
    description:
      'PCS 十六型人格色彩分析第一軸——判斷你的皮膚底色是暖調、冷調還是中性，包含血管色觀察、金銀飾品測試、白布米布對比與日曬反應四大經典檢測。',
    questions: [
      {
        id: 'q1',
        text: '在自然光下觀察手腕內側血管，你的血管顏色整體偏向？',
        imageUrl: QUIZ_IMAGES['skin-tone-q1'],
        options: [
          {
            id: 'a',
            text: '偏橄欖綠／青綠色，暖調特徵明顯（暖黃皮／黃黑皮傾向）',
            imageUrl: QUIZ_IMAGES['skin-tone-q1-warm'],
            scoreSeason: { spring: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '偏藍紫色／深紫藍色，冷調特徵明顯（冷白皮／冷黃皮傾向）',
            imageUrl: QUIZ_IMAGES['skin-tone-q1-cool'],
            scoreSeason: { summer: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '綠色與藍紫色都有，比例接近，偏向中性調',
            imageUrl: QUIZ_IMAGES['skin-tone-q1-neutral'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '素顏狀態下將黃金飾品與白金色／銀色飾品分別放在臉頰旁，哪一種更襯你的氣色？',
        imageUrl: QUIZ_IMAGES['accessory-q1'],
        options: [
          {
            id: 'a',
            text: '黃金／玫瑰金更好看，膚色顯得紅潤透亮有光澤',
            imageUrl: QUIZ_IMAGES['accessory-q1-gold'],
            scoreSeason: { spring: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '銀色／白金色更好看，膚色顯得均勻乾淨又顯白',
            imageUrl: QUIZ_IMAGES['accessory-q1-silver'],
            scoreSeason: { summer: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '兩種都還可以，差異不算特別明顯',
            imageUrl: QUIZ_IMAGES['accessory-q1-rose'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '分別穿上純白色與米白色（杏色／奶茶白）上衣，哪一種更能提亮你的氣色？',
        imageUrl: QUIZ_IMAGES['skin-tone-q2'],
        options: [
          {
            id: 'a',
            text: '米白／奶白色更柔和，膚色看起來均勻且氣色紅潤',
            imageUrl: QUIZ_IMAGES['skin-tone-q2-beige'],
            scoreSeason: { spring: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '純白色更亮眼，膚色看起來通透乾淨有光澤',
            imageUrl: QUIZ_IMAGES['skin-tone-q2-white'],
            scoreSeason: { summer: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '兩者差不多，都不會特別踩雷或驚艷',
            imageUrl: QUIZ_IMAGES['skin-tone-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '戶外曝曬一天且沒有防曬的情況下，你的皮膚通常會有什麼反應？',
        imageUrl: QUIZ_IMAGES['skin-tone-q4'],
        options: [
          {
            id: 'a',
            text: '容易曬黑但不太會紅，屬於小麥色／黃黑皮體質',
            imageUrl: QUIZ_IMAGES['skin-tone-q4-dark'],
            scoreSeason: { spring: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '容易曬紅、發癢甚至脫皮，不太容易變黑',
            imageUrl: QUIZ_IMAGES['skin-tone-q4-light'],
            scoreSeason: { summer: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '先紅個一兩天，然後慢慢變成均勻的小麥色',
            imageUrl: QUIZ_IMAGES['skin-tone-q4-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 2. 明度深淺（PCS第二軸） =====
  {
    id: 'brightness',
    name: '明度深淺',
    description:
      'PCS 十六型人格色彩分析第二軸——從原生髮色、瞳孔深淺到整體穿搭適應度，判斷你適合淺色系還是深色系，定位你的「明度值」。',
    questions: [
      {
        id: 'q1',
        text: '你的原生髮色（完全沒染過、自然生長狀態）偏向哪一種？',
        imageUrl: QUIZ_IMAGES['hair-color-q1'],
        options: [
          {
            id: 'a',
            text: '淺棕／黃棕／栗褐色，整體顏色偏淺、明度高',
            imageUrl: QUIZ_IMAGES['hair-color-q1-light'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '深棕／自然黑，顏色很深、明度低',
            imageUrl: QUIZ_IMAGES['hair-color-q1-dark'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '中等棕色，不深也不淺，屬於中明度',
            imageUrl: QUIZ_IMAGES['hair-color-q1-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你的瞳孔顏色與眼白之間，整體明度對比感覺如何？',
        imageUrl: QUIZ_IMAGES['eye-q2'],
        options: [
          {
            id: 'a',
            text: '淺棕／琥珀／蜜茶色，整體明亮通透、明度高',
            imageUrl: QUIZ_IMAGES['eye-q2-big'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '深棕／純黑色，整體深邃濃重、明度低',
            imageUrl: QUIZ_IMAGES['eye-q2-small'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '中等棕色，不深不淺，屬於中明度',
            imageUrl: QUIZ_IMAGES['eye-q2-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '淺色整身（米白＋淺粉＋淺藍）與深色整身（黑色＋深灰＋深藍），哪一種整體更適合你？',
        imageUrl: QUIZ_IMAGES['color-preference-q3'],
        options: [
          {
            id: 'a',
            text: '淺色系更顯年輕、有精神，整個人提亮不少',
            imageUrl: QUIZ_IMAGES['color-preference-q3-light'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '深色系更顯氣質、有存在感，氣場更強',
            imageUrl: QUIZ_IMAGES['color-preference-q3-dark'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '深淺都能駕馭，差異不大',
            imageUrl: QUIZ_IMAGES['color-preference-q3-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你穿各種深淺的灰色系衣服，哪一種效果最好？',
        imageUrl: QUIZ_IMAGES['color-preference-q3'],
        options: [
          {
            id: 'a',
            text: '淺灰／銀灰色好看，深灰會顯得老氣沒精神',
            imageUrl: QUIZ_IMAGES['color-preference-q3-light'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '深炭灰／煙灰色好看，淺灰會顯得氣色不好',
            imageUrl: QUIZ_IMAGES['color-preference-q3-dark'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '灰色整體都不太適合我，容易顯得沒氣色',
            imageUrl: QUIZ_IMAGES['color-preference-q3-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 3. 彩度清濁（PCS第三軸） =====
  {
    id: 'chroma',
    name: '彩度清濁',
    description:
      'PCS 十六型人格色彩分析第三軸——判斷你適合「清」（鮮豔飽和、高彩度）還是「濁」（柔和灰調、低彩度）的顏色，這是區分春季／冬季與夏季／秋季的關鍵指標。',
    questions: [
      {
        id: 'q1',
        text: '你穿高彩度鮮豔色（正紅、寶藍、檸檬黃、橘紅）的整體效果如何？',
        imageUrl: QUIZ_IMAGES['color-preference-q2'],
        options: [
          {
            id: 'a',
            text: '非常好看，顯白又有精神，氣色瞬間加分（清色型）',
            imageUrl: QUIZ_IMAGES['color-preference-q2-vivid'],
            scoreSeason: { spring: 2, winter: 2 },
          },
          {
            id: 'b',
            text: '太誇張突兀，會顯得人很黑或很俗，駕馭不住（濁色型）',
            imageUrl: QUIZ_IMAGES['color-preference-q2-muted'],
            scoreSeason: { summer: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '要看是哪一種顏色，部分飽和色可以接受',
            imageUrl: QUIZ_IMAGES['color-preference-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '莫蘭迪色系／灰霧色／霧霾藍這類「加了灰」的低飽和顏色，給你的整體感覺是？',
        imageUrl: QUIZ_IMAGES['color-preference-q4'],
        options: [
          {
            id: 'a',
            text: '高級又好看，很襯我的氣質（濁色型）',
            imageUrl: QUIZ_IMAGES['color-preference-q2-muted'],
            scoreSeason: { summer: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '有點黯淡灰沉，穿了顯得沒精神、氣色差（清色型）',
            imageUrl: QUIZ_IMAGES['color-preference-q2-vivid'],
            scoreSeason: { spring: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '還好，沒什麼特別強烈的感覺',
            imageUrl: QUIZ_IMAGES['color-preference-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你的皮膚質感整體給人的「通透感」如何？（參考：玻璃肌 vs 絨霧肌）',
        imageUrl: QUIZ_IMAGES['skin-tone-q3'],
        options: [
          {
            id: 'a',
            text: '清澈透亮，像玻璃一樣乾淨有光澤（清質感）',
            imageUrl: QUIZ_IMAGES['color-preference-q2-vivid'],
            scoreSeason: { spring: 2, winter: 2 },
          },
          {
            id: 'b',
            text: '霧面啞光，呈現高級絨霧感／天鵝絨質感（濁質感）',
            imageUrl: QUIZ_IMAGES['color-preference-q2-muted'],
            scoreSeason: { summer: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '混合質感，T 字部位偏油、兩頰偏乾',
            imageUrl: QUIZ_IMAGES['color-preference-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你最常擦的口紅，整體色彩飽和度偏向哪一種？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q3'],
        options: [
          {
            id: 'a',
            text: '高飽和鮮豔款（正紅、番茄紅、辣椒紅），顏色很有存在感',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-glossy'],
            scoreSeason: { spring: 2, winter: 2 },
          },
          {
            id: 'b',
            text: '低飽和柔霧款（奶茶色、豆沙色、裸粉色），低調又有質感',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-matte'],
            scoreSeason: { summer: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '幾乎不擦口紅，只用潤唇膏或淡唇彩',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 4. 髮膚眼對比度（PCS第四軸） =====
  {
    id: 'contrast',
    name: '髮膚眼對比度',
    description:
      'PCS 十六型人格色彩分析第四軸——透過髮色與膚色的差距、眼白與瞳孔的反差、以及整體視覺重量感，判斷你是高對比型還是低對比型，這是冬季型人格的核心判斷依據。',
    questions: [
      {
        id: 'q1',
        text: '你的頭髮顏色與膚色之間的明暗差距有多大？',
        imageUrl: QUIZ_IMAGES['hair-color-q1'],
        options: [
          {
            id: 'a',
            text: '對比強烈，黑髮配白皮，反差非常明顯（高對比）',
            imageUrl: QUIZ_IMAGES['hair-color-q1-dark'],
            scoreSeason: { winter: 3 },
          },
          {
            id: 'b',
            text: '對比柔和，棕髮配淺膚，色調融為一體（低對比）',
            imageUrl: QUIZ_IMAGES['hair-color-q1-light'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1 },
          },
          {
            id: 'c',
            text: '中等對比，不會特別強烈也不會太柔和',
            imageUrl: QUIZ_IMAGES['hair-color-q1-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你的眼白與瞳孔對比有多明顯？（黑白分明 vs 朦朧柔和）',
        imageUrl: QUIZ_IMAGES['eye-q2'],
        options: [
          {
            id: 'a',
            text: '非常明顯，黑白分明，眼神銳利有神（高對比）',
            imageUrl: QUIZ_IMAGES['eye-q1-double'],
            scoreSeason: { winter: 3 },
          },
          {
            id: 'b',
            text: '比較柔和，棕褐色系，朦朧感強（低對比）',
            imageUrl: QUIZ_IMAGES['eye-q1-monolid'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1 },
          },
          {
            id: 'c',
            text: '一般般，不算特別強烈也不算太柔',
            imageUrl: QUIZ_IMAGES['eye-q1-hooded'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '拍照時，你在什麼樣的光線下最好看、最出片？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q4'],
        options: [
          {
            id: 'a',
            text: '強光／高對比光／硬光，立體感很強、非常出片',
            imageUrl: QUIZ_IMAGES['makeup-preference-q4-shadow'],
            scoreSeason: { winter: 3 },
          },
          {
            id: 'b',
            text: '柔光／勻淨的光／逆光，氣色與膚質看起來最棒',
            imageUrl: QUIZ_IMAGES['makeup-preference-q4-lash'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1 },
          },
          {
            id: 'c',
            text: '自然光下都還好，沒有特別明顯的差異',
            imageUrl: QUIZ_IMAGES['makeup-preference-q4-simple'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你穿「黑色上衣＋白色下裝」這種高反差黑白配的效果如何？',
        imageUrl: QUIZ_IMAGES['clothing-q1'],
        options: [
          {
            id: 'a',
            text: '驚艷有氣場，整個人都亮起來、非常有型',
            imageUrl: QUIZ_IMAGES['clothing-q1-basic'],
            scoreSeason: { winter: 3 },
          },
          {
            id: 'b',
            text: '太硬太利，顯得嚴肅又有距離感，不太適合',
            imageUrl: QUIZ_IMAGES['clothing-q1-earth'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1 },
          },
          {
            id: 'c',
            text: '還好，普通不出錯，也不會特別驚艷',
            imageUrl: QUIZ_IMAGES['clothing-q1-pastel'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 5. 五官量感診斷 =====
  {
    id: 'features',
    name: '五官量感診斷',
    description:
      '國內風格診斷體系的核心一環——從五官大小、眉毛型態、中庭比例到唇形，分析你的「量感」（大／中／小）與五官分布特徵，為後續風格定位提供基礎。',
    questions: [
      {
        id: 'q1',
        text: '你的五官整體給人的「量感」如何？（存在感強弱、大小比例）',
        imageUrl: QUIZ_IMAGES['eye-q1'],
        options: [
          {
            id: 'a',
            text: '精緻細小，柔和輕盈，量感偏小（小量感）',
            imageUrl: QUIZ_IMAGES['eye-q1-monolid'],
            scoreSeason: { summer: 2, spring: 2 },
          },
          {
            id: 'b',
            text: '立體大氣，存在感強，量感偏大（大量感）',
            imageUrl: QUIZ_IMAGES['eye-q1-double'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '中等勻稱，大小適中，量感適中（中量感）',
            imageUrl: QUIZ_IMAGES['eye-q1-hooded'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你的眉毛形狀與眉眼距（眉毛到眼睛的距離）給人的感覺是？',
        imageUrl: QUIZ_IMAGES['eye-q3'],
        options: [
          {
            id: 'a',
            text: '彎眉／柳葉眉，眉眼距偏寬，氣質溫和柔軟',
            imageUrl: QUIZ_IMAGES['eye-q1-monolid'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '劍眉／平直眉，眉眼距偏近，眼神銳利有勁',
            imageUrl: QUIZ_IMAGES['eye-q1-double'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '自然彎眉，眉眼距適中，沒有特別偏向',
            imageUrl: QUIZ_IMAGES['eye-q1-hooded'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你的中庭（眉峰到鼻底的距離）與整張臉的比例感覺如何？',
        imageUrl: QUIZ_IMAGES['bone-structure-q2'],
        options: [
          {
            id: 'a',
            text: '中庭偏短，嬰兒感強，看起來比實際年齡小（幼態感）',
            imageUrl: QUIZ_IMAGES['bone-structure-q2-short'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '中庭偏長，成熟感強，看起來比實際年齡大（成熟感）',
            imageUrl: QUIZ_IMAGES['bone-structure-q2-long'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '中庭比例勻稱，與上下庭協調適中',
            imageUrl: QUIZ_IMAGES['bone-structure-q2-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你的嘴唇厚度與唇形給人的感覺是？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q1'],
        options: [
          {
            id: 'a',
            text: '飽滿厚唇，唇形圓潤立體，量感偏大',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-glossy'],
            scoreSeason: { autumn: 2, spring: 2 },
          },
          {
            id: 'b',
            text: '薄唇精緻，唇峰明顯銳利，量感偏小',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-matte'],
            scoreSeason: { winter: 2, summer: 2 },
          },
          {
            id: 'c',
            text: '中等厚度，標準唇形，量感適中',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 6. 骨相與直曲診斷 =====
  {
    id: 'bone-structure',
    name: '骨相與直曲診斷',
    description:
      '法式 Colorimétrie 與國內風格診斷的重要維度——分析你的臉型骨骼、顴骨下頜線、面部留白與眼神銳度，判斷你屬於「直線型」「曲線型」還是「中間型」。',
    questions: [
      {
        id: 'q1',
        text: '你的顴骨與下頜線視覺上感覺如何？（骨骼感強弱）',
        imageUrl: QUIZ_IMAGES['bone-structure-q1'],
        options: [
          {
            id: 'a',
            text: '柔和流暢，線條圓潤，骨骼感弱（曲線型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q1-delicate'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '骨骼明顯，輪廓立體，稜角清楚（直線型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q1-strong'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '一般般，不算特別突出也不算太柔和（中間型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q1-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你的面部留白（五官分布的疏密程度與臉部空間感）如何？',
        imageUrl: QUIZ_IMAGES['bone-structure-q2'],
        options: [
          {
            id: 'a',
            text: '留白多，五官分散，空間感大（鬆散／長型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q2-long'],
            scoreSeason: { summer: 2, spring: 1 },
          },
          {
            id: 'b',
            text: '留白少，五官集中，飽滿緊湊（緊緻／短型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q2-short'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '勻稱適中，比例剛剛好（均衡型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q2-medium'],
            scoreSeason: { spring: 2, autumn: 1, summer: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你的臉型最接近哪一種？（直曲判斷的重要依據）',
        imageUrl: QUIZ_IMAGES['bone-structure-q3'],
        options: [
          {
            id: 'a',
            text: '鵝蛋臉／橢圓臉，線條流暢柔和（曲線型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q3-oval'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '方臉／菱形臉，下頜角或顴骨明顯（直線型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q3-square'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '圓臉／心形臉，線條圓潤飽滿（中間偏曲）',
            imageUrl: QUIZ_IMAGES['bone-structure-q3-round'],
            scoreSeason: { spring: 2, autumn: 1, summer: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你的眼神銳度與穿透力感覺如何？',
        imageUrl: QUIZ_IMAGES['bone-structure-q4'],
        options: [
          {
            id: 'a',
            text: '銳利有神，目光堅定有穿透力（直線型特徵）',
            imageUrl: QUIZ_IMAGES['bone-structure-q4-sharp'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '柔和朦朧，眼神溫柔有溫度（曲線型特徵）',
            imageUrl: QUIZ_IMAGES['bone-structure-q4-soft'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'c',
            text: '中等，有精神但不算特別銳利（中間型）',
            imageUrl: QUIZ_IMAGES['bone-structure-q4-medium'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 7. 妝容偏好 =====
  {
    id: 'makeup-preference',
    name: '妝容偏好',
    description:
      '從日常妝感濃度、唇妝顏色質地、腮紅畫法到眼妝重點，結合當下流行的奶茶色、豆沙色、番茄紅等高話題唇色，找出最適合你的妝容風格。',
    questions: [
      {
        id: 'q1',
        text: '你日常最常畫的妝容濃度與風格偏向？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q1'],
        options: [
          {
            id: 'a',
            text: '淡妝／素顏妝，隔離＋眉筆＋口紅，追求自然好氣色',
            imageUrl: QUIZ_IMAGES['makeup-preference-q1-natural'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '精緻全妝，粉底＋眼線＋修容＋唇妝一應俱全',
            imageUrl: QUIZ_IMAGES['makeup-preference-q1-full'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '看心情／場合，淡妝與全妝都會畫',
            imageUrl: QUIZ_IMAGES['makeup-preference-q1-mood'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你最常擦的口紅顏色偏向哪一類？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q2'],
        options: [
          {
            id: 'a',
            text: '元氣亮色款（番茄紅、珊瑚橘、蜜桃粉），活潑減齡',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-glossy'],
            scoreSeason: { spring: 2, summer: 1 },
          },
          {
            id: 'b',
            text: '氣質柔霧款（奶茶色、豆沙色、紅棕玫瑰），低調高級',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-matte'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '都喜歡，按穿搭與場合更換顏色',
            imageUrl: QUIZ_IMAGES['makeup-preference-q2-both'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '腮紅你更傾向於哪一種畫法與色調？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q3'],
        options: [
          {
            id: 'a',
            text: '粉嫩元氣款，蘋果肌位置，減齡可愛（粉／橘色系）',
            imageUrl: QUIZ_IMAGES['makeup-preference-q3-pink'],
            scoreSeason: { spring: 2, summer: 1 },
          },
          {
            id: 'b',
            text: '收斂氣質款，顴骨下側打，當修容用（棕／奶茶色系）',
            imageUrl: QUIZ_IMAGES['makeup-preference-q3-contour'],
            scoreSeason: { autumn: 2, winter: 1 },
          },
          {
            id: 'c',
            text: '幾乎不畫腮紅，覺得可有可無',
            imageUrl: QUIZ_IMAGES['makeup-preference-q3-none'],
            scoreSeason: { winter: 2, summer: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '眼妝你最看重什麼效果與風格？',
        imageUrl: QUIZ_IMAGES['makeup-preference-q4'],
        options: [
          {
            id: 'a',
            text: '睫毛翹＋眼線簡單，清新有神、乾淨利落',
            imageUrl: QUIZ_IMAGES['makeup-preference-q4-lash'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '眼影層次＋眼線＋臥蠶，精緻濃郁、氛圍感強',
            imageUrl: QUIZ_IMAGES['makeup-preference-q4-shadow'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '簡單為主，有精神就好，不講究太多細節',
            imageUrl: QUIZ_IMAGES['makeup-preference-q4-simple'],
            scoreSeason: { spring: 1, summer: 1, autumn: 1, winter: 1 },
          },
        ],
      },
    ],
  },

  // ===== 8. 髮型偏好 =====
  {
    id: 'hairstyle-preference',
    name: '髮型偏好',
    description:
      '從長度、捲度、髮色到瀏海，結合法式慵懶捲、韓系層次剪、羊毛卷等當下流行趨勢，全方位定位最適合你的理想髮型。',
    questions: [
      {
        id: 'q1',
        text: '你最喜歡且最常留的頭髮長度是？',
        imageUrl: QUIZ_IMAGES['hairstyle-preference-q1'],
        options: [
          {
            id: 'a',
            text: '長髮，過胸或更長，飄逸有女人味',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q1-long'],
            scoreSeason: { summer: 2, autumn: 2, spring: 1 },
          },
          {
            id: 'b',
            text: '中長髮，鎖骨至胸上之間，優雅減齡',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q1-medium'],
            scoreSeason: { spring: 2, summer: 2, autumn: 1 },
          },
          {
            id: 'c',
            text: '短髮，耳下到下巴之間，俐落有型',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q1-short'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你更偏好哪一種捲度或直髮風格？',
        imageUrl: QUIZ_IMAGES['hairstyle-preference-q2'],
        options: [
          {
            id: 'a',
            text: '自然直髮或輕微內彎，簡單乾淨有質感',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q2-straight'],
            scoreSeason: { winter: 2, summer: 1 },
          },
          {
            id: 'b',
            text: '法式慵懶大捲／羊毛捲／芭比燙，氛圍感滿分',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q2-wave'],
            scoreSeason: { autumn: 2, spring: 2, summer: 1 },
          },
          {
            id: 'c',
            text: '微捲／層次剪／髮尾C彎，自然好整理',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q2-mild'],
            scoreSeason: { spring: 2, summer: 2 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你理想中的髮色偏向哪一種風格？',
        imageUrl: QUIZ_IMAGES['hairstyle-preference-q3'],
        options: [
          {
            id: 'a',
            text: '自然黑／深棕／黑茶色，低調有質感',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q3-dark'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '栗棕／奶茶棕／亞麻棕，溫柔有氣質',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q3-brown'],
            scoreSeason: { autumn: 2, summer: 2 },
          },
          {
            id: 'c',
            text: '淺金色／粉棕／極淺色，時髦有個性',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q3-light'],
            scoreSeason: { spring: 2, summer: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你最喜歡且最適合你的瀏海款式是？',
        imageUrl: QUIZ_IMAGES['hairstyle-preference-q4'],
        options: [
          {
            id: 'a',
            text: '八字瀏海／空氣瀏海／胎毛瀏海，溫柔修飾臉型',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q4-side'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '齊瀏海／漫畫瀏海／一刀剪，減齡可愛',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q4-bangs'],
            scoreSeason: { spring: 1, winter: 1 },
          },
          {
            id: 'c',
            text: '無瀏海／大旁分／all back，大氣清爽',
            imageUrl: QUIZ_IMAGES['hairstyle-preference-q4-none'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
        ],
      },
    ],
  },

  // ===== 9. 珠寶配飾偏好 =====
  {
    id: 'jewelry',
    name: '珠寶配飾偏好',
    description:
      '從飾品材質偏好、耳環款式、項鍊風格到寶石吸引力，發掘最襯你的配飾語言，為整體造型畫龍點睛。',
    questions: [
      {
        id: 'q1',
        text: '你更偏好什麼材質的首飾？（日常最常配戴的類型）',
        imageUrl: QUIZ_IMAGES['jewelry-q1'],
        options: [
          {
            id: 'a',
            text: '珍珠／貝殼／玉石類，溫潤有光澤',
            imageUrl: QUIZ_IMAGES['jewelry-q1-pearl'],
            scoreSeason: { summer: 2, spring: 2 },
          },
          {
            id: 'b',
            text: '黃金／玫瑰金／K金類，華麗有質感',
            imageUrl: QUIZ_IMAGES['jewelry-q1-gold'],
            scoreSeason: { autumn: 2, spring: 2 },
          },
          {
            id: 'c',
            text: '銀色／白金色／鉑金類，冷冽高級',
            imageUrl: QUIZ_IMAGES['jewelry-q1-silver'],
            scoreSeason: { winter: 2, summer: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你偏好的耳環風格與大小是？',
        imageUrl: QUIZ_IMAGES['jewelry-q2'],
        options: [
          {
            id: 'a',
            text: '小耳釘／精緻款，低調不張揚（小量感）',
            imageUrl: QUIZ_IMAGES['jewelry-q2-stud'],
            scoreSeason: { summer: 2, spring: 1 },
          },
          {
            id: 'b',
            text: '垂墜款／圈圈耳環／有存在感款，氣場十足（大量感）',
            imageUrl: QUIZ_IMAGES['jewelry-q2-dangle'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'c',
            text: '珍珠耳環／鋯石款，優雅百搭（中量感）',
            imageUrl: QUIZ_IMAGES['jewelry-q2-pearl'],
            scoreSeason: { spring: 2, summer: 2 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你常戴項鍊嗎？偏好什麼款式與長度？',
        imageUrl: QUIZ_IMAGES['jewelry-q3'],
        options: [
          {
            id: 'a',
            text: '細鏈小鑽款，低調精緻，適合日常',
            imageUrl: QUIZ_IMAGES['jewelry-q3-delicate'],
            scoreSeason: { summer: 2, winter: 1 },
          },
          {
            id: 'b',
            text: '珍珠項鍊／硬幣項鍊，優雅有氣質',
            imageUrl: QUIZ_IMAGES['jewelry-q3-pearl-necklace'],
            scoreSeason: { spring: 2, autumn: 1 },
          },
          {
            id: 'c',
            text: '很少戴項鍊，覺得麻煩或多餘',
            imageUrl: QUIZ_IMAGES['jewelry-q3-rarely'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '寶石與珍貴石材中，你最被哪一種視覺吸引？',
        imageUrl: QUIZ_IMAGES['jewelry-q4'],
        options: [
          {
            id: 'a',
            text: '珍珠／翡翠／瑪瑙，溫潤內斂有東方美',
            imageUrl: QUIZ_IMAGES['jewelry-q4-pearl-jade'],
            scoreSeason: { spring: 2, summer: 2, autumn: 1 },
          },
          {
            id: 'b',
            text: '紅寶石／藍寶石／祖母綠，濃郁大氣有份量',
            imageUrl: QUIZ_IMAGES['jewelry-q4-ruby-sapphire'],
            scoreSeason: { winter: 2, autumn: 2 },
          },
          {
            id: 'c',
            text: '鑽石／鋯石／水晶，閃耀通透有光芒',
            imageUrl: QUIZ_IMAGES['jewelry-q4-diamond'],
            scoreSeason: { winter: 2, summer: 1 },
          },
        ],
      },
    ],
  },

  // ===== 10. 衣著風格偏好 =====
  {
    id: 'clothing',
    name: '衣著風格偏好',
    description:
      '從衣櫃色彩構成、面料質感到版型風格，結合近年火紅的多巴胺穿搭、美拉德風、格雷系等流行趨勢，完整勾勒你的穿搭 DNA。',
    questions: [
      {
        id: 'q1',
        text: '你的衣櫃裡數量最多的顏色系是？',
        imageUrl: QUIZ_IMAGES['clothing-q1'],
        options: [
          {
            id: 'a',
            text: '黑／白／灰基本款（格雷系／極簡風）',
            imageUrl: QUIZ_IMAGES['clothing-q1-basic'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
          {
            id: 'b',
            text: '米色／咖色／大地色系（美拉德／焦糖系）',
            imageUrl: QUIZ_IMAGES['clothing-q1-earth'],
            scoreSeason: { autumn: 2, spring: 2 },
          },
          {
            id: 'c',
            text: '粉色／藍色／馬卡龍色系（多巴胺／甜美系）',
            imageUrl: QUIZ_IMAGES['clothing-q1-pastel'],
            scoreSeason: { spring: 2, summer: 2 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你更喜歡什麼質感與觸感的面料？',
        imageUrl: QUIZ_IMAGES['clothing-q2'],
        options: [
          {
            id: 'a',
            text: '針織／毛呢／天鵝絨，柔軟有溫度',
            imageUrl: QUIZ_IMAGES['clothing-q2-knit'],
            scoreSeason: { autumn: 2, spring: 2 },
          },
          {
            id: 'b',
            text: '真絲／雪紡／緞面，飄逸輕薄有光澤',
            imageUrl: QUIZ_IMAGES['clothing-q2-silk'],
            scoreSeason: { summer: 2, spring: 1 },
          },
          {
            id: 'c',
            text: '西裝料／牛仔／皮革，挺括有型',
            imageUrl: QUIZ_IMAGES['clothing-q2-suit'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你更偏好什麼版型的衣服？（鬆緊合身度）',
        imageUrl: QUIZ_IMAGES['clothing-q3'],
        options: [
          {
            id: 'a',
            text: '寬鬆 Oversize，舒適隨性，不羈束',
            imageUrl: QUIZ_IMAGES['clothing-q3-oversize'],
            scoreSeason: { autumn: 1, spring: 1 },
          },
          {
            id: 'b',
            text: '修身顯身材，線條俐落，凸顯曲線',
            imageUrl: QUIZ_IMAGES['clothing-q3-slim'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
          {
            id: 'c',
            text: '合身適中，H 型或 X 型，經典不敗款',
            imageUrl: QUIZ_IMAGES['clothing-q3-classic'],
            scoreSeason: { summer: 2, spring: 2 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你平常最常穿的整體穿搭風格偏向？',
        imageUrl: QUIZ_IMAGES['clothing-q4'],
        options: [
          {
            id: 'a',
            text: '韓系簡約／休閒舒適風，輕鬆自在',
            imageUrl: QUIZ_IMAGES['clothing-q4-casual'],
            scoreSeason: { spring: 2, summer: 1 },
          },
          {
            id: 'b',
            text: '法式慵懶／優雅知性風，得體大方',
            imageUrl: QUIZ_IMAGES['clothing-q4-elegant'],
            scoreSeason: { autumn: 2, summer: 2 },
          },
          {
            id: 'c',
            text: '御姐幹練／時髦個性風，與眾不同',
            imageUrl: QUIZ_IMAGES['clothing-q4-edgy'],
            scoreSeason: { winter: 2, spring: 1 },
          },
        ],
      },
    ],
  },

  // ===== 11. 氣場與場合穿搭 =====
  {
    id: 'aura',
    name: '氣場與場合穿搭',
    description:
      '從第一印象、重要場合穿搭、日常被誇獎的特質到理想自我形象，進行場合化穿搭分析，解讀你獨特的氣質與個人魅力。',
    questions: [
      {
        id: 'q1',
        text: '朋友第一次見到你，通常的第一印象是？',
        imageUrl: QUIZ_IMAGES['aura-q1'],
        options: [
          {
            id: 'a',
            text: '溫柔好親近，笑起來很甜，沒有距離感',
            imageUrl: QUIZ_IMAGES['aura-q1-gentle'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '高冷有氣場，不太敢主動搭話，有距離感',
            imageUrl: QUIZ_IMAGES['aura-q1-cool'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
          {
            id: 'c',
            text: '知性優雅，看起來很有內涵與教養',
            imageUrl: QUIZ_IMAGES['aura-q1-intellectual'],
            scoreSeason: { autumn: 2, summer: 1 },
          },
        ],
      },
      {
        id: 'q2',
        text: '參加重要聚會或晚宴，你會選擇什麼樣的穿搭風格？',
        imageUrl: QUIZ_IMAGES['aura-q2'],
        options: [
          {
            id: 'a',
            text: '優雅得體款，不搶鏡但越看越有味道',
            imageUrl: QUIZ_IMAGES['aura-q2-elegant'],
            scoreSeason: { summer: 2, autumn: 2 },
          },
          {
            id: 'b',
            text: '驚艷全場款，華麗閃耀，成為全場焦點',
            imageUrl: QUIZ_IMAGES['aura-q2-stunning'],
            scoreSeason: { winter: 2, spring: 1 },
          },
          {
            id: 'c',
            text: '甜美可愛款，元氣滿滿，很有活力',
            imageUrl: QUIZ_IMAGES['aura-q2-sweet'],
            scoreSeason: { spring: 2, summer: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你最常被別人誇獎的是什麼？（選最常聽到的一項）',
        imageUrl: QUIZ_IMAGES['aura-q3'],
        options: [
          {
            id: 'a',
            text: '氣質很好／很有內涵／舉止得體',
            imageUrl: QUIZ_IMAGES['aura-q3-temperament'],
            scoreSeason: { autumn: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '長得漂亮／很可愛／笑容很甜',
            imageUrl: QUIZ_IMAGES['aura-q3-pretty'],
            scoreSeason: { spring: 2, winter: 1 },
          },
          {
            id: 'c',
            text: '很有個性／很酷／穿衣風格獨特',
            imageUrl: QUIZ_IMAGES['aura-q3-cool'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '你理想中的自己，最接近以下哪一種形象？',
        imageUrl: QUIZ_IMAGES['aura-q4'],
        options: [
          {
            id: 'a',
            text: '溫柔從容的氣質姐姐，優雅又有底蘊',
            imageUrl: QUIZ_IMAGES['aura-q4-gentle-sister'],
            scoreSeason: { autumn: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '元氣甜美的陽光少女，永遠保持熱情',
            imageUrl: QUIZ_IMAGES['aura-q4-sweet-girl'],
            scoreSeason: { spring: 2, summer: 1 },
          },
          {
            id: 'c',
            text: '獨立颯爽的大女主，自信強大有氣場',
            imageUrl: QUIZ_IMAGES['aura-q4-queen'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
    ],
  },

  // ===== 12. 整體風格定位 =====
  {
    id: 'style',
    name: '整體風格定位',
    description:
      '從穿搭美學偏好、生活型態、品牌選擇到選衣價值觀，最終定位你的整體風格走向——韓系、法式、御姐、文青，找出最適合你的時尚坐標。',
    questions: [
      {
        id: 'q1',
        text: '你最喜歡且最常參考的穿搭風格是？',
        imageUrl: QUIZ_IMAGES['style-q1'],
        options: [
          {
            id: 'a',
            text: '韓系簡約溫柔風，清新減齡、顏值優先',
            imageUrl: QUIZ_IMAGES['style-q1-korean'],
            scoreSeason: { spring: 2, summer: 2 },
          },
          {
            id: 'b',
            text: '法式隨性慵懶風，毫不費力的優雅',
            imageUrl: QUIZ_IMAGES['style-q1-french'],
            scoreSeason: { summer: 2, autumn: 1 },
          },
          {
            id: 'c',
            text: '御姐知性姐姐風，成熟大氣有氣場',
            imageUrl: QUIZ_IMAGES['style-q1-mature'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
        ],
      },
      {
        id: 'q2',
        text: '你更嚮往哪一種生活美學與氛圍感？',
        imageUrl: QUIZ_IMAGES['style-q2'],
        options: [
          {
            id: 'a',
            text: '精緻優雅，處處有儀式感，重視生活品質',
            imageUrl: QUIZ_IMAGES['style-q2-elegant'],
            scoreSeason: { autumn: 2, spring: 1 },
          },
          {
            id: 'b',
            text: '自然舒適，簡單純粹就好，崇尚自在',
            imageUrl: QUIZ_IMAGES['style-q2-natural'],
            scoreSeason: { summer: 2, spring: 2 },
          },
          {
            id: 'c',
            text: '時髦前衛，有自己的態度，不喜歡撞款',
            imageUrl: QUIZ_IMAGES['style-q2-edgy'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
      {
        id: 'q3',
        text: '你最常光顧的服裝品牌或店鋪類型是？',
        imageUrl: QUIZ_IMAGES['style-q3'],
        options: [
          {
            id: 'a',
            text: '輕奢／設計師品牌，看重質感與剪裁',
            imageUrl: QUIZ_IMAGES['style-q3-luxury'],
            scoreSeason: { autumn: 2, winter: 2 },
          },
          {
            id: 'b',
            text: '平價快時尚，流行多變、價格親民',
            imageUrl: QUIZ_IMAGES['style-q3-fast-fashion'],
            scoreSeason: { spring: 2, summer: 1 },
          },
          {
            id: 'c',
            text: '小眾文青／原創設計，有特色、不容易撞衫',
            imageUrl: QUIZ_IMAGES['style-q3-niche'],
            scoreSeason: { summer: 2, spring: 1 },
          },
        ],
      },
      {
        id: 'q4',
        text: '選衣服時，你最看重的第一考量是什麼？',
        imageUrl: QUIZ_IMAGES['style-q4'],
        options: [
          {
            id: 'a',
            text: '款式好不好看、夠不夠時髦，顏值優先',
            imageUrl: QUIZ_IMAGES['style-q4-style-first'],
            scoreSeason: { spring: 2, winter: 1 },
          },
          {
            id: 'b',
            text: '面料質感與版型剪裁，重視穿著體驗',
            imageUrl: QUIZ_IMAGES['style-q4-fabric'],
            scoreSeason: { autumn: 2, summer: 2 },
          },
          {
            id: 'c',
            text: '百搭實用性，衣櫃裡好搭配最重要',
            imageUrl: QUIZ_IMAGES['style-q4-versatile'],
            scoreSeason: { winter: 2, autumn: 1 },
          },
        ],
      },
    ],
  },
];
