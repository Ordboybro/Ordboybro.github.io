const fs=require('fs');const app=fs.readFileSync('js/app-v2.js','utf8');const index=fs.readFileSync('index.html','utf8');const files=fs.readdirSync('js');
if(!/const version=327;/.test(app)||!index.includes('js/app-v2.js?v=runtime-327'))throw Error('Runtime owner/cache version drift');
const requiredOwners=[['cases','js/emoji-drops-case-showcase-exact.js'],['upgrade','js/emoji-drops-upgrade-final.js'],['market','js/emoji-drops-market-v26.js'],['live','js/emoji-drops-live-final.js'],['transaction','js/emoji-drops-transaction-layer.js']];
for(const [name,file] of requiredOwners){if(!files.includes(file))throw Error(`Missing canonical ${name} owner: ${file}`);if(!app.includes(file))throw Error(`Canonical ${name} owner not loaded by runtime manifest`)}
const forbidden=['emoji-drops-final-ux-v4.js','emoji-drops-upgrade-interaction-guard.js','emoji-drops-case-showcase.js','emoji-drops-case-showcase-final.js','emoji-drops-case-showcase-override.js','emoji-drops-case-authority.js','emoji-drops-ui-polish-v2.js','emoji-drops-main-reference-v2.js','emoji-drops-layout-v3.js','emoji-drops-reference-v5.js','emoji-drops-reference-interaction-fix.js','emoji-drops-reference-v8-luxe.js','emoji-drops-reference-v9-hitfix.js','emoji-drops-reference-v10-stability.js','emoji-drops-reference-v11-modal-reset.js','emoji-drops-reference-v13-fixed-action.js','emoji-drops-reference-v15-case-precedence.js','emoji-drops-reference-v18-modal-cleanup.js','emoji-drops-reference-v20-studio.js'];
for(const f of forbidden)if(app.includes(f))throw Error('Legacy/conflicting runtime layer still loaded: '+f);
if((app.match(/emoji-drops-case-showcase-exact\.js/g)||[]).length!==1)throw Error('Exact case owner loaded more than once');
if(!/emoji-drops-transaction-layer\.js/.test(app)||!/window\.__emojiDropsTransactions/.test(fs.readFileSync('js/emoji-drops-transaction-layer.js','utf8')))throw Error('Transaction boundary missing');
if(!/open_case_server|upgrade_server|market_snapshot|buy_market_listing|cancel_market_listing/.test(fs.readFileSync('supabase/schema.sql','utf8')))throw Error('Server authority contract incomplete');
const ownership=app.match(/Ownership contract[\s\S]*?\*\//)?.[0]||'';
const market=fs.readFileSync('js/emoji-drops-market-v26.js','utf8'),live=fs.readFileSync('js/emoji-drops-live-final.js','utf8');
const hard=fs.readFileSync('js/emoji-drops-final-hardening.js','utf8');
if(hard.includes('#edExact'))throw Error('Generic hardening still owns the exact case modal');
if(!/version:31/.test(market)||!market.includes('destroy'))throw Error('Market lifecycle owner contract missing');
if(!/version:18/.test(live)||!live.includes('destroyed')||!live.includes('generation'))throw Error('Live Drops lifecycle generation contract missing');
if(!fs.readFileSync('supabase/schema.sql','utf8').includes('create or replace function public.claim_daily_server()'))throw Error('Daily server authority missing');
for(const marker of ['navigation-final','case-showcase-exact','transaction-layer','upgrade-final','market-v26','live-final'])if(!ownership.includes(marker))throw Error('Ownership matrix missing: '+marker);
if((app.match(/emoji-drops-live-final\\.js/g)||[]).length!==1)throw Error('Live Drops owner loaded more than once');

const scripts=[...index.matchAll(/<script[^>]+src=['"]([^'"]+)/gi)].map(x=>x[1].split('?')[0]);for(const x of scripts)if(!x.startsWith('http')&&!fs.existsSync(x.replace(/^\//,'')))throw Error('Missing script asset: '+x);
console.log('Architecture audit OK: canonical owners, runtime manifest, legacy layer exclusion, transaction boundary, server RPC surface and script assets.');