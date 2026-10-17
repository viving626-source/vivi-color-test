import { FUNCTIONS_URL } from "../lib/supabase";

// 統一調用 Supabase Edge Function「color-api」
// 兼容原平台 axiosForBackend 的 { data } 響應形態
export async function callFunction<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    admin?: boolean;
  } = {},
): Promise<{ data: T }> {
  const method = (options.method ?? "GET").toUpperCase();
  const cleanPath = path.replace(/^\/api/, ""); // /api/color-test/... → /color-test/...
  const url = `${FUNCTIONS_URL}/color-api${cleanPath}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.admin) {
    const key = localStorage.getItem("vivi_admin_key") ?? "";
    headers["x-admin-key"] = key;
  }
  const resp = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const text = await resp.text();
  const json = text ? JSON.parse(text) : null;
  if (!resp.ok) {
    throw new Error(json?.message || json?.error || `請求失敗（${resp.status}）`);
  }
  return { data: json as T };
}

export interface AxiosLikeConfig {
  url: string;
  method?: string;
  data?: unknown;
  params?: Record<string, unknown>;
}

export async function axiosForBackend(config: AxiosLikeConfig): Promise<{ data: unknown }> {
  let url = config.url;
  if (config.params) {
    const qs = new URLSearchParams(
      Object.entries(config.params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {}),
    ).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  const isAdmin = url.includes("/admin/");
  return callFunction(url, { method: config.method, body: config.data, admin: isAdmin });
}
