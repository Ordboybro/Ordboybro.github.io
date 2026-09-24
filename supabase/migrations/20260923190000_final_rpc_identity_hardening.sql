-- Emoji Drops — final RPC identity hardening.
-- Keep one callable signature per authoritative economy operation.
-- This migration is intentionally dynamic because production databases can retain
-- historical overloads whose signatures are not known to the current source tree.

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
       and (
         (p.proname='open_case_server' and pg_get_function_identity_arguments(p.oid) <> 'text, numeric, uuid')
         or
         (p.proname='upgrade_server' and pg_get_function_identity_arguments(p.oid) <> 'text, numeric, numeric, text, text, text, numeric')
         or
         (p.proname='create_market_listing' and pg_get_function_identity_arguments(p.oid) <> 'text, numeric')
         or
         (p.proname='buy_market_listing' and pg_get_function_identity_arguments(p.oid) <> 'uuid')
         or
         (p.proname='cancel_market_listing' and pg_get_function_identity_arguments(p.oid) <> 'uuid')
       )
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

drop function if exists public.open_case_server(text,numeric);
revoke execute on function public.open_case_server(text,numeric,uuid) from public,anon;
grant execute on function public.open_case_server(text,numeric,uuid) to authenticated;

revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated;

revoke execute on function public.create_market_listing(text,numeric) from public,anon;
grant execute on function public.create_market_listing(text,numeric) to authenticated;

revoke execute on function public.buy_market_listing(uuid) from public,anon;
grant execute on function public.buy_market_listing(uuid) to authenticated;

revoke execute on function public.cancel_market_listing(uuid) from public,anon;
grant execute on function public.cancel_market_listing(uuid) to authenticated;

notify pgrst, 'reload schema';
