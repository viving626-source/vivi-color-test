export interface StyleDef {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export function buildStylePrompt(typeName: string): Record<string, StyleDef> {
  return {
    korean: {
      id: 'korean',
      name: '韓系輕熟',
      description: '清透裸妝、空氣感瀏海、奶茶棕髮色、溫柔優雅穿搭',
      prompt: `韓系輕熟女風格改造。人物為${typeName}季型。
- 妝容：清透無瑕底妝，奶茶色調眼影，自然臥蠶，玫瑰豆沙色脣膏，腮紅位置偏高營造減齡效果
- 髮型髮色：空氣感八字瀏海，大波浪或層次剪，奶茶棕/焦糖棕髮色，髮絲柔順有光澤
- 穿搭：溫柔系針織衫、米杏色風衣、高腰寬褲或長裙，鬆弛感極簡風格
- 色系：奶油米白、奶茶棕、豆沙粉、駝色系
- 整體氛圍：溫柔知性、韓劇女主感、柔光、高級畫報質感
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
    },
    french: {
      id: 'french',
      name: '法式溫柔',
      description: '慵懶隨性、紅唇標誌、微亂長髮、復古優雅穿搭',
      prompt: `法式慵懶優雅風格改造。人物為${typeName}季型。
- 妝容：自然霧面底妝，精緻眼線，標誌性勃艮第紅/楓葉紅脣膏，腮紅低位置營造成熟感
- 髮型髮色：法式微亂長髮或及肩髮，自然蓬鬆感，深棕/亞麻棕/蜜茶棕髮色
- 穿搭：白襯衫、針織開衫、高腰直筒牛仔褲、風衣、樂福鞋，簡約而有質感
- 色系：米白、焦糖棕、勃艮第紅、駝色、藏青
- 整體氛圍：慵懶隨性、巴黎街頭感、電影質感、自然光
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
    },
    mature: {
      id: 'mature',
      name: '職場知性',
      description: '幹練大氣、精緻職場妝、短髮或低馬尾、西裝套裝',
      prompt: `職場知性禦姐風格改造。人物為${typeName}季型。
- 妝容：精緻職場妝，乾淨底妝，大地色眼線加強眼神，磚紅/梅子色調脣膏，氣場全開
- 髮型髮色：齊肩短髮或低馬尾/低盤髮，深棕/黑茶色髮色，乾淨利落
- 穿搭：合身西裝套裝、真絲襯衫、鉛筆裙、高跟鞋，專業幹練有氣場
- 色系：黑白灰、藏青、酒紅、橄欖綠、米駝
- 整體氛圍：專業自信、大氣從容、高級寫真質感、柔光棚拍
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
    },
    sweet: {
      id: 'sweet',
      name: '甜美減齡',
      description: '粉嫩系妝容、空氣感捲髮、娃娃裙/針織、軟糯甜美',
      prompt: `甜美減齡風格改造。人物為${typeName}季型。
- 妝容：粉嫩系妝容，膨潤蘋果肌腮紅，粉色/蜜桃色眼影，果汁感脣釉，無辜大眼效果
- 髮型髮色：空氣感羊毛捲/蛋捲頭，齊瀏海，淺棕/蜜桃棕/奶茶金髮色
- 穿搭：粉色系針織衫、娃娃領襯衫、百褶裙、A字短裙，軟糯甜美
- 色系：粉色、奶白、淡紫、鵝黃、蜜桃色
- 整體氛圍：甜美可愛、少女感、柔光、清新畫報
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
    },
  };
}

export function listStyles(): StyleDef[] {
  const m = buildStylePrompt('個人色彩風格');
  return ['korean', 'french', 'mature', 'sweet'].map((k) => {
    const s = m[k];
    return { id: s.id, name: s.name, description: s.description, prompt: s.prompt };
  });
}
