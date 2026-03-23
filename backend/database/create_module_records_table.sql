-- Stores module-specific records added from frontend via backend APIs.
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.module_records (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  collection_key text not null,
  item_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (module_key, collection_key, item_id)
);

create index if not exists idx_module_records_lookup
  on public.module_records (module_key, collection_key, created_at desc);

alter table public.module_records enable row level security;

-- Demo-friendly policies for anon key usage.
-- Tighten these policies for production.
drop policy if exists "module_records_select_all" on public.module_records;
create policy "module_records_select_all"
on public.module_records for select
to anon
using (true);

drop policy if exists "module_records_insert_all" on public.module_records;
create policy "module_records_insert_all"
on public.module_records for insert
to anon
with check (true);

drop policy if exists "module_records_update_all" on public.module_records;
create policy "module_records_update_all"
on public.module_records for update
to anon
using (true)
with check (true);
