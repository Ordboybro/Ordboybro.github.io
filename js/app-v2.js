(()=>{'use strict';
/* Emoji Drops — resilient staged runtime. Critical UI boots first; QA/polish never blocks the page. */
const perf=(()=>{const mq=q=>{try{return matchMedia(q).matches}catch{return false}};const cores=Number(navigator.hardwareConcurrency)||4;const mem=Number(navigator.deviceMemory)||4;const slow=mq('(update: slow)')||cores<=2||mem<=2||navigator.connection?.saveData===true;const reduced=matchMedia('(prefers-reduced-motion: reduce)');const profile={version:15,lowEnd:slow,reduced,cores,memory:mem,reelItems:slow?24:56,reelTarget:slow?18:46,reelDuration:reduced?0:(slow?4500:5000),upgradeDuration:reduced?0:(slow?4000:4500),liveLimit:slow?6:10};window.__emojiDropsPerf=profile;return profile})();
function fallbackCatalog(){try{const root=document.getElementById('cases');if(!root||root.children.length)return;const data=window.cases||{};const prices=window.casePrices||{};const icons={smile:'😀',moves:'🕺',nature:'🌿',food:'🍔',animals:'🐶',transport:'🚗',sport:'⚽',games:'🎮'};const keys=Object.keys(data).length?Object.keys(data):Object.keys(icons);const frag=document.createDocumentFragment();keys.forEach(k=>{const b=document.createElement('button');b.type='button';b.className='case-card';b.dataset.edCase=k;b.innerHTML=`<div class="case-art">${icons[k]||'📦'}</div><div class="case-info"><div class="case-meta">${data[k]?.length||0} предметов</div><div class="case-name">${k[0].toUpperCase()+k.slice(1)}</div><div class="case-price"><span>${Math.round(Number(prices[k])||0)}₽</span></div></div>`;frag.appendChild(b)});root.replaceChildren(frag);window.__emojiDropsFallback=true}catch(err){console.warn('Emoji Drops fallback catalog failed',err)}}
fallbackCatalog();
const critical=[['functional','js/functional-final.js?v=stable-functional-10'],['economy','js/economy-balance.js?v=8'],['guard','js/transaction-guard.js?v=7'],['engine','js/game-transaction-engine.js?v=11'],['serialization','js/transaction-serialization.js?v=4'],['bridge','js/runtime-action-bridge.js?v=4'],['polish','js/case-upgrade-polish.js?v=14'],['motion','js/motion-system.js?v=9'],['recovery','js/final-ui-recovery.js?v=6']];
const optional=[['economyQA','js/economy-sim-qa.js?v=7'],['hardening','js/runtime-hardening.js?v=9'],['quality','js/final-quality-qa.js?v=5'],['runtimeQA','js/runtime-qa.js?v=17'],['finalQA','js/runtime-final-qa.js?v=9'],['socialEconomy','js/economy-social-rewards.js?v=3'],['completePolish','js/final-complete-polish.js?v=2'],['ux','js/ux-overhaul.js?v=3']];
const failed=[],loaded=[];const TIMEOUT=2500;
function loadOne(name,src,cb){let done=false;const s=document.createElement('script');s.src=src;s.async=false;s.dataset.emojiDropsLayer=name;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);(ok?loaded:failed).push(name);if(!ok)console.warn(`Emoji Drops layer unavailable: ${name}`);cb&&cb()};const timer=setTimeout(()=>finish(false),TIMEOUT);s.onload=()=>finish(true);s.onerror=()=>finish(false);document.body.appendChild(s)}
function loadSequential(list,done){let i=0;const next=()=>{if(i>=list.length){done?.();return}loadOne(...list[i++],next)};next()}
function loadOptional(){optional.forEach(([name,src])=>loadOne(name,src));}
window.__emojiDropsRuntimeLoader={version:15,complete:false,failed:[],loaded:[],count:critical.length+optional.length};
/* Functional UI first: the site must become interactive before non-critical polish loads. */
loadOne(...critical[0],()=>{
  fallbackCatalog();
  loadSequential(critical.slice(1),()=>{
    fallbackCatalog();
    window.__emojiDropsRuntimeLoader.complete=true;
    window.__emojiDropsRuntimeLoader.failed=[...failed];
    window.__emojiDropsRuntimeLoader.loaded=[...loaded];
    loadOptional();
  });
});
setTimeout(()=>{fallbackCatalog();if(!window.__emojiDropsRuntimeLoader.complete)window.__emojiDropsRuntimeLoader.bootWarning=true},1800);
})();
