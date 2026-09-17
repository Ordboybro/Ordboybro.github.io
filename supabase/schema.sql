-- Emoji Drops — server-authoritative economy v8.
-- Canonical case prices and authoritative random outcomes stay on the server.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Player',
  balance numeric(12,2) not null default 250 check (balance >= 0),
  inventory jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  best_drop jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid()=id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,nickname,balance) values(new.id,coalesce(new.raw_user_meta_data->>'nickname',split_part(new.email,'@',1)),250) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_nickname(p_nickname text) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); clean text:=trim(coalesce(p_nickname,''));
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if char_length(clean)<1 or char_length(clean)>32 then raise exception 'INVALID_NICKNAME'; end if;
 update public.profiles set nickname=clean,updated_at=now() where id=uid;
 return jsonb_build_object('nickname',clean);
end; $$;

create or replace function public.case_cost(p_case_id text) returns numeric language sql immutable as $$
select case lower(trim(p_case_id)) when 'smile' then 100 when 'moves' then 80 when 'nature' then 60 when 'food' then 40 when 'animals' then 20 when 'transport' then 10 when 'sport' then 250 when 'games' then 500 else null end $$;

create or replace function public.open_case_server(p_case_id text, p_cost numeric default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); bal numeric; inv jsonb; cost numeric; roll numeric:=random(); rarity text; price numeric; item jsonb;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 cost:=public.case_cost(p_case_id);
 if cost is null then raise exception 'INVALID_CASE'; end if;
 select balance,inventory into bal,inv from public.profiles where id=uid for update;
 if bal is null then raise exception 'PROFILE_NOT_FOUND'; end if;
 if bal<cost then raise exception 'INSUFFICIENT_FUNDS'; end if;
 rarity:=case when roll<.01 then 'legendary' when roll<.06 then 'mythical' when roll<.18 then 'epic' when roll<.45 then 'rare' else 'common' end;
 price:=case rarity when 'legendary' then round(cost*3,2) when 'mythical' then round(cost*1.7,2) when 'epic' then round(cost,2) when 'rare' then round(cost*.55,2) else round(cost*.30,2) end;
 item:=jsonb_build_object('id',gen_random_uuid()::text,'case_id',lower(trim(p_case_id)),'rarity',rarity,'price',price,'created_at',now());
 update public.profiles set balance=bal-cost,inventory=coalesce(inv,'[]'::jsonb)||jsonb_build_array(item),best_drop=case when best_drop is null or coalesce((best_drop->>'price')::numeric,0)<price then item else best_drop end,updated_at=now() where id=uid;
 return jsonb_build_object('item',item,'balance',bal-cost,'cost',cost);
end; $$;

create or replace function public.sell_all_server() returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); total numeric;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 with locked as (select inventory from public.profiles where id=uid for update) select coalesce(sum((x->>'price')::numeric),0) into total from locked,jsonb_array_elements(coalesce(locked.inventory,'[]'::jsonb)) x;
 update public.profiles set balance=balance+total,inventory='[]'::jsonb,updated_at=now() where id=uid;
 return jsonb_build_object('balance',(select balance from public.profiles where id=uid),'sold',total);
end; $$;

create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); inv jsonb; src jsonb; src_price numeric; chance numeric; roll numeric:=random(); success boolean; result jsonb;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_multiplier not in (1.5,2,3,5) or p_target_price<=0 then raise exception 'INVALID_UPGRADE'; end if;
 select inventory into inv from public.profiles where id=uid for update;
 select x into src from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
 if src is null then raise exception 'ITEM_NOT_FOUND'; end if;
 src_price:=round((src->>'price')::numeric,2);
 if p_target_price<=src_price or p_target_price>src_price*p_multiplier then raise exception 'INVALID_TARGET'; end if;
 chance:=greatest(0.01,least(0.95,(src_price*p_multiplier-p_target_price)/(src_price*p_multiplier-src_price)));
 success:=roll<=chance;
 if success then result:=jsonb_set(src,'{price}',to_jsonb(round(p_target_price,2))); else result:=null; end if;
 update public.profiles set inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id) || case when success then jsonb_build_array(result) else '[]'::jsonb end,updated_at=now() where id=uid;
 return jsonb_build_object('success',success,'item',result,'chance',chance,'balance',(select balance from public.profiles where id=uid));
end; $$;
grant execute on function public.case_cost(text) to authenticated;
grant execute on function public.set_nickname(text) to authenticated;
grant execute on function public.open_case_server(text,numeric) to authenticated;
grant execute on function public.sell_all_server() to authenticated;
grant execute on function public.upgrade_server(text,numeric,numeric) to authenticated;

-- Upgrade v8: target identity is supplied by the catalogue, while the server still owns the roll and inventory mutation.
create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric,p_target_emoji text,p_target_rarity text,p_target_case_id text) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); inv jsonb; src jsonb; src_price numeric; chance numeric; roll numeric:=random(); success boolean; result jsonb; clean_rarity text; clean_case text; clean_emoji text;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_multiplier not in (1.5,2,3,5) or p_target_price<=0 then raise exception 'INVALID_UPGRADE'; end if;
 clean_emoji:=left(trim(coalesce(p_target_emoji,'')),16); clean_rarity:=lower(trim(coalesce(p_target_rarity,''))); clean_case:=lower(trim(coalesce(p_target_case_id,'')));
 if clean_emoji='' or clean_rarity not in ('common','rare','epic','mythical','legendary') or clean_case='' then raise exception 'INVALID_TARGET'; end if;
 select inventory into inv from public.profiles where id=uid for update;
 select x into src from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
 if src is null then raise exception 'ITEM_NOT_FOUND'; end if;
 src_price:=round((src->>'price')::numeric,2);
 if p_target_price<=src_price or p_target_price>src_price*p_multiplier then raise exception 'INVALID_TARGET'; end if;
 chance:=greatest(0.01,least(0.95,(src_price*p_multiplier-p_target_price)/(src_price*p_multiplier-src_price)));
 success:=roll<=chance;
 if success then result:=jsonb_build_object('id',gen_random_uuid()::text,'emoji',clean_emoji,'rarity',clean_rarity,'case_id',clean_case,'price',round(p_target_price,2),'created_at',now(),'upgraded_from',p_item_id); else result:=null; end if;
 update public.profiles set inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id) || case when success then jsonb_build_array(result) else '[]'::jsonb end,stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+case when success then 1 else 0 end),true),updated_at=now() where id=uid;
 return jsonb_build_object('success',success,'item',result,'chance',chance,'balance',(select balance from public.profiles where id=uid));
end; $$;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text) to authenticated;
