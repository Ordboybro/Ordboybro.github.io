-- Emoji Drops — Realtime publication hardening.
-- Live Drops is the only public Realtime surface. Private economy tables must not be published.
do $$
begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime') then
    if exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='profiles') then
      alter publication supabase_realtime drop table public.profiles;
    end if;
    if exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='case_items') then
      alter publication supabase_realtime drop table public.case_items;
    end if;
    if exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='market_listings') then
      alter publication supabase_realtime drop table public.market_listings;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_drops') then
      alter publication supabase_realtime add table public.live_drops;
    end if;
  end if;
end $$;
