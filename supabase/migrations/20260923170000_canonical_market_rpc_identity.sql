-- Emoji Drops — canonical Market RPC identity hardening.
-- PostgREST cannot choose between overloaded RPCs when several functions expose
-- the same argument names. Earlier migrations removed known legacy signatures,
-- but a production database can contain an older/custom overload not covered by
-- a fixed DROP FUNCTION list. Remove every non-canonical overload by identity.
--
-- Important: pg_get_function_identity_arguments() returns the identity argument
-- TYPES (for example "uuid"), not parameter names. Never compare it to
-- "p_listing_id uuid".

do $$
declare
  r record;
begin
  for r in
    select n.nspname as schema_name,
           p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as identity_args
      from pg_proc p
      join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public'
       and p.proname in ('buy_market_listing','cancel_market_listing')
       and pg_get_function_identity_arguments(p.oid) <> 'uuid'
  loop
    execute format(
      'drop function if exists %I.%I(%s)',
      r.schema_name,
      r.function_name,
      r.identity_args
    );
  end loop;
end
$$;

revoke execute on function public.buy_market_listing(uuid) from public, anon;
grant execute on function public.buy_market_listing(uuid) to authenticated;

revoke execute on function public.cancel_market_listing(uuid) from public, anon;
grant execute on function public.cancel_market_listing(uuid) to authenticated;

notify pgrst, 'reload schema';
