import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { resolveAppUrl } from '@lark-apaas/client-toolkit/utils/resolveAppUrl';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { colorTest } from '@client/src/api';
import { quizDimensions } from '@client/src/data/quizData';
import { DIMENSION_ICONS } from '@client/src/data/quizImages';
import { useTestSession } from '@client/src/hooks/useTestSession';
import type { QuizDimension, QuizAnswer, SeasonScore } from '@shared/api.interface';

type ViewMode = 'overview' | 'quiz';

interface FlattenedQuestion {
  dimensionId: string;
  dimensionName: string;
  dimensionIndex: number;
  questionIndex: number;
  questionId: string;
  text: string;
  imageUrl?: string;
  options: {
    id: string;
    text: string;
    imageUrl?: string;
    scoreSeason?: Partial<SeasonScore>;
  }[];
}

function flattenQuestions(dimensions: QuizDimension[]): FlattenedQuestion[] {
  const result: FlattenedQuestion[] = [];
  dimensions.forEach((dim, dimIdx) => {
    dim.questions.forEach((q, qIdx) => {
      result.push({
        dimensionId: dim.id,
        dimensionName: dim.name,
        dimensionIndex: dimIdx,
        questionIndex: qIdx,
        questionId: `${dim.id}-${q.id}`,
        text: q.text,
        imageUrl: q.imageUrl,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          imageUrl: opt.imageUrl,
          scoreSeason: opt.scoreSeason,
        })),
      });
    });
  });
  return result;
}

function makeAnswerKey(dimensionId: string, questionId: string): string {
  return `${dimensionId}-${questionId}`;
}

const QuizPage: React.FC = () => {
  const { session, startSession, setAnswer, setProgress, ensureRecord } =
    useTestSession();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const answersRef = useRef<Record<string, string>>({});
  const handleSubmitRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const allQuestions = useMemo<FlattenedQuestion[]>(
    () => flattenQuestions(quizDimensions),
    [],
  );

  const totalQuestions = useMemo<number>(
    () => allQuestions.length,
    [allQuestions.length],
  );

  const answeredCount = useMemo(() => {
    if (!session) return 0;
    return allQuestions.filter((q) =>
      session.answers[makeAnswerKey(q.dimensionId, q.questionId)],
    ).length;
  }, [session, allQuestions]);

  useEffect(() => {
    if (!session) {
      startSession();
    }
  }, [session, startSession]);

  useEffect(() => {
    if (session && totalQuestions > 0) {
      setProgress(answeredCount, totalQuestions);
    }
  }, [answeredCount, totalQuestions, session, setProgress]);

  useEffect(() => {
    if (viewMode === 'quiz' && allQuestions[currentQuestionIndex]) {
      const key = makeAnswerKey(
        currentQuestion.dimensionId,
        currentQuestion.questionId,
      );
      setSelectedOption(session.answers[key] ?? null);
    }
  }, [viewMode, currentQuestionIndex, allQuestions]);

  const isDimensionComplete = useCallback(
    (dim: QuizDimension): boolean => {
      return dim.questions.every((q) => {
        const key = makeAnswerKey(dim.id, q.id);
        return Boolean(answersRef.current[key]);
      });
    },
    [],
  );

  const dimensionProgress = useCallback(
    (dim: QuizDimension): { answered: number; total: number } => {
      const answered = dim.questions.filter((q) => {
        const key = makeAnswerKey(dim.id, q.id);
        return Boolean(answersRef.current[key]);
      }).length;
      return { answered, total: dim.questions.length };
    },
    [],
  );

  const buildAnswers = useCallback((): QuizAnswer[] => {
    const answers: QuizAnswer[] = [];
    for (const q of allQuestions) {
      const key = makeAnswerKey(q.dimensionId, q.questionId);
      const answerId = answersRef.current[key];
      if (!answerId) continue;
      const opt = q.options.find((o) => o.id === answerId);
      answers.push({
        questionId: q.questionId,
        answer: answerId,
        dimensionId: q.dimensionId,
        dimensionName: q.dimensionName,
        scoreSeason: opt?.scoreSeason,
      });
    }
    return answers;
  }, [allQuestions]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (submitting) return;
    if (!session) {
      toast.error('會話初始化中，請稍後重試');
      return;
    }
    setSubmitting(true);

    const timeoutId = setTimeout(() => {
      setSubmitting(false);
      toast.error('提交逾時，請稍後重試');
    }, 30000);

    try {
      await ensureRecord();
      const answers = buildAnswers();
      await colorTest.submitQuiz({
        sessionId: session.sessionId,
        answers,
      });
      clearTimeout(timeoutId);
      // eslint-disable-next-line no-restricted-syntax
      window.location.href = resolveAppUrl('/analyzing');
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error('提交測驗失敗', error);
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      const msg = err.response?.data?.error?.message || '提交失敗，請稍後重試';
      toast.error(msg);
      setSubmitting(false);
    }
  }, [submitting, session, ensureRecord, buildAnswers]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const handleEnterDimension = useCallback(
    (dimIndex: number): void => {
      const firstIdx = allQuestions.findIndex(
        (q) => q.dimensionIndex === dimIndex,
      );
      if (firstIdx >= 0) {
        setCurrentQuestionIndex(firstIdx);
        setViewMode('quiz');
      }
    },
    [allQuestions],
  );

  const handleStart = useCallback((): void => {
    setCurrentQuestionIndex(0);
    setViewMode('quiz');
  }, []);

  const getDimensionIconKey = (dimId: string): string => {
    const map: Record<string, string> = {
      'skin-tone': 'skin-tone',
      'brightness': 'hair-color',
      'chroma': 'color-preference',
      'contrast': 'eye',
      'features': 'accessory',
      'bone-structure': 'bone-structure',
      'makeup-preference': 'makeup-preference',
      'hairstyle-preference': 'hairstyle-preference',
      'jewelry': 'jewelry',
      'clothing': 'clothing',
      'aura': 'aura',
      'style': 'style',
    };
    return map[dimId] ?? 'skin-tone';
  };

  const handleSelectOption = useCallback(
    (optionId: string): void => {
      const q = allQuestions[currentQuestionIndex];
      if (!q) return;
      const key = makeAnswerKey(currentQuestion.dimensionId, currentQuestion.questionId);
      setAnswer(key, optionId);
      setSelectedOption(optionId);

      const isLast = currentQuestionIndex === allQuestions.length - 1;
      if (!isLast) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 300);
      }
    },
    [currentQuestionIndex, allQuestions, setAnswer],
  );

  const handlePrevious = useCallback((): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleBackToOverview = useCallback((): void => {
    setViewMode('overview');
  }, []);

  const progressPercent = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  const currentQuestion = allQuestions[currentQuestionIndex];

  if (viewMode === 'overview') {
    return (
      <div className="min-h-screen bg-[#F7F1EA] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#A05060] mb-3">
              VIVI MACAU
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#7B2D3A] mb-3">
              色彩風格測驗
            </h1>
            <p className="text-[#7A6565] text-base">
               共 {totalQuestions} 題 · 12 個維度 · 約 15 分鐘完成
            </p>
          </div>

          {answeredCount > 0 && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-[#7A6565] mb-2">
                <span>整體進度</span>
                <span>{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="h-2 bg-[#E8DCD0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7B2D3A] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 12 維度圖文卡片網格 */}
          <div className="mb-10">
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#A05060] mb-2">
                12 DIMENSIONS
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#3D2B2B]">
                全方位色彩與風格分析
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizDimensions.map((dim, idx) => {
                const { answered, total } = dimensionProgress(dim);
                const complete = isDimensionComplete(dim);
                const iconUrl = DIMENSION_ICONS[getDimensionIconKey(dim.id)];
                const canEnter = answeredCount > 0;
                return (
                  <button
                    key={dim.id}
                    onClick={() => canEnter && handleEnterDimension(idx)}
                    disabled={!canEnter}
                    className={
                      'text-left bg-[#FBF7F2] rounded-xl border border-[#E8DCD0] p-5 transition-all group ' +
                      (canEnter
                        ? 'hover:shadow-lg hover:border-[#D4A5A5] cursor-pointer'
                        : 'cursor-default')
                    }
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8DCD0] shadow-sm bg-[#F7F1EA]">
                          <Image
                            src={iconUrl}
                            alt={dim.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#7B2D3A] text-white text-xs font-medium flex items-center justify-center shadow-sm border-2 border-[#FBF7F2]">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-lg text-[#3D2B2B] truncate">
                            {dim.name}
                          </h3>
                          {complete && (
                            <span className="w-5 h-5 rounded-full bg-[#7B2D3A]/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-[#7B2D3A]" />
                            </span>
                          )}
                        </div>
                        {dim.description && (
                          <p className="text-sm text-[#7A6565] leading-relaxed line-clamp-2">
                            {dim.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {answeredCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#E8DCD0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7B2D3A] rounded-full transition-all duration-500"
                            style={{ width: `${(answered / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#7A6565] tabular-nums flex-shrink-0">
                          {answered}/{total}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 開始測試按鈕 */}
          {answeredCount < totalQuestions && (
            <div className="text-center mb-6">
              <Button
                variant="default"
                size="lg"
                className="bg-[#7B2D3A] hover:bg-[#5C1E28] text-white rounded-full px-12 py-6 font-serif text-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                onClick={answeredCount > 0 ? () => handleEnterDimension(
                  quizDimensions.findIndex((d) => !isDimensionComplete(d)),
                ) : handleStart}
              >
                {answeredCount > 0 ? '繼續測試' : '開始測試'}
                <ArrowRight className="w-5 h-5" />
              </Button>
              {answeredCount === 0 && (
                <p className="text-xs text-[#7A6565] mt-3">
                  點擊開始，立即探索你的專屬色彩風格
                </p>
              )}
            </div>
          )}

          {answeredCount === totalQuestions && (
            <div className="text-center">
              <Button
                variant="default"
                size="lg"
                className="bg-[#7B2D3A] hover:bg-[#5C1E28] text-white rounded-full px-10 font-serif text-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '提交中...' : '完成測驗，查看結果'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1EA]">
      <div className="sticky top-0 z-10 bg-[#F7F1EA]/95 backdrop-blur-sm border-b border-[#E8DCD0]">
        <div className="h-1 bg-[#E8DCD0]">
          <div
            className="h-full bg-[#7B2D3A] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-1 text-sm text-[#7B2D3A] hover:text-[#5C1E28]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回總覽</span>
          </button>
          <span className="text-xs uppercase tracking-wider text-[#7A6565]">
            {answeredCount} / {totalQuestions}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-28">
        {currentQuestion && (
          <>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A05060] mb-1">
                第 {currentQuestionIndex + 1} 題
              </p>
              <p className="text-sm text-[#7A6565]">
                {currentQuestion.dimensionName}
              </p>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-[#3D2B2B] mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {currentQuestion.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-[#E8DCD0]">
                <Image
                  src={currentQuestion.imageUrl}
                  alt="題目示意圖"
                  width={800}
                  height={400}
                  className="w-full h-48 sm:h-56 object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedOption === opt.id;
                const optionLabels = ['A', 'B', 'C', 'D'];
                const label = optionLabels[optIdx] ?? String(optIdx + 1);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'border-[#7B2D3A] bg-[#7B2D3A]/5 shadow-md'
                        : 'border-[#E8DCD0] bg-[#FBF7F2] hover:border-[#D4A5A5] hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm transition-all ${
                        isSelected
                          ? 'bg-[#7B2D3A] text-white'
                          : 'bg-[#F7F1EA] text-[#7A6565] border border-[#E8DCD0]'
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`flex-1 text-base sm:text-lg leading-relaxed ${
                        isSelected
                          ? 'text-[#7B2D3A] font-medium'
                          : 'text-[#3D2B2B]'
                      }`}
                    >
                      {opt.text}
                    </span>
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#7B2D3A] bg-[#7B2D3A]'
                          : 'border-[#E8DCD0]'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {isLastQuestion && (
              <div className="mt-8 text-center">
                <p className="text-sm text-[#7A6565] mb-3">
                  恭喜完成所有題目！
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="bg-[#7B2D3A] hover:bg-[#5C1E28] text-white rounded-full px-10 py-6 text-lg font-serif shadow-lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '提交中...' : '完成測驗，查看結果 →'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F1EA]/95 backdrop-blur-sm border-t border-[#E8DCD0] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            aria-label="上一題"
            className="text-[#7B2D3A]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {isLastQuestion ? (
            <Button
              variant="default"
              size="lg"
              className="bg-[#7B2D3A] hover:bg-[#5C1E28] text-white rounded-full px-8 font-serif"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '完成測驗'}
            </Button>
          ) : (
            <div className="text-sm text-[#7A6565]">
              選擇選項後自動進入下一題
            </div>
          )}

          <div className="w-9" />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
