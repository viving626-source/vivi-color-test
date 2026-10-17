import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { generateSeasonResult, generateFacialResult } from "./lib/generators/season-facial.generator.ts";
import { generateHairstyleResult } from "./lib/generators/hairstyle.generator.ts";
import { generateStyleResult } from "./lib/generators/style.generator.ts";
import { buildStylePrompt, listStyles } from "./lib/styles.ts";
import { analyzeImages, generateStyleImage, aiConfigured, imageConfigured, listGeminiModels } from "./lib/ai.ts";
import {
  loadPaymentConfig,
  buildAsiaPayCheckout,
  buildManualCheckout,
  verifyAsiaPayDatafeed,
  type CheckoutSession,
} from "./lib/payment.ts";

// ---------- 環境 ----------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Vivi Macau <onboarding@resend.dev>";
const ADMIN_KEY = Deno.env.get("ADMIN_KEY") || "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "viving626@gmail.com";

const db = createClient(SUPABASE_URL, SERVICE_ROLE);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
  });
}
function err(status: number, message: string): Response {
  return json({ statusCode: status, message, error: message }, status);
}

// ---------- 照片 URL 處理 ----------
async function signKey(key: string): Promise<string> {
  if (/^https?:\/\//i.test(key)) return key;
  const { data, error } = await db.storage.from("photos").createSignedUrl(key, 3600);
  if (error) throw new Error("簽名照片 URL 失敗: " + error.message);
  return data.signedUrl;
}
async function signAll(keys: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const k of keys) {
    if (k) out.push(await signKey(k));
  }
  return out;
}

function mapRecord(r: Record<string, unknown>, faceUrls: string[], bodyUrls: string[]) {
  return {
    id: r.id,
    sessionId: r.session_id,
    facePhotoUrls: faceUrls,
    bodyPhotoUrls: bodyUrls,
    paymentStatus: r.payment_status ?? "free",
    seasonResult: r.season_result ?? undefined,
    facialResult: r.facial_result ?? undefined,
    hairstyleResult: r.hairstyle_result ?? undefined,
    styleResult: r.style_result ?? undefined,
    photoAnalysis: r.photo_analysis ?? undefined,
    email: r.email ?? undefined,
    emailSent: r.email_sent ?? false,
  };
}

async function getRecordRow(sessionId: string) {
  const { data, error } = await db
    .from("color_records")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw err(500, error.message);
  if (!data) throw err(404, "記錄不存在");
  return data;
}

async function buildResponse(row: Record<string, unknown>) {
  const face = await signAll(row.face_photo_urls as string[]);
  const body = await signAll(row.body_photo_urls as string[]);
  return mapRecord(row, face, body);
}

// ---------- 業務 ----------
async function createRecord(body: { sessionId?: string; facePhotoUrls?: string[]; bodyPhotoUrls?: string[] }) {
  const sessionId = body.sessionId;
  if (!sessionId) return err(400, "缺少 sessionId");
  const existing = await getRecordRow(sessionId).catch(() => null);
  if (existing) return json(await buildResponse(existing));
  const { data, error } = await db
    .from("color_records")
    .insert({
      session_id: sessionId,
      face_photo_urls: body.facePhotoUrls ?? [],
      body_photo_urls: body.bodyPhotoUrls ?? [],
    })
    .select("*")
    .single();
  if (error) return err(500, error.message);
  return json(await buildResponse(data));
}

async function submitQuiz(sessionId: string, answers: unknown[]) {
  const row = await getRecordRow(sessionId);
  const { data, error } = await db
    .from("color_records")
    .update({ quiz_answers: answers ?? [], updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .select("*")
    .single();
  if (error) return err(500, error.message);
  return json(await buildResponse(data));
}

async function generateReport(sessionId: string) {
  const row = await getRecordRow(sessionId);
  const answers = (row.quiz_answers as unknown[]) ?? [];
  const season = generateSeasonResult(answers as never);
  const facial = generateFacialResult(season, answers as never);
  const hairstyle = generateHairstyleResult(season, answers as never);
  const style = generateStyleResult(season, facial, answers as never);
  const { data, error } = await db
    .from("color_records")
    .update({
      season_result: season,
      facial_result: facial,
      hairstyle_result: hairstyle,
      style_result: style,
      full_report: { season, facial, hairstyle, style },
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .select("*")
    .single();
  if (error) return err(500, error.message);
  return json(await buildResponse(data));
}

function mapOrder(o: Record<string, unknown>) {
  return {
    id: o.id,
    orderNo: o.order_no,
    amount: Number(o.amount),
    currency: o.currency ?? "MOP",
    status: o.status ?? "pending",
    paymentMethod: o.payment_method ?? "",
    provider: o.provider ?? "manual",
    payMethod: o.pay_method ?? "",
    paidAt: o.paid_at ?? null,
    gatewayRef: o.gateway_ref ?? null,
  };
}

// 建立訂單並返回收銀台（AsiaPay 託管表單 / 人工二維碼）
async function createOrder(body: {
  sessionId?: string; amount?: number; currency?: string;
  email?: string; paymentMethod?: string;
}) {
  const cfg = loadPaymentConfig();
  const row = await getRecordRow(body.sessionId ?? "");

  // 冪等：同一記錄若已有 pending 訂單則複用；若已存在 paid 訂單直接返回（不重複收款）
  const { data: exist } = await db
    .from("orders")
    .select("*")
    .eq("record_id", row.id)
    .in("status", ["pending", "paid"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (exist && exist.status === "paid") {
    return json({ order: mapOrder(exist), alreadyPaid: true, checkout: null });
  }

  let order: Record<string, unknown>;
  let isNew = false;
  if (exist && exist.status === "pending") {
    order = exist;
  } else {
    const orderNo = `VIVI${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
    const { data, error } = await db
      .from("orders")
      .insert({
        record_id: row.id,
        order_no: orderNo,
        amount: String(body.amount ?? 38),
        currency: body.currency ?? "MOP",
        email: body.email ?? "",
        payment_method: body.paymentMethod ?? "",
        pay_method: body.paymentMethod ?? "",
        status: "pending",
        provider: cfg.provider,
      })
      .select("*")
      .single();
    if (error) return err(500, error.message);
    order = data;
    isNew = true;
  }

  // 記錄電郵
  if (body.email) {
    await db.from("color_records").update({ email: body.email }).eq("id", row.id);
  }

  let checkout: CheckoutSession;
  if (cfg.provider === "asiapay") {
    const form = await buildAsiaPayCheckout(cfg, {
      orderNo: order.order_no as string,
      paymentMethod: (order.pay_method as string) ?? "",
    });
    checkout = {
      provider: "asiapay",
      form: form ?? undefined,
      order: mapOrder(order),
    };
  } else {
    checkout = {
      provider: "manual",
      manual: buildManualCheckout(cfg),
      order: mapOrder(order),
    };
  }
  // 人工模式新訂單：發送管理員到單通知電郵
  if (isNew && cfg.provider === "manual") {
    await notifyAdminNewOrder(order);
  }
  return json({ order: checkout.order, checkout });
}

// 服務端權威：把訂單置為已付費並解鎖報告（僅由 webhook 核驗或管理員調用）
async function markOrderPaid(orderId: string, meta: Record<string, unknown> = {}) {
  const { data: upd, error } = await db
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...meta,
    })
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await db
    .from("color_records")
    .update({
      payment_status: "paid",
      email: upd.email ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", upd.record_id);
  return upd;
}

// AsiaPay 服務端 Datafeed（webhook）：核驗簽名後才解鎖
async function asiaPayDatafeed(req: Request) {
  const cfg = loadPaymentConfig();
  if (cfg.provider !== "asiapay") {
    return new Response("IGNORED", { status: 200, headers: CORS_HEADERS });
  }
  const form = await req.formData();
  const p: Record<string, string> = {};
  form.forEach((v, k) => {
    p[k] = String(v);
  });
  const { ok, orderNo, payRef, success } = await verifyAsiaPayDatafeed(cfg, p);
  if (!ok) {
    console.warn("[asiapay] datafeed 簽名驗證失敗", JSON.stringify(p));
    return new Response("INVALID", { status: 400, headers: CORS_HEADERS });
  }
  const { data: order } = await db
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!order) {
    console.warn("[asiapay] datafeed 找不到訂單", orderNo);
    return new Response("NOTFOUND", { status: 404, headers: CORS_HEADERS });
  }
  if (success && order.status !== "paid") {
    await markOrderPaid(order.id as string, {
      gateway_ref: payRef || null,
      payer_auth: p.payerAuth ?? null,
      return_status: p.successCode ?? null,
      raw_payload: p,
    });
  }
  // AsiaPay 期望 Datafeed 頁返回純文本 OK
  return new Response("OK", { status: 200, headers: CORS_HEADERS });
}

// 瀏覽器回跳後輪詢訂單狀態
async function orderStatus(orderNo: string) {
  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error) return err(500, error.message);
  if (!order) return err(404, "訂單不存在");
  return json({ order: mapOrder(order) });
}

// 人工模式：管理員核實收款後確認（需 x-admin-key）
async function adminConfirmOrder(orderId: string) {
  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error) return err(500, error.message);
  if (!order) return err(404, "訂單不存在");
  if (order.status === "paid") return json({ order: mapOrder(order), alreadyPaid: true });
  const upd = await markOrderPaid(orderId, { raw_payload: { manual: true, at: new Date().toISOString() } });
  return json({ order: mapOrder(upd as Record<string, unknown>) });
}

// 新訂單（人工收款）通知管理員電郵
const WALLET_LABEL: Record<string, string> = {
  mpay: "MPay 澳門通",
  wechat: "微信支付",
  alipay: "支付寶",
};
async function notifyAdminNewOrder(order: Record<string, unknown>) {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) return;
  const method = WALLET_LABEL[String(order.pay_method ?? "")] || String(order.pay_method ?? "人工收款");
  const amount = `${order.currency ?? "MOP"} ${Number(order.amount ?? 0).toFixed(2)}`;
  const site = Deno.env.get("PUBLIC_SITE_URL") || "https://vivi-color-test.pages.dev";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [ADMIN_EMAIL],
      subject: `【新訂單待收款】${order.order_no} · ${amount} · ${method}`,
      html: `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
        <h2 style="color:#7a2233;margin:0 0 12px">收到一筆新訂單，等待你核實收款</h2>
        <table style="border-collapse:collapse;font-size:14px">
          <tr><td style="padding:4px 12px;color:#888">訂單號</td><td style="padding:4px 12px;font-family:monospace;font-weight:bold">${order.order_no}</td></tr>
          <tr><td style="padding:4px 12px;color:#888">金額</td><td style="padding:4px 12px;font-weight:bold">${amount}</td></tr>
          <tr><td style="padding:4px 12px;color:#888">付款方式</td><td style="padding:4px 12px">${method}</td></tr>
          <tr><td style="padding:4px 12px;color:#888">客戶電郵</td><td style="padding:4px 12px">${order.email ?? "—"}</td></tr>
        </table>
        <p style="margin:16px 0 8px">請核實 MPay／微信／支付寶到賬後，點擊下方按鈕一鍵確認解鎖：</p>
        <p><a href="${site}/admin" style="background:#7a2233;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">前往後台確認收款</a></p>
        <p style="color:#999;font-size:12px;margin-top:16px">Vivi Macau 色彩測試 · 自動通知，請勿直接回覆</p>
      </div>`,
    }),
  }).catch((e) => console.error("Admin notify error", e));
}

async function sendEmail(sessionId: string, email: string) {
  const row = await getRecordRow(sessionId);
  await db
    .from("color_records")
    .update({ email, email_sent: true, updated_at: new Date().toISOString() })
    .eq("id", row.id);
  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "你的 Vivi Macau 色彩風格測試報告",
        html: `<p>感謝完成測試。你的完整報告可在網站「我的報告」查看，付款後可下載 PDF。</p>
               <p>Vivi Macau · viving626@gmail.com</p>`,
      }),
    }).catch((e) => console.error("Resend error", e));
  }
  return json({ success: true });
}

// 視覺分析（Part 2 照片個人化）
async function analyze(
  sessionId: string,
  analysisPrompt: string,
  photos?: string[],
) {
  const cfg = aiConfigured();
  if (!cfg.ok) return err(503, "AI 服務未配置：" + cfg.missing.join(", "));
  const row = await getRecordRow(sessionId);
  // 優先使用前端傳來的公開照片 URL；否則用記錄中的首張大頭/全身
  let urls: string[] = (photos ?? []).filter(Boolean);
  if (urls.length === 0) {
    const face = (row.face_photo_urls as string[]) ?? [];
    const body = (row.body_photo_urls as string[]) ?? [];
    urls = await signAll([face[0], body[0]].filter(Boolean) as string[]);
  }
  if (urls.length === 0) return err(400, "請先上傳人像照片");
  const text = await analyzeImages(urls, analysisPrompt);
  await db
    .from("color_records")
    .update({ photo_analysis: { text, at: new Date().toISOString() }, updated_at: new Date().toISOString() })
    .eq("id", row.id);
  return json({ content: text });
}

// 從公開存儲 URL 中提取 photos 桶對象 key
function keyFromUrl(u: string): string {
  const marker = "/object/public/photos/";
  const i = u.indexOf(marker);
  if (i >= 0) return decodeURIComponent(u.slice(i + marker.length));
  return u;
}

// 風格合成（圖生圖），並持久化到 generated 公共桶
async function transform(
  sessionId: string,
  payload: {
    styleId?: string;
    styleDescription?: string;
    photoIndex?: number;
    imageRatio?: string;
    photoUrl?: string;
  },
) {
  const cfg = aiConfigured();
  if (!cfg.ok) return err(503, "AI 服務未配置：" + cfg.missing.join(", "));
  const imgCfg = imageConfigured();
  if (!imgCfg.ok) {
    return err(503, "風格合成服務尚未配置（請設置 Cloudflare Workers AI 或圖像模型密鑰），請稍後再試。");
  }
  const row = await getRecordRow(sessionId);

  // 選定人像：優先前端指定的照片 URL，其次按序號取記錄內照片
  let portrait: string[];
  if (payload.photoUrl) {
    portrait = [payload.photoUrl];
  } else {
    const all = [
      ...((row.face_photo_urls as string[]) ?? []),
      ...((row.body_photo_urls as string[]) ?? []),
    ];
    if (all.length === 0) return err(400, "請先上傳人像照片");
    const idx = Math.max(0, Math.min(payload.photoIndex ?? 0, all.length - 1));
    portrait = await signAll([all[idx]]);
  }
  void keyFromUrl; // 公開桶可直接使用 URL，保留 key 解析以備私有桶場景

  const typeName = (row.season_result as { typeName?: string })?.typeName ?? "個人色彩風格";
  const styleMap = buildStylePrompt(typeName);
  const def = payload.styleId ? styleMap[payload.styleId] ?? styleMap.korean : null;
  const basePrompt = def ? def.prompt : payload.styleDescription ?? styleMap.korean.prompt;
  // 明確以圖 0 為同一人、保留五官長相（FLUX.2 參考圖編輯）
  const prompt = `以 image 0 中的人物為同一主角，嚴格保留其面部五官、臉型與本人長相，只改變妝容、髮型、髮色與穿著。${basePrompt} 輸出自然真實、高質感的人像照片，構圖為 3:4 直幅。`;
  const styleId = def ? def.id : payload.styleId ?? "custom";
  const styleName = def ? def.name : "個人化風格";

  // 生成失敗（如 Cloudflare 當日免費額度用盡 429、限流、逾時）時不報錯，
  // 優雅降級為文字卡，由前端渲染風格重點，避免整欄空白/破圖。
  let result: { bytes?: Uint8Array; mime?: string; url?: string };
  try {
    result = await generateStyleImage(portrait, prompt, payload.imageRatio ?? "3:4");
  } catch (genErr) {
    const reason = genErr instanceof Error ? genErr.message : "圖像生成服務暫時忙碌";
    console.error("transform generation failed, fallback to text card:", reason);
    return json({
      status: "fallback",
      fallback: true,
      reason,
      styleId,
      styleName,
      imageUrl: "",
    });
  }
  // 持久化（Gemini 返回 base64 bytes；fal/ark 後備返回可下載 url）
  let finalUrl = result.url ?? "";
  try {
    const path = `${sessionId}/${Date.now()}-${styleId}.png`;
    let upErr: { message: string } | null = null;
    if (result.bytes) {
      const { error } = await db.storage
        .from("generated")
        .upload(path, result.bytes, { contentType: result.mime || "image/png", upsert: true });
      upErr = error;
    } else if (result.url) {
      const imgResp = await fetch(result.url);
      const blob = await imgResp.arrayBuffer();
      const { error } = await db.storage
        .from("generated")
        .upload(path, blob, { contentType: "image/png", upsert: true });
      upErr = error;
    }
    if (!upErr) {
      finalUrl = `${SUPABASE_URL}/storage/v1/object/public/generated/${path}`;
      // 追加到已有合成照（免費 2 張），而非覆蓋
      const prev = (row.transform_images as unknown[]) ?? [];
      await db
        .from("color_records")
        .update({
          transform_images: [...prev, { styleId, styleName, url: finalUrl, at: new Date().toISOString() }],
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    } else {
      console.error("persist generated image failed", upErr.message);
    }
  } catch (e) {
    console.error("persist generated image failed", e);
  }
  return json({ status: "success", styleId, imageUrl: finalUrl, styleName });
}

function requireAdmin(req: Request): boolean {
  if (!ADMIN_KEY) return false;
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

async function adminList(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await db
    .from("color_records")
    .select("id, session_id, face_photo_urls, body_photo_urls, payment_status, email, email_sent, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return err(500, error.message);
  const items = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    sessionId: r.session_id,
    facePhotoUrls: (r.face_photo_urls as string[]) ?? [],
    bodyPhotoUrls: (r.body_photo_urls as string[]) ?? [],
    paymentStatus: r.payment_status ?? "free",
    email: r.email ?? undefined,
    emailSent: r.email_sent ?? false,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
  return json({ items, total: (data as unknown as { length: number }).length, page, pageSize });
}

async function adminListOrders(status: string) {
  let q = db
    .from("orders")
    .select("*, color_records(session_id)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return err(500, error.message);
  const items = (data ?? []).map((o: Record<string, unknown>) => {
    const rec = (o.color_records as { session_id?: string } | null) ?? null;
    return {
      ...mapOrder(o),
      sessionId: rec?.session_id ?? "",
      email: o.email ?? "",
      createdAt: new Date(o.created_at as string).toISOString(),
    };
  });
  return json({ items });
}

// ---------- 路由 ----------
function segments(url: string): string[] {
  const all = new URL(url).pathname.split("/").filter(Boolean);
  const i = all.indexOf("color-test");
  return i >= 0 ? all.slice(i + 1) : [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  try {
    const s = segments(req.url);
    const method = req.method;

    // GET /color-test/records
    if (method === "POST" && s[0] === "records" && !s[1]) {
      return await createRecord(await req.json());
    }
    // POST /color-test/records/quiz
    if (method === "POST" && s[0] === "records" && s[1] === "quiz") {
      const b = await req.json();
      return await submitQuiz(b.sessionId, b.answers);
    }
    // POST /color-test/records/generate
    if (method === "POST" && s[0] === "records" && s[1] === "generate") {
      const b = await req.json();
      return await generateReport(b.sessionId);
    }
    // POST /color-test/records/email
    if (method === "POST" && s[0] === "records" && s[1] === "email") {
      const b = await req.json();
      return await sendEmail(b.sessionId, b.email);
    }
    // POST /color-test/orders（建立訂單 + 收銀台）
    if (method === "POST" && s[0] === "orders" && !s[1]) {
      return await createOrder(await req.json());
    }
    // POST /color-test/orders/asiapay/datafeed（AsiaPay 服務端異步回調，表單提交）
    if (method === "POST" && s[0] === "orders" && s[1] === "asiapay" && s[2] === "datafeed") {
      return await asiaPayDatafeed(req);
    }
    // GET /color-test/orders/status/:orderNo（結果頁輪詢）
    if (method === "GET" && s[0] === "orders" && s[1] === "status" && s[2]) {
      return await orderStatus(s[2]);
    }
    // GET /color-test/records/:session/transform-styles
    if (method === "GET" && s[0] === "records" && s[2] === "transform-styles") {
      return json({ styles: listStyles() });
    }
    // GET /color-test/ai/models（診斷：列出可用 Gemini 模型）
    if (method === "GET" && s[0] === "ai" && s[1] === "models") {
      return json(await listGeminiModels());
    }
    // POST /color-test/records/:session/transform
    if (method === "POST" && s[0] === "records" && s[2] === "transform") {
      const b = await req.json();
      return await transform(s[1], b);
    }
    // POST /color-test/records/:session/analyze
    if (method === "POST" && s[0] === "records" && s[2] === "analyze") {
      const b = await req.json();
      return await analyze(s[1], b.analysisPrompt ?? "", b.photos);
    }
    // POST /color-test/records/:session/pdf
    if (method === "POST" && s[0] === "records" && s[2] === "pdf") {
      return json({ pdfUrl: "", note: "請使用網頁瀏覽器列印/另存為 PDF" });
    }
    // GET /color-test/records/:sessionId
    if (method === "GET" && s[0] === "records" && s[1] && !s[2]) {
      const row = await getRecordRow(s[1]);
      return json(await buildResponse(row));
    }
    // admin
    if (s[0] === "admin") {
      if (!requireAdmin(req)) return err(401, "管理密鑰錯誤");
      const u = new URL(req.url);
      const page = Number(u.searchParams.get("page") ?? "1");
      const pageSize = Number(u.searchParams.get("pageSize") ?? "20");
      if (s[1] === "records") return await adminList(page, pageSize);
      if (s[1] === "export") return json({ downloadUrl: "" });
      // GET /admin/orders?status=pending（人工模式核實收款）
      if (s[1] === "orders" && !s[2] && method === "GET") {
        const u = new URL(req.url);
        return await adminListOrders(u.searchParams.get("status") ?? "pending");
      }
      // POST /admin/orders/:id/confirm（人工模式核實收款後解鎖）
      if (s[1] === "orders" && s[3] === "confirm" && method === "POST") {
        return await adminConfirmOrder(s[2]);
      }
    }
    return err(404, "Not Found: " + s.join("/"));
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return err(500, (e as Error).message || "伺服器錯誤");
  }
});
