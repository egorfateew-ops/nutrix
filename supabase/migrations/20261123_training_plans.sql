-- NUTRIX: private home-training plans
-- Run once in Supabase Dashboard -> SQL Editor for an existing project.
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.training_plans enable row level security;
revoke all on table public.training_plans from anon, authenticated;
grant select, insert, update, delete on table public.training_plans to authenticated;
drop policy if exists training_plans_select_own on public.training_plans;
create policy training_plans_select_own on public.training_plans for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists training_plans_insert_own on public.training_plans;
create policy training_plans_insert_own on public.training_plans for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists training_plans_update_own on public.training_plans;
create policy training_plans_update_own on public.training_plans for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists training_plans_delete_own on public.training_plans;
create policy training_plans_delete_own on public.training_plans for delete to authenticated using (user_id = (select auth.uid()));
