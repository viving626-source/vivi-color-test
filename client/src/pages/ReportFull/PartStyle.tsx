import { Image } from '@/components/ui/image';
import { REPORT_IMAGES } from '@client/src/data/quizImages';
import type { StyleResult, ClothingCategory } from '@shared/api.interface';

const SUBSTYLE_IMAGES: string[] = [
  REPORT_IMAGES.styleKorean,
  REPORT_IMAGES.styleFrench,
  REPORT_IMAGES.styleMature,
  REPORT_IMAGES.styleSweet,
  REPORT_IMAGES.styleRetro,
  REPORT_IMAGES.styleMinimal,
];

const RECOMMENDED_ITEM_IMAGES: string[] = [
  REPORT_IMAGES.recommendedItems,
  REPORT_IMAGES.fabricCollection,
  REPORT_IMAGES.styleKorean,
  REPORT_IMAGES.styleFrench,
  REPORT_IMAGES.styleMinimal,
  REPORT_IMAGES.styleSweet,
  REPORT_IMAGES.styleRetro,
  REPORT_IMAGES.styleMature,
];

const CLOTHING_CATEGORY_IMAGES: string[] = [
  REPORT_IMAGES.styleKorean,
  REPORT_IMAGES.styleFrench,
  REPORT_IMAGES.styleMature,
  REPORT_IMAGES.styleSweet,
  REPORT_IMAGES.styleRetro,
  REPORT_IMAGES.styleMinimal,
  REPORT_IMAGES.fabricCollection,
  REPORT_IMAGES.recommendedItems,
];

interface PartStyleProps {
  style: StyleResult;
}

const PartStyle = ({ style }: PartStyleProps) => {
  const {
    mainStyle,
    subStyles,
    keywords,
    checklist,
    colorPalette,
    clothingCategories,
    recommendedItems,
    beautyGuide,
    closingQuote,
  } = style;

  const getLevelInfo = (level: ClothingCategory['level']) => {
    switch (level) {
      case 'recommend':
        return { icon: '☑', color: 'text-burgundy', label: '推薦', bg: 'bg-burgundy/10' };
      case 'normal':
        return { icon: '○', color: 'text-muted-foreground', label: '普通', bg: 'bg-muted/20' };
      case 'not-recommend':
        return { icon: '✕', color: 'text-destructive', label: '不建議', bg: 'bg-destructive/10' };
    }
  };

  return (
    <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 md:p-10">
      {/* PART label */}
      <div className="mb-8">
        <span className="bg-burgundy text-white rounded-full px-4 py-1.5 text-sm uppercase tracking-wider inline-block">
          PART 5 · 風格定位 &amp; 整體建議
        </span>
      </div>

      {/* 4.1 风格定位总览 */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-burgundy via-burgundy/95 to-rose-dust rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-200 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-rose-300 blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">
              Your Style Identity
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {mainStyle}
            </h1>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-medium border border-white/30"
                >
                  ♡ {keyword}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 text-white/80 text-sm">
              <span>主風格</span>
              <span className="w-8 h-px bg-white/40" />
              <span>副風格</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5.1 多元风格配图 6种 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            01
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">多元風格演繹</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          風格不應被定義。除了你的主風格之外，以下 6 種風格你也可以輕鬆駕馭，
          根據場合與心情切換，展現百變魅力。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subStyles.slice(0, 6).map((sub, index) => {
            const matchPercent = [92, 85, 78, 72, 68, 60][index] || 70;
            return (
              <div
                key={index}
                className="bg-cream rounded-xl border border-border overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <Image
                    src={SUBSTYLE_IMAGES[index % SUBSTYLE_IMAGES.length]}
                    alt={`風格 ${index + 1}：${sub.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-8">
                    <div className="flex items-end justify-between">
                      <h4 className="text-white font-serif font-bold text-lg drop-shadow-md">
                        {sub.name}
                      </h4>
                      <span className="text-white/90 text-xs font-medium bg-burgundy/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                        匹配 {matchPercent}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sub.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5.2 造型 Checklist */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            02
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">造型必備清單</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklist.map((cat, index) => (
            <div
              key={index}
              className="bg-cream rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
            >
              <h3 className="font-serif text-lg font-semibold text-burgundy mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-burgundy text-white flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {cat.category}
              </h3>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-gold-brown text-sm flex-shrink-0 mt-0.5">☑</span>
                    <span className="text-sm text-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5.3 推荐色系 HEX */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            03
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">推薦穿搭色系</h2>
        </div>

        {/* 推荐色系 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-burgundy mb-3 flex items-center gap-2">
            <span>✦</span> 推薦色系（8 色）
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {colorPalette.slice(0, 8).map((color, index) => {
              const isLight = /^#[0-9a-fA-F]{6}$/.test(color.mainColor)
                ? parseInt(color.mainColor.slice(1), 16) > 0xcccccc
                : true;
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg border border-border/60 shadow-sm mb-1 flex items-end justify-center pb-1"
                    style={{ backgroundColor: color.mainColor }}
                  >
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        isLight ? 'text-foreground/70 bg-white/70' : 'text-white bg-black/20'
                      }`}
                    >
                      {color.mainColor.slice(1).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground truncate">{color.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 慎选色系 */}
        <div>
          <h3 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
            <span>✕</span> 慎選色系（4 色）
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {colorPalette.slice(8, 12).map((color, index) => {
              const actualColor = color.mainColor || '#888888';
              return (
                <div key={index} className="text-center opacity-70">
                  <div
                    className="w-full aspect-square rounded-lg border border-border/60 shadow-sm mb-1 relative"
                    style={{ backgroundColor: actualColor }}
                  >
                    <span className="absolute top-1 right-1 text-white text-[10px] bg-black/50 rounded px-1">
                      ✕
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{color.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5.4 穿搭推荐三档 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            04
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">穿搭風格鑑定</h2>
        </div>

        <div className="space-y-6">
          {clothingCategories.map((cat, catIndex) => {
            const info = getLevelInfo(cat.level);
            return (
              <div key={catIndex}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xl ${info.color}`}>{info.icon}</span>
                  <h3 className={`font-serif text-xl font-bold ${info.color}`}>{info.label}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${info.bg} ${info.color}`}>
                    {cat.level === 'recommend' ? '輕鬆駕馭' : cat.level === 'normal' ? '尚可' : '雷區'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cat.items.slice(0, cat.level === 'recommend' ? 4 : 2).map((item, itemIndex) => {
                    const globalIndex = catIndex * 4 + itemIndex;
                    return (
                      <div
                        key={itemIndex}
                        className="bg-cream rounded-xl border border-border overflow-hidden text-center group hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-[3/4] overflow-hidden">
                          <Image
                            src={CLOTHING_CATEGORY_IMAGES[globalIndex % CLOTHING_CATEGORY_IMAGES.length]}
                            alt={`${cat.level === 'recommend' ? '推薦' : cat.level === 'normal' ? '普通' : '雷區'}穿搭 ${itemIndex + 1}：${item.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 25vw, 150px"
                        />
                      </div>
                      <div className="p-3">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5.5 推荐单品配图 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            05
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">必備單品推薦</h2>
        </div>

        <div className="rounded-xl overflow-hidden border border-border mb-4 aspect-[21/9]">
          <Image
            src={REPORT_IMAGES.recommendedItems}
            alt="單品推薦"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          衣櫃裡的經典不敗款，擁有這些基礎單品，就能輕鬆搭配出百變造型。
          件件實穿、樣樣百搭，是每個精緻女孩的必備戰袍。
        </p>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {recommendedItems.slice(0, 8).map((item, index) => (
            <div
              key={index}
              className="bg-cream rounded-xl border border-border overflow-hidden text-center hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={RECOMMENDED_ITEM_IMAGES[index % RECOMMENDED_ITEM_IMAGES.length]}
                  alt={`必備單品 ${index + 1}：${item.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 25vw, 120px"
                />
              </div>
              <div className="p-2">
                <span className="text-xs font-medium text-foreground">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5.6 變美指南四欄 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            06
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">你的專屬變美指南</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {beautyGuide.map((guide, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-burgundy/5 to-cream rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-burgundy text-white flex items-center justify-center text-lg font-serif font-bold mb-2">
                  {index + 1}
                </div>
                <h3 className="font-serif text-lg font-bold text-burgundy">{guide.category}</h3>
              </div>
              <div className="space-y-2">
                {guide.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-gold-brown text-xs flex-shrink-0 mt-0.5">☑</span>
                    <span className="text-xs text-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5.7 结尾金句 */}
      <section>
        <div className="bg-gradient-to-br from-cream via-burgundy/5 to-rose-dust/10 rounded-2xl p-8 md:p-12 text-center border border-burgundy/10 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-6xl font-serif text-burgundy/10 leading-none select-none">
            "
          </div>
          <div className="absolute bottom-4 right-4 text-6xl font-serif text-burgundy/10 leading-none select-none rotate-180">
            "
          </div>
          <div className="relative">
            <p className="font-serif text-2xl md:text-3xl text-burgundy leading-relaxed mb-6 italic">
              {closingQuote}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-burgundy/30" />
              <div className="font-serif text-lg font-bold text-burgundy">Vivi Macau</div>
              <span className="w-12 h-px bg-burgundy/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              你的專屬色彩與風格顧問
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartStyle;
