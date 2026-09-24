-- Emoji Drops: public Live Drops Broadcast transport.
-- Avoids exposing live_drops primary-key/user identity through Postgres Changes.
do $$
begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime')
     and exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_drops') then
    execute 'alter publication supabase_realtime drop table public.live_drops';
  end if;
exception when others then null;
end $$;

create or replace function public.live_drops_broadcast_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'nickname',new.nickname,
      'item',jsonb_build_object(
        'emoji',new.item->>'emoji',
        'rarity',new.item->>'rarity',
        'price',new.item->>'price'
      ),
      'case_id',new.case_id,
      'item_price',new.item_price,
      'created_at',new.created_at
    ),
    'live_drop',
    'emoji-drops-live-final',
    false
  );
  return new;
end;
$$;

revoke execute on function public.live_drops_broadcast_insert() from public,anon,authenticated;
drop trigger if exists live_drops_broadcast_insert on public.live_drops;
create trigger live_drops_broadcast_insert
after insert on public.live_drops
for each row execute function public.live_drops_broadcast_insert();

notify pgrst, 'reload schema';
