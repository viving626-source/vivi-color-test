import { useState, useCallback, useEffect } from 'react';
import { colorTest as colorTestApi } from '@client/src/api';

const SESSION_KEY = 'vivi_color_test_session';

export interface TestSession {
  sessionId: string;
  recordId?: string;
  facePhotoUrls: string[];
  bodyPhotoUrls: string[];
  currentStep: number;
  totalQuestions: number;
  answers: Record<string, string>;
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadSession(): TestSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as TestSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: TestSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function useTestSession() {
  const [session, setSession] = useState<TestSession | null>(() => loadSession());

  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  const startSession = useCallback(() => {
    const newSession: TestSession = {
      sessionId: generateSessionId(),
      currentStep: 0,
      totalQuestions: 0,
      answers: {},
      facePhotoUrls: [],
      bodyPhotoUrls: [],
    };
    setSession(newSession);
    saveSession(newSession);
    return newSession;
  }, []);

  const setPhotos = useCallback((faceUrls: string[], bodyUrls: string[]) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, facePhotoUrls: faceUrls, bodyPhotoUrls: bodyUrls };
      saveSession(next);
      return next;
    });
  }, []);

  const setRecordId = useCallback((recordId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, recordId };
      saveSession(next);
      return next;
    });
  }, []);

  const setAnswer = useCallback((questionId: string, answerId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        answers: { ...prev.answers, [questionId]: answerId },
      };
      saveSession(next);
      return next;
    });
  }, []);

  const setProgress = useCallback((current: number, total: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, currentStep: current, totalQuestions: total };
      saveSession(next);
      return next;
    });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const ensureRecord = useCallback(async (): Promise<string> => {
    if (!session) throw new Error('no session');
    if (session.recordId) return session.recordId;

    const res = await colorTestApi.createRecord({
      sessionId: session.sessionId,
      facePhotoUrls: session.facePhotoUrls,
      bodyPhotoUrls: session.bodyPhotoUrls,
    });
    setRecordId(res.id);
    return res.id;
  }, [session, setRecordId]);

  return {
    session,
    startSession,
    setPhotos,
    setAnswer,
    setProgress,
    setRecordId,
    clearSession,
    ensureRecord,
  };
}
