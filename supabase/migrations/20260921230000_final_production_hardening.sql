-- Emoji Drops — final production security/economy hardening.
-- No new product features. This migration closes remaining race/permission edges.

-- The case price is resolved by case_cost(p_case_id); the client-supplied p_cost is
-- intentionally ignored by the authoritative RPC. Make the intended execution
-- surface explicit after the final privilege hardening.
revoke execute on function public.open_case_server(text,numeric) from public,anon;
grant execute on function public.open_case_server(text,numeric) to authenticated;

-- Never allow arbitrary authenticated clients to mutate economy tables directly.
revoke insert,update,delete on table public.profiles from anon,authenticated;
revoke insert,update,delete,truncate,references,trigger on table public.case_items from anon,authenticated;
revoke insert,update,delete,truncate,references,trigger on table public.market_listings from anon,authenticated;
revoke insert,update,delete,truncate,references,trigger on table public.live_drops from anon,authenticated;

-- A physical inventory item may have at most one active listing for its owner.
-- The RPC already checks this; the database constraint closes the concurrent-request gap.
create unique index if not exists market_listings_active_item_uidx
  on public.market_listings(seller_id, (item->>'id'))
  where status='active';

-- Keep active-listing scans cheap under the real marketplace query pattern.
create index if not exists market_listings_active_price_idx
  on public.market_listings(status, listing_price, created_at desc)
  where status='active';

-- Prevent pathological listing values from reaching the economy.
alter table public.market_listings
  drop constraint if exists market_listings_listing_price_reasonable;
alter table public.market_listings
  add constraint market_listings_listing_price_reasonable
  check (listing_price > 0 and listing_price <= 100000000);

-- Remove legacy RPC overloads so PostgREST cannot resolve ambiguous public candidates.\ndrop function if exists public.buy_market_listing(text);\ndrop function if exists public.buy_market_listing();\ndrop function if exists public.cancel_market_listing(text);\ndrop function if exists public.cancel_market_listing();\ndrop function if exists public.create_market_listing(text);\ndrop function if exists public.sell_item_server();\ndrop function if exists public.market_snapshot(text);\n\n-- Re-assert the narrow RPC surface after default-privilege hardening.
revoke execute on function public.create_market_listing(text,numeric) from public,anon;
grant execute on function public.create_market_listing(text,numeric) to authenticated;
revoke execute on function public.market_snapshot() from public,anon;
grant execute on function public.market_snapshot() to authenticated;
revoke execute on function public.buy_market_listing(uuid) from public,anon;
grant execute on function public.buy_market_listing(uuid) to authenticated;
revoke execute on function public.cancel_market_listing(uuid) from public,anon;
grant execute on function public.cancel_market_listing(uuid) to authenticated;
revoke execute on function public.sell_item_server(text) from public,anon;
grant execute on function public.sell_item_server(text) to authenticated;

-- case_items is a server-owned catalogue: clients may not enumerate or mutate it
-- through the REST table surface; RPCs resolve targets internally.
revoke all on table public.case_items from anon,authenticated;

-- Live Drops are read-only to authenticated users.
revoke all on table public.live_drops from anon;
revoke insert,update,delete,truncate,references,trigger on table public.live_drops from authenticated;
grant select on table public.live_drops to authenticated;
