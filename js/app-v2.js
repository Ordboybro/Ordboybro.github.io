(()=>{'use strict';
/* Emoji Drops — resilient runtime entrypoint. Core UI loads first; optional layers never block the page. */
const mq=q=>{try{return matchMedia(q).matches}catch{return false}};
const cores=Number(navigator.hardwareConcurrency)||4;
const mem=Number(navigator.deviceMemory)||4;
const slow=mq('(update: slow)')||cores<=2||mem<=2||navigator.connection?.saveData===true;
const reduced=mq('(prefers-reduced-motion: reduce)');
const perf={version:14,lowEnd:slow,reduced,cores,memory:mem,reelItems:slow?24:56,reelTarget:slow?18:46,reelDuration:reduced?0:(slow?5000:5500),upgradeDuration:reduced?0:(slow?4500:5000),liveLimit:slow?6:10};
window.__emojiDropsPerf=perf;
const scripts=[['functional','js/functional-final.js?v=stable-functional-9'],['economy','js/economy-balance.js?v=7'],['economyQA','js/economy-sim-qa.js?v=6'],['hardening','js/runtime-hardening.js?v=8'],['transactionGuard','js/transaction-guard.js?v=6'],['engine','js/game-transaction-engine.js?v=10'],['serialization','js/transaction-serialization.js?v=3'],['actionBridge','js/runtime-action-bridge.js?v=3'],['polish','js/case-upgrade-polish.js?v=13'],['motion','js/motion-system.js?v=8'],['uiRecovery','js/final-ui-recovery.js?v=5'],['quality','js/final-quality-qa.js?v=4'],['runtimeQA','js/runtime-qa.js?v=16'],['finalQA','js/runtime-final-qa.js?v=8'],['socialEconomy','js/economy-social-rewards.js?v=2']];
const failed=[];const started=Date.now();
window.__emojiDropsRuntimeLoader={version:14,complete:false,failed:[],count:scripts.length,loaded:0,started};
const status=msg=>{const e=document.getElementById('bootStatus');if(e&&msg){e.textContent=msg;e.classList.remove('ok')}};
window.addEventListener('error',e=>{window.__emojiDropsRuntimeLoader.lastError={type:'error',message:e?.message||'runtime error',source:e?.filename||''};status('Ошибка модуля — основной интерфейс сохранён');},{passive:true});
window.addEventListener('unhandledrejection',e=>{window.__emojiDropsRuntimeLoader.lastError={type:'unhandledrejection',message:String(e?.reason?.message||e?.reason||'promise rejection')};status('Ошибка запуска — основной интерфейс сохранён');},{passive:true});
function load(i){
 if(i>=scripts.length){window.__emojiDropsRuntimeLoader.complete=true;window.__emojiDropsRuntimeLoader.failed=[...failed];window.__emojiDropsRuntimeLoader.finished=Date.now();window.__emojiDropsRuntimeLoader.duration=Date.now()-started;const e=document.getElementById('bootStatus');if(e&&!failed.length)e.classList.add('ok');else if(e&&failed.length)status(`Запущено с ограничениями · ${failed.length} мод.`);return;}
 const[name,src]=scripts[i];let settled=false;const s=document.createElement('script');s.src=src;s.async=false;s.dataset.emojiDropsLayer=name;
 const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);window.__emojiDropsRuntimeLoader.loaded=i+1;load(i+1)};
 const timer=setTimeout(()=>{failed.push(name);window.__emojiDropsRuntimeLoader.failed=[...failed];console.warn(`Emoji Drops runtime layer timeout: ${name}`);finish()},8000);
 s.onload=finish;
 s.onerror=()=>{failed.push(name);window.__emojiDropsRuntimeLoader.failed=[...failed];console.error(`Emoji Drops runtime layer failed to load: ${name}`);finish()};
 document.body.appendChild(s);
}
load(0);
})();
