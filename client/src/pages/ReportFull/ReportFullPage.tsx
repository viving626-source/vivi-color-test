import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { ChevronRight, FileText, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { colorTest } from '@client/src/api';
import { useTestSession } from '@client/src/hooks/useTestSession';

import PartStylePreview from './PartStylePreview';
import PartSeason from './PartSeason';
import PartFacial from './PartFacial';
import PartCelebrity from './PartCelebrity';
import PartHairstyle from './PartHairstyle';
import PartStyle from './PartStyle';
import PartAiStyle from './PartAiStyle';
import { ReportHeader, ReportFooter } from './ReportHeader';

import type { RecordResponse } from '@shared/api.interface';

const ReportFullPage = () => {
  const { session } = useTestSession();
  const [record, setRecord] = useState<RecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!session?.sessionId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await colorTest.getRecord(session.sessionId);
      setRecord(data);
    } catch (err) {
      logger.error('獲取完整報告失敗', err);
      setError('載入失敗，請重試');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void fetchRecord();
  }, [session?.sessionId, fetchRecord]);

  // 列印 / 另存 PDF：完全使用瀏覽器原生能力，免後端、免第三方、手機與桌面皆可
  const handlePrint = () => {
    window.print();
  };

  // --- render states ---
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="font-serif text-2xl text-burgundy mb-4">Vivi Macau</div>
          <div className="text-muted-foreground">正在載入您的專屬報告…</div>
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
          <p className="text-muted-foreground mb-6">
            請先完成色彩與風格測試並解鎖完整報告。
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

  if (error || !record || !record.seasonResult) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-burgundy/10 flex items-center justify-center">
            <FileText className="size-6 text-burgundy" />
          </div>
          <h2 className="font-serif text-2xl text-burgundy mb-2">尚未解鎖完整報告</h2>
          <p className="text-muted-foreground mb-6">
            請先完成色彩測試問卷並支付解鎖，即可查看 10+ 版完整詳細分析。
          </p>
          <Button asChild className="bg-burgundy text-primary-foreground">
            <Link to="/report/preview">
              查看免費預覽
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { seasonResult, facialResult, hairstyleResult, styleResult } = record;

  return (
    <div className="min-h-screen bg-cream">
      {/* 浮動操作列（列印時自動隱藏） */}
      <div className="no-print sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="font-serif text-lg font-bold text-burgundy">Vivi Macau</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-white"
            >
              <Printer className="size-4 mr-1.5" />
              列印 / 儲存 PDF
            </Button>
          </div>
        </div>
      </div>

      {/* 報告內容 */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {session.facePhotoUrls.length > 0 && (
          <PartStylePreview
            styleResult={styleResult}
            facePhotoUrl={session.facePhotoUrls[0]}
          />
        )}

        <ReportHeader
          mainStyle={styleResult.mainStyle}
          keywords={styleResult.keywords}
        />

        <PartSeason season={seasonResult} />
        <PartFacial
          facial={facialResult}
          facePhotoUrl={session.facePhotoUrls[0] ?? ''}
          bodyPhotoUrl={session.bodyPhotoUrls[0]}
          seasonResult={seasonResult}
          styleResult={styleResult}
        />
        <PartCelebrity
          celebrities={styleResult.celebrities}
          mainStyle={styleResult.mainStyle}
        />
        <PartHairstyle hairstyle={hairstyleResult} />
        <PartStyle style={styleResult} />

        {/* 手動 4 風格遊樂場為互動功能，不列入 PDF（PDF 僅保留自動主風格預覽＋完整文字報告） */}
        <div className="no-print">
          <PartAiStyle
            style={styleResult}
            facePhotoUrls={session.facePhotoUrls}
            bodyPhotoUrls={session.bodyPhotoUrls}
            isPaid={true}
          />
        </div>

        <ReportFooter />
      </div>
    </div>
  );
};

export default ReportFullPage;
