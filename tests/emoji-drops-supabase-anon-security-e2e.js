const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('js/supabase-config.js','utf8');
const url=src.match(/url:'([^']+)'/)?.[1],key=src.match(/anonKey:'([^']+)'/)?.[1];
if(!url||!key)throw Error('Supabase public config unavailable');
async function req(path,opts={}){const h=new Headers(opts.headers||{});h.set('apikey',key);h.set('Accept','application/json');return fetch(url+'/rest/v1/'+path,{...opts,headers:h})}
async function rpc(name,body={}){return fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body)})}
(async()=>{
 const deniedTables=['profiles?select=*','market_listings?select=*','case_items?select=*'];
 for(const p of deniedTables){const r=await req(p);assert.ok([401,403,404].includes(r.status),`Direct table access unexpectedly allowed: ${p} -> ${r.status}`)}
 const deniedRpcs=[
  ['open_case_server',{p_case_id:'smile',p_cost:100}],
  ['upgrade_server',{p_item_id:'missing',p_target_price:200,p_multiplier:2,p_target_emoji:'😀',p_target_rarity:'rare',p_target_case_id:'smile',p_chance:.45}],
  ['create_market_listing',{p_item_id:'missing',p_price:100}],
  ['cancel_market_listing',{p_listing_id:'00000000-0000-0000-0000-000000000000'}],
  ['buy_market_listing',{p_listing_id:'00000000-0000-0000-0000-000000000000'}],
  ['sell_item_server',{p_item_id:'missing'}],
  ['sell_all_server',{}],
  ['claim_daily_server',{}],
  ['profile_snapshot',{}]
 ];
 for(const [name,body] of deniedRpcs){const r=await rpc(name,body);assert.ok([401,403].includes(r.status),`Unauthenticated RPC unexpectedly allowed: ${name} -> ${r.status}`)}
 const market=await rpc('market_snapshot');assert.equal(market.status,200,'market_snapshot public contract must remain readable');const rows=await market.json();assert.ok(Array.isArray(rows));for(const row of rows)for(const k of Object.keys(row))assert.ok(!['seller_id','user_id','buyer_id','transaction_id'].includes(k),`Private field leaked from market_snapshot: ${k}`);
 const live=await req('live_drops?select=id,nickname,item,case_id,item_price,created_at&limit=1');assert.equal(live.status,200,`live_drops public read failed: ${live.status}`);const liveRows=await live.json();assert.ok(Array.isArray(liveRows));for(const row of liveRows)for(const k of Object.keys(row))assert.ok(['id','nickname','item','case_id','item_price','created_at'].includes(k),`Unexpected live_drops field exposed: ${k}`);
 console.log('Supabase anonymous security matrix OK: direct economy tables denied; unauthenticated economy RPCs denied; market_snapshot public schema constrained; live_drops public schema constrained');
})().catch(e=>{console.error(e);process.exitCode=1});
