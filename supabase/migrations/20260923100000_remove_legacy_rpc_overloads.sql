-- Emoji Drops — remove legacy RPC overloads left by superseded migrations.
-- Keeps the public API deterministic for PostgREST and prevents PGRST203 ambiguity.
drop function if exists public.buy_market_listing(text);
drop function if exists public.buy_market_listing();
drop function if exists public.cancel_market_listing(text);
drop function if exists public.cancel_market_listing();
drop function if exists public.create_market_listing(text);
drop function if exists public.sell_item_server();
drop function if exists public.market_snapshot(text);
