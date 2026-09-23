-- Emoji Drops — canonical Market + Live Drops production migration.
-- This file is intentionally aligned with supabase/schema.sql. It is safe to run after
-- the base schema and upgrades the older item_id/emoji/rarity market shape in-place.
-- It does not own Case/Upgrade RPCs.

create table if not exists public.market_listings (
  id uuid primary key default public.gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  item jsonb,
  listing_price numeric(12,2) not null check (listing_price > 0),
  status text not null default 'active' check (status in ('active','sold','cancelled')),
  buyer_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  sold_at timestamptz,
  cancelled_at timestamptz
);

-- Upgrade legacy market rows if this migration was previously deployed.
alter table public.market_listings add column if not exists item jsonb;
alter table public.market_listings add column if not exists cancelled_at timestamptz;
do $$
begin
  if to_regclass('public.market_listings') is not null
     and exists(select 1 from information_schema.columns where table_schema='public' and table_name='market_listings' and column_name='item_id')
  then
    execute $sql$
      update public.market_listings
      set item=jsonb_build_object(
        'id',item_id,
        'emoji',emoji,
        'rarity',rarity,
        'case_id',case_id,
        'price',item_price,
        'created_at',created_at
      )
      where item is null and item_id is not null
    $sql$;
  end if;
end $$;
-- Legacy columns remain nullable for backward compatibility with an already-created table.
do $$
begin
  foreach col in array array['item_id','emoji','rarity','item_price'] loop
    if exists(select 1 from information_schema.columns where table_schema='public' and table_name='market_listings' and column_name=col) then
      execute format('alter table public.market_listings alter column %I drop not null',col);
    end if;
  end loop;
end $$;

do $$
begin
  if exists(select 1 from public.market_listings where item is null) then
    raise exception 'MARKET_MIGRATION_INCOMPLETE: every listing must have canonical item JSON';
  end if;
end $$;
alter table public.market_listings alter column item set not null;

-- Remove every legacy overload of the Market RPCs before recreating the canonical signatures.
-- PostgREST returns PGRST203 when overloaded RPCs share argument names/types that make
-- JSON RPC resolution ambiguous. Keep exactly one public identity per mutation.
do $drop_legacy_market_rpc_overloads$
declare r record;
begin
  for r in select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) args
           from pg_proc p join pg_namespace n on n.oid=p.pronamespace
          where n.nspname='public'
            and p.proname in ('create_market_listing','buy_market_listing','cancel_market_listing')
  loop
    if (r.proname='create_market_listing' and r.args <> 'p_item_id text, p_price numeric')
       or (r.proname='buy_market_listing' and r.args <> 'p_listing_id uuid')
       or (r.proname='cancel_market_listing' and r.args <> 'p_listing_id uuid') then
      execute format('drop function if exists public.%I(%s)',r.proname,r.args);
    end if;
  end loop;
end $drop_legacy_market_rpc_overloads$;

alter table public.market_listings enable row level security;
revoke all on table public.market_listings from anon,authenticated;
drop policy if exists "market_listings_read_active" on public.market_listings;
create policy "market_listings_read_active" on public.market_listings
  for select to authenticated using (status='active');

create index if not exists market_listings_active_created_idx on public.market_listings(status,created_at desc);
create index if not exists market_listings_seller_idx on public.market_listings(seller_id,status);
create unique index if not exists market_listings_active_item_unique_idx
  on public.market_listings(seller_id,(item->>'id')) where status='active';
create index if not exists market_listings_buyer_idx on public.market_listings(buyer_id);

create or replace function public.create_market_listing(p_item_id text,p_price numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); inv jsonb; item jsonb; clean_price numeric; listing public.market_listings%rowtype;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  clean_price:=round(coalesce(p_price,0),2);
  if clean_price<=0 or clean_price>100000000 then raise exception 'INVALID_LISTING_PRICE'; end if;
  select inventory into inv from public.profiles where id=uid for update;
  if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  select x into item from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
  if item is null then raise exception 'ITEM_NOT_FOUND'; end if;
  if exists(select 1 from public.market_listings where seller_id=uid and status='active' and item->>'id'=p_item_id) then
    raise exception 'ITEM_ALREADY_LISTED';
  end if;
  insert into public.market_listings(seller_id,item,listing_price) values(uid,item,clean_price) returning * into listing;
  update public.profiles
    set inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id),updated_at=now()
    where id=uid;
  return jsonb_build_object('id',listing.id,'item',item,'listing_price',listing.listing_price,'status',listing.status);
end; $$;
revoke execute on function public.create_market_listing(text,numeric) from public,anon;
grant execute on function public.create_market_listing(text,numeric) to authenticated;

drop function if exists public.market_snapshot();
create or replace function public.market_snapshot() returns table(
  id uuid,item_id text,nickname text,emoji text,rarity text,case_id text,item_price numeric,listing_price numeric,status text,created_at timestamptz,is_owner boolean
) language sql security definer set search_path='' as $$
  select ml.id,(ml.item->>'id'),p.nickname,(ml.item->>'emoji'),(ml.item->>'rarity'),
         coalesce(ml.item->>'case_id',''),coalesce((ml.item->>'price')::numeric,ml.listing_price),
         ml.listing_price,ml.status,ml.created_at,
         (auth.uid() is not null and auth.uid()=ml.seller_id)
  from public.market_listings ml
  join public.profiles p on p.id=ml.seller_id
  where ml.status='active'
  order by ml.created_at desc
  limit 200
$$;
revoke execute on function public.market_snapshot() from public,anon;
grant execute on function public.market_snapshot() to authenticated;
grant execute on function public.market_snapshot() to anon;

create or replace function public.buy_market_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; buyer public.profiles%rowtype; seller public.profiles%rowtype; item jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into l from public.market_listings where id=p_listing_id for update;
  if l.id is null or l.status<>'active' then raise exception 'LISTING_UNAVAILABLE'; end if;
  if l.seller_id=uid then raise exception 'SELF_PURCHASE_FORBIDDEN'; end if;
  item:=l.item;
  perform 1 from public.profiles where id in (uid,l.seller_id) order by id for update;
  select * into buyer from public.profiles where id=uid;
  select * into seller from public.profiles where id=l.seller_id;
  if buyer.id is null or seller.id is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if buyer.balance<l.listing_price then raise exception 'INSUFFICIENT_FUNDS'; end if;
  update public.profiles set balance=balance-l.listing_price,inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(item),
    stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{spent}',to_jsonb(coalesce((stats->>'spent')::numeric,0)+l.listing_price),true),updated_at=now()
    where id=uid;
  update public.profiles set balance=balance+l.listing_price,
    stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+l.listing_price),true),updated_at=now()
    where id=l.seller_id;
  update public.market_listings set status='sold',buyer_id=uid,sold_at=now() where id=l.id;
  return jsonb_build_object('item',item,'balance',(select balance from public.profiles where id=uid),
    'listing_id',l.id,'listing_price',l.listing_price);
end; $$;
revoke execute on function public.buy_market_listing(uuid) from public,anon;
grant execute on function public.buy_market_listing(uuid) to authenticated;

create or replace function public.cancel_market_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into l from public.market_listings where id=p_listing_id for update;
  if l.id is null or l.status<>'active' then raise exception 'LISTING_UNAVAILABLE'; end if;
  if l.seller_id<>uid then raise exception 'NOT_LISTING_OWNER'; end if;
  update public.profiles set inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(l.item),updated_at=now() where id=uid;
  update public.market_listings set status='cancelled',cancelled_at=now() where id=l.id;
  return jsonb_build_object('item',l.item,'listing_id',l.id);
end; $$;
revoke execute on function public.cancel_market_listing(uuid) from public,anon;
grant execute on function public.cancel_market_listing(uuid) to authenticated;

create table if not exists public.live_drops (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  nickname text not null default 'Player',
  item jsonb not null,
  case_id text not null,
  item_price numeric(12,2) not null default 0 check (item_price>=0),
  created_at timestamptz not null default now()
);
alter table public.live_drops enable row level security;
revoke all on table public.live_drops from anon,authenticated;
drop policy if exists "live_drops_read_authenticated" on public.live_drops;
create policy "live_drops_read_authenticated" on public.live_drops for select to authenticated using (true);
drop policy if exists "live_drops_read_anon" on public.live_drops;
create policy "live_drops_read_anon" on public.live_drops for select to anon using (true);
grant select (nickname,item,case_id,item_price,created_at) on public.live_drops to authenticated,anon;
create index if not exists live_drops_created_idx on public.live_drops(created_at desc);
create index if not exists live_drops_user_idx on public.live_drops(user_id);

do $$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime')
     and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_drops')
  then
    execute 'alter publication supabase_realtime add table public.live_drops';
  end if;
exception when others then null;
end $$;

-- The canonical Case/Upgrade RPCs remain owned by supabase/schema.sql.
