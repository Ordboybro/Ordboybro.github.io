-- Emoji Drops: final Market concurrency + RPC identity hardening.
-- This migration is intentionally additive so it still fixes production databases
-- where the earlier Market migration has already been marked as applied.

do $drop_market_overloads$
declare r record;
begin
  for r in
    select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) args
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname in ('create_market_listing','buy_market_listing','cancel_market_listing')
  loop
    if (r.proname='create_market_listing' and r.args <> 'text, numeric')
       or (r.proname='buy_market_listing' and r.args <> 'uuid')
       or (r.proname='cancel_market_listing' and r.args <> 'uuid') then
      execute format('drop function if exists public.%I(%s)',r.proname,r.args);
    end if;
  end loop;
end $drop_market_overloads$;

create or replace function public.buy_market_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid();
  l public.market_listings%rowtype;
  buyer public.profiles%rowtype;
  seller public.profiles%rowtype;
  item jsonb;
  seller_id uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select ml.seller_id into seller_id from public.market_listings ml where ml.id=p_listing_id;
  if seller_id is null then raise exception 'LISTING_UNAVAILABLE'; end if;
  if seller_id=uid then raise exception 'SELF_PURCHASE_FORBIDDEN'; end if;
  perform 1 from public.profiles where id in (uid,seller_id) order by id for update;
  select * into l from public.market_listings where id=p_listing_id for update;
  if l.id is null or l.status<>'active' or l.seller_id<>seller_id then raise exception 'LISTING_UNAVAILABLE'; end if;
  item:=l.item;
  select * into buyer from public.profiles where id=uid;
  select * into seller from public.profiles where id=l.seller_id;
  if buyer.id is null or seller.id is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if buyer.balance<l.listing_price then raise exception 'INSUFFICIENT_FUNDS'; end if;
  update public.profiles
    set balance=balance-l.listing_price,
        inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(item),
        stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{spent}',to_jsonb(coalesce((stats->>'spent')::numeric,0)+l.listing_price),true),
        updated_at=now()
    where id=uid;
  update public.profiles
    set balance=balance+l.listing_price,
        stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+l.listing_price),true),
        updated_at=now()
    where id=l.seller_id;
  update public.market_listings set status='sold',buyer_id=uid,sold_at=now() where id=l.id;
  return jsonb_build_object('item',item,'balance',(select balance from public.profiles where id=uid),'listing_id',l.id,'listing_price',l.listing_price);
end; $$;

create or replace function public.cancel_market_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid();
  l public.market_listings%rowtype;
  seller_id uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select ml.seller_id into seller_id from public.market_listings ml where ml.id=p_listing_id;
  if seller_id is null then raise exception 'LISTING_UNAVAILABLE'; end if;
  if seller_id<>uid then raise exception 'NOT_LISTING_OWNER'; end if;
  perform 1 from public.profiles where id=uid for update;
  select * into l from public.market_listings where id=p_listing_id for update;
  if l.id is null or l.status<>'active' or l.seller_id<>seller_id then raise exception 'LISTING_UNAVAILABLE'; end if;
  update public.profiles
    set inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(l.item),
        updated_at=now()
    where id=uid;
  update public.market_listings set status='cancelled',cancelled_at=now() where id=l.id;
  return jsonb_build_object('item',l.item,'listing_id',l.id);
end; $$;

revoke execute on function public.buy_market_listing(uuid) from public,anon;
grant execute on function public.buy_market_listing(uuid) to authenticated;
revoke execute on function public.cancel_market_listing(uuid) from public,anon;
grant execute on function public.cancel_market_listing(uuid) to authenticated;

notify pgrst, 'reload schema';
