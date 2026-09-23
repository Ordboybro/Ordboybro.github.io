const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
const browser=fs.readFileSync('js/supabase-config.js','utf8');
const tx=fs.readFileSync('js/emoji-drops-transaction-layer.js','utf8');

if(/\.from\(['"]profiles['"]\)/i.test(tx))throw new Error('Transaction recovery must not read profiles directly; use profile_snapshot RPC');

const dollarMatches=[...schema.matchAll(/\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/g)].map(m=>m[0]);
for(const tag of [...new Set(dollarMatches)]){
  const count=dollarMatches.filter(x=>x===tag).length;
  if(count%2!==0)throw new Error('Unbalanced dollar quote: '+tag+' count='+count);
}
if(/\bas\s+\$\s*\n/i.test(schema)||/\n\$;/i.test(schema))throw new Error('Malformed bare dollar-quote delimiter detected');
if(!/revoke execute on function public\.case_cost\(text\) from public,anon/i.test(schema))throw new Error('case_cost must not be executable by public/anon');

const required=[
  'alter table public.profiles enable row level security',
  'alter table public.case_items enable row level security',
  'alter table public.market_listings enable row level security',
  'alter table public.live_drops enable row level security',
  'grant execute on function public.open_case_server(text,numeric) to authenticated',
  'grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated',
  'grant execute on function public.create_market_listing(text,numeric) to authenticated',
  'grant execute on function public.market_snapshot() to authenticated',
  'grant execute on function public.market_snapshot() to anon',
  'grant execute on function public.buy_market_listing(uuid) to authenticated',
  'grant execute on function public.cancel_market_listing(uuid) to authenticated',
  'revoke execute on function public.open_case_server(text,numeric) from public,anon',
  'revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon',
  'revoke execute on function public.create_market_listing(text,numeric) from public,anon',
  'revoke execute on function public.buy_market_listing(uuid) from public,anon',
  'revoke execute on function public.cancel_market_listing(uuid) from public,anon',
  'revoke execute on function public.claim_daily_server() from public,anon',
  'revoke all on table public.market_listings from anon,authenticated',
  'revoke all on table public.profiles from anon,authenticated',
  'revoke select,insert,update,delete on tables from anon,authenticated',
  'revoke usage,select on sequences from anon,authenticated',
  'case_items_lookup_idx',
  'INVALID_TARGET',
  'SELF_PURCHASE_FORBIDDEN',
  'AUTH_REQUIRED',
  'INSUFFICIENT_FUNDS',
  'ITEM_NOT_FOUND',
  'INVALID_ITEM_PRICE',
  'TARGET_NOT_IN_CATALOG',
  'INVALID_UPGRADE',
  'INVALID_CHANCE',
  'ITEM_ALREADY_LISTED',
  'INVALID_LISTING_PRICE',
  'claim_daily_server',
  'LISTING_UNAVAILABLE',
  'NOT_LISTING_OWNER',
  'for update'
];
for(const x of required)if(!schema.toLowerCase().includes(x.toLowerCase()))throw new Error('Supabase schema contract missing: '+x);

if(/revoke all on table public\.profiles from anon,authenticated;\s*grant select on table public\.profiles to authenticated;/i.test(schema))throw new Error('Profiles table is directly exposed to authenticated clients; use profile_snapshot RPC only');

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

if(/(?:service_role|service-role|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]/i.test(browser)||/['"]sk-[A-Za-z0-9_-]{20,}['"]/i.test(browser)){
  throw new Error('Secret/service key exposed to browser');
}
if(!/grant select \(nickname,item,case_id,item_price,created_at\) on public\.live_drops to authenticated,anon/i.test(schema))throw new Error('Live Drops public column grant is missing or exposes private fields');

console.log('Supabase schema audit OK');

const marketSig=schema.match(/market_snapshot\(\)\s*returns table\(([\s\S]*?)\)\s+language/i)?.[1]||'';
if(!/\bis_owner\s+boolean\b/i.test(marketSig))throw new Error('market_snapshot must expose is_owner instead of seller_id');
if(/\bseller_id\s+uuid\b/i.test(marketSig))throw new Error('market_snapshot must not expose seller_id');
if(!fs.existsSync('supabase/migrations/20260922150000_market_snapshot_privacy.sql'))throw new Error('market snapshot privacy migration missing');
