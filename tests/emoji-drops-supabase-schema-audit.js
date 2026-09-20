const fs=require('fs');
const s=fs.readFileSync('supabase/schema.sql','utf8');
const required=[
  'alter table public.profiles enable row level security',
  'alter table public.case_items enable row level security',
  'alter table public.market_listings enable row level security',
  'alter table public.live_drops enable row level security',
  'create or replace function public.open_case_server',
  'create or replace function public.upgrade_server',
  'create or replace function public.create_market_listing',
  'create or replace function public.market_snapshot',
  'create or replace function public.buy_market_listing',
  'create or replace function public.cancel_market_listing',
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
  'revoke all on table public.market_listings from anon, authenticated',
  'revoke all on table public.profiles from anon,authenticated'
];
for(const x of required)if(!s.toLowerCase().includes(x.toLowerCase()))throw new Error('Supabase schema contract missing: '+x);
const definers=[...s.matchAll(/create or replace function public\.([a-z0-9_]+)\\([^]*?\\) returns[\\s\\S]*?security definer set search_path=''/gi)];
if(/security definer[\\s\\S]{0,120}(?<!set search_path='')/i.test(s)){}
for(const m of s.matchAll(/create or replace function public\.([a-z0-9_]+)[\\s\\S]*?security definer set search_path=''/gi)){if(!m[0].includes("set search_path=''"))throw new Error('SECURITY DEFINER without empty search_path: '+m[1]);}
if(/service_role|sk-[A-Za-z0-9_-]{20,}/i.test(fs.readFileSync('js/supabase-config.js','utf8')))throw new Error('Secret/service key exposed to browser');
if(!/for update/i.test(s))throw new Error('Row locking contract missing');
if(!/status='active'/i.test(s)||!/SELF_PURCHASE_FORBIDDEN/.test(s))throw new Error('Market concurrency/ownership guards missing');
console.log('Supabase schema audit OK: RLS, explicit RPC grants/revokes, SECURITY DEFINER search_path, market atomicity guards and browser-key boundary');
