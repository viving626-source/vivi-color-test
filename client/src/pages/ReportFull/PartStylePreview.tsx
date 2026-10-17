import { useState, useEffect, useCallback } from 'react';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Wand2, RefreshCw, Sparkles, Lock, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { REPORT_IMAGES } from '@client/src/data/quizImages';

import type { StyleResult } from '@shared/api.interface';
import type { ViviMacauAiStylePhotoEditOneOutput } from '@shared/plugin-types';

const PLUGIN_ID = 'vivi_macau_ai_style_photo_edit_1';

interface StyleOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  preview: string;
  prompt: string;
  points: string[];
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'korean',
    name: '韓系輕熟',
    tagline: 'Korean Elegant',
    description: '清透裸妝、空氣感瀏海、奶茶棕髮色，溫柔知性',
    preview: REPORT_IMAGES.styleKorean,
    prompt:
      '韓系輕熟女風格：清透自然的偽素顏妝容，帶有光澤感的底妝，柔粉係眼影，自然彎眉，水潤唇色。髮型為慵懶的長捲髮或氣墊燙，髮色為自然棕色系。穿搭為米白色針織衫、軟尼外套，整體色調為奶油米白、豆沙粉、淺棕色。背景為溫柔的室內空間，柔光效果，電影質感，高級雜誌畫報風。',
    points: ['清透無瑕底妝＋玫瑰豆沙唇', '八字瀏海・大波浪・奶茶棕', '針織衫×米杏風衣×寬褲長裙'],
  },
  {
    id: 'french',
    name: '法式溫柔',
    tagline: 'French Chic',
    description: '紅唇、白襯衫、微亂長髮，慵懶隨性的巴黎感',
    preview: REPORT_IMAGES.styleFrench,
    prompt:
      '法式優雅風格：精緻的紅唇妝容，乾淨的眼線，自然毛流感眉毛。髮型為低馬尾或凌亂盤髮，帶有碎髮的隨性感。穿搭為白色緞面襯衫、深色針織開衫、金色細項鍊，整體色調為米白、深紅、藏青。背景為巴黎風情的咖啡館或書房，自然光線，慵懶又高級的質感，雜誌畫報風。',
    points: ['勃艮第紅唇＋自然霧底妝', '微亂長髮・深棕/亞麻棕', '白襯衫×針織開衫×直筒牛仔'],
  },
  {
    id: 'mature',
    name: '御姐氣場',
    tagline: 'Boss Lady',
    description: '大紅唇、剪裁西裝、俐落髮型，專業大氣',
    preview: REPORT_IMAGES.styleMature,
    prompt:
      '御姐氣場風格：飽和的大紅唇，精緻的貓眼線，輪廓分明的修容。髮型為大波浪長捲髮，側分，深色髮色帶光澤。穿搭為剪裁俐落的西裝外套、緞面襯衫、精緻耳環，整體色調為深酒紅、黑色、香檳金。背景為現代簡約的辦公室或酒吧，冷暖對比光線，高級時尚質感，雜誌封面風。',
    points: ['飽和紅唇＋貓眼線＋立體修容', '側分大波浪・黑茶深色', '合身西裝×真絲襯衫×鉛筆裙'],
  },
  {
    id: 'sweet',
    name: '甜美少女',
    tagline: 'Sweet Girl',
    description: '粉嫩腮紅、空氣瀏海、軟糯單品，元氣減齡',
    preview: REPORT_IMAGES.styleSweet,
    prompt:
      '甜美少女風格：粉嫩系妝容，蜜桃色腮紅，透明感唇釉，臥蠶妝，圓溜溜的大眼效果。髮型為空氣瀏海+半紮髮或雙馬尾，髮色為淺棕色或帶有粉色調。穿搭為粉白色蕾絲上衣、針織背心、百褶裙，整體色調為粉白、淺紫、鵝黃。背景為明亮的臥室或咖啡廳，柔光效果，清新元氣，少女雜誌風。',
    points: ['蜜桃腮紅＋果汁唇＋臥蠶', '空氣瀏海・蛋捲頭・淺棕', '粉色針織×娃娃領×百褶裙'],
  },
];

function matchStyleId(mainStyle: string, keywords: string[]): string {
  const lower = mainStyle.toLowerCase();
  if (lower.includes('韓') || lower.includes('korean') || lower.includes('輕熟')) return 'korean';
  if (lower.includes('法') || lower.includes('french') || lower.includes('優雅') || lower.includes('溫柔')) return 'french';
  if (lower.includes('御姐') || lower.includes('mature') || lower.includes('氣場') || lower.includes('熟女') || lower.includes('職場') || lower.includes('知性')) return 'mature';
  if (lower.includes('甜') || lower.includes('sweet') || lower.includes('少女') || lower.includes('減齡')) return 'sweet';

  const kw = keywords.join('').toLowerCase();
  if (kw.includes('韓') || kw.includes('korean') || kw.includes('輕熟')) return 'korean';
  if (kw.includes('法') || kw.includes('french') || kw.includes('優雅')) return 'french';
  if (kw.includes('御姐') || kw.includes('mature') || kw.includes('氣場') || kw.includes('職場')) return 'mature';
  if (kw.includes('甜') || kw.includes('sweet') || kw.includes('少女')) return 'sweet';

  return 'korean';
}

interface PartStylePreviewProps {
  styleResult: StyleResult;
  facePhotoUrl: string;
  isPreview?: boolean;
  /** 鎖定狀態：不呼叫生成、只展示模糊範例＋解鎖提示（免費預覽頁用，避免提前消耗生成額度） */
  locked?: boolean;
}

type GenStatus = 'idle' | 'loading' | 'done' | 'fallback' | 'error';

interface StyleGenState {
  status: GenStatus;
  image: string | null;
  error: string | null;
}

const PartStylePreview: React.FC<PartStylePreviewProps> = ({
  styleResult,
  facePhotoUrl,
  isPreview = false,
  locked = false,
}) => {
  // 僅自動生成 1 款最匹配風格（省額度、提升成功率）
  const primaryId = matchStyleId(styleResult.mainStyle, styleResult.keywords);
  const primaryStyle = STYLE_OPTIONS.find((s) => s.id === primaryId) ?? STYLE_OPTIONS[0];

  const [state, setState] = useState<StyleGenState>(() => ({
    status: locked ? 'idle' : 'loading',
    image: null,
    error: null,
  }));

  const generateStyle = useCallback(async () => {
    if (!facePhotoUrl) {
      setState({ status: 'error', image: null, error: '缺少人像照片' });
      return;
    }
    setState({ status: 'loading', image: null, error: null });
    try {
      const result = await capabilityClient
        .load(PLUGIN_ID)
        .call<ViviMacauAiStylePhotoEditOneOutput>('imageToImage', {
          user_portrait: [facePhotoUrl],
          style_reference_images: [],
          style_description: primaryStyle.prompt,
          image_ratio: '3:4',
        });

      const images = result.images;
      if (images && images.length > 0) {
        setState({ status: 'done', image: images[0], error: null });
      } else if ((result as { fallback?: boolean }).fallback) {
        // 後端生成額度用盡/限流 → 降級為文字風格卡
        setState({ status: 'fallback', image: null, error: null });
      } else {
        setState({ status: 'fallback', image: null, error: null });
      }
    } catch (err) {
      logger.error('風格合成失敗', err);
      // 出錯也降級為文字風格卡，不出現破圖/空白
      setState({ status: 'fallback', image: null, error: null });
    }
  }, [facePhotoUrl, primaryStyle.prompt]);

  useEffect(() => {
    if (locked) return;
    void generateStyle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    void generateStyle();
  };

  return (
    <div className="bg-gradient-to-br from-burgundy via-burgundy/95 to-rose-dust rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-8 pt-8 pb-6 text-center text-white relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-200 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-rose-300 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gold-brown" />
            <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-medium">
              Style Preview
            </span>
            <Sparkles className="w-5 h-5 text-gold-brown" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            你的專屬風格改造預覽
          </h2>
          <p className="text-white/70 text-sm">
            {locked
              ? '根據測試結果，為你匹配最適合的風格造型'
              : `根據測試結果，為你量身打造最適合的「${primaryStyle.name}」風格`}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="px-6 md:px-8 pb-8">
        <div className="grid grid-cols-1 max-w-xs mx-auto gap-4">
          {/* 鎖定：模糊範例＋解鎖提示，不消耗生成額度 */}
          {locked && (
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-white/5">
              <div className="aspect-[3/4] relative">
                <Image
                  src={primaryStyle.preview}
                  alt={`${primaryStyle.name} 風格範例`}
                  className="w-full h-full object-cover blur-md scale-105"
                  sizes="(max-width: 768px) 80vw, 320px"
                />
                <div className="absolute inset-0 bg-burgundy-deep/45" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white">
                  <div className="w-14 h-14 rounded-full bg-white/15 border border-white/40 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="font-serif text-xl mb-1">最匹配：{primaryStyle.name}</p>
                  <p className="text-xs text-white/80 leading-relaxed mb-4">
                    {primaryStyle.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-burgundy text-xs font-semibold px-4 py-2 shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                    解鎖後生成你的專屬改造照
                  </span>
                </div>
              </div>
              <div className="bg-white/95 px-3 py-2.5 text-center">
                <p className="font-serif text-sm font-semibold text-foreground">
                  {primaryStyle.name} · {primaryStyle.tagline}
                </p>
              </div>
            </div>
          )}

          {/* 生成中 */}
          {!locked && state.status === 'loading' && (
            <div className="aspect-[3/4] rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-white/80">
              <div className="relative w-14 h-14 mb-4">
                <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <Wand2 className="absolute inset-0 m-auto w-5 h-5 text-white" />
              </div>
              <p className="font-serif text-lg mb-1">讀取照片中…</p>
              <p className="text-sm text-white/60">風格合成大約需要 30-60 秒</p>
            </div>
          )}

          {/* 生成成功 */}
          {!locked && state.status === 'done' && state.image && (
            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-white/5">
              <div className="aspect-[3/4] relative">
                <Image
                  src={state.image}
                  alt={`${primaryStyle.name} 風格改造效果`}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 80vw, 320px"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 backdrop-blur-sm text-burgundy text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                    ✓ {primaryStyle.name}
                  </span>
                </div>
              </div>
              <div className="bg-white/95 px-3 py-2.5 text-center">
                <p className="font-serif text-sm font-semibold text-foreground">
                  {primaryStyle.name}
                </p>
              </div>
            </div>
          )}

          {/* 降級文字風格卡：額度用盡/限流/失敗時，仍給出完整風格重點 */}
          {!locked && (state.status === 'fallback' || state.status === 'error') && (
            <div className="rounded-2xl border border-white/25 bg-white/95 overflow-hidden shadow-lg">
              <div className="aspect-[3/4] relative px-5 py-6 flex flex-col">
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy/10 text-burgundy text-[11px] font-semibold tracking-wider px-3 py-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {primaryStyle.tagline}
                  </span>
                  <h3 className="font-serif text-2xl text-burgundy mt-3">
                    {primaryStyle.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {primaryStyle.description}
                  </p>
                </div>
                <div className="mt-5 space-y-2.5 flex-1">
                  {primaryStyle.points.map((p) => (
                    <div
                      key={p}
                      className="flex items-start gap-2 rounded-xl bg-cream px-3 py-2.5 text-sm text-foreground/85"
                    >
                      <Check className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
                  改造圖當前排隊中，可稍後重試生成；完整報告含妝容、髮色、穿搭與珠寶的逐項建議。
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="no-print mt-3 border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-white"
                  onClick={handleRetry}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  重新生成改造照
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/60 mt-5 leading-relaxed">
          合成效果僅供造型參考，實際妝容與穿搭效果會因個人特質有所差異
        </p>
      </div>
    </div>
  );
};

export default PartStylePreview;
