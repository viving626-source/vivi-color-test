// ============================================================
// 收款閘道層（Provider 抽象）
//   - asiapay：AsiaPay / PayDollar 託管收銀台（支援澳門主體：
//             Visa/Master/JCB/銀聯 + ALIPAYHKONL + WECHATONL）
//   - manual：二維碼 / 轉賬（MPay、支付寶澳門、微信等），後台人工核實
//
// 安全原則：
//   1) 下單參數由服務端用 Secure Hash Secret 簽名；
//   2) 只有服務端 Datafeed（webhook）核驗簽名通過後才把訂單置 paid；
//   3) 瀏覽器回跳僅用於導向結果頁，不可信任、不可直接解鎖；
//   4) 舊的「無驗證 simulatePayment」已移除（任何人可免費解鎖的漏洞）。
//
// AsiaPay 官方文檔：
//   https://developer.asiapay.com/integration-guide/security
//   請求簽名：SHA256(merchantId|orderRef|currCode|amount|payType|secret)
//   Datafeed 驗簽：SHA256(src|prc|successCode|ref|payRef|cur|amt|payerAuth|secret)
// ============================================================

export type PaymentProvider = "asiapay" | "manual";

export interface CheckoutSession {
  provider: PaymentProvider;
  // 託管頁面：瀏覽器自動提交一個 POST 表單到收銀台
  form?: {
    method: "POST";
    url: string;
    fields: Record<string, string>;
  };
  // 人工模式：顯示收款二維碼 / 轉賬資料
  manual?: {
    title: string;
    instructions: string[];
    qrImageUrl?: string;
    accountInfo?: string;
  };
  order: {
    id: string;
    orderNo: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface PaymentConfig {
  provider: PaymentProvider;
  siteUrl: string;
  // AsiaPay
  asiaPayMerchantId: string;
  asiaPaySecret: string;
  asiaPayEnv: "test" | "prod";
  asiaPayPayUrl: string;
  asiaPayCurrCode: string;
  asiaPayAmount: number;
  // Manual
  manualTitle: string;
  manualInstructions: string[];
  manualQrImageUrl: string;
  manualAccountInfo: string;
}

const PAY_URLS: Record<"test" | "prod", string> = {
  test: "https://test.paydollar.com/b2c2/eng/payment/payForm.jsp",
  prod: "https://www.paydollar.com/b2c2/eng/payment/payForm.jsp",
};

// ISO 數字貨幣碼（AsiaPay 慣例）：344 HKD / 446 MOP / 840 USD / 156 CNY
export const CURRENCY_CODES: Record<string, string> = {
  HKD: "344",
  MOP: "446",
  USD: "840",
  CNY: "156",
};

export function loadPaymentConfig(): PaymentConfig {
  const env = (Deno.env.get("PAYMENT_PROVIDER") || "manual").toLowerCase();
  const envMode = (Deno.env.get("ASIAPAY_ENV") || "test").toLowerCase() === "prod"
    ? "prod"
    : "test";
  const siteUrl =
    Deno.env.get("PUBLIC_SITE_URL") || "https://vivi-color-test.pages.dev";

  const asiaPayMerchantId = Deno.env.get("ASIAPAY_MERCHANT_ID") || "";
  const asiaPaySecret = Deno.env.get("ASIAPAY_SECURE_HASH_SECRET") || "";

  // 未配置閘道商戶憑證時，安全降級為人工模式
  let provider: PaymentProvider = env === "asiapay" ? "asiapay" : "manual";
  if (provider === "asiapay" && (!asiaPayMerchantId || !asiaPaySecret)) {
    console.warn(
      "[payment] PAYMENT_PROVIDER=asiapay 但缺少 ASIAPAY_MERCHANT_ID / ASIAPAY_SECURE_HASH_SECRET，降級為 manual",
    );
    provider = "manual";
  }

  const gatewayCurrency = (Deno.env.get("ASIAPAY_CURRENCY") || "HKD").toUpperCase();
  const asiaPayAmount = Number(
    Deno.env.get("ASIAPAY_AMOUNT") || "37", // MOP 38 ≈ HKD 37（MOP/HKD≈1.03）
  );

  return {
    provider,
    siteUrl: siteUrl.replace(/\/$/, ""),
    asiaPayMerchantId,
    asiaPaySecret,
    asiaPayEnv: envMode,
    asiaPayPayUrl:
      Deno.env.get("ASIAPAY_PAY_URL") || PAY_URLS[envMode],
    asiaPayCurrCode: CURRENCY_CODES[gatewayCurrency] || "344",
    asiaPayAmount: Number.isFinite(asiaPayAmount) && asiaPayAmount > 0 ? asiaPayAmount : 37,
    manualTitle: Deno.env.get("MANUAL_PAY_TITLE") || "轉賬 / 掃碼支付（MPay・支付寶澳門・微信）",
    manualInstructions: (Deno.env.get("MANUAL_PAY_INSTRUCTIONS") ||
      "1. 用 MPay / 支付寶澳門 / 微信掃描下方二維碼，或轉賬至收款賬號；\n2. 付款金額請務必為 MOP 38，並備注你的訂單號；\n3. 完成付款後點擊「我已付款」，我們核實後即自動解鎖完整報告。")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    manualQrImageUrl: Deno.env.get("MANUAL_PAY_QR_URL") || "",
    manualAccountInfo: Deno.env.get("MANUAL_PAY_ACCOUNT") || "",
  };
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 前端選項 → AsiaPay 強制支付方式（不強制時用 ALL，進入收銀台由用戶選擇）
function mapPayMethod(paymentMethod: string): string {
  switch ((paymentMethod || "").toLowerCase()) {
    case "wechat_alipay":
      return "WECHATONL";
    case "macau_local":
      return "ALIPAYHKONL";
    case "credit_card":
    default:
      return "ALL";
  }
}

// 建立 AsiaPay 託管收銀台表單（Client Post through Browser）
export async function buildAsiaPayCheckout(
  cfg: PaymentConfig,
  order: { orderNo: string; paymentMethod: string },
): Promise<CheckoutSession["form"]> {
  const merchantId = cfg.asiaPayMerchantId;
  const orderRef = order.orderNo;
  const currCode = cfg.asiaPayCurrCode;
  const amount = cfg.asiaPayAmount.toFixed(2);
  const payType = "N"; // 一般銷售
  const payMethod = mapPayMethod(order.paymentMethod);

  const signing = [
    merchantId,
    orderRef,
    currCode,
    amount,
    payType,
    cfg.asiaPaySecret,
  ].join("|");
  const secureHash = await sha256Hex(signing);

  const lang = "C"; // 繁體中文
  const successUrl = `${cfg.siteUrl}/payment/result?orderNo=${encodeURIComponent(orderRef)}`;
  const failUrl = `${cfg.siteUrl}/payment/result?orderNo=${encodeURIComponent(orderRef)}&status=failed`;
  const cancelUrl = `${cfg.siteUrl}/payment/result?orderNo=${encodeURIComponent(orderRef)}&status=cancelled`;
  // 服務端 Datafeed（webhook）：異步、權威回調
  const datafeedUrl = `${getFunctionsBase(cfg.siteUrl)}/color-api/color-test/orders/asiapay/datafeed`;

  return {
    method: "POST",
    url: cfg.asiaPayPayUrl,
    fields: {
      merchantId,
      orderRef,
      currCode,
      amount,
      payType,
      payMethod,
      lang,
      successUrl,
      failUrl,
      cancelUrl,
      redirect: "1",
      remark: "Vivi Macau 色彩風格測試完整報告",
      datafeedUrl,
      secureHashType: "SHA-256",
      secureHash,
    },
  };
}

// 由前端站點推導 Edge Function 對外地址（cloudflare 同域 / supabase 直連均可）
function getFunctionsBase(siteUrl: string): string {
  // Supabase Edge 函數對外地址優先取環境變數；這裡用於 datafeedUrl 兜底
  return (
    Deno.env.get("PUBLIC_FUNCTIONS_URL") ||
    (Deno.env.get("SUPABASE_URL")
      ? `${Deno.env.get("SUPABASE_URL")}/functions/v1`
      : siteUrl)
  );
}

// 核驗 AsiaPay Datafeed 簽名；成功返回 true
export async function verifyAsiaPayDatafeed(
  cfg: PaymentConfig,
  p: Record<string, string>,
): Promise<{ ok: boolean; orderNo: string; payRef: string; success: boolean }> {
  const src = p.src ?? "";
  const prc = p.prc ?? "";
  const successCode = p.successCode ?? "";
  const orderNo = p.ref ?? p.orderRef ?? p.merchantRef ?? "";
  const payRef = p.payRef ?? "";
  const cur = p.cur ?? "";
  const amt = p.amt ?? "";
  const payerAuth = p.payerAuth ?? "";
  const givenHash = p.secureHash ?? "";

  const signing = [
    src,
    prc,
    successCode,
    orderNo,
    payRef,
    cur,
    amt,
    payerAuth,
    cfg.asiaPaySecret,
  ].join("|");
  const expect = await sha256Hex(signing);
  const ok =
    !!givenHash &&
    expect.toLowerCase() === givenHash.toLowerCase();

  // successCode = 0 且 prc = 0 代表成功
  const success = successCode === "0" && (prc === "0" || prc === "");
  return { ok, orderNo, payRef, success: ok && success };
}

export function buildManualCheckout(cfg: PaymentConfig): CheckoutSession["manual"] {
  return {
    title: cfg.manualTitle,
    instructions: cfg.manualInstructions,
    qrImageUrl: cfg.manualQrImageUrl || undefined,
    accountInfo: cfg.manualAccountInfo || undefined,
  };
}
