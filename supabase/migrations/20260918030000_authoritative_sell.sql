-- Emoji Drops — authoritative single-item sale.
-- Run after supabase/schema.sql for existing projects.
create or replace function public.sell_item_server(p_item_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); inv jsonb; item jsonb; value numeric;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select inventory into inv from public.profiles where id=uid for update;
 if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
 select x into item from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
 if item is null then raise exception 'ITEM_NOT_FOUND'; end if;
 value:=round(coalesce((item->>'price')::numeric,0),2);
 if value<=0 then raise exception 'INVALID_ITEM_PRICE'; end if;
 update public.profiles set balance=balance+value,inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id),stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+value),true),updated_at=now() where id=uid;
 return jsonb_build_object('item',item,'sold',value,'balance',(select balance from public.profiles where id=uid));
end; $$;
revoke execute on function public.sell_item_server(text) from public,anon;
grant execute on function public.sell_item_server(text) to authenticated;
