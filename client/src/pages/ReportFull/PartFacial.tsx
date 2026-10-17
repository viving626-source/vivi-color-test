import { useState, useEffect, useCallback } from 'react';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { RefreshCw, ScanFace, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { REPORT_IMAGES } from '@client/src/data/quizImages';
import type {
  FacialResult,
  SeasonResult,
  StyleResult,
} from '@shared/api.interface';
import type { ViviMacauPhotoAnalysisThreeOutput } from '@shared/plugin-types';

const PLUGIN_ID = 'vivi_macau_photo_analysis_3';

interface PartFacialProps {
  facial: FacialResult;
  facePhotoUrl: string;
  bodyPhotoUrl?: string;
  seasonResult: SeasonResult;
  styleResult?: StyleResult;
}

const ANALYSIS_PROMPT = `你是一位專業的形象設計師與色彩顧問。請仔細分析這張人像照片，按照以下 8 個維度給出專業、具體、有洞察的分析。請用繁體中文回答，語氣像一位資深造型師看完照片後的當面點評，簡潔有力、直指重點。

【分析維度】
1. 臉型分析：判斷屬於圓臉、方臉、長臉、菱形臉、鵝蛋臉、心形臉中的哪一種，說明臉部輪廓特點與骨骼感
2. 骨相直曲：骨骼線條偏直線型還是曲線型？下顎線、顴骨、鼻型的直曲判斷
3. 五官量感：五官偏大偏立體（大量感）還是偏小精緻（小量感）？眼部、鼻子、嘴唇的比例
4. 三庭五眼比例：簡單評估三庭（上中下）與五眼的比例是否標準，有哪些特點
5. 面部留白：面部留白多寡與分佈，對髮型與妝容的啟示
6. 氣質基調：整體氣質偏向哪種風格（如溫柔、知性、元氣、冷艷、甜美、御姐等），為什麼
7. 優勢強化：你認為她最大的容貌優勢是什麼？該如何強化放大
8. 修飾重點：有哪些可以透過妝容、髮型、穿搭來修飾或平衡的地方？請給出具體建議

【格式要求】
請直接給出分析，每個維度用「【維度名稱】」開頭，內容控制在 1-2 句話，精煉而有說服力。整體風格像專業造型師的口頭點評，不要太學術。`;

function extractSummaryBullets(fullText: string): string[] {
  const lines = fullText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const bullets: string[] = [];
  const patterns = [
    '臉型',
    '骨相',
    '五官量感',
    '三庭五眼',
    '面部留白',
    '氣質',
    '優勢',
    '修飾',
  ];

  for (const line of lines) {
    const matched = patterns.some((p) => line.includes(p));
    if (matched && bullets.length < 5) {
      const clean = line.replace(/^【[^】]+】\s*/, '').replace(/^\d+[.、)\s]+/, '');
      if (clean.length > 5) {
        bullets.push(clean);
      }
    }
    if (bullets.length >= 5) break;
  }

  if (bullets.length === 0) {
    const shortLines = lines.filter((l) => l.length < 60 && l.length > 8).slice(0, 4);
    bullets.push(...shortLines);
  }

  return bullets.slice(0, 5);
}

const PartFacial = ({
  facial,
  facePhotoUrl,
  bodyPhotoUrl,
  seasonResult,
}: PartFacialProps) => {
  const {
    features,
    makeupAdvices,
    baseColors,
    eyeshadowColors,
    lipColors,
    makeupTips,
    jewelries,
  } = facial;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string>('');

  const analyzePhoto = useCallback(async () => {
    if (!facePhotoUrl) {
      setError('缺少人像照片，無法進行影像分析');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisText('');

    try {
      const photos = bodyPhotoUrl ? [facePhotoUrl, bodyPhotoUrl] : [facePhotoUrl];

      const stream = await capabilityClient
        .load(PLUGIN_ID)
        .callStream<ViviMacauPhotoAnalysisThreeOutput>('imageUnderstanding', {
          photos,
          analysisPrompt: ANALYSIS_PROMPT,
        });

      let accumulated = '';

      // Normalize stream shape
      const iterable =
        stream && typeof stream === 'object' && 'output' in stream
          ? (stream as { output: AsyncIterable<ViviMacauPhotoAnalysisThreeOutput> }).output
          : (stream as AsyncIterable<ViviMacauPhotoAnalysisThreeOutput>);

      for await (const chunk of iterable) {
        const piece = chunk.content ?? chunk.response ?? '';
        if (piece) {
          accumulated += piece;
          setAnalysisText(accumulated);
        }
      }

      if (!accumulated) {
        throw new Error('分析結果為空');
      }
    } catch (err) {
      logger.error('影像分析失敗', err);
      const errMessage =
        (err as { message?: string }).message ?? '影像分析暫時無法載入，請稍後再試';
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  }, [facePhotoUrl, bodyPhotoUrl]);

  useEffect(() => {
    if (facePhotoUrl) {
      void analyzePhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryBullets = analysisText ? extractSummaryBullets(analysisText) : [];

  const StarRating = ({ stars }: { stars: number }) => {
    const full = Math.round(stars);
    return (
      <span className="text-gold-brown tracking-wider">
        {'★'.repeat(full)}
        <span className="text-border">{'☆'.repeat(5 - full)}</span>
      </span>
    );
  };

  const LipColorCard = ({ color, name, finish }: { color: string; name: string; finish: string }) => {
    const isLight = /^#[0-9a-fA-F]{6}$/.test(color)
      ? parseInt(color.slice(1), 16) > 0xbbbbbb
      : true;
    return (
      <div className="bg-cream rounded-xl border border-border p-4 text-center">
        <div
          className="w-full aspect-square rounded-full mx-auto mb-3 shadow-inner border border-border/50"
          style={{ backgroundColor: color }}
        />
        <h4 className="font-medium text-foreground text-sm mb-1">{name}</h4>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
            isLight ? 'bg-foreground/10 text-foreground' : 'bg-white/20 text-white'
          }`}
          style={!isLight ? { backgroundColor: color, color: '#fff' } : {}}
        >
          {color.toUpperCase()}
        </span>
        <p className="text-[11px] text-muted-foreground mt-2">{finish}</p>
      </div>
    );
  };

  const EyeshadowPalette = ({ colors }: { colors: string[] }) => (
    <div className="bg-cream rounded-xl border border-border p-4">
      <h4 className="text-sm font-medium text-foreground mb-3 text-center">推薦眼影色階</h4>
      <div className="flex gap-1 justify-center">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 aspect-[3/4] rounded-lg border border-border/50 shadow-sm relative"
            style={{ backgroundColor: color }}
          >
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/90 bg-black/30 rounded px-1 whitespace-nowrap">
              {color.slice(1).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 md:p-10">
      {/* PART label */}
      <div className="mb-8">
        <span className="bg-burgundy text-white rounded-full px-4 py-1.5 text-sm uppercase tracking-wider inline-block">
          PART 2 · 影像個人化分析 &amp; 妝容珠寶
        </span>
      </div>

      {/* 影像分析 - 精炼总结区 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            01
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">影像個人化分析</h2>
        </div>

        <div className="bg-gradient-to-br from-burgundy/5 via-cream to-rose-dust/10 rounded-2xl p-6 md:p-8 border border-burgundy/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-burgundy/15 flex items-center justify-center">
              <ScanFace className="w-5 h-5 text-burgundy" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">
                根據你的照片，造型師觀點
              </p>
              <p className="text-xs text-muted-foreground">
                結合五官輪廓、氣質與整體比例，給出個人化建議
              </p>
            </div>
          </div>

          {loading && !analysisText && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-3 text-burgundy">
                <div className="w-5 h-5 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
                <span className="text-sm font-medium">影像分析中，請稍候…</span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-border/40 rounded-full animate-pulse"
                    style={{ width: `${70 + i * 10}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button size="sm" variant="outline" onClick={() => void analyzePhoto()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                重新分析
              </Button>
            </div>
          )}

          {analysisText && (
            <div className="space-y-5">
              {/* 精炼总结 */}
              <div className="bg-white/60 rounded-xl p-5 border border-burgundy/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-gold-brown" />
                  <h3 className="font-serif text-base font-semibold text-burgundy">
                    重點觀察
                  </h3>
                </div>
                <div className="space-y-3">
                  {summaryBullets.length > 0
                    ? summaryBullets.map((bullet, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-burgundy text-white flex items-center justify-center text-xs font-serif font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-foreground leading-relaxed">
                            {bullet}
                          </p>
                        </div>
                      ))
                    : analysisText.split('\n').slice(0, 4).map((line, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-burgundy text-white flex items-center justify-center text-xs font-serif font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-foreground leading-relaxed">
                            {line}
                          </p>
                        </div>
                      ))}
                </div>
              </div>

              {/* 详细分析 */}
              <div className="pt-2">
                <h3 className="font-serif text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-burgundy">✦</span>
                  詳細分析與建議
                </h3>
                <div className="space-y-3 text-sm text-foreground leading-relaxed">
                  {analysisText.split('\n').map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    const isHeading = /^【.+】/.test(trimmed);
                    return (
                      <p
                        key={idx}
                        className={
                          isHeading
                            ? 'font-semibold text-burgundy mt-3'
                            : ''
                        }
                      >
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 季型补充提示 */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          ※ 以上為影像個人化分析，下方結合
          <span className="text-burgundy font-medium">
            {seasonResult?.typeName || '四季色彩'}
          </span>
          給出更詳細的妝容與珠寶建議
        </div>
      </section>

      {/* 2.2 五官分析 (保留原有內容，作為補充) */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            02
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">五官精準分析</h2>
        </div>

        {/* 配图 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl overflow-hidden border border-border aspect-[4/3]">
            <Image
              src={REPORT_IMAGES.eyeFeatures}
              alt="眼部特徵分析"
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-border aspect-[4/3]">
            <Image
              src={REPORT_IMAGES.lipTexture}
              alt="唇部質地分析"
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-cream rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy to-rose-dust text-white flex items-center justify-center text-sm font-serif font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {feature.name}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2 items-start">
                  <span className="text-burgundy text-xs font-bold flex-shrink-0 mt-0.5">特徵</span>
                  <p className="text-foreground leading-relaxed">{feature.description}</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-gold-brown text-xs font-bold flex-shrink-0 mt-0.5">優勢</span>
                  <p className="text-foreground leading-relaxed">{feature.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2.3 妆容分析 */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            03
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">專屬妝容方案</h2>
        </div>

        {/* 妆容色盘头图 */}
        <div className="rounded-xl overflow-hidden border border-border mb-6 aspect-[16/9]">
          <Image
            src={REPORT_IMAGES.makeupPalette}
            alt="妝容色盤參考"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        {/* 底妆 */}
        <div className="bg-cream rounded-xl p-5 border border-border mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-rose-dust/20 text-burgundy flex items-center justify-center text-xs font-bold">
              底
            </span>
            <h3 className="font-serif text-lg font-semibold text-foreground">底妝建議</h3>
          </div>
          <div className="space-y-2 text-sm text-foreground leading-relaxed">
            {makeupAdvices
              .filter((a) => a.name.includes('底') || a.name.includes('粉底'))
              .map((advice, idx) => (
                <div key={idx}>
                  <span className="font-medium">{advice.name}：</span>
                  {advice.description}
                </div>
              ))}
            {makeupAdvices.filter((a) => a.name.includes('底') || a.name.includes('粉底')).length ===
              0 && (
              <>
                <p>
                  <span className="font-medium">色號調性：</span>
                  選擇<span className="text-burgundy">暖黃調（Warm Tone）</span>
                  粉底，色號以自然提亮一個色階為原則，避免過白產生面具感。
                </p>
                <p>
                  <span className="font-medium">上妝手法：</span>
                  先用手指均勻點塗於面部五點，再用濕潤的美妝蛋輕拍推開，由內向外帶出薄透感。
                  T字部位輕壓定妝，面頰保留自然光澤。
                </p>
                <p>
                  <span className="font-medium">產品類型：</span>
                  偏好光澤肌選粉底液，追求遮瑕選氣墊。乾性肌膚建議加入一滴精華油混合使用。
                </p>
              </>
            )}
          </div>
          {/* 底妆色条 */}
          <div className="mt-4 flex gap-1 rounded-lg overflow-hidden border border-border">
            {baseColors.map((color, index) => (
              <div key={index} className="flex-1 h-8" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {baseColors.map((color, index) => (
              <div
                key={index}
                className="flex-1 text-center text-[10px] text-muted-foreground font-mono"
              >
                {color.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* 眼妆 + 腮红 双栏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 眼妆 */}
          <div className="bg-cream rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-rose-dust/20 text-burgundy flex items-center justify-center text-xs font-bold">
                眼
              </span>
              <h3 className="font-serif text-lg font-semibold text-foreground">眼妝建議</h3>
            </div>
            <EyeshadowPalette colors={eyeshadowColors} />
            <div className="mt-3 space-y-2 text-sm text-foreground leading-relaxed">
              <p>
                <span className="font-medium">畫法：</span>
                打底色大範圍鋪滿眼窩，主色暈染在眼褶內，眼尾加深色細線拉出上扬角度。
              </p>
              <p>
                <span className="font-medium">眼線：</span>
                棕色眼線膠筆填補睫毛根部，眼尾微微拉長 2-3mm，創造自然放大效果。
              </p>
              <p>
                <span className="font-medium">睫毛：</span>
                先用睫毛夾分段夾翹，再以「Z 字手法」刷睫毛膏，根根分明不結塊。
              </p>
            </div>
          </div>

          {/* 腮红 */}
          <div className="bg-cream rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-rose-dust/20 text-burgundy flex items-center justify-center text-xs font-bold">
                頰
              </span>
              <h3 className="font-serif text-lg font-semibold text-foreground">腮紅建議</h3>
            </div>
            <div className="flex gap-3 justify-center mb-3">
              <div
                className="w-16 h-16 rounded-full border border-border/50 shadow-inner"
                style={{ backgroundColor: '#E89B9B' }}
              />
              <div
                className="w-16 h-16 rounded-full border border-border/50 shadow-inner"
                style={{ backgroundColor: '#F0B8A0' }}
              />
            </div>
            <div className="text-center mb-3">
              <span className="text-xs text-muted-foreground font-mono">E89B9B · F0B8A0</span>
            </div>
            <div className="space-y-2 text-sm text-foreground leading-relaxed">
              <p>
                <span className="font-medium">畫法位置：</span>
                微笑時蘋果肌最高處，由內向外輕掃，斜向上拉提至太陽穴方向。
              </p>
              <p>
                <span className="font-medium">工具建議：</span>
                蓬鬆腮紅刷取粉後先抖掉多餘粉末，少量多次疊加，避免下手過重。
              </p>
            </div>
          </div>
        </div>

        {/* 唇妆 */}
        <div className="bg-cream rounded-xl p-5 border border-border mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-rose-dust/20 text-burgundy flex items-center justify-center text-xs font-bold">
              唇
            </span>
            <h3 className="font-serif text-lg font-semibold text-foreground">唇妝建議</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {lipColors.slice(0, 3).map((color, index) => (
              <LipColorCard
                key={index}
                color={color}
                name={['蜜糖橘棕', '玫瑰奶茶', '焦糖紅葉'][index] || `唇色 ${index + 1}`}
                finish={['水潤光感', '絲絨霧面', '緞面水光'][index] || '推薦'}
              />
            ))}
          </div>
          <div className="mt-4 p-3 bg-burgundy/5 rounded-lg border border-burgundy/10">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-medium text-burgundy">💡 唇妝小秘訣：</span>
              先用唇線筆勾勒唇峰與下唇邊緣，再填充內側，最後用無名指暈染邊緣，
              創造由深至淺的漸層感，顯得嘴唇更飽滿立體。
            </p>
          </div>
        </div>

        {/* 化妆小技巧 */}
        <div className="bg-gradient-to-br from-burgundy/5 to-rose-dust/5 rounded-xl p-5 border border-burgundy/10">
          <h4 className="font-serif text-lg font-semibold text-burgundy mb-4 flex items-center gap-2">
            <span>✦</span> 化妝小技巧
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {makeupTips.map((tip, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-gold-brown text-lg flex-shrink-0">☑</span>
                <div>
                  <span className="font-medium text-foreground text-sm">{tip.name}：</span>
                  <span className="text-muted-foreground text-sm">{tip.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.4 珠宝搭配 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center text-sm font-serif font-bold">
            04
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">珠寶搭配指南</h2>
        </div>

        {/* 珠宝头图 */}
        <div className="rounded-xl overflow-hidden border border-border mb-6 aspect-[16/7]">
          <Image
            src={REPORT_IMAGES.jewelryCollection}
            alt="珠寶收藏鑑賞"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jewelries.map((jewelry, index) => (
            <div
              key={index}
              className="bg-cream rounded-xl p-5 border border-border hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {jewelry.name}
                </h3>
                <StarRating stars={jewelry.stars} />
              </div>
              <p className="text-sm text-foreground mb-2 leading-relaxed font-medium">
                {jewelry.description}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {jewelry.reason}
              </p>
              <div className="mt-3 pt-3 border-t border-border/60">
                <span className="text-xs text-burgundy font-medium">
                  適合款式：耳環 · 項鍊 · 手鍊
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 金銀對比小結 */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200/60 text-center">
            <div className="text-3xl mb-2">🥇</div>
            <h4 className="font-serif font-bold text-foreground mb-1">金色系 首選</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              黃金、玫瑰金、K金飾品與你的暖色膚質完美契合，提亮氣色又顯高級
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-5 border border-gray-200/60 text-center">
            <div className="text-3xl mb-2">🥈</div>
            <h4 className="font-serif font-bold text-foreground mb-1">銀色系 慎用</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              純銀、白K金容易讓你看起來氣色蒼白，建議選擇帶有暖調的金屬質感
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartFacial;
