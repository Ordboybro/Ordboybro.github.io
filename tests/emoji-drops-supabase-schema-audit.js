const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
const browser=fs.readFileSync('js/supabase-config.js','utf8');
const tx=fs.readFileSync('js/emoji-drops-transaction-layer.js','utf8');
const fairnessMigration='supabase/migrations/20260924110000_case_fairness_commitment.sql';

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
  'grant execute on function public.open_case_server(text,numeric,uuid) to authenticated',
  'grant execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) to authenticated',
  'grant execute on function public.create_market_listing(text,numeric) to authenticated',
  'grant execute on function public.market_snapshot() to authenticated',
  'grant execute on function public.market_snapshot() to anon',
  'grant execute on function public.buy_market_listing(uuid) to authenticated',
  'grant execute on function public.cancel_market_listing(uuid) to authenticated',
  'revoke execute on function public.open_case_server(text,numeric,uuid) from public,anon',
  'revoke execute on function public.upgrade_server(text,numeric,numeric,text,text,text,numeric) from public,anon',
  'revoke execute on function public.create_market_listing(text,numeric) from public,anon',
  'revoke execute on function public.buy_market_listing(uuid) from public,anon',
  'revoke execute on function public.cancel_market_listing(uuid) from public,anon',
  'revoke execute on function public.claim_daily_server() from public,anon',
  'create table if not exists public.case_fairness_rounds',
  'alter table public.case_fairness_rounds enable row level security',
  'revoke all on table public.case_fairness_rounds from public,anon,authenticated',
  'case_fairness_active_user_idx',
  'create or replace function public.fair_uniform(p_seed text,p_nonce text,p_case_id text,p_label text)',
  'revoke execute on function public.fair_uniform(text,text,text,text) from public,anon,authenticated',
  'create or replace function public.case_fairness_commit(p_case_id text,p_client_nonce text)',
  'grant execute on function public.case_fairness_commit(text,text) to authenticated',
  'drop function if exists public.open_case_server(text,numeric)',
  "p_round_id uuid",
  "FAIRNESS_COMMIT_REQUIRED",
  "FAIRNESS_COMMIT_INVALID",
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
if(/insert into public\.live_drops[\s\S]{0,500}values \(\$1,\$2,\$3,\$4,\$5,now\(\)\)' using uid,[\s\S]*?,item,chosen\.case_id/i.test(schema))throw new Error('Live Drops must not persist the full private inventory item JSON');
if(!/jsonb_build_object\('emoji',item->>'emoji','rarity',item->>'rarity','price',item->>'price'\)/i.test(schema))throw new Error('Live Drops public item payload sanitization missing');
if(!fs.existsSync(fairnessMigration))throw new Error('Committed fairness production migration missing');
if(!/perform 1 from public\.profiles where id=uid for update;[\s\S]*delete from public\.case_fairness_rounds where user_id=uid and consumed_at is null;/i.test(schema))throw new Error('Fairness commit must lock the profile before replacing the active fairness round');
if(!/perform 1 from public\.profiles where id=uid for update;[\s\S]*select \* into fair_round from public\.case_fairness_rounds[\s\S]*for update;/i.test(schema))throw new Error('Case open must use the same profile-first lock order as fairness commit');
const fairnessMigrationSql=fs.readFileSync(fairnessMigration,'utf8');
for(const marker of ['create table if not exists public.case_fairness_rounds','create or replace function public.case_fairness_commit','create or replace function public.open_case_server(p_case_id text,p_cost numeric,p_round_id uuid)','drop function if exists public.open_case_server(text,numeric)','create or replace function public.upgrade_server','secure_uniform_roll','notify pgrst, \'reload schema\''])if(!fairnessMigrationSql.includes(marker))throw new Error('Committed fairness migration marker missing: '+marker);

const marketSig=schema.match(/market_snapshot\(\)\s*returns table\(([\s\S]*?)\)\s+language/i)?.[1]||'';
if(!/\bis_owner\s+boolean\b/i.test(marketSig))throw new Error('market_snapshot must expose is_owner instead of seller_id');
if(/\bseller_id\s+uuid\b/i.test(marketSig))throw new Error('market_snapshot must not expose seller_id');

const privacyMigration='supabase/migrations/20260922150000_market_snapshot_privacy.sql';
if(!fs.existsSync(privacyMigration))throw new Error('market snapshot privacy migration missing');

const marketRpcMigration='supabase/migrations/20260923170000_canonical_market_rpc_identity.sql';
const finalRpcMigration='supabase/migrations/20260923190000_final_rpc_identity_hardening.sql';
if(!fs.existsSync(marketRpcMigration))throw new Error('canonical market RPC identity migration missing');
const marketRpc=fs.readFileSync(marketRpcMigration,'utf8');
for(const marker of [
  "p.proname in ('buy_market_listing','cancel_market_listing')",
  "pg_get_function_identity_arguments(p.oid)",
  "pg_get_function_identity_arguments(p.oid) <> 'uuid'",
  "notify pgrst, 'reload schema'",
  'grant execute on function public.buy_market_listing(uuid) to authenticated',
  'grant execute on function public.cancel_market_listing(uuid) to authenticated'
]){
  if(!marketRpc.includes(marker))throw new Error('Canonical market RPC migration contract missing: '+marker);
}
if(!/pg_get_function_identity_arguments\(p\.oid\) <> 'uuid'/i.test(marketRpc))throw new Error('Canonical market RPC migration must preserve exactly the uuid identity and remove all other overloads');
if(!fs.existsSync(finalRpcMigration))throw new Error('Final RPC identity hardening migration missing');
const finalRpc=fs.readFileSync(finalRpcMigration,'utf8');
for(const marker of ["p.proname='open_case_server'","p.proname='upgrade_server'","p.proname='create_market_listing'","p.proname='buy_market_listing'","p.proname='cancel_market_listing'","pg_get_function_identity_arguments(p.oid)","execute format(","drop function if exists","notify pgrst, 'reload schema'"]){if(!finalRpc.includes(marker))throw new Error('Final RPC identity hardening marker missing: '+marker)}
if(!/for\s+r\s+in\s+select[\s\S]*p\.proname in \('buy_market_listing','cancel_market_listing'\)[\s\S]*execute format\([\s\S]*drop function/i.test(marketRpc))throw new Error('Canonical market RPC migration must dynamically remove unknown legacy overloads');

if(/revoke execute on function public\.open_case_server\(text,numeric\)/i.test(schema)||/grant execute on function public\.open_case_server\(text,numeric\)/i.test(schema))throw new Error('Legacy two-argument open_case_server grant remains in canonical schema');
if(/'round_id',round\.id/i.test(schema))throw new Error('Fairness receipt still references stale round variable');
if(/revoke execute on function public\.upgrade_server\(text,numeric,numeric\) from/i.test(schema))throw new Error('Legacy three-argument upgrade revoke must be dropped before revoke/grant operations');
console.log('Supabase schema audit OK');
