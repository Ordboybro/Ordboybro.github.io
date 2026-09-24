'use strict';
const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

const requiredIndexes=[
  'case_fairness_active_user_idx',
  'case_fairness_user_created_idx',
  'case_items_lookup_idx',
  'market_listings_active_created_idx',
  'market_listings_seller_idx',
  'market_listings_active_item_unique_idx',
  'live_drops_created_idx'
];
for(const idx of requiredIndexes){
  if(!new RegExp('create\\s+(?:unique\\s+)?index\\s+if\\s+not\\s+exists\\s+'+idx,'i').test(schema)){
    throw new Error('Expected release index missing: '+idx);
  }
}
if(!/create index if not exists market_listings_active_created_idx on public\.market_listings\(status,created_at desc\)/i.test(schema))throw new Error('Market listing read-path index drifted');
if(!/create index if not exists case_items_lookup_idx on public\.case_items\(case_id,rarity,item_price,emoji\)/i.test(schema))throw new Error('Case catalog lookup index drifted');
if(!/create index if not exists live_drops_created_idx on public\.live_drops\(created_at desc\)/i.test(schema))throw new Error('Live Drops time-order index drifted');
if(!/perform 1 from public\.profiles where id=uid for update;[\\s\\S]*select \* into l from public\.market_listings[\\s\\S]*for update/i.test(schema))throw new Error('Market lock order drifted: profile must lock before listing');
if(!/perform 1 from public\.profiles where id=uid for update;[\\s\\S]*select \* into fair_round from public\.case_fairness_rounds[\\s\\S]*for update/i.test(schema))throw new Error('Fairness lock order drifted: profile must lock before fairness round');

const dbUrl=process.env.EMOJI_DROPS_DB_URL||process.env.SUPABASE_DB_URL;
if(!dbUrl){
  console.log('DB performance contract OK (static): release indexes and lock order verified. Runtime EXPLAIN ANALYZE is opt-in via EMOJI_DROPS_DB_URL/SUPABASE_DB_URL.');
  process.exit(0);
}
const {spawnSync}=require('child_process');
const queries=[
  'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.market_listings WHERE status=\'active\' ORDER BY created_at DESC LIMIT 50;',
  'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.live_drops ORDER BY created_at DESC LIMIT 50;',
  'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.case_items WHERE case_id=\'smile\' ORDER BY rarity,item_price,emoji LIMIT 100;'
];
for(const q of queries){
  const out=spawnSync('psql',[dbUrl,'-v','ON_ERROR_STOP=1','-tAc',q],{encoding:'utf8',timeout:30000});
  if(out.error)throw out.error;
  if(out.status!==0)throw new Error('Runtime EXPLAIN failed: '+String(out.stderr||'').trim());
  const text=String(out.stdout||'').trim();
  if(!text.startsWith('['))throw new Error('Runtime EXPLAIN did not return JSON');
  console.log('EXPLAIN OK:',text.slice(0,600));
}
console.log('DB performance contract OK: runtime EXPLAIN ANALYZE completed for Market, Live Drops and case catalog.');
