import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { ChevronRight, RefreshCw, Lock, Sparkles, FileText, Wand2 } from 'lucide-react';

import PartStylePreview from '@client/src/pages/ReportFull/PartStylePreview';
import ShareCard from '@client/src/pages/ReportPreview/ShareCard';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { useTestSession } from '@client/src/hooks/useTestSession';
import { colorTest } from '@client/src/api';
import { REPORT_IMAGES } from '@client/src/data/quizImages';
import type { RecordResponse, SeasonScore } from '@shared/api.interface';

const SEASON_LABELS: Record<keyof SeasonScore, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
};

const SEASON_COLORS: Record<keyof SeasonScore, string> = {
  spring: 'bg-rose-dust',
  summer: 'bg-burgundy-light',
  autumn: 'bg-gold-brown',
  winter: 'bg-burgundy',
};

function computePercentages(scores: SeasonScore): Record<keyof SeasonScore, number> {
  const total = scores.spring + scores.summer + scores.autumn + scores.winter;
  if (total <= 0) return { spring: 25, summer: 25, autumn: 25, winter: 25 };
  return {
    spring: Math.round((scores.spring / total) * 100),
    summer: Math.round((scores.summer / total) * 100),
    autumn: Math.round((scores.autumn / total) * 100),
    winter: Math.round((scores.winter / total) * 100),
  };
}

function ReportPreviewPage() {
  const { session } = useTestSession();
  const navigate = useNavigate();
  const [record, setRecord] = useState<RecordResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await colorTest.getRecord(sessionId);
      setRecord(data);
    } catch (err) {
      logger.error('獲取報告失敗', err);
      setError('載入報告失敗，請重試');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.sessionId) {
      setLoading(false);
      return;
    }
    void fetchRecord(session.sessionId);
  }, [session, fetchRecord]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">正在載入你的報告…</p>
        </div>
      </div>
    );
  }

  if (!session?.sessionId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-burgundy/10 flex items-center justify-center">
            <FileText className="size-6 text-burgundy" />
          </div>
          <h2 className="font-serif text-2xl text-burgundy mb-2">尚未開始測試</h2>
          <p className="text-muted-foreground mb-4">
            請先完成色彩與風格測試，即可獲得你的專屬分析報告。
          </p>
          <p className="text-sm text-gold-brown mb-6 font-medium">
            <span className="line-through text-muted-foreground mr-2">原價 MOP 88</span>
            完整報告解鎖價 MOP 38
          </p>
          <Button asChild className="bg-burgundy text-primary-foreground">
            <Link to="/upload">
              開始測試
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-burgundy/10 flex items-center justify-center">
            <RefreshCw className="size-6 text-burgundy" />
          </div>
          <h2 className="font-serif text-2xl text-burgundy mb-2">尚未完成測試</h2>
          <p className="text-muted-foreground mb-4">
            請先完成色彩與風格問卷，即可生成你的專屬分析報告。
          </p>
          <p className="text-sm text-gold-brown mb-6 font-medium">
            <span className="line-through text-muted-foreground mr-2">原價 MOP 88</span>
            完整報告解鎖價 MOP 38
          </p>
          <Button asChild className="bg-burgundy text-primary-foreground">
            <Link to="/quiz">
              前往問卷
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!record || !record.seasonResult) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-burgundy/10 flex items-center justify-center">
            <FileText className="size-6 text-burgundy" />
          </div>
          <h2 className="font-serif text-2xl text-burgundy mb-2">尚未完成測試</h2>
          <p className="text-muted-foreground mb-4">
            請先完成色彩與風格測試，即可獲得你的專屬分析報告。
          </p>
          <p className="text-sm text-gold-brown mb-6 font-medium">
            <span className="line-through text-muted-foreground mr-2">原價 MOP 88</span>
            完整報告解鎖價 MOP 38
          </p>
          <Button asChild className="bg-burgundy text-primary-foreground">
            <Link to="/upload">
              開始測試
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { seasonResult, styleResult } = record;
  const percentages = computePercentages(seasonResult.scores);
  const isPaid = record.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="font-serif text-xl text-burgundy tracking-wide">Vivi Macau</p>
          <h1 className="font-serif text-3xl text-foreground leading-tight">
            2027 最新韓流色彩
            <br />
            妝容風格測試
          </h1>
          <p className="text-sm text-muted-foreground">你的專屬色彩與風格分析報告</p>
        </div>

        <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-8 space-y-8">
          <div className="text-center space-y-4">
            <Badge className="bg-burgundy text-primary-foreground px-4 py-1 rounded-full text-xs uppercase tracking-wider">
              免費預覽版
            </Badge>
            <h2 className="font-serif text-3xl text-burgundy leading-tight">
              {seasonResult.typeName}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {seasonResult.keywords.map((kw: string) => (
                <span
                  key={kw}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-warm-beige/40 text-sm text-burgundy border border-burgundy/10"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-muted-foreground text-sm">
              主：{SEASON_LABELS[seasonResult.primarySeason]}季型 · 輔：
              {SEASON_LABELS[seasonResult.secondarySeason]}季型
            </p>
            <div className="space-y-3">
              {(Object.keys(SEASON_LABELS) as Array<keyof SeasonScore>).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{SEASON_LABELS[key]}季</span>
                    <span className="text-muted-foreground">{percentages[key]}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SEASON_COLORS[key]} transition-all`}
                      style={{ width: `${percentages[key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-border shadow-md bg-cream-light">
              <Image
                src={REPORT_IMAGES.styleKorean}
                alt="風格定位主視覺"
                sizes="(max-width: 768px) 100vw, 400px"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep/80 via-burgundy-deep/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                    PART 4 · Style
                  </p>
                  <h3 className="font-serif text-2xl leading-tight">
                    你的風格定位：春日暖系輕熟女
                  </h3>
                </div>
                <p className="text-sm opacity-90 tracking-wide">
                  溫柔 · 優雅 · 知性
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="size-6 rounded-full border-2 border-white/60 shadow-sm"
                    style={{ backgroundColor: '#D4A574' }}
                  />
                  <div
                    className="size-6 rounded-full border-2 border-white/60 shadow-sm"
                    style={{ backgroundColor: '#E8B4B8' }}
                  />
                  <div
                    className="size-6 rounded-full border-2 border-white/60 shadow-sm"
                    style={{ backgroundColor: '#C4A882' }}
                  />
                  <span className="text-xs opacity-70 ml-1">推薦色</span>
                </div>
                <p className="text-xs opacity-70 pt-1 border-t border-white/20">
                  解鎖完整報告，查看詳細風格分析與穿搭建議
                </p>
              </div>
             </div>

           {styleResult && (
             <PartStylePreview
               styleResult={styleResult}
               facePhotoUrl={session.facePhotoUrls[0] ?? ''}
               locked
             />
           )}

           {!styleResult && (
             <div className="bg-gradient-to-br from-burgundy/5 to-cream-light rounded-2xl border border-border overflow-hidden">
               <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-burgundy flex items-center justify-center">
                   <Wand2 className="w-4 h-4 text-white" />
                 </div>
                 <div>
                   <p className="text-xs uppercase tracking-widest text-burgundy/70 font-medium">
                     Style Transform · 預覽體驗
                   </p>
                   <h3 className="font-serif text-xl text-burgundy-deep">
                     你的專屬風格改造預覽
                   </h3>
                 </div>
               </div>
               <div className="px-5 pb-5 space-y-4">
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   結合你上傳的照片與測試結果，為你生成「韓系輕熟」風格改造效果，保留你的面部特徵，換上推薦妝容與穿搭。
                 </p>
                 <div className="flex items-center gap-3">
                   <Button
                     asChild
                     className="flex-1 bg-burgundy text-white rounded-xl min-h-11"
                   >
                     <Link to="/payment">
                       <Sparkles className="w-4 h-4" />
                       解鎖風格改造
                       <ChevronRight className="w-4 h-4" />
                     </Link>
                   </Button>
                 </div>
                 <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border/60 bg-cream/50 flex items-center justify-center">
                   <Image
                     src={REPORT_IMAGES.styleKorean}
                     alt="風格改造範例"
                     sizes="(max-width: 768px) 100vw, 400px"
                     className="w-full h-full object-cover opacity-80"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep/40 to-transparent" />
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs text-burgundy px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                     <Lock className="w-3 h-3" />
                     解鎖生成你的專屬改造照
                   </div>
                   <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                     <p className="font-serif text-lg">韓系輕熟 · 範例效果</p>
                     <p className="text-xs opacity-80">解鎖後上傳你的照片一鍵生成</p>
                   </div>
                 </div>
               </div>
             </div>
           )}

          <div className="pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              <span className="font-medium text-foreground">理論依據：</span>
              本測試參考韓國 PCS 16 型體系、歐美四季色彩理論與法式 Colorimétrie 色彩分析方法，結合影像辨識技術進行線上分析。
            </p>
            <p>
              <span className="font-medium text-foreground">免責聲明：</span>
              線上測試與照片分析為自我參考，無法 100% 取代線下專業色布比對與儀器測色，最終診斷以專業色彩顧問面對面為準。本網站提供的建議僅供參考，不構成任何專業形象設計或醫療美容建議。
            </p>
          </div>
        </div>

        <ShareCard season={seasonResult} />

        <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-gold-brown" />
            <h3 className="font-serif text-xl text-burgundy">
              解鎖完整詳細報告（10+ 版）
            </h3>
          </div>

          <ul className="space-y-3 text-sm text-foreground">
             <li className="flex gap-3">
               <span className="text-burgundy shrink-0">☑</span>
               <span>PART 1 四季型人格分析完整版</span>
             </li>
             <li className="flex gap-3">
               <span className="text-burgundy shrink-0">☑</span>
               <span>PART 2 影像個人化分析 &amp; 妝容珠寶</span>
             </li>
             <li className="flex gap-3">
               <span className="text-burgundy shrink-0">☑</span>
               <span>PART 3 明星風格參考（造型靈感）</span>
             </li>
             <li className="flex gap-3">
               <span className="text-burgundy shrink-0">☑</span>
               <span>PART 4 髮型 &amp; 髮色分析（6 款髮型 + 6 款髮色）</span>
             </li>
             <li className="flex gap-3">
               <span className="text-burgundy shrink-0">☑</span>
               <span>PART 5 風格定位 &amp; 整體建議</span>
             </li>
            <li className="flex gap-3">
              <span className="text-burgundy shrink-0">☑</span>
              <span>一鍵導出 PDF，永久保存</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-border flex items-baseline justify-between">
            <span className="text-muted-foreground text-sm">價格</span>
            <div className="text-right">
              <span className="text-sm text-muted-foreground line-through mr-2">MOP 88</span>
              <span className="text-2xl font-serif text-burgundy">MOP 38</span>
              <span className="text-sm text-muted-foreground"> / HKD</span>
            </div>
          </div>

          {isPaid ? (
            <div className="space-y-3">
              <Badge className="bg-success text-success-foreground px-3 py-1 rounded-full text-sm w-fit">
                ✓ 已解鎖
              </Badge>
              <Button
                onClick={() => navigate('/report/full')}
                className="w-full bg-burgundy text-primary-foreground rounded-xl min-h-12 text-base"
              >
                查看完整報告
                <ChevronRight className="size-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/payment')}
              className="w-full bg-burgundy text-primary-foreground rounded-xl min-h-12 text-base"
            >
              <Lock className="size-4" />
              立即解鎖完整報告
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          © Vivi Macau · 你的色彩，由你定義
        </p>
      </div>
    </div>
  );
}

export default ReportPreviewPage;
