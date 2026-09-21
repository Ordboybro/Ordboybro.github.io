-- Emoji Drops — server-authoritative economy v8.
-- Canonical case prices and authoritative random outcomes stay on the server.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default 'Player',
  balance numeric(12,2) not null default 250 check (balance >= 0),
  inventory jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  best_drop jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid()=id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,nickname,balance) values(new.id,coalesce(new.raw_user_meta_data->>'nickname',split_part(new.email,'@',1)),250) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_nickname(p_nickname text) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); clean text:=trim(coalesce(p_nickname,''));
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if char_length(clean)<1 or char_length(clean)>32 then raise exception 'INVALID_NICKNAME'; end if;
 update public.profiles set nickname=clean,updated_at=now() where id=uid;
 return jsonb_build_object('nickname',clean);
end; $$;

create or replace function public.case_cost(p_case_id text) returns numeric language sql immutable as $$
select case lower(trim(p_case_id)) when 'smile' then 100 when 'moves' then 80 when 'nature' then 60 when 'food' then 40 when 'animals' then 20 when 'transport' then 10 when 'sport' then 250 when 'games' then 500 else null end $$;

create or replace function public.sell_all_server() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); total numeric;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 with locked as (select inventory from public.profiles where id=uid for update) select coalesce(sum((x->>'price')::numeric),0) into total from locked,jsonb_array_elements(coalesce(locked.inventory,'[]'::jsonb)) x;
 update public.profiles set balance=balance+total,inventory='[]'::jsonb,updated_at=now() where id=uid;
 return jsonb_build_object('balance',(select balance from public.profiles where id=uid),'sold',total);
end; $$;

grant execute on function public.case_cost(text) to authenticated;
grant execute on function public.set_nickname(text) to authenticated;
grant execute on function public.sell_all_server() to authenticated;


-- Authoritative single-item sale. The server owns item existence and payout.
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


-- Harden the fresh schema against legacy/public execution and remove superseded overloads.
revoke execute on function public.handle_new_user() from public,anon,authenticated;
grant execute on function public.handle_new_user() to service_role;
revoke execute on function public.set_nickname(text) from public,anon;
grant execute on function public.set_nickname(text) to authenticated;
revoke execute on function public.open_case_server(text,numeric) from public,anon;
revoke execute on function public.sell_all_server() from public,anon;
grant execute on function public.sell_all_server() to authenticated;
revoke execute on function public.upgrade_server(text,numeric,numeric) from public,anon,authenticated;
drop function if exists public.upgrade_server(text,numeric,numeric);

-- Canonical case catalogue and server-side resolution (self-contained schema).
-- Emoji Drops authoritative case catalog + server-side case resolution.
-- The browser may display this catalog, but the RPC chooses the actual item on the server.
create table if not exists public.case_items (
  case_id text not null,
  item_index integer not null,
  emoji text not null,
  rarity text not null check (rarity in ('common','rare','epic','mythical','legendary')),
  item_price numeric(12,2) not null check (item_price >= 0),
  primary key (case_id,item_index)
);
alter table public.case_items enable row level security;
revoke all on public.case_items from anon, authenticated;

insert into public.case_items(case_id,item_index,emoji,rarity,item_price) values
('smile',0,'😀','common',4),
('smile',1,'😃','common',4),
('smile',2,'😄','common',5),
('smile',3,'😁','common',5),
('smile',4,'😆','common',5),
('smile',5,'😅','common',5),
('smile',6,'😂','common',6),
('smile',7,'🤣','common',6),
('smile',8,'🙂','common',6),
('smile',9,'🙃','common',6),
('smile',10,'😉','common',7),
('smile',11,'😊','rare',12),
('smile',12,'😇','rare',13),
('smile',13,'😍','rare',14),
('smile',14,'😘','rare',14),
('smile',15,'😎','rare',15),
('smile',16,'🤓','rare',16),
('smile',17,'🥳','epic',28),
('smile',18,'🤩','epic',30),
('smile',19,'😈','epic',32),
('smile',20,'👻','epic',35),
('smile',21,'🤖','mythical',70),
('smile',22,'👽','mythical',80),
('smile',23,'💀','mythical',90),
('smile',24,'👑','legendary',150),
('smile',25,'💎','legendary',180),
('smile',26,'🌟','legendary',220),
('smile',27,'🤗','common',7),
('smile',28,'🤭','common',7),
('smile',29,'🤔','common',8),
('smile',30,'😐','common',8),
('smile',31,'😑','common',8),
('smile',32,'😌','rare',11),
('smile',33,'😏','rare',12),
('smile',34,'😒','rare',13),
('smile',35,'😞','rare',14),
('smile',36,'😓','rare',15),
('smile',37,'😩','epic',25),
('smile',38,'😱','epic',27),
('smile',39,'😭','epic',30),
('smile',40,'😖','epic',33),
('smile',41,'🤯','mythical',65),
('smile',42,'🤢','mythical',75),
('smile',43,'🤧','mythical',85),
('smile',44,'🥵','legendary',170),
('smile',45,'🥶','legendary',190),
('moves',0,'🕺','common',3),
('moves',1,'💃','common',3),
('moves',2,'🏃','common',4),
('moves',3,'🚶','common',4),
('moves',4,'🏃‍♂️','common',5),
('moves',5,'🏃‍♀️','common',5),
('moves',6,'🤸','rare',10),
('moves',7,'🏋️','rare',12),
('moves',8,'🤾','rare',13),
('moves',9,'🚴','rare',14),
('moves',10,'⚡','epic',24),
('moves',11,'🔥','epic',28),
('moves',12,'💨','epic',30),
('moves',13,'🌪️','mythical',60),
('moves',14,'☄️','mythical',75),
('moves',15,'👑','legendary',140),
('moves',16,'🧘‍♂️','common',4),
('moves',17,'🧘‍♀️','common',4),
('moves',18,'🤺','common',5),
('moves',19,'🤼‍♂️','common',5),
('moves',20,'🤼‍♀️','common',5),
('moves',21,'🤽‍♂️','rare',11),
('moves',22,'🤽‍♀️','rare',11),
('moves',23,'🤹‍♂️','rare',12),
('moves',24,'🤹‍♀️','rare',12),
('moves',25,'🤴','rare',13),
('moves',26,'🤵‍♂️','epic',20),
('moves',27,'🤵‍♀️','epic',20),
('moves',28,'🤴','epic',22),
('moves',29,'🦸‍♂️','epic',26),
('moves',30,'🦸‍♀️','epic',26),
('moves',31,'🦹‍♂️','mythical',55),
('moves',32,'🦹‍♀️','mythical',55),
('moves',33,'🦸‍♂️','mythical',65),
('moves',34,'🦸‍♀️','mythical',65),
('moves',35,'🦹‍♂️','legendary',130),
('moves',36,'🦹‍♀️','legendary',130),
('nature',0,'🌿','common',2),
('nature',1,'🌲','common',3),
('nature',2,'🌳','common',3),
('nature',3,'🍀','common',3),
('nature',4,'🌱','common',4),
('nature',5,'🌵','common',4),
('nature',6,'🌸','rare',10),
('nature',7,'🌺','rare',12),
('nature',8,'🌼','rare',13),
('nature',9,'🌻','rare',14),
('nature',10,'🌈','epic',26),
('nature',11,'🌊','epic',28),
('nature',12,'🌋','mythical',55),
('nature',13,'🌪️','mythical',70),
('nature',14,'☀️','legendary',130),
('nature',15,'🌌','legendary',180),
('nature',16,'🍂','common',2),
('nature',17,'🍁','common',2),
('nature',18,'🍃','common',3),
('nature',19,'🌴','common',3),
('nature',20,'💐','common',4),
('nature',21,'🌹','rare',11),
('nature',22,'🌷','rare',12),
('nature',23,'🥀','rare',13),
('nature',24,'🌴','rare',14),
('nature',25,'🌾','rare',15),
('nature',26,'🌦️','epic',25),
('nature',27,'⛅','epic',27),
('nature',28,'🌧️','epic',29),
('nature',29,'❄️','epic',31),
('nature',30,'🌩️','mythical',60),
('nature',31,'🌤️','mythical',65),
('nature',32,'🌑','mythical',75),
('nature',33,'🌕','mythical',80),
('nature',34,'🌍','legendary',160),
('nature',35,'🌎','legendary',170),
('nature',36,'🪐','legendary',190),
('food',0,'🍔','common',2),
('food',1,'🍕','common',2),
('food',2,'🍟','common',3),
('food',3,'🌭','common',3),
('food',4,'🍿','common',3),
('food',5,'🥪','common',4),
('food',6,'🍩','rare',9),
('food',7,'🍪','rare',10),
('food',8,'🍫','rare',12),
('food',9,'🍰','epic',20),
('food',10,'🎂','epic',24),
('food',11,'🍓','epic',26),
('food',12,'🍣','mythical',50),
('food',13,'🍤','mythical',65),
('food',14,'💎','legendary',140),
('food',15,'👑','legendary',170),
('food',16,'🍎','common',2),
('food',17,'🍊','common',2),
('food',18,'🍋','common',3),
('food',19,'🍇','common',3),
('food',20,'🍏','common',3),
('food',21,'🍐','rare',8),
('food',22,'🍑','rare',9),
('food',23,'🍒','rare',10),
('food',24,'🍌','rare',11),
('food',25,'🍍','rare',12),
('food',26,'🍯','epic',18),
('food',27,'🍼','epic',22),
('food',28,'☕️','epic',23),
('food',29,'🍵','epic',25),
('food',30,'🍷','mythical',45),
('food',31,'🍸','mythical',52),
('food',32,'🍹','mythical',58),
('food',33,'🍾','mythical',62),
('food',34,'🍳','legendary',120),
('food',35,'🍽️','legendary',130),
('food',36,'🧁','legendary',150),
('animals',0,'🐶','common',3),
('animals',1,'🐱','common',3),
('animals',2,'🐭','common',3),
('animals',3,'🐹','common',4),
('animals',4,'🐰','common',4),
('animals',5,'🦊','rare',12),
('animals',6,'🐼','rare',14),
('animals',7,'🐨','rare',15),
('animals',8,'🦁','epic',30),
('animals',9,'🐯','epic',34),
('animals',10,'🦄','epic',38),
('animals',11,'🐉','mythical',80),
('animals',12,'🦖','mythical',90),
('animals',13,'👹','legendary',170),
('animals',14,'👑','legendary',220),
('animals',15,'🦜','common',5),
('animals',16,'🕊️','common',4),
('animals',17,'🦅','common',5),
('animals',18,'🦉','common',5),
('animals',19,'🦋','common',4),
('animals',20,'🐝','common',4),
('animals',21,'🕷️','common',5),
('animals',22,'🦟','common',5),
('animals',23,'🦗','common',6),
('animals',24,'🐞','common',4),
('animals',25,'🦂','rare',11),
('animals',26,'🦃','rare',13),
('animals',27,'🦚','rare',14),
('animals',28,'🦩','rare',16),
('animals',29,'🦤','rare',17),
('animals',30,'🦛','epic',28),
('animals',31,'🦏','epic',32),
('animals',32,'🦓','epic',36),
('animals',33,'🦍','epic',42),
('animals',34,'🦧','epic',44),
('animals',35,'🦈','mythical',75),
('animals',36,'🦐','mythical',85),
('animals',37,'🦑','mythical',95),
('animals',38,'🦀','mythical',100),
('animals',39,'🦕','legendary',200),
('animals',40,'🦇','legendary',210),
('transport',0,'🚗','common',2),
('transport',1,'🚕','common',2),
('transport',2,'🚌','common',3),
('transport',3,'🚓','common',3),
('transport',4,'🚑','rare',10),
('transport',5,'🏎️','rare',14),
('transport',6,'🚜','rare',15),
('transport',7,'✈️','epic',28),
('transport',8,'🚀','epic',35),
('transport',9,'🛸','mythical',70),
('transport',10,'⚡','mythical',80),
('transport',11,'🪐','legendary',150),
('transport',12,'🌌','legendary',180),
('transport',13,'🚲','common',3),
('transport',14,'🛴','common',4),
('transport',15,'🛵','common',4),
('transport',16,'🛺','common',3),
('transport',17,'🚘','common',3),
('transport',18,'🚙','rare',11),
('transport',19,'🚚','rare',12),
('transport',20,'🚛','rare',13),
('transport',21,'🚐','rare',14),
('transport',22,'🚍','rare',16),
('transport',23,'🚝','epic',25),
('transport',24,'🚞','epic',27),
('transport',25,'🚈','epic',29),
('transport',26,'🚆','epic',31),
('transport',27,'🚄','epic',33),
('transport',28,'🛩️','mythical',65),
('transport',29,'🛫','mythical',75),
('transport',30,'⛵','mythical',85),
('transport',31,'🛥️','mythical',90),
('transport',32,'🛳️','mythical',95),
('transport',33,'🛰️','legendary',160),
('transport',34,'🗼','legendary',190),
('transport',35,'🗽','legendary',200),
('sport',0,'⚽','common',5),
('sport',1,'🏀','common',6),
('sport',2,'🏉','common',7),
('sport',3,'🏒','common',8),
('sport',4,'🏓','common',9),
('sport',5,'⛸️','common',10),
('sport',6,'🥌','common',11),
('sport',7,'🏸','common',12),
('sport',8,'🤸‍♂️','common',13),
('sport',9,'🤸‍♀️','common',13),
('sport',10,'🏋️‍♂️','rare',14),
('sport',11,'🏋️‍♀️','rare',14),
('sport',12,'🤺','rare',15),
('sport',13,'🏊‍♂️','rare',16),
('sport',14,'🏊‍♀️','rare',16),
('sport',15,'🚴‍♂️','rare',17),
('sport',16,'🚴‍♀️','rare',17),
('sport',17,'🏇','rare',18),
('sport',18,'🤼‍♂️','rare',19),
('sport',19,'🤼‍♀️','rare',19),
('sport',20,'🎣','epic',25),
('sport',21,'🛹','epic',27),
('sport',22,'🛼','epic',29),
('sport',23,'🤾‍♂️','epic',32),
('sport',24,'🤾‍♀️','epic',32),
('sport',25,'🤽‍♂️','epic',35),
('sport',26,'🤽‍♀️','epic',35),
('sport',27,'🏄‍♂️','epic',38),
('sport',28,'🏄‍♀️','epic',38),
('sport',29,'🏂','epic',42),
('sport',30,'🎽','mythical',60),
('sport',31,'🏋️','mythical',65),
('sport',32,'🤾','mythical',70),
('sport',33,'🏆','mythical',80),
('sport',34,'🏅','mythical',85),
('sport',35,'🥉','legendary',150),
('sport',36,'🥈','legendary',200),
('sport',37,'🥇','legendary',260),
('games',0,'🎮','common',8),
('games',1,'🕹️','common',9),
('games',2,'🃏','common',10),
('games',3,'🀄','common',11),
('games',4,'🎴','common',12),
('games',5,'🎲','rare',20),
('games',6,'♟️','rare',22),
('games',7,'🎯','rare',24),
('games',8,'🧩','rare',25),
('games',9,'🧸','rare',26),
('games',10,'🎪','rare',28),
('games',11,'🎰','rare',30),
('games',12,'🎱','rare',32),
('games',13,'🎳','rare',36),
('games',14,'👾','epic',50),
('games',15,'💻','epic',55),
('games',16,'🖥️','epic',58),
('games',17,'🎮','epic',62),
('games',18,'🕹️','epic',65),
('games',19,'🧙‍♂️','mythical',90),
('games',20,'🧙‍♀️','mythical',95),
('games',21,'🦸‍♂️','mythical',100),
('games',22,'🦸‍♀️','mythical',105),
('games',23,'🦹‍♂️','mythical',110),
('games',24,'🦹‍♀️','mythical',115),
('games',25,'🧝‍♂️','mythical',125),
('games',26,'🧝‍♀️','mythical',130),
('games',27,'🧛‍♂️','mythical',135),
('games',28,'🧛‍♀️','mythical',140),
('games',29,'🧜‍♂️','mythical',145),
('games',30,'🧜‍♀️','mythical',150),
('games',31,'🧞‍♂️','legendary',250),
('games',32,'🧞‍♀️','legendary',300),
('games',33,'🏆','legendary',350),
('games',34,'👑','legendary',500)
on conflict (case_id,item_index) do update set emoji=excluded.emoji,rarity=excluded.rarity,item_price=excluded.item_price;

create or replace function public.open_case_server(p_case_id text, p_cost numeric default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  uid uuid:=auth.uid(); bal numeric; inv jsonb; cost numeric; roll numeric:=random(); v_rarity text; chosen public.case_items%rowtype; item jsonb;
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

-- Canonical Upgrade RPC. The 7-argument signature is the only supported client contract.
-- Emoji Drops — authoritative Upgrade target and chance validation.
-- Target identity is resolved against the same server-owned case catalog used by case opening.
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
  if p_multiplier<=1 or p_multiplier>5 then raise exception 'INVALID_UPGRADE'; end if;
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

-- Remove superseded Upgrade overloads so the client cannot accidentally call a legacy contract.
drop function if exists public.upgrade_server(text,numeric,numeric);
drop function if exists public.upgrade_server(text,numeric,numeric,text,text,text);
revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon;
grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated;


-- Market v26: server-owned listings and atomic buy/sell/cancel.
create table if not exists public.market_listings (
  id uuid primary key default public.gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  item jsonb not null,
  listing_price numeric(12,2) not null check (listing_price > 0),
  status text not null default 'active' check (status in ('active','sold','cancelled')),
  buyer_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  sold_at timestamptz,
  cancelled_at timestamptz
);
alter table public.market_listings enable row level security;
revoke all on table public.market_listings from anon, authenticated;
drop policy if exists "market_listings_read_active" on public.market_listings;
create policy "market_listings_read_active" on public.market_listings
  for select to authenticated using (status='active');
create index if not exists case_items_lookup_idx on public.case_items(case_id,rarity,item_price,emoji);

create index if not exists market_listings_active_created_idx on public.market_listings(status,created_at desc);
create index if not exists market_listings_seller_idx on public.market_listings(seller_id,status);
create unique index if not exists market_listings_active_item_unique_idx on public.market_listings(seller_id,(item->>'id')) where status='active';
create index if not exists market_listings_buyer_idx on public.market_listings(buyer_id);

create or replace function public.create_market_listing(p_item_id text,p_price numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); inv jsonb; item jsonb; clean_price numeric; listing public.market_listings%rowtype;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  clean_price:=round(coalesce(p_price,0),2);
  if clean_price<=0 then raise exception 'INVALID_LISTING_PRICE'; end if;
  select inventory into inv from public.profiles where id=uid for update;
  if inv is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  select x into item from jsonb_array_elements(coalesce(inv,'[]'::jsonb)) x where x->>'id'=p_item_id limit 1;
  if item is null then raise exception 'ITEM_NOT_FOUND'; end if;
  if exists(select 1 from public.market_listings where seller_id=uid and status='active' and item->>'id'=p_item_id) then
    raise exception 'ITEM_ALREADY_LISTED';
  end if;
  insert into public.market_listings(seller_id,item,listing_price) values(uid,item,clean_price) returning * into listing;
  update public.profiles
    set inventory=(select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(inv) x where x->>'id'<>p_item_id),updated_at=now()
    where id=uid;
  return jsonb_build_object('id',listing.id,'item',item,'listing_price',listing.listing_price,'status',listing.status);
end; $$;
revoke execute on function public.create_market_listing(text,numeric) from public,anon;
grant execute on function public.create_market_listing(text,numeric) to authenticated;

create or replace function public.market_snapshot() returns table(
  id uuid,item_id text,seller_id uuid,nickname text,emoji text,rarity text,case_id text,item_price numeric,listing_price numeric,status text,created_at timestamptz
) language sql security definer set search_path='' as $$
  select ml.id,(ml.item->>'id'),ml.seller_id,p.nickname,(ml.item->>'emoji'),(ml.item->>'rarity'),coalesce(ml.item->>'case_id',''),coalesce((ml.item->>'price')::numeric,ml.listing_price),ml.listing_price,ml.status,ml.created_at
  from public.market_listings ml
  join public.profiles p on p.id=ml.seller_id
  where ml.status='active'
  order by ml.created_at desc
  limit 200
$$;
revoke execute on function public.market_snapshot() from public,anon;
grant execute on function public.market_snapshot() to authenticated;

create or replace function public.buy_market_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; buyer public.profiles%rowtype; seller public.profiles%rowtype; item jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into l from public.market_listings where id=p_listing_id for update;
  if l.id is null or l.status<>'active' then raise exception 'LISTING_UNAVAILABLE'; end if;
  if l.seller_id=uid then raise exception 'SELF_PURCHASE_FORBIDDEN'; end if;
  item:=l.item;
  perform 1 from public.profiles where id in (uid,l.seller_id) order by id for update;
  select * into buyer from public.profiles where id=uid;
  select * into seller from public.profiles where id=l.seller_id;
  if buyer.id is null or seller.id is null then raise exception 'PROFILE_NOT_FOUND'; end if;
  if buyer.balance<l.listing_price then raise exception 'INSUFFICIENT_FUNDS'; end if;
  update public.profiles set balance=balance-l.listing_price,inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(item),stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{spent}',to_jsonb(coalesce((stats->>'spent')::numeric,0)+l.listing_price),true),updated_at=now() where id=uid;
  update public.profiles set balance=balance+l.listing_price,stats=jsonb_set(coalesce(stats,'{}'::jsonb),'{earned}',to_jsonb(coalesce((stats->>'earned')::numeric,0)+l.listing_price),true),updated_at=now() where id=l.seller_id;
  update public.market_listings set status='sold',buyer_id=uid,sold_at=now() where id=l.id;
  return jsonb_build_object('item',item,'balance',(select balance from public.profiles where id=uid),'listing_id',l.id);
end; $$;
revoke execute on function public.buy_market_listing(uuid) from public,anon;
grant execute on function public.buy_market_listing(uuid) to authenticated;

create or replace function public.cancel_market_listing(p_listing_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into l from public.market_listings where id=p_listing_id for update;
  if l.id is null or l.status<>'active' then raise exception 'LISTING_UNAVAILABLE'; end if;
  if l.seller_id<>uid then raise exception 'NOT_LISTING_OWNER'; end if;
  update public.profiles set inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(l.item),updated_at=now() where id=uid;
  update public.market_listings set status='cancelled',cancelled_at=now() where id=l.id;
  return jsonb_build_object('item',l.item,'listing_id',l.id);
end; $$;
revoke execute on function public.cancel_market_listing(uuid) from public,anon;
grant execute on function public.cancel_market_listing(uuid) to authenticated;

-- Direct table access is intentionally denied for the economy tables; clients use the narrow RPC surface.
revoke all on table public.profiles from anon,authenticated;
grant select on table public.profiles to authenticated;
revoke all on table public.case_items from anon,authenticated;
revoke all on table public.market_listings from anon,authenticated;

-- Live Drops is read-only to clients; writes are performed by server-side RPCs.
create table if not exists public.live_drops (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  nickname text not null,
  item jsonb not null,
  case_id text not null,
  item_price numeric(12,2) not null check (item_price>=0),
  created_at timestamptz not null default now()
);
alter table public.live_drops enable row level security;
revoke all on table public.live_drops from anon,authenticated;
drop policy if exists "live_drops_read_authenticated" on public.live_drops;
create policy "live_drops_read_authenticated" on public.live_drops for select to authenticated using (true);
grant select on table public.live_drops to authenticated;
create index if not exists live_drops_created_idx on public.live_drops(created_at desc);
create index if not exists live_drops_user_idx on public.live_drops(user_id);

-- Realtime is optional in local Supabase projects; add the table only when the publication exists.
do $ begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_drops') then
    execute 'alter publication supabase_realtime add table public.live_drops';
  end if;
exception when others then null;
end $;

-- Make the intended public API explicit; new functions are not executable by arbitrary roles.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public revoke execute on functions from authenticated;
