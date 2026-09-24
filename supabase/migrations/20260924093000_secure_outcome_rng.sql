-- Production RNG hardening: server-only cryptographic uniform roll.
create or replace function public.secure_uniform_roll() returns numeric
language sql volatile security definer set search_path='' as $$
  with r as (select public.gen_random_bytes(4) as b)
  select (
    pg_catalog.get_byte(b,0)::numeric*16777216 +
    pg_catalog.get_byte(b,1)::numeric*65536 +
    pg_catalog.get_byte(b,2)::numeric*256 +
    pg_catalog.get_byte(b,3)::numeric
  ) / 4294967296
  from r;
$$;
revoke execute on function public.secure_uniform_roll() from public,anon,authenticated;

create or replace function public.open_case_server(p_case_id text, p_cost numeric default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid(); bal numeric; inv jsonb; cost numeric; roll numeric:=public.secure_uniform_roll(); v_rarity text; chosen public.case_items%rowtype; item jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  cost:=public.case_cost(p_case_id);
  if cost is null then raise exception 'INVALID_CASE'; end if;
  select balance,inventory into bal,inv from public.profiles where id=uid for update;
  if bal is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if bal<cost then raise exception 'INSUFFICIENT_FUNDS'; end if;
  v_rarity:=case when roll<.01 then 'legendary' when roll<.06 then 'mythical' when roll<.18 then 'epic' when roll<.45 then 'rare' else 'common' end;
  select ci.* into chosen from public.case_items ci where ci.case_id=lower(trim(p_case_id)) and ci.rarity=v_rarity order by random() limit 1;
  if chosen.item_index is null then raise exception 'CASE_ITEMS_UNAVAILABLE'; end if;
  item:=jsonb_build_object('id',public.gen_random_uuid()::text,'emoji',chosen.emoji,'rarity',chosen.rarity,'price',chosen.item_price,'case_id',chosen.case_id,'caseKey',chosen.case_id,'obtainedAt',now());
  update public.profiles set balance=bal-cost,inventory=coalesce(inv,'[]'::jsonb)||jsonb_build_array(item),best_drop=case when best_drop is null or coalesce((best_drop->>'price')::numeric,0)<chosen.item_price then item else best_drop end,stats=jsonb_set(jsonb_set(jsonb_set(coalesce(stats,'{}'::jsonb),'{opens}',to_jsonb(coalesce((stats->>'opens')::int,0)+1),true),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+1),true),'{spent}',to_jsonb(coalesce((stats->>'spent')::numeric,0)+cost),true),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+chosen.item_price),true),updated_at=now() where id=uid;
  if to_regclass('public.live_drops') is not null then
    execute 'insert into public.live_drops(user_id,nickname,item,case_id,item_price,created_at) values ($1,$2,$3,$4,$5,now())' using uid,(select nickname from public.profiles where id=uid),item,chosen.case_id,chosen.item_price;
    execute 'delete from public.live_drops where created_at < now()-interval ''30 minutes''';
  end if;
  return jsonb_build_object('item',item,'balance',bal-cost,'cost',cost);
end; $$;
revoke execute on function public.open_case_server(text,numeric) from public,anon;
grant execute on function public.open_case_server(text,numeric) to authenticated;

create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric,p_target_emoji text,p_target_rarity text,p_target_case_id text,p_chance numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid(); inv jsonb; src jsonb; src_price numeric; target public.case_items%rowtype; max_chance numeric; chance numeric; roll numeric:=random(); success boolean; result jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select inventory into inv from public.profiles where id=uid for update;
  if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  select x into src from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
  if src is null then raise exception 'ITEM_NOT_FOUND'; end if;
  src_price:=round((src->>'price')::numeric,2);
  if src_price<=0 then raise exception 'INVALID_SOURCE'; end if;
  select ci.* into target from public.case_items ci where ci.case_id=lower(trim(p_target_case_id)) and ci.emoji=left(trim(coalesce(p_target_emoji,'')),16) and ci.rarity=lower(trim(coalesce(p_target_rarity,''))) and ci.item_price=round(p_target_price,2) limit 1;
  if target.item_index is null then raise exception 'TARGET_NOT_IN_CATALOG'; end if;
  if target.item_price<=src_price then raise exception 'INVALID_TARGET'; end if;
  if p_multiplier<=1 or p_multiplier>5 or p_target_price>100000000 then raise exception 'INVALID_UPGRADE'; end if;
  if target.item_price>round(src_price*p_multiplier,2) then raise exception 'INVALID_TARGET'; end if;
  max_chance:=greatest(0.01,least(0.90,0.90/(target.item_price/src_price)));
  chance:=greatest(0.01,least(max_chance,coalesce(p_chance,max_chance)));
  if p_chance is null or p_chance<=0 or p_chance>max_chance+0.000001 then raise exception 'INVALID_CHANCE'; end if;
  success:=roll<=chance;
  if success then result:=jsonb_build_object('id',public.gen_random_uuid()::text,'emoji',target.emoji,'rarity',target.rarity,'price',target.item_price,'case_id',target.case_id,'created_at',now(),'upgraded_from',p_item_id); else result:=null; end if;
  update public.profiles set best_drop=case when success and (best_drop is null or coalesce((best_drop->>'price')::numeric,0)<target.item_price) then result else best_drop end, inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id) || case when success then jsonb_build_array(result) else '[]'::jsonb end,stats=jsonb_set(jsonb_set(coalesce(stats,'{}'::jsonb),'{upgrades}',to_jsonb(coalesce((stats->>'upgrades')::int,0)+1),true),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+case when success then 1 else 0 end),true),updated_at=now() where id=uid;
  return jsonb_build_object('success',success,'item',result,'chance',chance,'multiplier',target.item_price/src_price,'balance',(select balance from public.profiles where id=uid));
end; $$;
revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated;
