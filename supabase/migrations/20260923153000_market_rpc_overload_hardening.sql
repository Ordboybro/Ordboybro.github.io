-- Emoji Drops — final market RPC overload hardening.
-- PostgREST cannot disambiguate overloaded RPCs with the same argument names.
-- Keep exactly one canonical buy/cancel contract and force a schema-cache refresh.
drop function if exists public.buy_market_listing(text);
drop function if exists public.buy_market_listing(varchar);
drop function if exists public.buy_market_listing(json);
drop function if exists public.buy_market_listing(jsonb);
drop function if exists public.buy_market_listing(integer);
drop function if exists public.buy_market_listing(bigint);
drop function if exists public.buy_market_listing(numeric);
drop function if exists public.buy_market_listing(uuid,text);
drop function if exists public.buy_market_listing(uuid,numeric);
drop function if exists public.buy_market_listing();
drop function if exists public.cancel_market_listing(text);
drop function if exists public.cancel_market_listing(varchar);
drop function if exists public.cancel_market_listing(json);
drop function if exists public.cancel_market_listing(jsonb);
drop function if exists public.cancel_market_listing(integer);
drop function if exists public.cancel_market_listing(bigint);
drop function if exists public.cancel_market_listing(numeric);
drop function if exists public.cancel_market_listing(uuid,text);
drop function if exists public.cancel_market_listing(uuid,numeric);
drop function if exists public.cancel_market_listing();
notify pgrst, 'reload schema';