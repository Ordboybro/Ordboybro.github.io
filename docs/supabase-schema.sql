-- Emoji Drops: minimum secure Supabase schema.
-- Run in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Игрок',
  balance bigint not null default 250 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  case_id text,
  emoji text not null,
  rarity text not null,
  value bigint not null check (value >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.live_drops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nickname text,
  case_id text not null,
  item_id text not null,
  emoji text not null,
  rarity text not null,
  value bigint not null check (value >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.live_drops enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "inventory_select_own" on public.inventory;
create policy "inventory_select_own" on public.inventory for select using (auth.uid() = user_id);

drop policy if exists "live_drops_select_authenticated" on public.live_drops;
create policy "live_drops_select_authenticated" on public.live_drops for select to authenticated using (true);

-- No client INSERT/UPDATE/DELETE policies are intentionally provided for
-- balances, inventory, or live drops. Game mutations must go through a
-- SECURITY DEFINER RPC/Edge Function that validates the authenticated user,
-- balance, odds and result atomically.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, nickname)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'nickname',''), 'Игрок'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable Realtime for live drops. If the table is already in the publication,
-- the ALTER may report a duplicate depending on the project state.
do $$
begin
  alter publication supabase_realtime add table public.live_drops;
exception when duplicate_object then
  null;
end $$;
