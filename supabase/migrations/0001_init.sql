-- ============================================================
-- Vivi Macau 色彩/妝容風格測試 — Supabase 初始化
-- 在 Supabase 控制台 → SQL Editor 整段執行
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- 測試記錄表 ----------
create table if not exists public.color_records (
  id              uuid primary key default gen_random_uuid(),
  session_id      text not null unique,
  face_photo_urls jsonb not null default '[]'::jsonb,
  body_photo_urls jsonb not null default '[]'::jsonb,
  quiz_answers    jsonb not null default '[]'::jsonb,
  season_result   jsonb,
  facial_result   jsonb,
  hairstyle_result jsonb,
  style_result    jsonb,
  full_report     jsonb,
  photo_analysis  jsonb,
  transform_images jsonb not null default '[]'::jsonb,
  payment_status  text not null default 'free',
  email           text,
  email_sent      boolean not null default false,
  pdf_url         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists color_records_session_idx on public.color_records (session_id);
create index if not exists color_records_created_idx on public.color_records (created_at);

-- ---------- 訂單表 ----------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  record_id       uuid not null references public.color_records(id) on delete cascade,
  order_no        text not null unique,
  amount          numeric(10,2) not null default 8.8,
  currency        text not null default 'MOP',
  email           text,
  payment_method  text not null default '',
  status          text not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_record_idx on public.orders (record_id);
create index if not exists orders_status_idx on public.orders (status);

-- ---------- 關閉表的匿名直連（後端一律走 Edge Functions + service_role） ----------
alter table public.color_records enable row level security;
alter table public.orders enable row level security;
-- 不建立任何 policy：匿名/前端密鑰無法直接讀寫表，只可經過 Edge Functions

-- ============================================================
-- 存儲桶
--  photos    公開（路徑含 sessionId + 隨機 UUID，無法被列舉）：
--            用戶上傳的大頭/全身照，用於即時預覽與送 AI 分析
--  generated 公開：AI 生成的風格改造圖（需持久、可直接展示）
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('generated', 'generated', true)
on conflict (id) do update set public = true;

-- photos 公開讀取（對應上面 public=true）
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'public read photos'
      and schemaname = 'storage' and tablename = 'objects'
  ) then
    create policy 'public read photos'
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'photos');
  end if;
end $$;

-- 允許匿名上傳照片（提交測試用），路徑由前端用 sessionId + uuid 命名
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'allow anon upload photos'
      and schemaname = 'storage' and tablename = 'objects'
  ) then
    create policy 'allow anon upload photos'
      on storage.objects for insert
      to anon, authenticated
      with check (bucket_id = 'photos');
  end if;
end $$;

-- generated 桶允許公開讀取；寫入只允許 service_role（Edge Functions，無匿名寫入政策）
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'public read generated'
      and schemaname = 'storage' and tablename = 'objects'
  ) then
    create policy 'public read generated'
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'generated');
  end if;
end $$;
