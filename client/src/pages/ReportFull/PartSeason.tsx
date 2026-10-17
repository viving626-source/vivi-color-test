import { Image } from '@/components/ui/image';
import { REPORT_IMAGES } from '@client/src/data/quizImages';
import type { SeasonResult, SeasonScore } from '@shared/api.interface';

interface PartSeasonProps {
  season: SeasonResult;
}

const SEASON_NAMES: Record<keyof SeasonScore, string> = {
  spring: '春季型',
  summer: '夏季型',
  autumn: '秋季型',
  winter: '冬季型',
};

const SEASON_ENGLISH: Record<keyof SeasonScore, string> = {
  spring: 'Warm Spring',
  summer: 'Cool Summer',
  autumn: 'Deep Autumn',
  winter: 'Clear Winter',
};

const SEASON_PORTRAITS: Record<keyof SeasonScore, string> = {
  spring: REPORT_IMAGES.springPortrait,
  summer: REPORT_IMAGES.springPortrait,
  autumn: REPORT_IMAGES.springPortrait,
  winter: REPORT_IMAGES.springPortrait,
};

const SEASON_PERSONALITY: Record<keyof SeasonScore, string[]> = {
  spring: [
    '你是天生的「元氣女孩」，笑容裡有陽光的味道。走到哪裡都像春暖花開，讓人不自覺地想靠近。你的活力具有感染力，朋友聚會時總是氣氛擔當。',
    '在穿搭上，你適合明亮飽和的暖色調——蜜桃橘、檸檬黃、青草綠，這些顏色會讓你的皮膚看起來通透發光，像剛從海邊度假回來一樣元氣滿滿。',
    '你的性格特質是熱情、開朗、對世界充滿好奇。適合的風格偏向輕快、活潑、帶有少女感的設計，避免過於沈重或灰暗的色調，那會壓住你的光芒。',
  ],
  summer: [
    '你是自帶「柔光濾鏡」的氣質美人，舉手投足都有一種仙氣飄飄的感覺。你不喜歡張揚，卻總能在低調中讓人念念不忘。',
    '在穿搭上，你適合灰粉色系、莫蘭迪色調——煙粉灰、灰藍紫、米灰綠，這些帶灰度的顏色會襯托出你溫柔優雅的氣質，像一層薄霧籠罩的花園。',
    '你的性格特質是溫和、細膩、有同理心。適合浪漫柔軟的風格，避免過於鮮豔刺眼的顏色，那會與你的氣質產生衝突，顯得浮躁。',
  ],
  autumn: [
    '你是「自帶故事感」的復古美人，像一本翻不膩的舊書，越讀越有味道。你有一種沈穩的力量，不需要嘩眾取寵，卻自然而然成為焦點。',
    '在穿搭上，你適合大地色系、飽和溫暖色——焦糖棕、磚紅、橄欖綠、芥末黃，這些像秋日楓葉一樣的顏色會讓你的氣質更加沈穩高級，像陳年美酒一樣醇厚。',
    '你的性格特質是成熟、內斂、有自己的節奏。適合復古、質感、有溫度的風格，避免過於清涼淺淡的顏色，那會讓你看起來氣色不佳、精神不夠。',
  ],
  winter: [
    '你是「冷艷高級」的大女主，自帶強大氣場。你不喜歡拖泥帶水，做事乾淨利落，有一種讓人信服的力量感。',
    '在穿搭上，你適合高飽和的冷色調——正紅、寶藍、翡翠綠、純黑純白，這些對比強烈的顏色會讓你的氣場全開，像女明星走紅毯一樣自帶打光。',
    '你的性格特質是果斷、獨立、追求極致。適合簡約、幹練、有鋒芒的風格，避免混濁模糊的中間色，那會削弱你的氣場，顯得平庸無趣。',
  ],
};

const PartSeason = ({ season }: PartSeasonProps) => {
  const {
    scores,
    primarySeason,
    secondarySeason,
    typeName,
    conclusion,
    keywords,
    warmColors,
    neutralColors,
    coolColors,
  } = season;

  const total = scores.spring + scores.summer + scores.autumn + scores.winter;
  const seasons: { key: keyof SeasonScore; percent: number }[] = (
    Object.keys(scores) as (keyof SeasonScore)[]
  ).map((key) => ({
    key,
    percent: Math.round((scores[key] / total) * 100),
  }));

  const sortedSeasons = [...seasons].sort((a, b) => b.percent - a.percent);

  const ColorSwatchGroup = ({
    title,
    subtitle,
    colors,
    tone,
  }: {
    title: string;
    subtitle: string;
    colors: string[];
    tone: 'warm' | 'neutral' | 'cool';
  }) => (
    <div className="bg-cream rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-serif text-lg font-bold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            tone === 'warm'
              ? 'bg-rose-dust/20 text-burgundy'
              : tone === 'cool'
                ? 'bg-slate-200/60 text-slate-600'
                : 'bg-amber-100/60 text-amber-700'
          }`}
        >
          {tone === 'warm' ? '推薦' : tone === 'cool' ? '慎用' : '百搭'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {colors.map((color, index) => {
          const isLight = /^#[0-9a-fA-F]{6}$/.test(color)
            ? parseInt(color.slice(1), 16) > 0xdddddd
            : true;
          return (
            <div key={index} className="text-center">
              <div
                className="w-full aspect-square rounded-lg border border-border/60 shadow-sm flex items-end justify-center pb-1"
                style={{ backgroundColor: color }}
              >
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isLight ? 'text-foreground/80 bg-white/60' : 'text-white bg-black/20'
                  }`}
                >
                  {color.toUpperCase().replace('#', '')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 md:p-10">
      {/* PART label */}
      <div className="mb-8">
        <span className="bg-burgundy text-white rounded-full px-4 py-1.5 text-sm uppercase tracking-wider inline-block">
          PART 1 · 春夏秋冬四季型人格分析
        </span>
      </div>

      {/* 四型匹配度柱状图 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            01
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">四季型匹配度</h2>
        </div>
        <div className="bg-cream rounded-xl p-6 border border-border">
          <div className="space-y-5">
            {sortedSeasons.map(({ key, percent }, idx) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-burgundy/10 text-burgundy text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{SEASON_NAMES[key]}</span>
                    <span className="text-xs text-muted-foreground font-serif italic">
                      {SEASON_ENGLISH[key]}
                    </span>
                  </div>
                  <span className="text-lg font-serif font-bold text-burgundy">{percent}%</span>
                </div>
                <div className="w-full h-3 bg-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-burgundy to-rose-dust rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 主輔季型結論 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            02
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">你的專屬季型</h2>
        </div>
        <div className="bg-gradient-to-br from-burgundy/5 via-cream to-rose-dust/10 rounded-xl p-8 border border-border text-center relative overflow-hidden">
          <div className="absolute top-4 right-6 font-serif text-[120px] text-burgundy/5 leading-none select-none">
            {primarySeason.charAt(0).toUpperCase()}
          </div>
          <div className="relative">
            <div className="text-sm uppercase tracking-[0.3em] text-burgundy/70 mb-3">
              Your Season Type
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-burgundy mb-2 leading-tight">
              {typeName || SEASON_NAMES[primarySeason]}
            </h1>
            <p className="font-serif text-lg text-muted-foreground italic mb-5">
              {SEASON_ENGLISH[primarySeason]}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>主季型</span>
              <span className="text-burgundy font-medium">{SEASON_NAMES[primarySeason]}</span>
              <span className="text-border">·</span>
              <span>輔季型</span>
              <span className="text-foreground font-medium">{SEASON_NAMES[secondarySeason]}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 關鍵詞 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            03
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">你的色彩關鍵詞</h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-burgundy/10 text-burgundy rounded-full px-5 py-2 text-sm font-medium border border-burgundy/20 hover:bg-burgundy/15 transition-colors"
            >
              ♡ {keyword}
            </span>
          ))}
        </div>
      </section>

      {/* 色卡展示 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            04
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">專屬色卡鑑定</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorSwatchGroup
            title="推薦暖色組"
            subtitle="Warm Palette"
            colors={warmColors.slice(0, 6)}
            tone="warm"
          />
          <ColorSwatchGroup
            title="中性色組"
            subtitle="Neutral Palette"
            colors={neutralColors.slice(0, 6)}
            tone="neutral"
          />
          <ColorSwatchGroup
            title="冷色調慎用"
            subtitle="Cool / Avoid"
            colors={coolColors.slice(0, 4)}
            tone="cool"
          />
        </div>
      </section>

      {/* 人物肖像參考 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            05
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">風格人物參考</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 rounded-xl overflow-hidden border border-border shadow-md">
            <Image
              src={SEASON_PORTRAITS[primarySeason]}
              alt={`${SEASON_NAMES[primarySeason]}風格參考`}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, 250px"
            />
          </div>
          <div className="md:col-span-3 flex flex-col justify-center">
            <div className="font-serif text-sm uppercase tracking-wider text-burgundy mb-2">
              Style Reference
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
              {SEASON_NAMES[primarySeason]}代表形象
            </h3>
            <div className="space-y-3 text-sm text-foreground leading-relaxed">
              <p className="italic text-muted-foreground border-l-2 border-burgundy/40 pl-4">
                「像春日裡盛開的鬱金香，明亮、溫暖、帶著初綻的元氣。」
              </p>
              <p>
                你的整體色調偏<span className="text-burgundy font-medium">暖黃基調</span>，
                膚色帶有自然光澤感。穿上暖色系衣服時，氣色會瞬間提亮，整個人看起來元氣滿滿；
                反之冷色系會讓你看起來蒼白、氣色不佳。
              </p>
              <p>
                建議多選擇<span className="text-burgundy font-medium">帶有金色調的配飾</span>
                （黃金、玫瑰金、琥珀），避免冷銀色飾品。
                化妝時重點放在腮紅與唇色的暖感，打造從內透出的好氣色。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 季型性格描述 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            06
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">你的色彩性格</h2>
        </div>
        <div className="bg-cream rounded-xl p-6 border border-border">
          <div className="space-y-4 text-foreground leading-relaxed">
            {SEASON_PERSONALITY[primarySeason].map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {conclusion && (
              <p className="pt-3 border-t border-border/60 text-muted-foreground text-sm italic">
                💡 {conclusion}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartSeason;
