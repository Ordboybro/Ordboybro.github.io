(()=>{'use strict';
/* Emoji Drops runtime guards v3. Emergency bonus only when balance cannot afford the cheapest case. Max 5 claims per local day. No visual redesign. */
const KEY='emojiDropsStateV3',MAX_DAILY=5,BONUS=250;
const core=()=>window.__emojiDropsCore&&typeof window.__emojiDropsCore.state==='function'?window.__emojiDropsCore:null;
const state=()=>core()?.state?.();
const prices=()=>window.casePrices&&typeof window.casePrices==='object'?window.casePrices:{smile:100,moves:80,nature:60,food:40,animals:20,transport:10,sport:250,games:500};
const cheapest=()=>Math.min(...Object.values(prices()).map(Number).filter(Number.isFinite).filter(n=>n>0));
const money=n=>`${Math.round(Number(n)||0)} ₽`;
function persist(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}}
function toast(text){const e=document.getElementById?.('edToast');if(!e)return;e.textContent=text;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2200)}
function dayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function repair(){const s=state();if(!s)return false;let changed=false;if(!Number.isFinite(Number(s.balance))||s.balance<0){s.balance=0;changed=true}if(!Array.isArray(s.inventory)){s.inventory=[];changed=true}if(!Array.isArray(s.market)){s.market=[];changed=true}s.stats=s.stats&&typeof s.stats==='object'?s.stats:{};for(const k of ['opens','wins','spent','earned','upgrades']){if(!Number.isFinite(Number(s.stats[k]))||s.stats[k]<0){s.stats[k]=0;changed=true}}if(!Number.isFinite(Number(s.xp))||s.xp<0){s.xp=0;changed=true}if(!Number.isFinite(Number(s.level))||s.level<1){s.level=1;changed=true}const today=dayKey();if(s.bonusDay!==today){s.bonusDay=today;s.bonusClaims=0;changed=true}else if(!Number.isFinite(Number(s.bonusClaims))||s.bonusClaims<0){s.bonusClaims=0;changed=true}else{s.bonusClaims=Math.min(MAX_DAILY,Math.floor(Number(s.bonusClaims)))}if(changed)persist(s);return changed}
function eligible(){const s=state();return !!s&&Number(s.balance)<cheapest()&&Number(s.bonusClaims||0)<MAX_DAILY}
function updateRewardLabel(){const q=document.querySelector;if(typeof q!=='function')return;const b=q.call(document,'[data-reward]');if(!b)return;repair();const s=state();if(!s)return;if(Number(s.balance)>=cheapest()){b.textContent=`Бонус: при нехватке ${money(cheapest())}`;return}if(Number(s.bonusClaims||0)>=MAX_DAILY){b.textContent='Бонус: 5/5 сегодня';return}b.textContent=`+250 ₽ · ${Number(s.bonusClaims||0)}/5 сегодня`}
function neutralizeLegacyTimer(){const s=state();if(!s)return false;const now=Date.now();if(s.lastReward!==now){s.lastReward=now;persist(s);return true}return false}
function claimDue(){repair();const s=state();if(!s)return false;if(Number(s.balance)>=cheapest()){toast(`Сначала потрать деньги: минимум ${money(cheapest())}`);updateRewardLabel();return true}if(Number(s.bonusClaims||0)>=MAX_DAILY){toast('Лимит бонусов на сегодня: 5/5');updateRewardLabel();return true}s.balance=(Number(s.balance)||0)+BONUS;s.stats=s.stats||{};s.stats.earned=(Number(s.stats.earned)||0)+BONUS;s.xp=(Number(s.xp)||0)+10;s.bonusClaims=(Number(s.bonusClaims)||0)+1;s.bonusDay=dayKey();s.lastReward=Date.now();persist(s);core()?.render?.();toast(`Получено ${money(BONUS)}`);updateRewardLabel();return true}
document.addEventListener?.('click',e=>{const b=e.target?.closest?.('[data-reward]');if(!b)return;e.preventDefault?.();e.stopImmediatePropagation?.();claimDue()},true);
setInterval(()=>{repair();neutralizeLegacyTimer();updateRewardLabel()},250);repair();neutralizeLegacyTimer();updateRewardLabel();
window.__emojiDropsRuntimeGuards={version:1,repair,claimDue,eligible};
})();
