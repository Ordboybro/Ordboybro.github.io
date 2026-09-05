(()=>{'use strict';
/* Emoji Drops — non-invasive runtime QA. Read-only checks; never changes user data or UI. */
function run(){const checks=[];const pass=(name,ok,detail='')=>checks.push({name,ok:!!ok,detail});
const catalog=typeof cases!=='undefined'?cases:{};const prices=typeof casePrices!=='undefined'?casePrices:{};
const keys=Object.keys(catalog);pass('catalog loaded',keys.length>0,`${keys.length} cases`);
let items=0,badItems=0;keys.forEach(k=>(catalog[k]||[]).forEach(x=>{items++;if(!x||!x.emoji||!x.rarity||!(Number(x.value)||Number(x.price)>0))badItems++}));pass('catalog items valid',badItems===0,`${items} items, ${badItems} invalid`);
const priceBad=keys.filter(k=>!(Number(prices[k])>0));pass('case prices valid',priceBad.length===0,priceBad.join(', '));
const rarity={common:55,rare:27,epic:12,mythical:5,legendary:1};pass('rarity weights sum to 100',Object.values(rarity).reduce((a,b)=>a+b,0)===100);
['edAuthModal','edOpenModal','edWinModal','edProfileModal','edStatsModal','edSettingsModal','edUpgradeModal'].forEach(id=>pass(`modal #${id}`,!!document.getElementById(id)));
['1.5','2','3','5'].forEach(m=>pass(`upgrade multiplier ×${m}`,!!document.querySelector(`#edUpgradeModal [data-ed-mult="${m}"]`)));
pass('upgrade wheel',!!document.querySelector('#edUpgradeModal .ed-final-wheel-circle'));
pass('upgrade source selector',!!document.getElementById('edUpgradeInventory'));
pass('upgrade target selector',!!document.getElementById('edTargets'));
pass('upgrade chance display',!!document.getElementById('edChance'));
pass('case reel',!!document.getElementById('edReels'));
pass('case open control',!!document.getElementById('edOpen'));
let storage=true;try{const k='__ed_qa__';localStorage.setItem(k,'1');storage=localStorage.getItem(k)==='1';localStorage.removeItem(k)}catch{storage=false}pass('localStorage writable',storage);
const scripts=[...document.scripts].map(s=>s.src).filter(Boolean);const required=['functional-final.js','runtime-hardening.js','case-upgrade-polish.js'];required.forEach(x=>pass(`runtime script ${x}`,scripts.some(s=>s.includes(x))));
const duplicateIds=[...document.querySelectorAll('[id]')].map(x=>x.id).filter((id,i,a)=>id&&a.indexOf(id)!==i);pass('no duplicate DOM ids',duplicateIds.length===0,[...new Set(duplicateIds)].join(', '));
const failed=checks.filter(x=>!x.ok);window.__emojiDropsQA={ok:failed.length===0,checks,failedCount:failed.length,ranAt:new Date().toISOString()};console.groupCollapsed(`Emoji Drops QA: ${failed.length?'FAIL':'PASS'} (${checks.length} checks)`);checks.forEach(x=>console[x.ok?'log':'error'](`${x.ok?'✓':'✗'} ${x.name}`,x.detail));console.groupEnd();return window.__emojiDropsQA}
function boot(){setTimeout(run,0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
