-- ============================================================================
-- Hazard Map Dashboard — Supabase Schema (Live Global Sync)
-- ============================================================================
-- Run this SQL in Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- Project: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1) Main table: stores ONE row (id=1) with the whole hazard map JSON
create table if not exists public.hazard_data (
  id int primary key,
  data jsonb,
  updated_at bigint not null default 0,
  created_at timestamptz not null default now()
);

-- Seed single row if not exists
insert into public.hazard_data (id, data, updated_at)
values (1, null, 0)
on conflict (id) do nothing;

-- 2) Optional: audit log table (every save is logged)
create table if not exists public.hazard_data_audit (
  id bigserial primary key,
  data jsonb,
  updated_at bigint not null,
  created_at timestamptz not null default now(),
  ip text
);

-- 3) Enable RLS but allow public read/write for this simple use-case
--    If you want to protect writes with SYNC_TOKEN, keep RLS enabled and
--    use SERVICE_ROLE_KEY on the server (server bypasses RLS).
alter table public.hazard_data enable row level security;
alter table public.hazard_data_audit enable row level security;

-- Allow anyone to read
drop policy if exists "Allow public read" on public.hazard_data;
create policy "Allow public read" on public.hazard_data
  for select using (true);

-- Allow anyone to write (server uses SERVICE_ROLE_KEY which bypasses RLS anyway)
-- If you want to lock down, remove this and only allow service_role.
drop policy if exists "Allow public write" on public.hazard_data;
create policy "Allow public write" on public.hazard_data
  for all using (true) with check (true);

-- Audit log: allow insert for all
drop policy if exists "Allow public audit insert" on public.hazard_data_audit;
create policy "Allow public audit insert" on public.hazard_data_audit
  for insert with check (true);

drop policy if exists "Allow public audit read" on public.hazard_data_audit;
create policy "Allow public audit read" on public.hazard_data_audit
  for select using (true);

-- 4) Index for speed
create index if not exists idx_hazard_data_updated_at on public.hazard_data(updated_at desc);

-- 5) Optional: function to auto-log changes
create or replace function public.log_hazard_change()
returns trigger as $$
begin
  insert into public.hazard_data_audit(data, updated_at)
  values (new.data, new.updated_at);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_log_hazard on public.hazard_data;
create trigger trg_log_hazard
  after update on public.hazard_data
  for each row execute function public.log_hazard_change();

-- ============================================================================
-- Verification query (run after setup):
-- select * from public.hazard_data where id=1;
-- ============================================================================
