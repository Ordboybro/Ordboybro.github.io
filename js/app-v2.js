(()=>{'use strict';
/* Emoji Drops — single runtime entrypoint. One loader, non-blocking optional layers, explicit health state. */
const mq=q=>{try{return matchMedia(q).matches}catch{return false}};
const cores=Number(navigator.hardwareConcurrency)||4;
const mem=Number(navigator.deviceMemory)||4;
const slow=mq('(update: slow)')||cores<=2||mem<=2||navigator.connection?.saveData===true;
const reduced=mq('(prefers-reduced-motion: reduce)');
const perf={version:12,lowEnd:slow,reduced,cores,memory:mem,reelItems:slow?24:56,reelTarget:slow?18:46,reelDuration:reduced?0:(slow?5000:5500),upgradeDuration:reduced?0:(slow?4500:5000),liveLimit:slow?6:10};
window.__emojiDropsPerf=perf;
const scripts=[['functional','js/functional-final.js?v=stable-functional-8'],['economy','js/economy-balance.js?v=6'],['economyQA','js/economy-sim-qa.js?v=5'],['hardening','js/runtime-hardening.js?v=7'],['transactionGuard','js/transaction-guard.js?v=5'],['engine','js/game-transaction-engine.js?v=9'],['serialization','js/transaction-serialization.js?v=2'],['actionBridge','js/runtime-action-bridge.js?v=2'],['polish','js/case-upgrade-polish.js?v=12'],['motion','js/motion-system.js?v=7'],['uiRecovery','js/final-ui-recovery.js?v=4'],['quality','js/final-quality-qa.js?v=3'],['runtimeQA','js/runtime-qa.js?v=15'],['finalQA','js/runtime-final-qa.js?v=7'],['socialEconomy','js/economy-social-rewards.js?v=1']];
const failed=[];const started=Date.now();
window.__emojiDropsRuntimeLoader={version:11,complete:false,failed:[],count:scripts.length,loaded:0,started};
window.addEventListener('error',e=>{window.__emojiDropsRuntimeLoader.lastError={type:'error',message:e?.message||'runtime error',source:e?.filename||''};},{passive:true});
window.addEventListener('unhandledrejection',e=>{window.__emojiDropsRuntimeLoader.lastError={type:'unhandledrejection',message:String(e?.reason?.message||e?.reason||'promise rejection')};},{passive:true});
function load(i){
 if(i>=scripts.length){window.__emojiDropsRuntimeLoader.complete=true;window.__emojiDropsRuntimeLoader.failed=[...failed];window.__emojiDropsRuntimeLoader.finished=Date.now();if(failed.length)console.warn('Emoji Drops runtime completed with failed optional layers:',failed);return;}
 const[name,src]=scripts[i],s=document.createElement('script');s.src=src;s.async=false;s.dataset.emojiDropsLayer=name;
 const next=()=>{window.__emojiDropsRuntimeLoader.loaded=i+1;load(i+1)};
 s.onload=next;
 s.onerror=()=>{failed.push(name);window.__emojiDropsRuntimeLoader.failed=[...failed];console.error(`Emoji Drops runtime layer failed to load: ${name}`);next()};
 document.body.appendChild(s);
}
load(0);
})();
