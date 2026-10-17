import { Image } from '@/components/ui/image';
import { REPORT_IMAGES } from '@client/src/data/quizImages';
import type { CelebrityRef } from '@shared/api.interface';

const CELEBRITY_IMAGES: string[] = [
  REPORT_IMAGES.celebrities,
  REPORT_IMAGES.styleMature,
  REPORT_IMAGES.styleSweet,
];

interface PartCelebrityProps {
  celebrities: CelebrityRef[];
  mainStyle: string;
}

const PartCelebrity = ({ celebrities, mainStyle }: PartCelebrityProps) => {
  const displayCelebrities = celebrities.slice(0, 3);

  const takeawaysByStyle: Record<string, string[]> = {
    default: [
      '學習她們如何運用色彩強化個人氣質',
      '參考她們的經典造型，找到屬於你的版本',
      '從細節入手：髮型、配件、整體比例',
    ],
  };

  const getTakeaways = (_celebName: string, style: string): string[] => {
    const lower = style.toLowerCase();
    if (lower.includes('韓') || lower.includes('輕熟')) {
      return ['清透底妝 + 自然眉型', '慵懶髮型襯托臉型', '軟質面料提升溫柔感'];
    }
    if (lower.includes('法') || lower.includes('優雅') || lower.includes('溫柔')) {
      return ['紅唇是法式靈魂', '簡約單品也能很有型', '隨性凌亂的髮型美感'];
    }
    if (lower.includes('御姐') || lower.includes('氣場') || lower.includes('成熟')) {
      return ['乾淨俐落的輪廓線條', '高飽和唇色提升氣場', '墊肩/西裝打造強大存在感'];
    }
    if (lower.includes('甜') || lower.includes('少女')) {
      return ['粉嫩腮紅提升元氣感', '空氣感瀏海減齡神器', '軟糯面料營造少女氛圍'];
    }
    return takeawaysByStyle.default;
  };

  return (
    <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 md:p-10">
      {/* PART label */}
      <div className="mb-8">
        <span className="bg-burgundy text-white rounded-full px-4 py-1.5 text-sm uppercase tracking-wider inline-block">
          PART 3 · 明星風格參考
        </span>
      </div>

      {/* 引言 */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-burgundy/5 via-cream to-rose-dust/10 rounded-2xl p-8 border border-border text-center relative overflow-hidden">
          <div className="absolute top-4 right-6 font-serif text-[100px] text-burgundy/5 leading-none select-none">
            ★
          </div>
          <div className="relative">
            <div className="text-sm uppercase tracking-[0.3em] text-burgundy/70 mb-3">
              Your Style Muses
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-burgundy mb-3 leading-tight">
              與你氣質相似的明星
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              以下幾位明星與你的 <span className="text-burgundy font-medium">{mainStyle}</span> 氣質最為接近。
              她們的造型值得參考，學習她們如何放大優勢、演繹屬於自己的風格。
            </p>
          </div>
        </div>
      </section>

      {/* 头图 */}
      <section className="mb-10">
        <div className="rounded-xl overflow-hidden border border-border aspect-[21/9]">
          <Image
            src={REPORT_IMAGES.celebrities}
            alt="風格明星參考"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      </section>

      {/* 明星卡片 */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCelebrities.map((celeb, index) => {
            const takeaways = getTakeaways(celeb.name, celeb.style);
            return (
              <div
                key={index}
                className="bg-cream rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <Image
                    src={CELEBRITY_IMAGES[index % CELEBRITY_IMAGES.length]}
                    alt={`明星參考 ${index + 1}：${celeb.name}`}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 33vw, 240px"
                  />
                  <div className="absolute top-3 left-3">
                    <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 pt-10">
                    <h3 className="font-serif text-xl font-bold text-white mb-1">
                      {celeb.name}
                    </h3>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full border border-white/30">
                      {celeb.style}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-serif text-base font-semibold text-burgundy mb-3 flex items-center gap-2">
                    <span className="text-gold-brown">♡</span>
                    可以學習的重點
                  </h4>
                  <div className="space-y-2">
                    {takeaways.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex gap-2 items-start">
                        <span className="text-burgundy text-xs font-bold flex-shrink-0 mt-0.5">
                          {String(tipIndex + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 造型啟示 */}
      <section>
        <div className="bg-gradient-to-br from-gold-brown/10 to-cream rounded-2xl p-6 md:p-8 border border-gold-brown/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-brown/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                造型啟示
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                明星的造型團隊會根據她們的臉型、氣質、身材量身打造。
                參考她們的穿搭思路，但不要照搬 — 找到屬於你自己的版本，
                才是最高級的時尚。你的獨特性，就是你最大的魅力。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartCelebrity;
