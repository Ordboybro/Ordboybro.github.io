(()=>{'use strict';
/* Emoji Drops action resilience v3: pointer activation fallback plus one-shot state verification for transient case-open races. No polling. */
const KEY='emojiDropsStateV3',MARK='emojiDropsActionResilienceV3',RETRY_DELAY=720;
const cloneState=()=>{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&typeof s==='object'?{opens:Number(s.stats?.opens)||0,inventory:Array.isArray(s.inventory)?s.inventory.length:0,balance:Number(s.balance)||0}:null}catch{return null}};
const changed=(a,b)=>!!a&&!!b&&(a.opens!==b.opens||a.inventory!==b.inventory||a.balance!==b.balance);
let last=0;
function verifyAndRetry(button,before){if(!button?.isConnected)return;const after=cloneState();if(changed(before,after))return;if(button.dataset.edRetry==='1')return;button.dataset.edRetry='1';last=Date.now();button.click();setTimeout(()=>{if(button.isConnected)delete button.dataset.edRetry},900)}
function activateFromPointer(e){const button=e.target?.closest?.('[data-do-open]');if(!button||Date.now()-last<120)return;const before=cloneState();if(!before)return;setTimeout(()=>verifyAndRetry(button,before),0)}
function onClick(e){const button=e.target?.closest?.('[data-do-open]');if(!button||Date.now()-last<120)return;const before=cloneState();if(!before)return;setTimeout(()=>verifyAndRetry(button,before),RETRY_DELAY)}
const install=()=>{document.addEventListener('pointerup',activateFromPointer,true);document.addEventListener('click',onClick,true)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.__emojiDropsActionResilience={version:3,key:MARK,retryDelay:RETRY_DELAY,verifyAndRetry};
})();
