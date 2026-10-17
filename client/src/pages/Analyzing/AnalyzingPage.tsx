import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { RefreshCw, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTestSession } from '@client/src/hooks/useTestSession';
import { colorTest } from '@client/src/api';

const MIN_ANIMATION_MS = 6000;

type AnalyzeState = 'loading' | 'done' | 'error';

const ANALYSIS_STEPS = [
  { label: '分析膚色底色', desc: '判斷冷暖 / 深淺 / 清濁' },
  { label: '檢測五官特徵', desc: '量感 · 輪廓 · 比例' },
  { label: '比對色彩數據庫', desc: '16型色彩系統比對' },
  { label: '生成個人化報告', desc: '專屬配色 · 妝容 · 穿搭建議' },
];

const AnalyzingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useTestSession();

  const [state, setState] = useState<AnalyzeState>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [stepIndex, setStepIndex] = useState(0);
  const startedAtRef = useRef<number>(0);
  const hasGeneratedRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasSession = !!session?.sessionId;

  const handleGenerate = useCallback(async () => {
    if (!session?.sessionId) {
      setErrorMsg('找不到測試記錄，請重新開始');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');
    startedAtRef.current = Date.now();

    try {
      await colorTest.generateReport({ sessionId: session.sessionId });

      const elapsed = Date.now() - startedAtRef.current;
      const remaining = Math.max(0, MIN_ANIMATION_MS - elapsed);

      timerRef.current = setTimeout(() => {
        setState('done');
        navigate('/report/preview');
      }, remaining);
    } catch (error: unknown) {
      logger.error('生成報告失敗', error);
      const err = error as {
        response?: { data?: { error?: { message?: string } } };
      };
      const msg =
        err?.response?.data?.error?.message ?? '生成失敗，請重試';
      setErrorMsg(msg);
      setState('error');
      toast.error(msg);
    }
  }, [session, navigate]);

  // Kick off generation once session is available
  useEffect(() => {
    if (!hasSession) return;
    if (hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;

    const delayTimer = setTimeout(() => {
      void handleGenerate();
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [hasSession, handleGenerate]);

  // Step carousel
  useEffect(() => {
    if (state !== 'loading') return;
    stepTimerRef.current = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 1500);
    return () => {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    };
  }, [state]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    };
  }, []);

  const handleRetry = () => {
    hasGeneratedRef.current = false;
    void handleGenerate();
    hasGeneratedRef.current = true;
  };

  const displayState: AnalyzeState = hasSession ? state : 'error';
  const displayError = hasSession ? errorMsg : '找不到測試記錄，請重新開始測試';

  return (
    <div
      data-testid="analyzing-page"
      className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(350 35% 75%) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(45 50% 45%) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Brand */}
        <h1 className="font-serif text-5xl text-burgundy mb-2 tracking-tight">
          Vivi Macau
        </h1>
        <p className="text-sm text-muted-foreground mb-10 tracking-widest uppercase">
          Personal Color Analysis
        </p>

        {displayState === 'loading' && (
          <>
            {/* Spinner */}
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-burgundy/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-burgundy animate-spin"
                style={{ animationDuration: '1s' }}
              />
              <div className="absolute inset-4 rounded-full bg-cream-light flex items-center justify-center">
                <span className="font-serif text-2xl text-burgundy">
                  {Math.floor(((stepIndex + 1) / ANALYSIS_STEPS.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-10 w-full">
              {ANALYSIS_STEPS.map((step, idx) => {
                const isActive = idx === stepIndex;
                const isDone = idx < stepIndex;
                return (
                  <div
                    key={step.label}
                    className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-cream-light border border-border/60"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all duration-300
                        ${isDone ? 'bg-burgundy text-white' : ''}
                        ${isActive ? 'bg-burgundy text-white scale-110' : ''}
                        ${!isDone && !isActive ? 'bg-border/50 text-muted-foreground' : ''}
                      `}
                    >
                      {isDone ? '✓' : idx + 1}
                    </span>
                    <div className="text-left">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isActive || isDone ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

             <p className="text-sm text-muted-foreground animate-pulse">
               正在為你分析，請稍候...
             </p>
          </>
        )}

        {displayState === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-burgundy/10 flex items-center justify-center mb-6">
              <RefreshCw className="w-10 h-10 text-burgundy" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">
              分析失敗
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {displayError}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetry} className="px-8">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新分析
              </Button>
              <Button
                variant="outline"
                asChild
              >
                <Link to="/quiz">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回問卷
                </Link>
              </Button>
            </div>
          </div>
        )}

        {displayState === 'done' && (
          <p className="text-burgundy font-medium">分析完成，正在跳轉...</p>
        )}
      </div>

      {/* Back to home */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-burgundy transition-colors"
        >
          ← 返回首頁
        </Link>
      </div>
    </div>
  );
};

export default AnalyzingPage;
