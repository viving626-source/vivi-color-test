import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export const FUNCTIONS_URL =
  (import.meta.env.VITE_FUNCTIONS_URL as string) ||
  `${SUPABASE_URL}/functions/v1`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// 讀取當前測試 sessionId（與 AppContext 存儲鍵一致）
export function getSessionId(): string {
  try {
    const raw = localStorage.getItem("vivi_color_test_session");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed.sessionId ?? "";
  } catch {
    return "";
  }
}
