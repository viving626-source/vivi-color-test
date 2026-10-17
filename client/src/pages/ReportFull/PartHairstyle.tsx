import { Image } from '@/components/ui/image';
import { REPORT_IMAGES } from '@client/src/data/quizImages';
import type { HairstyleResult, HairstyleItem, HairColorItem } from '@shared/api.interface';

const HAIRSTYLE_IMAGES: string[] = [
  REPORT_IMAGES.hairstyleCollection,
  REPORT_IMAGES.longShortHair,
  REPORT_IMAGES.straightWaveHair,
  REPORT_IMAGES.lightDarkHair,
  REPORT_IMAGES.faceShape,
  REPORT_IMAGES.hairColorCollection,
];

const HAIR_COLOR_IMAGES: string[] = [
  REPORT_IMAGES.hairColorCollection,
  REPORT_IMAGES.lightDarkHair,
  REPORT_IMAGES.warmCoolPalette,
  REPORT_IMAGES.hairstyleCollection,
  REPORT_IMAGES.longShortHair,
  REPORT_IMAGES.straightWaveHair,
];

interface PartHairstyleProps {
  hairstyle: HairstyleResult;
}

const PartHairstyle = ({ hairstyle }: PartHairstyleProps) => {
  const {
    hairstyles,
    hairColors,
    keyPoints,
    avoidColors,
    blowDryTips,
    careTips,
    summary,
  } = hairstyle;

  const HairstyleCard = ({ item, rank, index }: { item: HairstyleItem; rank: number; index: number }) => (
    <div className="bg-cream rounded-xl border border-border overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] overflow-hidden relative">
        <Image
          src={HAIRSTYLE_IMAGES[index % HAIRSTYLE_IMAGES.length]}
          alt={`推薦髮型 ${rank}：${item.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 33vw, 200px"
        />
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold shadow-md">
          {rank}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-serif text-base font-semibold text-foreground mb-1">{item.name}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
    </div>
  );

  const HairColorCard = ({ item, rank, index }: { item: HairColorItem; rank: number; index: number }) => {
    const isLight = /^#[0-9a-fA-F]{6}$/.test(item.colorHex)
      ? parseInt(item.colorHex.slice(1), 16) > 0xaaaaaa
      : true;
    return (
      <div className="bg-cream rounded-xl border border-border overflow-hidden group hover:shadow-md transition-shadow">
        <div className="aspect-[3/4] overflow-hidden relative">
          <Image
            src={HAIR_COLOR_IMAGES[index % HAIR_COLOR_IMAGES.length]}
            alt={`推薦髮色 ${rank}：${item.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 33vw, 200px"
          />
          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold shadow-md">
            {rank}
          </div>
          <div
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: item.colorHex }}
          />
        </div>
        <div className="p-4">
          <h4 className="font-serif text-base font-semibold text-foreground mb-1">{item.name}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isLight ? item.colorHex + '30' : item.colorHex,
                color: isLight ? item.colorHex : '#fff',
              }}
            >
              {item.colorHex.toUpperCase()}
            </span>
            <span className="text-gold-brown text-xs">★★★★★</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 md:p-10">
      {/* PART label */}
      <div className="mb-8">
        <span className="bg-burgundy text-white rounded-full px-4 py-1.5 text-sm uppercase tracking-wider inline-block">
          PART 4 · 髮型 &amp; 髮色分析
        </span>
      </div>

      {/* 3.1 推荐6款发型 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            01
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">6 款最適合髮型</h2>
        </div>

        <div className="rounded-xl overflow-hidden border border-border mb-6 aspect-[21/9]">
          <Image
            src={REPORT_IMAGES.hairstyleCollection}
            alt="髮型靈感集"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          根據你的臉型輪廓、五官量感與個人氣質，精選以下 6 款髮型。每一款都經過設計考量，
          旨在修飾臉型、放大優勢，讓你輕鬆找到命定髮型。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {hairstyles.slice(0, 6).map((item, index) => (
            <HairstyleCard key={index} item={item} rank={index + 1} index={index} />
          ))}
        </div>
      </section>

      {/* 3.2 推荐6款发色 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            02
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">6 款最佳髮色</h2>
        </div>

        <div className="rounded-xl overflow-hidden border border-border mb-6 aspect-[21/9]">
          <Image
            src={REPORT_IMAGES.hairColorCollection}
            alt="髮色靈感集"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          你的膚色屬於暖黃基調，適合帶有<span className="text-burgundy font-medium">金色/棕色系</span>
          的髮色。以下 6 款髮色經過專業配色分析，既能顯白提亮，又能襯托你的氣質。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {hairColors.slice(0, 6).map((item, index) => (
            <HairColorCard key={index} item={item} rank={index + 1} index={index} />
          ))}
        </div>
      </section>

      {/* 3.3 选择要点 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            03
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">髮型選擇要點</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 脸型适配 */}
          <div className="bg-cream rounded-xl p-5 border border-border">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-burgundy">◈</span> 臉型適配指南
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-burgundy text-lg flex-shrink-0">☑</span>
                <div>
                  <p className="text-sm font-medium text-foreground">鵝蛋/橢圓臉</p>
                  <p className="text-xs text-muted-foreground">
                    各種長度都適合，重點在於強調臉部輪廓的流暢感
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-burgundy text-lg flex-shrink-0">☑</span>
                <div>
                  <p className="text-sm font-medium text-foreground">圓臉/嬰兒肥</p>
                  <p className="text-xs text-muted-foreground">
                    選擇側分+層次剪，拉高頭頂蓬鬆度，拉長臉部視覺比例
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-burgundy text-lg flex-shrink-0">☑</span>
                <div>
                  <p className="text-sm font-medium text-foreground">方臉/下顎明顯</p>
                  <p className="text-xs text-muted-foreground">
                    柔軟的燙捲或層次剪能夠修飾臉部稜角，增加女性柔和感
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 肤色×发色搭配表 */}
          <div className="bg-cream rounded-xl p-5 border border-border">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-burgundy">◈</span> 膚色 × 髮色對照
            </h3>
            <div className="space-y-2 text-sm">
              {keyPoints.slice(0, 4).map((point, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-gold-brown text-xs font-bold flex-shrink-0 mt-0.5">
                    0{index + 1}
                  </span>
                  <span className="text-foreground leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 脸型配图 */}
        <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-[21/9]">
          <Image
            src={REPORT_IMAGES.faceShape}
            alt="臉型分析示意"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      </section>

      {/* 3.4 避雷发色 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            04
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">避雷髮色提醒</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          以下髮色與你的暖色膚質相性較差，容易顯得氣色不好、膚色暗沉，建議盡量避免。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {avoidColors.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 items-center bg-cream rounded-xl p-4 border border-border"
            >
              <span className="text-destructive text-xl flex-shrink-0">✕</span>
              <div
                className="w-12 h-12 rounded-lg border border-border flex-shrink-0 shadow-inner"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm mb-0.5">{item.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 吹护重点 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            05
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">吹護重點</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-burgundy/5 to-transparent rounded-xl p-5 border border-burgundy/10">
            <h3 className="font-serif text-lg font-semibold text-burgundy mb-3 flex items-center gap-2">
              <span>🌬️</span> 吹髮技巧
            </h3>
            <div className="space-y-2">
              {blowDryTips.map((tip, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-gold-brown flex-shrink-0 mt-0.5">☑</span>
                  <span className="text-sm text-foreground leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-dust/10 to-transparent rounded-xl p-5 border border-rose-dust/20">
            <h3 className="font-serif text-lg font-semibold text-burgundy mb-3 flex items-center gap-2">
              <span>✨</span> 護理重點
            </h3>
            <div className="space-y-2">
              {careTips.map((tip, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-gold-brown flex-shrink-0 mt-0.5">☑</span>
                  <span className="text-sm text-foreground leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3.6 总结 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            06
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">總結建議</h2>
        </div>

        <div className="bg-gradient-to-r from-burgundy via-burgundy/90 to-rose-dust rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-amber-200 blur-3xl" />
          </div>
          <div className="relative">
            <p className="font-serif text-xl md:text-2xl leading-relaxed italic">
              「{summary}」
            </p>
            <div className="mt-4 flex justify-center gap-1 text-gold-brown text-lg">
              {'★'.repeat(5)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartHairstyle;
