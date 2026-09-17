-- Emoji Drops Live Drops repair v2.
-- Run after supabase/market-live-migration.sql.
-- Fixes the authoritative case-open payload so Live Drops receives the real case emoji.
create or replace function public.open_case_server(p_case_id text, p_cost numeric default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare
 uid uuid:=auth.uid(); bal numeric; inv jsonb; cost numeric; roll numeric:=random(); rarity text; price numeric; item jsonb; nick text; case_emoji text;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 cost:=public.case_cost(p_case_id); if cost is null then raise exception 'INVALID_CASE'; end if;
 case_emoji:=case lower(trim(p_case_id))
   when 'smile' then '😀' when 'moves' then '🕺' when 'nature' then '🌿' when 'food' then '🍔'
   when 'animals' then '🐶' when 'transport' then '🚗' when 'sport' then '⚽' when 'games' then '🎮' else '🎁' end;
 select balance,inventory,nickname into bal,inv,nick from public.profiles where id=uid for update;
 if bal is null then raise exception 'PROFILE_NOT_FOUND'; end if;
 if bal<cost then raise exception 'INSUFFICIENT_FUNDS'; end if;
 rarity:=case when roll<.01 then 'legendary' when roll<.06 then 'mythical' when roll<.18 then 'epic' when roll<.45 then 'rare' else 'common' end;
 price:=case rarity when 'legendary' then round(cost*3,2) when 'mythical' then round(cost*1.7,2) when 'epic' then round(cost,2) when 'rare' then round(cost*.55,2) else round(cost*.30,2) end;
 item:=jsonb_build_object('id',gen_random_uuid()::text,'case_id',lower(trim(p_case_id)),'emoji',case_emoji,'rarity',rarity,'price',price,'created_at',now());
 update public.profiles set balance=bal-cost,inventory=coalesce(inv,'[]'::jsonb)||jsonb_build_array(item),best_drop=case when best_drop is null or coalesce((best_drop->>'price')::numeric,0)<price then item else best_drop end,updated_at=now() where id=uid;
 insert into public.live_drops(user_id,nickname,item,case_id,item_price) values(uid,coalesce(nick,'Player'),item,lower(trim(p_case_id)),price);
 delete from public.live_drops where created_at < now()-interval '30 minutes';
 return jsonb_build_object('item',item,'balance',bal-cost,'cost',cost,'nickname',coalesce(nick,'Player'));
end; $$;
grant execute on function public.open_case_server(text,numeric) to authenticated;
