import { useState, useCallback } from 'react';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, Wand2, ChevronRight, ImageIcon, Info, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'korean',
    name: '韓系輕熟',
    tagline: 'Korean Elegant',
    description: '清透妝容、慵懶長髮、針織單品，溫柔又知性',
    preview: REPORT_IMAGES.styleKorean,
    prompt:
      '韓系輕熟女風格：清透自然的偽素顏妝容，帶有光澤感的底妝，柔粉係眼影，自然彎眉，水潤唇色。髮型為慵懶的長捲髮或氣墊燙，髮色為自然棕色系。穿搭為米白色針織衫、軟尼外套，整體色調為奶油米白、豆沙粉、淺棕色。背景為溫柔的室內空間，柔光效果，電影質感，高級雜誌畫報風。',
  },
  {
    id: 'french',
    name: '法式溫柔',
    tagline: 'French Chic',
    description: '紅唇、緞面襯衫、低馬尾，優雅又隨性',
    preview: REPORT_IMAGES.styleFrench,
    prompt:
      '法式優雅風格：精緻的紅唇妝容，乾淨的眼線，自然毛流感眉毛。髮型為低馬尾或凌亂盤髮，帶有碎髮的隨性感。穿搭為白色緞面襯衫、深色針織開衫、金色細項鍊，整體色調為米白、深紅、藏青。背景為巴黎風情的咖啡館或書房，自然光線，慵懶又高級的質感，雜誌畫報風。',
  },
  {
    id: 'mature',
    name: '御姐氣場',
    tagline: 'Boss Lady',
    description: '大紅唇、西裝外套、波浪長髮，氣場全開',
    preview: REPORT_IMAGES.styleMature,
    prompt:
      '御姐氣場風格：飽和的大紅唇，精緻的貓眼線，輪廓分明的修容。髮型為大波浪長捲髮，側分，深色髮色帶光澤。穿搭為剪裁俐落的西裝外套、緞面襯衫、精緻耳環，整體色調為深酒紅、黑色、香檳金。背景為現代簡約的辦公室或酒吧，冷暖對比光線，高級時尚質感，雜誌封面風。',
  },
  {
    id: 'sweet',
    name: '甜美少女',
    tagline: 'Sweet Girl',
    description: '粉嫩妝容、空氣瀏海、蕾絲單品，元氣滿滿',
    preview: REPORT_IMAGES.styleSweet,
    prompt:
      '甜美少女風格：粉嫩系妝容，蜜桃色腮紅，透明感唇釉，臥蠶妝，圓溜溜的大眼效果。髮型為空氣瀏海+半紮髮或雙馬尾，髮色為淺棕色或帶有粉色調。穿搭為粉白色蕾絲上衣、針織背心、百褶裙，整體色調為粉白、淺紫、鵝黃。背景為明亮的臥室或咖啡廳，柔光效果，清新元氣，少女雜誌風。',
  },
];

// 改造圖當前無法生成（額度用盡/限流）時，降級顯示的風格重點文字卡
const STYLE_POINTS: Record<string, string[]> = {
  korean: ['清透無瑕底妝＋玫瑰豆沙唇', '八字瀏海・大波浪・奶茶棕', '針織衫×米杏風衣×寬褲長裙'],
  french: ['勃艮第紅唇＋自然霧底妝', '微亂長髮・深棕/亞麻棕', '白襯衫×針織開衫×直筒牛仔'],
  mature: ['飽和紅唇＋貓眼線＋立體修容', '側分大波浪・黑茶深色', '合身西裝×真絲襯衫×鉛筆裙'],
  sweet: ['蜜桃腮紅＋果汁唇＋臥蠶', '空氣瀏海・蛋捲頭・淺棕', '粉色針織×娃娃領×百褶裙'],
};

interface PartAiStyleProps {
  style: StyleResult;
  facePhotoUrls: string[];
  bodyPhotoUrls?: string[];
  isPaid?: boolean;
}

const PartAiStyle: React.FC<PartAiStyleProps> = ({
  style,
  facePhotoUrls,
  bodyPhotoUrls = [],
  isPaid = true,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('korean');
  const [generating, setGenerating] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);

  const allPhotos = [...facePhotoUrls, ...bodyPhotoUrls];
  const currentPhotoUrl = allPhotos[selectedPhotoIdx] ?? allPhotos[0] ?? '';
  const currentStyle = STYLE_OPTIONS.find((s) => s.id === selectedStyle) ?? STYLE_OPTIONS[0];
  const visibleStyles = isPaid ? STYLE_OPTIONS : STYLE_OPTIONS.slice(0, 1);

  const handleGenerate = useCallback(async () => {
    if (!currentPhotoUrl) {
      toast.error('請先上傳人像照片再生成風格改造照');
      return;
    }

    setGenerating(true);
    setError(null);
    setFallback(false);
    setResultImage(null);
    setActiveTab('after');

    try {
      const result = await capabilityClient
        .load(PLUGIN_ID)
        .call<ViviMacauAiStylePhotoEditOneOutput>('imageToImage', {
          user_portrait: [currentPhotoUrl],
          style_reference_images: [],
          style_description: currentStyle.prompt,
          image_ratio: '3:4',
        });

      const images = result.images;
      if (images && images.length > 0) {
        setResultImage(images[0]);
        toast.success('風格改造照生成成功！');
      } else if ((result as { fallback?: boolean }).fallback) {
        // 後端生成額度用盡/限流 → 降級為文字風格卡，不報錯
        setFallback(true);
      } else {
        setFallback(true);
      }
    } catch (err) {
      logger.error('AI 風格改造生成失敗', err);
      // 出錯也降級為文字風格卡，避免畫面空白
      setFallback(true);
    } finally {
      setGenerating(false);
    }
  }, [currentPhotoUrl, currentStyle]);

  const handleStyleSelect = (styleId: string) => {
    if (!isPaid && styleId !== STYLE_OPTIONS[0].id) {
      toast.info('解鎖完整報告解鎖全部改造風格');
      return;
    }
    setSelectedStyle(styleId);
    setResultImage(null);
    setFallback(false);
    setError(null);
  };

  return (
    <div className="bg-cream-light rounded-3xl border border-border/60 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-burgundy to-burgundy-deep px-6 md:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <Badge
              variant="outline"
              className="text-white/80 border-white/30 text-xs uppercase tracking-widest mb-1"
            >
              AI Style
            </Badge>
            <h2 className="font-serif text-2xl md:text-3xl text-white">
              你的專屬風格改造
            </h2>
          </div>
        </div>
        <p className="text-white/70 text-sm mt-3 ml-13">
          結合本次測試推薦，一鍵生成你的風格改造效果
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {!isPaid && (
          <div className="bg-gold-brown/10 border border-gold-brown/30 rounded-xl px-4 py-3 text-xs text-gold-brown flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              預覽版僅限體驗 1 款風格，解鎖完整報告可體驗全部 {STYLE_OPTIONS.length} 種改造風格
            </span>
          </div>
        )}

        {allPhotos.length > 1 && (
          <div className="space-y-2">
            <h3 className="font-serif text-lg text-foreground">選擇參考照片</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allPhotos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIdx(idx)}
                  className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhotoIdx === idx
                      ? 'border-burgundy shadow-md'
                      : 'border-border hover:border-burgundy/40'
                  }`}
                >
                  <Image
                    src={url}
                    alt={`參考照片 ${idx + 1}`}
                    width={64}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-serif text-lg text-foreground mb-4">
            選擇想要體驗的風格
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {visibleStyles.map((opt) => {
              const isSelected = selectedStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleStyleSelect(opt.id)}
                  className={`text-left rounded-xl overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-burgundy ring-2 ring-burgundy/20 shadow-md'
                      : 'border-border/60 hover:border-burgundy/40'
                  }`}
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={opt.preview}
                      alt={opt.name}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 768px) 45vw, 160px"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-burgundy flex items-center justify-center">
                        <ChevronRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="font-serif text-white text-base">{opt.name}</p>
                      <p className="text-white/70 text-xs">{opt.tagline}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-warm-beige/20 rounded-xl p-4 border border-warm-beige/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-gold-brown shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-foreground text-sm mb-1">
                {currentStyle.name} · {currentStyle.tagline}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStyle.description}
              </p>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-cream/50 shadow-sm">
          <div className="absolute top-3 left-3 z-10 flex gap-1.5 bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow-sm">
            <button
              onClick={() => setActiveTab('before')}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                activeTab === 'before'
                  ? 'bg-burgundy text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              原圖
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                activeTab === 'after'
                  ? 'bg-burgundy text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              改造後
            </button>
          </div>
          <div className="aspect-[3/4] w-full flex items-center justify-center">
            {activeTab === 'before' && currentPhotoUrl ? (
              <Image
                src={currentPhotoUrl}
                alt="原圖"
                sizes="(max-width: 768px) 100vw, 500px"
                className="w-full h-full object-contain"
              />
            ) : activeTab === 'after' && generating ? (
              <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-burgundy/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-burgundy border-t-transparent rounded-full animate-spin" />
                  <Wand2 className="absolute inset-0 m-auto w-6 h-6 text-burgundy" />
                </div>
                <div>
                  <p className="font-serif text-lg text-burgundy mb-1">
                    AI 正在為你改造中…
                  </p>
                  <p className="text-sm text-muted-foreground">
                    約 30-60 秒，保留你的長相特徵
                  </p>
                </div>
              </div>
            ) : activeTab === 'after' && resultImage ? (
              <>
                <Image
                  src={resultImage}
                  alt={`${currentStyle.name} 風格改造效果`}
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/90 text-burgundy text-xs shadow-sm">
                    ✓ {currentStyle.name}
                  </Badge>
                </div>
              </>
            ) : activeTab === 'after' && fallback ? (
              <div className="w-full h-full overflow-y-auto bg-cream-light px-6 py-7 flex flex-col">
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy/10 text-burgundy text-[11px] font-semibold tracking-wider px-3 py-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentStyle.tagline}
                  </span>
                  <p className="font-serif text-2xl text-burgundy mt-3">
                    {currentStyle.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {currentStyle.description}
                  </p>
                </div>
                <div className="mt-5 space-y-2.5 flex-1">
                  {(STYLE_POINTS[currentStyle.id] ?? []).map((p) => (
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
                  className="mt-3 border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-white"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  重新生成改造照
                </Button>
              </div>
            ) : activeTab === 'after' ? (
              <div className="text-center space-y-3 px-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-burgundy/10 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-burgundy/60" />
                </div>
                <p className="font-serif text-lg text-foreground">
                  一鍵生成你的風格改造效果
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  根據你上傳的照片與測試結果，
                  <br />
                  為你生成「{currentStyle.name}」風格的改造效果圖
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-burgundy hover:bg-burgundy-deep text-white rounded-xl min-h-12 text-base"
            onClick={handleGenerate}
            disabled={generating || !currentPhotoUrl}
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                生成中，請稍候…
              </>
            ) : resultImage ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                生成{currentStyle.name}風格照
              </>
            )}
          </Button>
          {isPaid && resultImage && (
            <Button
              variant="outline"
              className="sm:w-auto"
              onClick={() => {
                const nextIdx =
                  (STYLE_OPTIONS.findIndex((s) => s.id === selectedStyle) + 1) %
                  STYLE_OPTIONS.length;
                setSelectedStyle(STYLE_OPTIONS[nextIdx].id);
                setResultImage(null);
                setActiveTab('after');
              }}
            >
              換個風格
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed bg-cream/60 rounded-xl px-4 py-3 border border-border/60">
          <span className="font-medium text-foreground">溫馨提示：</span>
          AI 生成的風格改造照僅供造型參考，實際妝容與穿搭效果會因個人特質與現場條件有所差異。
          最適合你的形象仍建議搭配完整報告與專業顧問咨詢。
        </p>
      </div>
    </div>
  );
};

export default PartAiStyle;
