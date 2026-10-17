import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

import { colorTest } from '@client/src/api';
import { Button } from '@client/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';

type Phase = 'waiting' | 'paid' | 'failed' | 'cancelled';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderNo = params.get('orderNo') || '';
  const initialStatus = params.get('status');
  const [phase, setPhase] = useState<Phase>(
    initialStatus === 'failed'
      ? 'failed'
      : initialStatus === 'cancelled'
        ? 'cancelled'
        : 'waiting',
  );
  const [tries, setTries] = useState(0);
  const pollRef = useRef<number | null>(null);
  const stopRef = useRef(false);

  const poll = useCallback(async () => {
    if (!orderNo) {
      setPhase('failed');
      return;
    }
    try {
      const res = await colorTest.getOrderStatus(orderNo);
      const st = res.order.status;
      if (st === 'paid') {
        stopRef.current = true;
        setPhase('paid');
        setTimeout(() => navigate('/report/full'), 900);
      } else if (st === 'failed') {
        setPhase('failed');
      } else if (st === 'cancelled') {
        setPhase('cancelled');
      }
    } catch (e) {
      logger.error('支付結果查詢失敗', e);
    }
    setTries((t) => t + 1);
  }, [orderNo, navigate]);

  useEffect(() => {
    // 以服務端 Datafeed 為準，頁面輪詢最多約 2 分鐘（每 3 秒一次）
    void poll();
    pollRef.current = window.setInterval(() => {
      if (stopRef.current || tries >= 40) {
        if (pollRef.current) window.clearInterval(pollRef.current);
        return;
      }
      void poll();
    }, 3000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-light to-cream pt-24 pb-20 px-4 flex items-start justify-center">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-xl bg-cream-light/95">
          <CardHeader className="text-center">
            {phase === 'paid' ? (
              <>
                <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="size-9 text-green-600" />
                </div>
                <CardTitle className="font-serif text-2xl text-burgundy">
                  支付成功！
                </CardTitle>
                <p className="text-sm text-muted-foreground">正在為你解鎖完整報告…</p>
              </>
            ) : phase === 'failed' ? (
              <>
                <div className="mx-auto size-16 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <XCircle className="size-9 text-red-600" />
                </div>
                <CardTitle className="font-serif text-2xl text-burgundy">
                  支付未完成
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  如已扣款，系統確認後會自動解鎖；你也可以重新發起支付。
                </p>
              </>
            ) : phase === 'cancelled' ? (
              <>
                <div className="mx-auto size-16 rounded-full bg-cream flex items-center justify-center mb-3">
                  <XCircle className="size-9 text-muted-foreground" />
                </div>
                <CardTitle className="font-serif text-2xl text-burgundy">
                  已取消支付
                </CardTitle>
                <p className="text-sm text-muted-foreground">你可以重新選擇支付方式。</p>
              </>
            ) : (
              <>
                <div className="mx-auto size-16 rounded-full bg-burgundy/10 flex items-center justify-center mb-3">
                  <Loader2 className="size-9 text-burgundy animate-spin" />
                </div>
                <CardTitle className="font-serif text-2xl text-burgundy">
                  正在確認支付結果…
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  請勿關閉頁面，支付成功後將自動解鎖完整報告。
                </p>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {orderNo && (
              <p className="text-center text-xs text-muted-foreground font-mono">
                訂單號：{orderNo}
              </p>
            )}
            {phase === 'waiting' && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                正在與支付機構核實，通常只需幾秒鐘…
              </div>
            )}
            {(phase === 'failed' || phase === 'cancelled') && (
              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  onClick={() => navigate('/payment')}
                  className="w-full h-11 bg-burgundy text-cream-light hover:bg-burgundy-deep"
                >
                  重新支付
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/report/preview')}
                  className="w-full"
                >
                  返回免費報告
                </Button>
              </div>
            )}
            {phase === 'paid' && (
              <Button
                type="button"
                onClick={() => navigate('/report/full')}
                className="w-full h-11 bg-burgundy text-cream-light hover:bg-burgundy-deep"
              >
                立即查看完整報告
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentResultPage;
