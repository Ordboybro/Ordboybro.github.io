-- Emoji Drops — authoritative Upgrade target and chance validation.
-- Target identity is resolved against the same server-owned case catalog used by case opening.
create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric,p_target_emoji text,p_target_rarity text,p_target_case_id text,p_chance numeric) returns jsonb
language plpgsql security definer set search_path=public as $$
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
  if target.item_index is null then raise exception 'INVALID_TARGET'; end if;
  if target.item_price<=src_price then raise exception 'INVALID_TARGET'; end if;
  if p_multiplier<=1 or p_multiplier>5 then raise exception 'INVALID_UPGRADE'; end if;
  if abs((target.item_price/src_price)-p_multiplier)>0.01 then raise exception 'INVALID_MULTIPLIER'; end if;
  max_chance:=greatest(0.01,least(0.90,0.90/(target.item_price/src_price)));
  chance:=greatest(0.01,least(max_chance,coalesce(p_chance,max_chance)));
  if p_chance is null or p_chance<=0 or p_chance>max_chance+0.000001 then raise exception 'INVALID_CHANCE'; end if;
  success:=roll<=chance;
  if success then result:=jsonb_build_object('id',gen_random_uuid()::text,'emoji',target.emoji,'rarity',target.rarity,'price',target.item_price,'case_id',target.case_id,'created_at',now(),'upgraded_from',p_item_id); else result:=null; end if;
  update public.profiles set inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id) || case when success then jsonb_build_array(result) else '[]'::jsonb end,stats=jsonb_set(jsonb_set(coalesce(stats,'{}'::jsonb),'{upgrades}',to_jsonb(coalesce((stats->>'upgrades')::int,0)+1),true),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+case when success then 1 else 0 end),true),updated_at=now() where id=uid;
  return jsonb_build_object('success',success,'item',result,'chance',chance,'multiplier',target.item_price/src_price,'balance',(select balance from public.profiles where id=uid));
end; $$;
revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text) from public,anon;
revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated;
