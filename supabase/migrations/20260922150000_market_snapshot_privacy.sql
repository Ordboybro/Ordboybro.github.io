-- Emoji Drops — market snapshot privacy hardening.
-- Public Market needs listing identity for rendering, not seller UUIDs.
drop function if exists public.market_snapshot();
create or replace function public.market_snapshot() returns table(
  id uuid,
  item_id text,
  nickname text,
  emoji text,
  rarity text,
  case_id text,
  item_price numeric,
  listing_price numeric,
  status text,
  created_at timestamptz,
  is_owner boolean
) language sql security definer set search_path='' as $$
  select
    ml.id,
    (ml.item->>'id'),
    p.nickname,
    (ml.item->>'emoji'),
    (ml.item->>'rarity'),
    coalesce(ml.item->>'case_id',''),
    coalesce((ml.item->>'price')::numeric,ml.listing_price),
    ml.listing_price,
    ml.status,
    ml.created_at,
    (auth.uid() is not null and auth.uid()=ml.seller_id)
  from public.market_listings ml
  join public.profiles p on p.id=ml.seller_id
  where ml.status='active'
  order by ml.created_at desc
  limit 200
$$;
revoke execute on function public.market_snapshot() from public,anon,authenticated;
grant execute on function public.market_snapshot() to authenticated;
grant execute on function public.market_snapshot() to anon;
