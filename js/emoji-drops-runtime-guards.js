(()=>{'use strict';
/* Emoji Drops runtime guards v7. No UI redesign. Protects bonus, state integrity and duplicate action clicks. */
const KEY='emojiDropsStateV3',MAX_DAILY=3,BONUS=250,BLOCK_MS=100*365*24*60*60*1000,MAX_SAFE=Number.MAX_SAFE_INTEGER,ACTION_LOCK_MS=650;
const VALID_RARITY=new Set(['common','rare','epic','mythical','legendary']);
const core=()=>window.__emojiDropsCore&&typeof window.__emojiDropsCore.state==='function'?window.__emojiDropsCore:null;
const state=()=>core()?.state?.();
const prices=()=>window.casePrices&&typeof window.casePrices==='object'?window.casePrices:{smile:100,moves:80,nature:60,food:40,animals:20,transport:10,sport:250,games:500};
const cheapest=()=>Math.min(...Object.values(prices()).map(Number).filter(Number.isFinite).filter(n=>n>0));
const money=n=>`${Math.round(Number(n)||0)} ₽`;
function persist(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}}
function toast(text){const e=document.getElementById?.('edToast');if(!e)return;e.textContent=text;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2200)}
function dayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function cleanItem(x,fallbackId){if(!x||typeof x!=='object')return null;const out={...x};out.emoji=String(out.emoji||'🎁').slice(0,16);out.rarity=VALID_RARITY.has(out.rarity)?out.rarity:'common';const n=Number.parseFloat(String(out.price??'').replace(/[^0-9.\-]/g,''));out.price=Number.isFinite(n)?Math.min(MAX_SAFE,Math.max(0,n)):0;out.id=String(out.id||fallbackId||`${out.rarity}:${out.emoji}:${out.price}`).slice(0,120);return out}
function repair(){const s=state();if(!s)return false;let changed=false;const balance=Number(s.balance);if(!Number.isFinite(balance)||balance<0){s.balance=0;changed=true}else if(balance>MAX_SAFE){s.balance=MAX_SAFE;changed=true}
if(!Array.isArray(s.inventory)){s.inventory=[];changed=true}else{const seen=new Set(),next=[];for(const x of s.inventory){const y=cleanItem(x);if(!y)continue;if(seen.has(y.id))y.id=`${y.id}:${next.length}`;seen.add(y.id);next.push(y)}if(next.length!==s.inventory.length||next.some((x,i)=>JSON.stringify(x)!==JSON.stringify(s.inventory[i]))){s.inventory=next;changed=true}}
if(!Array.isArray(s.market)){s.market=[];changed=true}else{const next=s.market.map((x,i)=>{const y=cleanItem(x,`market:${i}`);if(y)y.seller=String(y.seller||'Player').trim().slice(0,32)||'Player';return y}).filter(Boolean);if(next.length!==s.market.length||next.some((x,i)=>JSON.stringify(x)!==JSON.stringify(s.market[i])))s.market=next,changed=true}
s.stats=s.stats&&typeof s.stats==='object'?s.stats:{};for(const k of ['opens','wins','spent','earned','upgrades']){const n=Number(s.stats[k]);const fixed=Number.isFinite(n)&&n>=0?Math.min(MAX_SAFE,n):0;if(n!==fixed){s.stats[k]=fixed;changed=true}}
const xp=Number(s.xp);if(!Number.isFinite(xp)||xp<0){s.xp=0;changed=true}else if(xp>MAX_SAFE){s.xp=MAX_SAFE;changed=true}const level=Math.floor(Number(s.level));if(!Number.isFinite(level)||level<1){s.level=1;changed=true}else if(level>1000000){s.level=1000000;changed=true}
const today=dayKey();if(s.bonusDay!==today){s.bonusDay=today;s.bonusClaims=0;changed=true}else{const n=Math.floor(Number(s.bonusClaims));const fixed=Math.min(MAX_DAILY,Math.max(0,Number.isFinite(n)?n:0));if(n!==fixed){s.bonusClaims=fixed;changed=true}}
if(changed)persist(s);return changed}
function eligible(){repair();const s=state();return !!s&&Number.isFinite(Number(s.balance))&&Number(s.balance)>=0&&Number(s.balance)<cheapest()&&Number.isInteger(Number(s.bonusClaims))&&Number(s.bonusClaims)<MAX_DAILY}
function updateRewardLabel(){const q=document.querySelector;if(typeof q!=='function')return;const b=q.call(document,'[data-reward]');if(!b)return;repair();const s=state();if(!s)return;if(Number(s.balance)>=cheapest()){b.textContent=`Бонус: при нехватке ${money(cheapest())}`;return}if(Number(s.bonusClaims||0)>=MAX_DAILY){b.textContent=`Бонус: ${MAX_DAILY}/${MAX_DAILY} сегодня`;return}b.textContent=`+250 ₽ · ${Number(s.bonusClaims||0)}/${MAX_DAILY} сегодня`}
function neutralizeLegacyTimer(){const s=state();if(!s)return false;const blocked=Date.now()+BLOCK_MS;if(Number(s.lastReward)!==blocked){s.lastReward=blocked;persist(s);return true}return false}
function claimDue(){repair();const s=state();if(!s)return false;if(Number(s.balance)>=cheapest()){toast(`Сначала потрать деньги: минимум ${money(cheapest())}`);updateRewardLabel();return true}if(Number(s.bonusClaims||0)>=MAX_DAILY){toast(`Лимит бонусов на сегодня: ${MAX_DAILY}/${MAX_DAILY}`);updateRewardLabel();return true}s.balance=Math.min(MAX_SAFE,(Number(s.balance)||0)+BONUS);s.stats=s.stats||{};s.stats.earned=Math.min(MAX_SAFE,(Number(s.stats.earned)||0)+BONUS);s.xp=Math.min(MAX_SAFE,(Number(s.xp)||0)+10);s.bonusClaims=(Number(s.bonusClaims)||0)+1;s.bonusDay=dayKey();s.lastReward=Date.now()+BLOCK_MS;if(!persist(s)){toast('Не удалось сохранить бонус');return false}core()?.render?.();toast(`Получено ${money(BONUS)}`);updateRewardLabel();return true}
const actionTimes=new Map();
function actionKey(b){return ['data-open','data-do-open','data-sell','data-sell-all','data-up-from','data-up-to','data-upgrade','data-buy','data-list-random','data-daily'].map(k=>b.hasAttribute?.(k)?`${k}:${b.getAttribute(k)||'1'}`:'').find(Boolean)||''}
document.addEventListener?.('click',e=>{const b=e.target?.closest?.('[data-reward]');if(!b)return;e.preventDefault?.();e.stopImmediatePropagation?.();claimDue()},true);
document.addEventListener?.('click',e=>{const b=e.target?.closest?.('[data-open],[data-do-open],[data-sell],[data-sell-all],[data-up-from],[data-up-to],[data-upgrade],[data-buy],[data-list-random],[data-daily]');if(!b)return;const k=actionKey(b);if(!k)return;const now=Date.now(),last=actionTimes.get(k)||0;if(now-last<ACTION_LOCK_MS){e.preventDefault?.();e.stopImmediatePropagation?.();return}actionTimes.set(k,now);if(actionTimes.size>100){for(const [key,t] of actionTimes)if(now-t>ACTION_LOCK_MS*4)actionTimes.delete(key)}},true);
const refresh=()=>{repair();neutralizeLegacyTimer();updateRewardLabel()};
document.addEventListener?.('visibilitychange',()=>{if(document.visibilityState==='hidden')refresh()});window.addEventListener?.('pagehide',refresh);window.addEventListener?.('pageshow',refresh);
setInterval(refresh,250);refresh();
window.__emojiDropsRuntimeGuards={version:3,repair,claimDue,eligible,actionLockMs:ACTION_LOCK_MS};
})();
