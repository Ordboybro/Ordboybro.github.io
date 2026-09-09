(()=>{'use strict';
/* Emoji Drops runtime guards v2. Post-core safety layer. No visual redesign. */
const KEY='emojiDropsStateV3',PERIOD=15*60*1000;
const core=()=>window.__emojiDropsCore&&typeof window.__emojiDropsCore.state==='function'?window.__emojiDropsCore:null;
const state=()=>core()?.state?.();
const money=n=>`${Math.round(Number(n)||0)} ₽`;
function persist(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}}
function toast(text){const e=document.getElementById?.('edToast');if(!e)return;e.textContent=text;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2200)}
function repair(){const s=state();if(!s)return false;let changed=false;if(!Number.isFinite(Number(s.balance))||s.balance<0){s.balance=0;changed=true}if(!Array.isArray(s.inventory)){s.inventory=[];changed=true}if(!Array.isArray(s.market)){s.market=[];changed=true}s.stats=s.stats&&typeof s.stats==='object'?s.stats:{};for(const k of ['opens','wins','spent','earned','upgrades']){if(!Number.isFinite(Number(s.stats[k]))||s.stats[k]<0){s.stats[k]=0;changed=true}}if(!Number.isFinite(Number(s.xp))||s.xp<0){s.xp=0;changed=true}if(!Number.isFinite(Number(s.level))||s.level<1){s.level=1;changed=true}if(changed)persist(s);return changed}
function dueMs(){const s=state();if(!s)return PERIOD;const last=Number(s.lastReward)||Date.now();return Math.max(0,PERIOD-(Date.now()-last)%PERIOD)}
function updateRewardLabel(){const q=document.querySelector;if(typeof q!=='function')return;const b=q.call(document,'[data-reward]');if(!b)return;const left=dueMs();if(left<=1000){b.textContent='+250 ₽';return}const m=Math.floor(left/60000),sec=Math.floor((left%60000)/1000);b.textContent=`Бонус через ${m}:${String(sec).padStart(2,'0')}`}
function claimDue(){const s=state();if(!s)return false;const now=Date.now(),last=Number(s.lastReward)||now;const count=Math.floor((now-last)/PERIOD);if(count<=0){toast('Бонус ещё не готов');return true}const reward=count*250;s.balance=(Number(s.balance)||0)+reward;s.stats=s.stats||{};s.stats.earned=(Number(s.stats.earned)||0)+reward;s.xp=(Number(s.xp)||0)+count*10;s.lastReward=last+count*PERIOD;persist(s);core()?.render?.();toast(`Получено ${money(reward)}`);return true}
document.addEventListener?.('click',e=>{const b=e.target?.closest?.('[data-reward]');if(!b)return;e.preventDefault?.();e.stopImmediatePropagation?.();claimDue()},true);
setInterval(()=>{repair();updateRewardLabel()},1000);repair();updateRewardLabel();
window.__emojiDropsRuntimeGuards={version:1,repair,claimDue};
})();
