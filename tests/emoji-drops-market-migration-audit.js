'use strict';
const fs=require('fs');
const migration=fs.readFileSync('supabase/market-live-migration.sql','utf8');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

for(const marker of [
  'item jsonb',
  'add column if not exists item jsonb',
  'add column if not exists cancelled_at timestamptz',
  'MARKET_MIGRATION_INCOMPLETE',
  'market_listings_active_item_unique_idx',
  'create or replace function public.create_market_listing(p_item_id text,p_price numeric)',
  'create or replace function public.buy_market_listing(p_listing_id uuid)',
  'create or replace function public.cancel_market_listing(p_listing_id uuid)',
  'Remove every legacy overload of the Market RPCs',
  "p.proname in ('create_market_listing','buy_market_listing','cancel_market_listing')",
  "revoke execute on function public.buy_market_listing(uuid) from public,anon",
  "grant execute on function public.buy_market_listing(uuid) to authenticated",
  "grant select (nickname,item,case_id,item_price,created_at) on public.live_drops to authenticated,anon",
  'canonical Case/Upgrade RPCs remain owned'
]) if(!migration.includes(marker)) throw Error('Canonical production migration contract missing: '+marker);

if(/create or replace function public\.create_market_listing\(p_item_id text, p_price numeric\).*?seller_id,?item_id/is.test(migration))
  throw Error('Production migration still contains the legacy item_id listing RPC');
if(/market_snapshot\(\).*?seller_id uuid/is.test(migration))
  throw Error('Production migration must not expose seller_id in market_snapshot');
if(!/security definer set search_path=''/i.test(migration))
  throw Error('Production market RPCs must use SECURITY DEFINER with empty search_path');
if(/(?:^|\n)do \$(?:\n|$)|(?:\n)end \$;/m.test(migration))
  throw Error('Production market migration contains malformed bare dollar-quote delimiters');

const schemaSig=schema.match(/market_snapshot\(\)\s*returns table\(([\s\S]*?)\)\s+language/i)?.[1]||'';
if(!/\bis_owner\s+boolean\b/i.test(schemaSig)) throw Error('Canonical schema market_snapshot privacy contract missing');

console.log('Market production migration audit OK: legacy listing shape is upgraded to canonical item JSON, cancel timestamp is present, RPC identities/grants are canonical, and private seller IDs stay out of snapshots.');
