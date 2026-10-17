-- ============================================================
-- Vivi Macau 色彩/妝容風格測試 — 真實收款欄位擴展
-- 在 Supabase 控制台 → SQL Editor 整段執行（可重複執行）
-- 依賴 0001_init.sql 已建立 public.orders
-- ============================================================

-- 收款閘道：asiapay（PayDollar）/ manual（二維碼/轉賬人工核實）
alter table public.orders
  add column if not exists provider       text not null default 'manual',
  add column if not exists gateway_ref    text,          -- 支付閘道交易參考（AsiaPay: payRef）
  add column if not exists payer_auth     text,          -- 3DS 認證狀態（AsiaPay: payerAuth）
  add column if not exists paid_at        timestamptz,   -- 實際支付成功時間（以 webhook 為準）
  add column if not exists raw_payload    jsonb,         -- 閘道回調原始資料（核賬/排查用）
  add column if not exists pay_method     text,          -- 閘道內支付方式（如 WECHATONL / ALIPAYHKONL / CC）
  add column if not exists return_status  text;          -- 瀏覽器回跳狀態（僅輔助，以 webhook 為準）

-- 訂單狀態：pending（待支付）/ paid（已支付）/ failed（失敗）/ cancelled（已取消）
-- 以 webhook(Datafeed) 服務端核驗簽名後寫入 paid；前端回跳不可直接置 paid
create index if not exists orders_order_no_idx on public.orders (order_no);
create index if not exists orders_provider_idx on public.orders (provider);
