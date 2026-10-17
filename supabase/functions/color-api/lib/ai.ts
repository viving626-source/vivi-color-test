/**
 * AI 能力（純免費 Google Gemini）
 * - 照片分析（臉型/骨相/五官量感/身形/氣質）：gemini-2.5-flash（視覺）
 * - 人像風格合成（保留本人長相、換妝髮穿搭）：gemini-2.5-flash-image（Nano Banana）
 * 同一把 GEMINI_API_KEY，免費額度。
 * fal.ai / 火山方舟僅在配置了對應密鑰時作為可選後備（不配置＝全程免費）。
 */

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL =
  Deno.env.get("GEMINI_IMAGE_MODEL") || "gemini-2.5-flash-image";
const FAL_KEY = Deno.env.get("FAL_KEY") || "";
const ARK_API_KEY = Deno.env.get("ARK_API_KEY") || "";
const ARK_MODEL = Deno.env.get("ARK_MODEL") || "doubao-seedream-5.0-pro";
// Cloudflare Workers AI（免費 10,000 neurons/日，FLUX.2 支援參考圖編輯、保留本人）
const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID") || "";
const CF_API_TOKEN = Deno.env.get("CF_API_TOKEN") || "";
const CF_IMAGE_MODEL =
  Deno.env.get("CF_IMAGE_MODEL") || "@cf/black-forest-labs/flux-2-klein-9b";

export function aiConfigured() {
  const missing: string[] = [];
  if (!GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  return { ok: missing.length === 0, missing };
}

export function imageConfigured() {
  // 圖像合成優先走 Cloudflare（免費）；Gemini 圖像免費額度通常為 0
  const providers: string[] = [];
  if (CF_ACCOUNT_ID && CF_API_TOKEN) providers.push("cloudflare");
  if (GEMINI_API_KEY) providers.push("gemini");
  if (FAL_KEY) providers.push("fal");
  if (ARK_API_KEY) providers.push("ark");
  return { ok: providers.length > 0, providers };
}

function dataUriFromImage(img: { url: string; mimeType?: string }) {
  if (img.url.startsWith("data:")) return img.url;
  const mime = img.mimeType || "image/jpeg";
  return `data:${mime};url=${encodeURIComponent(img.url)}`;
}

// 對 429 / 500 / 503（暫時過載）自動重試，避免 Gemini 高峰期直接失敗
async function postJsonWithRetry(
  url: string,
  body: unknown,
  label: string,
  tries = 3,
): Promise<any> {
  let lastText = "";
  let lastStatus = 0;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (res.ok) {
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }
    lastStatus = res.status;
    lastText = text;
    const retryable = res.status === 429 || res.status === 500 || res.status === 503;
    if (retryable && i < tries - 1) {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      continue;
    }
    break;
  }
  throw new Error(`${label} ${lastStatus}: ${lastText}`);
}

// 列出該密鑰可用的 Gemini 模型（服務器端調用，用於確認可用模型名）
export async function listGeminiModels(): Promise<any> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
  );
  return await res.json();
}

// ---------------- Google Gemini 視覺分析 ----------------
async function generateWithGemini(
  images: { url: string; mimeType?: string }[],
  prompt: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const parts: unknown[] = [{ text: prompt }];
  for (const img of images) {
    parts.push({
      inline_data: {
        mime_type: img.mimeType || "image/jpeg",
        data: await toBase64(img.url),
      },
    });
  }
  const data = await postJsonWithRetry(
    url,
    {
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2200 },
    },
    "Gemini 分析失敗",
  );
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text || "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini 未返回分析結果");
  return text;
}

async function toBase64(url: string): Promise<string> {
  if (url.startsWith("data:")) {
    const b64 = url.split(",")[1];
    return decodeURIComponent(b64);
  }
  const r = await fetch(url);
  const buf = new Uint8Array(await r.arrayBuffer());
  // 分塊 base64：避免逐字元串接（O(n²)）在大圖上撐爆 Edge isolate CPU/記憶體
  const CHUNK = 0x8000; // 32 KiB / 塊
  const parts: string[] = [];
  for (let i = 0; i < buf.length; i += CHUNK) {
    parts.push(String.fromCharCode(...buf.subarray(i, i + CHUNK)));
  }
  return btoa(parts.join(""));
}

// ---------------- 人像風格合成（Gemini 圖像 / Nano Banana） ----------------
async function generateWithGeminiImage(
  images: { url: string; mimeType?: string }[],
  prompt: string,
  ratio: string,
): Promise<{ bytes: Uint8Array; mime: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const parts: unknown[] = [{ text: prompt }];
  for (const img of images) {
    parts.push({
      inline_data: {
        mime_type: img.mimeType || "image/jpeg",
        data: await toBase64(img.url),
      },
    });
  }
  // Gemini 圖像輸出 + 3:4 比例
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: ratio || "3:4" },
    },
  };
  const data = await postJsonWithRetry(
    url,
    body,
    "Gemini 合成失敗",
  );
  const candParts = data?.candidates?.[0]?.content?.parts ?? [];
  let inline: { data?: string; mimeType?: string } | null = null;
  for (const p of candParts) {
    if (p?.inlineData || p?.inline_data) {
      inline = p.inlineData || p.inline_data;
      break;
    }
  }
  if (!inline?.data) throw new Error("Gemini 未返回合成圖片");
  const b64 = inline.data;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime: inline.mimeType || "image/png" };
}

// ---------------- 免費：Cloudflare Workers AI（FLUX.2 參考圖編輯） ----------------
async function generateWithCloudflareImage(
  images: { url: string; mimeType?: string }[],
  prompt: string,
): Promise<{ bytes: Uint8Array; mime: string }> {
  const form = new FormData();
  form.append("prompt", prompt);
  // FLUX.2 支援多參考圖（最多 4 張），取前 2 張（面部+全身）
  for (let i = 0; i < Math.min(images.length, 2); i++) {
    const b64 = await toBase64(images[i].url);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
    form.append(
      `input_image_${i}`,
      new Blob([bytes], { type: images[i].mimeType || "image/jpeg" }),
      `reference_${i}.jpg`,
    );
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_IMAGE_MODEL}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    body: form,
  });
  const ct = res.headers.get("content-type") || "";
  const buf = new Uint8Array(await res.arrayBuffer());
  if (!res.ok) {
    let txt = "";
    try {
      txt = new TextDecoder().decode(buf);
    } catch {
      txt = "";
    }
    throw new Error(`Cloudflare 合成失敗 ${res.status}: ${txt}`);
  }
  // FLUX.2 回應為 JSON：{ success, result: { image: "<base64>" } }（部分模型直接回二進制）
  if (ct.includes("application/json")) {
    let data: {
      result?: unknown;
      image?: string;
    } = {};
    try {
      data = JSON.parse(new TextDecoder().decode(buf));
    } catch {
      throw new Error("Cloudflare 回應無法解析（非 JSON）");
    }
    const resultObj = data.result as
      | { image?: string; b64_json?: string }
      | string
      | null;
    let raw = "";
    if (typeof resultObj === "string") raw = resultObj;
    else if (resultObj && typeof resultObj === "object") {
      raw = resultObj.image || resultObj.b64_json || "";
    }
    if (!raw) raw = data.image || "";
    if (!raw) {
      throw new Error(
        `Cloudflare 未返回圖片：${new TextDecoder().decode(buf).slice(0, 300)}`,
      );
    }
    // 相容 data:image/jpeg;base64, 前綴
    const b64 = raw.includes(",") ? raw.split(",").pop() || "" : raw;
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return { bytes: out, mime: "image/jpeg" };
  }
  if (!ct.startsWith("image/")) {
    throw new Error(
      `Cloudflare 合成失敗：非圖片回應（${ct}）${new TextDecoder().decode(buf).slice(0, 200)}`,
    );
  }
  return { bytes: buf, mime: ct.split(";")[0] || "image/jpeg" };
}

// ---------------- 可選後備：fal.ai ----------------
async function generateWithFal(
  images: { url: string; mimeType?: string }[],
  prompt: string,
  ratio: string,
): Promise<{ url: string }> {
  const res = await fetch("https://queue.fal.run/fal-ai/nano-banana", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      output_format: "png",
      aspect_ratio: ratio || "3:4",
      image_urls: images.map((i) => dataUriFromImage(i)),
    }),
  });
  if (!res.ok) throw new Error(`fal.ai 合成失敗 ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data?.images?.[0]?.url || data?.image?.url;
  if (!url) throw new Error("fal.ai 未返回圖片");
  return { url };
}

// ---------------- 可選後備：火山方舟 Seedream（圖生圖） ----------------
async function generateWithArk(
  images: { url: string; mimeType?: string }[],
  prompt: string,
  ratio: string,
): Promise<{ url: string }> {
  const size = ratio === "1:1" ? "1024x1024" : "768x1024";
  const res = await fetch(
    `https://ark.cn-beijing.volces.com/api/v3/images/generations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ARK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ARK_MODEL,
        prompt,
        image: images.map((i) => dataUriFromImage(i)),
        size,
        response_format: "url",
      }),
    },
  );
  if (!res.ok) throw new Error(`方舟合成失敗 ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("方舟未返回圖片");
  return { url };
}

// ---------------- 統一對外 ----------------
export async function analyzeImages(
  imageUrls: string[],
  prompt: string,
): Promise<string> {
  const images = imageUrls.map((u) => ({ url: u }));
  return await generateWithGemini(images, prompt);
}

/** 風格合成；優先返回 base64 bytes（Gemini），否則返回可下載 url（fal/ark 後備） */
export async function generateStyleImage(
  imageUrls: string[],
  prompt: string,
  ratio = "3:4",
): Promise<{ bytes?: Uint8Array; mime?: string; url?: string }> {
  const images = imageUrls.map((u) => ({ url: u }));
  // 優先免費的 Cloudflare Workers AI（圖像編輯、保留本人長相）
  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    return await generateWithCloudflareImage(images, prompt);
  }
  if (GEMINI_API_KEY) {
    return await generateWithGeminiImage(images, prompt, ratio);
  }
  if (FAL_KEY) return await generateWithFal(images, prompt, ratio);
  if (ARK_API_KEY) return await generateWithArk(images, prompt, ratio);
  throw new Error("未配置任何圖像生成服務（請設置 CF_ACCOUNT_ID / CF_API_TOKEN 或 GEMINI_API_KEY）");
}
