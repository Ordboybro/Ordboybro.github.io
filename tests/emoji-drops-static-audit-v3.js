const fs=require('fs');
const path=require('path');
const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const loader=read('js/app-v2.js');
const data=read('js/data.js');
const schema=read('supabase/schema.sql');

const scripts=[...html.matchAll(/<script[^>]+src=['"]([^'"]+)/gi)].map(m=>m[1].split('?')[0]);
if(scripts.length!==2||scripts[0]!=='js/data.js'||scripts[1]!=='js/app-v2.js')throw Error('Root shell must load only data.js then app-v2.js');
if(!html.includes('js/app-v2.js?v=runtime-336'))throw Error('Root runtime cache contract must be runtime-336');
for(const marker of ['window.cases=cases','window.casePrices=casePrices','window.rarities=rarities'])if(!data.includes(marker))throw Error('data.js canonical export missing: '+marker);

const filesMatch=loader.match(/const files=\[(.*?)\];/s);
if(!filesMatch)throw Error('Runtime files manifest missing');
const runtime=[...filesMatch[1].matchAll(/['"]([^'"]+\.js)(?:\?[^'"]*)?['"]/g)].map(m=>path.basename(m[1]));
const expected=[
 'supabase-config.js','supabase-auth.js','emoji-drops-schema-migration.js','emoji-drops-hardening.js',
 'emoji-drops-core.js','emoji-drops-transaction-layer.js','emoji-drops-runtime-guards.js','emoji-drops-final-hardening.js',
 'emoji-drops-release-polish.js','emoji-drops-product-layer.js','emoji-drops-navigation-final.js','emoji-drops-quality-final.js',
 'emoji-drops-p4-final.js','emoji-drops-case-showcase-exact.js','emoji-drops-reference-v23-studio.js','emoji-drops-market-v26.js',
 'emoji-drops-final-product-polish.js','emoji-drops-upgrade-final.js','emoji-drops-final-ux.js','emoji-drops-live-final.js','emoji-drops-p5-final-audit.js'
];
if(JSON.stringify(runtime)!==JSON.stringify(expected))throw Error('Canonical runtime manifest/order drift: '+JSON.stringify(runtime));
for(const file of runtime)if(!fs.existsSync(path.join('js',file)))throw Error('Missing runtime module: '+file);
for(const marker of [
 'const version=336;','supabase-auth-8','core-25','case-showcase-exact-40','market-v26-21','live-final-20',
 'upgrade-final-29','final-ux-15','p5-final-audit-2','emoji-drops-navigation-final.js?v=navigation-final-11'
])if(!loader.includes(marker))throw Error('Runtime/cache marker missing: '+marker);

const retired=[
 'emoji-drops-data-export.js','emoji-drops-data-bridge.js','emoji-drops-product-plus.js','emoji-drops-action-resilience.js','emoji-drops-p3-polish.js',
 'emoji-drops-v23-stability.js','emoji-drops-exact-landscape-polish.js','emoji-drops-case-authority-v2.js','emoji-drops-case-open-bridge.js',
 'emoji-drops-case-authority-finalizer.js','emoji-drops-market-authority-final.js','emoji-drops-smooth-ui.js','emoji-drops-modal-finalizer.js',
 'emoji-drops-cta-lock.js'
];
for(const name of retired){
 if(fs.existsSync(path.join('js',name)))throw Error('Retired module still present: '+name);
 if(loader.includes(name))throw Error('Retired module still loaded: '+name);
}

const nav=read('js/emoji-drops-navigation-final.js');
for(const marker of ['version:11','emoji-drops-view-committed','pointerdown','TOUCH_CLICK_GUARD_MS','stopImmediatePropagation'])if(!nav.includes(marker))throw Error('Navigation ownership contract missing: '+marker);
if(/pointerup[^\n]*commit\(/.test(nav))throw Error('Navigation must not commit views from pointerup');

const exact=read('js/emoji-drops-case-showcase-exact.js');
for(const marker of ['version:15','case_fairness_commit','verifyFairnessReceipt','FAIRNESS_OUTCOME_MISMATCH','item_index','orientation:landscape','#edExactBox .edx-open','data-result-locked'])if(!exact.includes(marker))throw Error('Exact case contract missing: '+marker);
if(/window\.addEventListener\(['"]click['"]/.test(exact))throw Error('Exact case must not own a global click navigation layer');

const live=read('js/emoji-drops-live-final.js');
for(const marker of ['version:20','postgres_changes','SUBSCRIBED','CHANNEL_ERROR','FALLBACK','destroyed','generation','nickname,item,case_id,item_price,created_at'])if(!live.includes(marker))throw Error('Live Drops lifecycle contract missing: '+marker);
if(/setInterval\(\(\)=>.*scrollBy/.test(live)||/rotateTimer/.test(live))throw Error('Live Drops must not auto-rotate attention');

const market=read('js/emoji-drops-market-v26.js');
if(!market.includes('version:32')||!market.includes('is_owner')||!market.includes('destroy'))throw Error('Market owner lifecycle/privacy contract missing');

const core=read('js/emoji-drops-core.js');
if(!core.includes("rpc('profile_snapshot',{})")||!core.includes("window.__emojiDropsCore={version:APP"))throw Error('Core server-authoritative profile contract missing');
if(/localStorage\.setItem\([^\n]+users/.test(core))throw Error('Authenticated legacy users mirror still present');

const supa=read('js/supabase-config.js');
const auth=read('js/supabase-auth.js');
if(!supa.includes('publishableKey')||/anonKey/.test(supa)||!auth.includes('publishableKey')||/anonKey/.test(auth))throw Error('Supabase publishable-key naming drift');

if(!schema.includes('case_fairness_rounds')||!schema.includes('case_fairness_commit')||!schema.includes('secure_uniform_roll')||/'round_id',round\.id/.test(schema))throw Error('Server fairness/security contract missing');
const marketSig=schema.match(/market_snapshot\(\)\s*returns table\(([\s\S]*?)\)\s+language/i)?.[1]||'';
if(/seller_id\s+uuid/i.test(marketSig)||!/is_owner\s+boolean/i.test(marketSig))throw Error('Market privacy contract drift');
for(const mig of ['supabase/migrations/20260922150000_market_snapshot_privacy.sql','supabase/migrations/20260923170000_canonical_market_rpc_identity.sql','supabase/migrations/20260923190000_final_rpc_identity_hardening.sql','supabase/migrations/20260924110000_case_fairness_commitment.sql'])if(!fs.existsSync(mig))throw Error('Required production migration missing: '+mig);

for(const n of [1,2,3])if(!fs.existsSync(`assets/emoji-drops/sprite-${n}.b64`))throw Error('Missing sprite chunk '+n);
for(const n of ['smile','nature','food'])if(!fs.existsSync(`assets/emoji-drops/live-${n}.b64`))throw Error('Missing Live Drops art '+n);
if(!fs.existsSync('assets/emoji-drops/smile.b64'))throw Error('Missing exact Smile art');

console.log('Static audit v3 OK: single root shell, canonical 336 runtime, retired-layer cleanup, navigation/case/live/market ownership, publishable-key naming, fairness production migrations and required visual assets.');
