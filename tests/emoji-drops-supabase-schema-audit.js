const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
const browser=fs.readFileSync('js/supabase-config.js','utf8');

const required=[
  'alter table public.profiles enable row level security',
  'alter table public.case_items enable row level security',
  'alter table public.market_listings enable row level security',
  'alter table public.live_drops enable row level security',
  'grant execute on function public.open_case_server(text,numeric) to authenticated',
  'grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated',
  'grant execute on function public.create_market_listing(text,numeric) to authenticated',
  'grant execute on function public.market_snapshot() to authenticated',
  'grant execute on function public.buy_market_listing(uuid) to authenticated',
  'grant execute on function public.cancel_market_listing(uuid) to authenticated',
  'revoke execute on function public.open_case_server(text,numeric) from public,anon',
  'revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon',
  'revoke execute on function public.create_market_listing(text,numeric) from public,anon',
  'revoke execute on function public.buy_market_listing(uuid) from public,anon',
  'revoke execute on function public.cancel_market_listing(uuid) from public,anon',
  'revoke all on table public.market_listings from anon,authenticated',
  'revoke all on table public.profiles from anon,authenticated',
  'case_items_lookup_idx',
  'INVALID_TARGET',
  'SELF_PURCHASE_FORBIDDEN',
  'for update',
  'AUTH_REQUIRED',
  'INSUFFICIENT_FUNDS',
  'ITEM_NOT_FOUND',
  'INVALID_ITEM_PRICE',
  'TARGET_NOT_IN_CATALOG',
  'INVALID_UPGRADE',
  'INVALID_CHANCE',
  'ITEM_ALREADY_LISTED',
  'INVALID_LISTING_PRICE',
  'LISTING_UNAVAILABLE',
  'NOT_LISTING_OWNER'
];
for(const x of required)if(!schema.toLowerCase().includes(x.toLowerCase()))throw new Error('Supabase schema contract missing: '+x);
if(/revoke all on table public\.profiles from anon,authenticated;\s*grant select on table public\.profiles to authenticated;/i.test(schema))throw new Error('Profiles table is directly exposed to authenticated clients; use profile_snapshot RPC only');
for(const x of ['revoke select,insert,update,delete on tables from anon,authenticated','revoke usage,select on sequences from anon,authenticated'])if(!schema.toLowerCase().includes(x))throw new Error('Future public grant hardening missing: '+x);

const opens=(schema.match(/create or replace function public\.open_case_server/g)||[]).length;
const upgrades=(schema.match(/create or replace function public\.upgrade_server/g)||[]).length;
if(opens!==1)throw new Error('Expected exactly one authoritative open_case_server, found '+opens);
if(upgrades!==1)throw new Error('Expected exactly one authoritative upgrade_server, found '+upgrades);

for(const block of schema.split(/(?=create or replace function public\.)/i)){
  if(/security definer/i.test(block)&&!/security definer\s+set search_path=''/i.test(block)){
    const name=block.match(/create or replace function public\.([a-z0-9_]+)/i)?.[1]||'unknown';
    throw new Error('SECURITY DEFINER without empty search_path: '+name);
  }
}
if(/(?:service_role|service-role|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]/i.test(browser)||/['\"]sk-[A-Za-z0-9_-]{20,}['\"]/i.test(browser))throw new Error('Secret/service key exposed to browser');
console.log('Supabase schema audit OK: single authoritative case/upgrade RPCs, catalog validation, RLS, explicit grants/revokes, SECURITY DEFINER search_path, row locks, market ownership guards and browser-key boundary');
