-- NUTRIX shared backend: Supabase PostgreSQL
-- Paste this file into Supabase Dashboard -> SQL Editor and run it once.
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  profile_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Рацион на неделю',
  plan_data jsonb not null,
  share_token uuid not null default gen_random_uuid() unique,
  share_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.plan_members (
  plan_id uuid not null references public.meal_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('editor')),
  created_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);
create table if not exists public.shopping_lists (
  plan_id uuid primary key references public.meal_plans(id) on delete cascade,
  checked_items jsonb not null default '[]'::jsonb,
  price_overrides jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_data jsonb not null,
  updated_at timestamptz not null default now()
);

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

create index if not exists meal_plans_owner_created_idx on public.meal_plans(owner_id, created_at desc);
create index if not exists plan_members_user_idx on public.plan_members(user_id);
create index if not exists shopping_lists_updated_idx on public.shopping_lists(updated_at desc);
create index if not exists progress_entries_user_date_idx on public.progress_entries(user_id, measured_on desc, created_at desc);

create or replace function private.is_plan_owner(p_plan_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.meal_plans p
    where p.id = p_plan_id and p.owner_id = (select auth.uid())
  );
$$;

create or replace function private.is_plan_member(p_plan_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.plan_members m
    where m.plan_id = p_plan_id and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.can_access_plan(p_plan_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select private.is_plan_owner(p_plan_id) or private.is_plan_member(p_plan_id);
$$;

revoke all on function private.is_plan_owner(uuid) from public;
revoke all on function private.is_plan_member(uuid) from public;
revoke all on function private.can_access_plan(uuid) from public;
grant execute on function private.is_plan_owner(uuid) to authenticated;
grant execute on function private.is_plan_member(uuid) to authenticated;
grant execute on function private.can_access_plan(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.plan_members enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.progress_entries enable row level security;
alter table public.training_plans enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.meal_plans from anon, authenticated;
revoke all on table public.plan_members from anon, authenticated;
revoke all on table public.shopping_lists from anon, authenticated;
revoke all on table public.progress_entries from anon, authenticated;
revoke all on table public.training_plans from anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.meal_plans to authenticated;
grant select on table public.plan_members to authenticated;
grant select, insert, update, delete on table public.shopping_lists to authenticated;
grant select, insert, delete on table public.progress_entries to authenticated;
grant select, insert, update, delete on table public.training_plans to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists training_plans_select_own on public.training_plans;
create policy training_plans_select_own on public.training_plans for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists training_plans_insert_own on public.training_plans;
create policy training_plans_insert_own on public.training_plans for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists training_plans_update_own on public.training_plans;
create policy training_plans_update_own on public.training_plans for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists training_plans_delete_own on public.training_plans;
create policy training_plans_delete_own on public.training_plans for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists progress_entries_select_own on public.progress_entries;
create policy progress_entries_select_own on public.progress_entries for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists progress_entries_insert_own on public.progress_entries;
create policy progress_entries_insert_own on public.progress_entries for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists progress_entries_delete_own on public.progress_entries;
create policy progress_entries_delete_own on public.progress_entries for delete to authenticated using (user_id = (select auth.uid()));

-- Full plan JSON contains personal profile data. Only its owner can read or change it.
drop policy if exists meal_plans_select_owner on public.meal_plans;
create policy meal_plans_select_owner on public.meal_plans for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists meal_plans_insert_owner on public.meal_plans;
create policy meal_plans_insert_owner on public.meal_plans for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists meal_plans_update_owner on public.meal_plans;
create policy meal_plans_update_owner on public.meal_plans for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists meal_plans_delete_owner on public.meal_plans;
create policy meal_plans_delete_owner on public.meal_plans for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists plan_members_select_self on public.plan_members;
create policy plan_members_select_self on public.plan_members for select to authenticated using (user_id = (select auth.uid()));

-- Shared users can work with the shopping checklist, but cannot read the owner's private profile.
drop policy if exists shopping_lists_select_members on public.shopping_lists;
create policy shopping_lists_select_members on public.shopping_lists for select to authenticated using ((select private.can_access_plan(plan_id)));
drop policy if exists shopping_lists_insert_members on public.shopping_lists;
create policy shopping_lists_insert_members on public.shopping_lists for insert to authenticated with check ((select private.can_access_plan(plan_id)));
drop policy if exists shopping_lists_update_members on public.shopping_lists;
create policy shopping_lists_update_members on public.shopping_lists for update to authenticated using ((select private.can_access_plan(plan_id))) with check ((select private.can_access_plan(plan_id)));
drop policy if exists shopping_lists_delete_members on public.shopping_lists;
create policy shopping_lists_delete_members on public.shopping_lists for delete to authenticated using ((select private.can_access_plan(plan_id)));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shopping_lists'
     ) then
    alter publication supabase_realtime add table public.shopping_lists;
  end if;
end
$$;
