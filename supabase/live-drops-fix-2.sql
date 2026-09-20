-- Emoji Drops Live Drops repair v3.
-- This file is a repair migration only. It deliberately restores the canonical
-- case_items-backed transaction so it cannot reintroduce the legacy hard-coded
-- rarity/price resolver that used to overwrite the authoritative migration.
create or replace function public.open_case_server(p_case_id text, p_cost numeric default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid();
  bal numeric;
  inv jsonb;
  cost numeric;
  roll numeric:=random();
  v_rarity text;
  chosen public.case_items%rowtype;
  item jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  cost:=public.case_cost(p_case_id);
  if cost is null then raise exception 'INVALID_CASE'; end if;
  select balance,inventory into bal,inv from public.profiles where id=uid for update;
  if bal is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if bal<cost then raise exception 'INSUFFICIENT_FUNDS'; end if;
  v_rarity:=case
    when roll<.01 then 'legendary'
    when roll<.06 then 'mythical'
    when roll<.18 then 'epic'
    when roll<.45 then 'rare'
    else 'common'
  end;
  select ci.* into chosen
  from public.case_items ci
  where ci.case_id=lower(trim(p_case_id)) and ci.rarity=v_rarity
  order by random()
  limit 1;
  if chosen.item_index is null then raise exception 'CASE_ITEMS_UNAVAILABLE'; end if;
  item:=jsonb_build_object(
    'id',public.gen_random_uuid()::text,
    'emoji',chosen.emoji,
    'rarity',chosen.rarity,
    'price',chosen.item_price,
    'case_id',chosen.case_id,
    'caseKey',chosen.case_id,
    'obtainedAt',now()
  );
  update public.profiles
  set balance=bal-cost,
      inventory=coalesce(inv,'[]'::jsonb)||jsonb_build_array(item),
      best_drop=case when best_drop is null or coalesce((best_drop->>'price')::numeric,0)<chosen.item_price then item else best_drop end,
      stats=jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(coalesce(stats,'{}'::jsonb),'{opens}',to_jsonb(coalesce((stats->>'opens')::int,0)+1),true),
            '{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+1),true
          ),
          '{spent}',to_jsonb(coalesce((stats->>'spent')::numeric,0)+cost),true
        ),
        '{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+chosen.item_price),true
      ),
      updated_at=now()
  where id=uid;
  if to_regclass('public.live_drops') is not null then
    execute 'insert into public.live_drops(user_id,nickname,item,case_id,item_price,created_at) values ($1,$2,$3,$4,$5,now())'
      using uid,(select nickname from public.profiles where id=uid),item,chosen.case_id,chosen.item_price;
    execute 'delete from public.live_drops where created_at < now()-interval ''30 minutes''';
  end if;
  return jsonb_build_object('item',item,'balance',bal-cost,'cost',cost);
end; $$;

revoke execute on function public.open_case_server(text,numeric) from public,anon;
grant execute on function public.open_case_server(text,numeric) to authenticated;
