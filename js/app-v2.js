(()=>{'use strict';
/* Emoji Drops — single runtime entrypoint. */
const perf=(()=>{const mq=q=>{try{return matchMedia(q).matches}catch{return false}};const cores=Number(navigator.hardwareConcurrency)||4;const mem=Number(navigator.deviceMemory)||4;const slow=mq('(update: slow)')||cores<=2||mem<=2||navigator.connection?.saveData===true;const reduced=matchMedia('(prefers-reduced-motion: reduce)');const profile={version:14,lowEnd:slow,reduced,cores,memory:mem,reelItems:slow?24:56,reelTarget:slow?18:46,reelDuration:reduced?0:(slow?5000:5500),upgradeDuration:reduced?0:(slow?4500:5000),liveLimit:slow?6:10};window.__emojiDropsPerf=profile;return profile})();
const scripts=[['functional','js/functional-final.js?v=stable-functional-10'],['economy','js/economy-balance.js?v=8'],['economyQA','js/economy-sim-qa.js?v=7'],['hardening','js/runtime-hardening.js?v=9'],['transactionGuard','js/transaction-guard.js?v=7'],['engine','js/game-transaction-engine.js?v=11'],['serialization','js/transaction-serialization.js?v=4'],['actionBridge','js/runtime-action-bridge.js?v=4'],['polish','js/case-upgrade-polish.js?v=14'],['motion','js/motion-system.js?v=9'],['uiRecovery','js/final-ui-recovery.js?v=6'],['quality','js/final-quality-qa.js?v=5'],['runtimeQA','js/runtime-qa.js?v=17'],['finalQA','js/runtime-final-qa.js?v=9'],['socialEconomy','js/economy-social-rewards.js?v=3']];
const failed=[];
function load(i){if(i>=scripts.length){window.__emojiDropsRuntimeLoader={version:14,complete:true,failed:[...failed],count:scripts.length};if(failed.length)console.warn('Emoji Drops runtime completed with failed layers:',failed);health();return}const[name,src]=scripts[i],s=document.createElement('script');s.src=src;s.async=false;s.dataset.emojiDropsLayer=name;const next=()=>load(i+1);s.onload=next;s.onerror=()=>{failed.push(name);console.error(`Emoji Drops runtime layer failed to load: ${name}`);next()};(document.body||document.head||document.documentElement).appendChild(s)}
window.__emojiDropsRuntimeLoader={version:14,complete:false,failed:[],count:scripts.length};
function health(){
 const run=()=>{
  document.documentElement.dataset.emojiDropsRuntime='ready';
  const cases=document.getElementById('cases');
  if(cases&&!cases.children.length){
   const s=document.createElement('script');s.src='js/functional-final.js?v=health-retry-1';s.async=false;s.dataset.emojiDropsLayer='health-retry';document.body.appendChild(s);
  }
  const modal=document.getElementById('edUpgradeModal');
  if(modal) modal.setAttribute('aria-hidden',modal.classList.contains('show')?'false':'true');
 };
 setTimeout(run,350);
 setTimeout(run,1800);
}
function start(){load(0)}
if(document.body)start();else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();