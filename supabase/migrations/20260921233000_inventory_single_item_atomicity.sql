-- Emoji Drops: final inventory atomicity hardening.
-- Remove exactly one physical item by id. Duplicate/corrupt inventory entries must never
-- cause a sell/list/upgrade action to consume multiple items.

create or replace function public.sell_item_server(p_item_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); inv jsonb; item jsonb; value numeric; remove_ord bigint;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select inventory into inv from public.profiles where id=uid for update;
 if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
 select e.x,e.ord into item,remove_ord
 from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) with ordinality e(x,ord)
 where e.x->>'id'=p_item_id order by e.ord limit 1;
 if item is null then raise exception 'ITEM_NOT_FOUND'; end if;
 value:=round(coalesce((item->>'price')::numeric,0),2);
 if value<=0 then raise exception 'INVALID_ITEM_PRICE'; end if;
 update public.profiles
 set balance=balance+value,
     inventory=(select coalesce(jsonb_agg(e.x order by e.ord),'[]'::jsonb)
                from jsonb_array_elements(inv) with ordinality e(x,ord)
                where e.ord<>remove_ord),
     stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+value),true),
     updated_at=now()
 where id=uid;
 return jsonb_build_object('item',item,'sold',value,'balance',(select balance from public.profiles where id=uid));
end; $$;

create or replace function public.create_market_listing(p_item_id text,p_price numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); inv jsonb; item jsonb; clean_price numeric; listing public.market_listings%rowtype; remove_ord bigint;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 clean_price:=round(coalesce(p_price,0),2);
 if clean_price<=0 or clean_price>100000000 then raise exception 'INVALID_LISTING_PRICE'; end if;
 select inventory into inv from public.profiles where id=uid for update;
 if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
 select e.x,e.ord into item,remove_ord
 from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) with ordinality e(x,ord)
 where e.x->>'id'=p_item_id order by e.ord limit 1;
 if item is null then raise exception 'ITEM_NOT_FOUND'; end if;
 if exists(select 1 from public.market_listings where seller_id=uid and status='active' and item->>'id'=p_item_id) then
   raise exception 'ITEM_ALREADY_LISTED';
 end if;
 insert into public.market_listings(seller_id,item,listing_price) values(uid,item,clean_price) returning * into listing;
 update public.profiles set
   inventory=(select coalesce(jsonb_agg(e.x order by e.ord),'[]'::jsonb)
             from jsonb_array_elements(inv) with ordinality e(x,ord)
             where e.ord<>remove_ord),
   updated_at=now()
 where id=uid;
 return jsonb_build_object('id',listing.id,'item',item,'listing_price',listing.listing_price,'status',listing.status);
end; $$;

create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric,p_target_emoji text,p_target_rarity text,p_target_case_id text,p_chance numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); inv jsonb; src jsonb; src_ord bigint; src_price numeric; target public.case_items%rowtype; max_chance numeric; chance numeric; roll numeric:=random(); success boolean; result jsonb;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select inventory into inv from public.profiles where id=uid for update;
 if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
 select e.x,e.ord into src,src_ord
 from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) with ordinality e(x,ord)
 where e.x->>'id'=p_item_id order by e.ord limit 1;
 if src is null then raise exception 'ITEM_NOT_FOUND'; end if;
 src_price:=round((src->>'price')::numeric,2);
 if src_price<=0 then raise exception 'INVALID_SOURCE'; end if;
 select ci.* into target from public.case_items ci
 where ci.case_id=lower(trim(p_target_case_id))
   and ci.emoji=left(trim(coalesce(p_target_emoji,'')),16)
   and ci.rarity=lower(trim(coalesce(p_target_rarity,'')))
   and ci.item_price=round(p_target_price,2) limit 1;
 if target.item_index is null then raise exception 'TARGET_NOT_IN_CATALOG'; end if;
 if target.item_price<=src_price then raise exception 'INVALID_TARGET'; end if;
 if p_multiplier<=1 or p_multiplier>5 or p_target_price>100000000 then raise exception 'INVALID_UPGRADE'; end if;
 if target.item_price>round(src_price*p_multiplier,2) then raise exception 'INVALID_TARGET'; end if;
 max_chance:=greatest(0.01,least(0.90,0.90/(target.item_price/src_price)));
 chance:=greatest(0.01,least(max_chance,coalesce(p_chance,max_chance)));
 if p_chance is null or p_chance<=0 or p_chance>max_chance+0.000001 then raise exception 'INVALID_CHANCE'; end if;
 success:=roll<=chance;
 if success then
   result:=jsonb_build_object('id',public.gen_random_uuid()::text,'emoji',target.emoji,'rarity',target.rarity,'price',target.item_price,'case_id',target.case_id,'created_at',now(),'upgraded_from',p_item_id);
 else result:=null; end if;
 update public.profiles set
   best_drop=case when success and (best_drop is null or coalesce((best_drop->>'price')::numeric,0)<target.item_price) then result else best_drop end,
   inventory=(select coalesce(jsonb_agg(e.x order by e.ord),'[]'::jsonb)
              from jsonb_array_elements(inv) with ordinality e(x,ord)
              where e.ord<>src_ord) || case when success then jsonb_build_array(result) else '[]'::jsonb end,
   stats=jsonb_set(jsonb_set(coalesce(stats,'{}'::jsonb),'{upgrades}',to_jsonb(coalesce((stats->>'upgrades')::int,0)+1),true),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+case when success then 1 else 0 end),true),
   updated_at=now()
 where id=uid;
 return jsonb_build_object('success',success,'item',result,'chance',chance,'multiplier',target.item_price/src_price,'balance',(select balance from public.profiles where id=uid));
end; $$;

revoke execute on function public.sell_item_server(text) from public,anon;
grant execute on function public.sell_item_server(text) to authenticated;
revoke execute on function public.create_market_listing(text,numeric) from public,anon;
grant execute on function public.create_market_listing(text,numeric) to authenticated;
revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated;
