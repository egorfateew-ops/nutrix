-- NUTRIX personal progress diary migration
-- Run once in Supabase Dashboard -> SQL Editor.
create table if not exists public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,2) not null check (weight_kg between 15 and 350),
  height_cm numeric(5,2) check (height_cm is null or height_cm between 80 and 250),
  waist_cm numeric(5,2) check (waist_cm is null or waist_cm between 30 and 200),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);
create index if not exists progress_entries_user_date_idx
  on public.progress_entries(user_id, measured_on desc, created_at desc);
alter table public.progress_entries enable row level security;
revoke all on table public.progress_entries from anon, authenticated;
grant select, insert, delete on table public.progress_entries to authenticated;
drop policy if exists progress_entries_select_own on public.progress_entries;
create policy progress_entries_select_own on public.progress_entries
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists progress_entries_insert_own on public.progress_entries;
create policy progress_entries_insert_own on public.progress_entries
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists progress_entries_delete_own on public.progress_entries;
create policy progress_entries_delete_own on public.progress_entries
  for delete to authenticated using (user_id = (select auth.uid()));
-- Turn off old invitation links and remove any legacy collaborators.
update public.meal_plans set share_enabled = false where share_enabled = true;
delete from public.plan_members;
