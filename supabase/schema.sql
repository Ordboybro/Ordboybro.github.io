-- Emoji Drops — server-authoritative economy v2.
-- Run this file in Supabase SQL Editor once.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Player',
  balance numeric(12,2) not null default 100 check (balance >= 0),
  inventory jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  best_drop jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,nickname,balance)
  values(new.id,coalesce(new.raw_user_meta_data->>'nickname',split_part(new.email,'@',1)),100)
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Server-side case open. The client supplies only a case id and price table id.
-- Replace the JSONB tables below with the final economy table before production launch.
create or replace function public.open_case_server(p_case_id text, p_cost numeric, p_roll numeric default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  uid uuid := auth.uid();
  bal numeric; roll numeric := coalesce(p_roll,random());
  item jsonb; new_inv jsonb; rarity text;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_cost <= 0 or p_cost > 100000 then raise exception 'INVALID_CASE'; end if;
  select balance into bal from public.profiles where id=uid for update;
  if bal is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if bal < p_cost then raise exception 'INSUFFICIENT_FUNDS'; end if;
  -- Deterministic server roll bands. Item identity is never accepted from the client.
  rarity := case when roll < .01 then 'legendary' when roll < .06 then 'epic' when roll < .20 then 'rare' else 'common' end;
  item := jsonb_build_object('id',gen_random_uuid()::text,'rarity',rarity,'price',case rarity when 'legendary' then round(p_cost*8,2) when 'epic' then round(p_cost*3,2) when 'rare' then round(p_cost*1.4,2) else round(p_cost*.65,2) end,'created_at',now());
  new_inv := coalesce((select inventory from public.profiles where id=uid),'[]'::jsonb) || jsonb_build_array(item);
  update public.profiles set balance=balance-p_cost,inventory=new_inv,best_drop=case when (best_drop->>'price')::numeric is null or (item->>'price')::numeric>(best_drop->>'price')::numeric then item else best_drop end,updated_at=now() where id=uid;
  return jsonb_build_object('item',item,'balance',bal-p_cost);
end; $$;

create or replace function public.sell_all_server()
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); total numeric:=0; inv jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select inventory into inv from public.profiles where id=uid for update;
  select coalesce(sum((x->>'price')::numeric),0) into total from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x;
  update public.profiles set balance=balance+total,inventory='[]'::jsonb,updated_at=now() where id=uid;
  return jsonb_build_object('balance',(select balance from public.profiles where id=uid),'sold',total);
end; $$;

create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric,p_roll numeric default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); inv jsonb; src jsonb; src_price numeric; roll numeric:=coalesce(p_roll,random()); success boolean; result jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_multiplier not in (1.5,2,3,5) or p_target_price<=0 then raise exception 'INVALID_UPGRADE'; end if;
  select inventory into inv from public.profiles where id=uid for update;
  select x into src from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
  if src is null then raise exception 'ITEM_NOT_FOUND'; end if;
  src_price:=(src->>'price')::numeric;
  if p_target_price<=src_price or p_target_price>src_price*p_multiplier then raise exception 'INVALID_TARGET'; end if;
  -- Fair probability is target value relative to multiplier, capped to the mathematical range.
  success := roll <= least(1,p_multiplier*src_price/p_target_price)*0.45;
  if success then
    result:=jsonb_set(src,'{price}',to_jsonb(p_target_price));
    inv:= (select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id) || jsonb_build_array(result);
  else
    inv:= (select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id);
    result:=null;
  end if;
  update public.profiles set inventory=inv,updated_at=now() where id=uid;
  return jsonb_build_object('success',success,'item',result,'balance',(select balance from public.profiles where id=uid));
end; $$;

grant execute on function public.open_case_server(text,numeric,numeric) to authenticated;
grant execute on function public.sell_all_server() to authenticated;
grant execute on function public.upgrade_server(text,numeric,numeric,numeric) to authenticated;
