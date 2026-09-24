-- Emoji Drops: committed case fairness and canonical post-RNG RPC identities.
-- Applies after 20260924093000_secure_outcome_rng.sql and removes its remaining random() / legacy open RPC behavior.

create table if not exists public.case_fairness_rounds (
  id uuid primary key default public.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null,
  client_nonce text not null,
  server_seed text not null,
  commitment text not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  result jsonb
);
alter table public.case_fairness_rounds enable row level security;
revoke all on table public.case_fairness_rounds from public,anon,authenticated;
create unique index if not exists case_fairness_active_user_idx
  on public.case_fairness_rounds(user_id) where consumed_at is null;
create index if not exists case_fairness_user_created_idx
  on public.case_fairness_rounds(user_id,created_at desc);

create or replace function public.fair_uniform(p_seed text,p_nonce text,p_case_id text,p_label text) returns numeric
language sql immutable security definer set search_path='' as $fairuniform$
  with d as (
    select digest(coalesce(p_seed,'')||':'||coalesce(p_nonce,'')||':'||lower(trim(coalesce(p_case_id,'')))||':'||coalesce(p_label,''),'sha256') as b
  )
  select (
    get_byte(b,0)::numeric*72057594037927936 +
    get_byte(b,1)::numeric*281474976710656 +
    get_byte(b,2)::numeric*1099511627776 +
    get_byte(b,3)::numeric*4294967296 +
    get_byte(b,4)::numeric*16777216 +
    get_byte(b,5)::numeric*65536 +
    get_byte(b,6)::numeric*256 +
    get_byte(b,7)::numeric
  ) / 18446744073709551616 from d
$fairuniform$;
revoke execute on function public.fair_uniform(text,text,text,text) from public,anon,authenticated;

create or replace function public.case_fairness_commit(p_case_id text,p_client_nonce text) returns jsonb
language plpgsql security definer set search_path='' as $faircommit$
declare
  uid uuid:=auth.uid();
  case_key text:=lower(trim(coalesce(p_case_id,'')));
  nonce text:=trim(coalesce(p_client_nonce,''));
  seed text;
  commitment text;
  round_id uuid;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if public.case_cost(case_key) is null then raise exception 'INVALID_CASE'; end if;
  if char_length(nonce)<8 or char_length(nonce)>128 then raise exception 'INVALID_CLIENT_NONCE'; end if;
  if not exists(select 1 from public.case_items where case_id=case_key) then raise exception 'CASE_ITEMS_UNAVAILABLE'; end if;
  perform 1 from public.profiles where id=uid for update;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  delete from public.case_fairness_rounds where user_id=uid and consumed_at is null;
  seed:=encode(public.gen_random_bytes(32),'hex');
  commitment:=encode(digest(seed||':'||nonce||':'||case_key,'sha256'),'hex');
  insert into public.case_fairness_rounds(user_id,case_id,client_nonce,server_seed,commitment)
    values(uid,case_key,nonce,seed,commitment)
    returning id into round_id;
  return jsonb_build_object('round_id',round_id,'case_id',case_key,'client_nonce',nonce,'commitment',commitment,'algorithm','sha256-csprng-v1');
end; $faircommit$;
revoke execute on function public.case_fairness_commit(text,text) from public,anon;
grant execute on function public.case_fairness_commit(text,text) to authenticated;

drop function if exists public.open_case_server(text,numeric);

create or replace function public.open_case_server(p_case_id text,p_cost numeric,p_round_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid();
  bal numeric;
  inv jsonb;
  cost numeric;
  roll numeric;
  item_roll numeric;
  item_count integer;
  item_offset integer;
  v_rarity text;
  chosen public.case_items%rowtype;
  item jsonb;
  fair_round public.case_fairness_rounds%rowtype;
  expected_commitment text;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  cost:=public.case_cost(p_case_id);
  if cost is null or p_cost is null or round(p_cost,2)<>round(cost,2) then raise exception 'INVALID_CASE_COST'; end if;
  select * into fair_round from public.case_fairness_rounds where id=p_round_id and user_id=uid and consumed_at is null for update;
  if fair_round.id is null then raise exception 'FAIRNESS_COMMIT_REQUIRED'; end if;
  if fair_round.case_id<>lower(trim(p_case_id)) then raise exception 'FAIRNESS_CASE_MISMATCH'; end if;
  if fair_round.created_at < now()-interval '5 minutes' then
    update public.case_fairness_rounds set consumed_at=now() where id=fair_round.id;
    raise exception 'FAIRNESS_COMMIT_EXPIRED';
  end if;
  expected_commitment:=encode(digest(fair_round.server_seed||':'||fair_round.client_nonce||':'||fair_round.case_id,'sha256'),'hex');
  if expected_commitment<>fair_round.commitment then raise exception 'FAIRNESS_COMMIT_INVALID'; end if;
  select balance,inventory into bal,inv from public.profiles where id=uid for update;
  if bal is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if bal<cost then raise exception 'INSUFFICIENT_FUNDS'; end if;
  roll:=public.fair_uniform(fair_round.server_seed,fair_round.client_nonce,fair_round.case_id,'rarity');
  item_roll:=public.fair_uniform(fair_round.server_seed,fair_round.client_nonce,fair_round.case_id,'item');
  v_rarity:=case when roll<.01 then 'legendary' when roll<.06 then 'mythical' when roll<.18 then 'epic' when roll<.45 then 'rare' else 'common' end;
  select count(*)::int into item_count from public.case_items where case_id=lower(trim(p_case_id)) and rarity=v_rarity;
  if item_count<1 then raise exception 'CASE_ITEMS_UNAVAILABLE'; end if;
  item_offset:=least(item_count-1,floor(item_roll*item_count)::int);
  select ci.* into chosen from public.case_items ci
    where ci.case_id=lower(trim(p_case_id)) and ci.rarity=v_rarity
    order by ci.item_index offset item_offset limit 1;
  if chosen.item_index is null then raise exception 'CASE_ITEMS_UNAVAILABLE'; end if;
  item:=jsonb_build_object('id',public.gen_random_uuid()::text,'item_index',chosen.item_index,'emoji',chosen.emoji,'rarity',chosen.rarity,'price',chosen.item_price,'case_id',chosen.case_id,'caseKey',chosen.case_id,'obtainedAt',now());
  update public.profiles
    set balance=bal-cost,
        inventory=coalesce(inv,'[]'::jsonb)||jsonb_build_array(item),
        best_drop=case when best_drop is null or coalesce((best_drop->>'price')::numeric,0)<chosen.item_price then item else best_drop end,
        stats=jsonb_set(jsonb_set(jsonb_set(coalesce(stats,'{}'::jsonb),'{opens}',to_jsonb(coalesce((stats->>'opens')::int,0)+1),true),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+1),true),'{spent}',to_jsonb(coalesce((stats->>'spent')::numeric,0)+cost),true),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+chosen.item_price),true),
        updated_at=now()
    where id=uid;
  if to_regclass('public.live_drops') is not null then
    execute 'insert into public.live_drops(user_id,nickname,item,case_id,item_price,created_at) values ($1,$2,$3,$4,$5,now())'
      using uid,(select nickname from public.profiles where id=uid),item,chosen.case_id,chosen.item_price;
    execute 'delete from public.live_drops where created_at < now()-interval ''30 minutes''';
  end if;
  update public.case_fairness_rounds
    set consumed_at=now(),result=jsonb_build_object('item',item,'balance',bal-cost,'cost',cost)
    where id=fair_round.id;
  return jsonb_build_object(
    'item',item,
    'balance',bal-cost,
    'cost',cost,
    'fairness',jsonb_build_object(
      'round_id',round.id,
      'commitment',fair_round.commitment,
      'server_seed',fair_round.server_seed,
      'client_nonce',fair_round.client_nonce,
      'case_id',fair_round.case_id,
      'algorithm','sha256-csprng-v1'
    )
  );
end; $$;
revoke execute on function public.open_case_server(text,numeric,uuid) from public,anon;
grant execute on function public.open_case_server(text,numeric,uuid) to authenticated;

create or replace function public.upgrade_server(p_item_id text,p_target_price numeric,p_multiplier numeric,p_target_emoji text,p_target_rarity text,p_target_case_id text,p_chance numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid();
  inv jsonb;
  src jsonb;
  src_price numeric;
  target public.case_items%rowtype;
  max_chance numeric;
  chance numeric;
  roll numeric:=public.secure_uniform_roll();
  success boolean;
  result jsonb;
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
  if success then
    result=jsonb_build_object('id',public.gen_random_uuid()::text,'emoji',target.emoji,'rarity',target.rarity,'price',target.item_price,'case_id',target.case_id,'created_at',now(),'upgraded_from',p_item_id);
  else
    result:=null;
  end if;
  update public.profiles
    set best_drop=case when success and (best_drop is null or coalesce((best_drop->>'price')::numeric,0)<target.item_price) then result else best_drop end,
        inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id) || case when success then jsonb_build_array(result) else '[]'::jsonb end,
        stats=jsonb_set(jsonb_set(coalesce(stats,'{}'::jsonb),'{upgrades}',to_jsonb(coalesce((stats->>'upgrades')::int,0)+1),true),'{wins}',to_jsonb(coalesce((stats->>'wins')::int,0)+case when success then 1 else 0 end),true),
        updated_at=now()
    where id=uid;
  return jsonb_build_object('success',success,'item',result,'chance',chance,'multiplier',target.item_price/src_price,'balance',(select balance from public.profiles where id=uid));
end; $$;
revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated;

notify pgrst, 'reload schema';
