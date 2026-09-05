(()=>{'use strict';
/* Emoji Drops — integrity layer. No homepage/layout changes. */
const ITEM_RANK={common:1,rare:2,epic:3,mythical:4,legendary:5};
const REWARD_V6='emojiDrops.dailyReward.v6',REWARD_V7='emojiDrops.dailyReward.v7',SCHEMA='emojiDrops.schema.v2';
const num=v=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:0};
const catalog=()=>Object.values(typeof cases!=='undefined'?cases:{}).flat().filter(Boolean);
const value=x=>Math.max(0,num(x?.value||x?.price));
const validEmail=x=>typeof x==='string'&&x.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
function storageProbe(){try{const k='__ed_probe__';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok}catch{return false}}
function canonical(x){if(!x||typeof x!=='object')return null;const v=value(x),hit=catalog().find(c=>c.emoji===x.emoji&&c.rarity===x.rarity&&value(c)===v);return hit?{emoji:hit.emoji,rarity:hit.rarity,price:hit.price}:null}
function cleanUser(u){if(!u||typeof u!=='object'||!validEmail(u.email)||typeof u.password!=='string')return null;const st=u.stats&&typeof u.stats==='object'?u.stats:{};const inv=Array.isArray(u.inventory)?u.inventory.map(canonical).filter(Boolean):[];return{...u,nickname:typeof u.nickname==='string'&&u.nickname.trim()?u.nickname.trim().slice(0,24):'User',balance:Math.max(0,num(u.balance)),stats:{opened:Math.floor(Math.max(0,num(st.opened))),upgrades:Math.floor(Math.max(0,num(st.upgrades))),spent:Math.max(0,num(st.spent)),received:Math.max(0,num(st.received))},inventory:inv}}
function readUsers(){try{const raw=JSON.parse(localStorage.getItem('users')||'[]');return Array.isArray(raw)?raw:null}catch{return null}}
function repair(){if(!storageProbe())return;const raw=readUsers();if(!raw){localStorage.setItem('users','[]');return}const cleaned=raw.map(cleanUser).filter(Boolean);const current=localStorage.getItem('currentUser');if(current&&!cleaned.some(u=>u.email===current))localStorage.removeItem('currentUser');if(JSON.stringify(raw)!==JSON.stringify(cleaned))localStorage.setItem('users',JSON.stringify(cleaned));try{localStorage.setItem(SCHEMA,'2')}catch{}}
function migrateReward(){try{const email=localStorage.getItem('currentUser');if(!email)return;const old=localStorage.getItem(`${REWARD_V6}:${email}`),neo=localStorage.getItem(`${REWARD_V7}:${email}`);if(old&&!neo)localStorage.setItem(`${REWARD_V7}:${email}`,old)}catch{}}
function actionGuard(){document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||!b.matches('#edOpen,#edDoUpgrade,#edReward,#rewardHeader,#edSellAll'))return;if(b.dataset.edBusy==='1'){e.preventDefault();e.stopImmediatePropagation();return}b.dataset.edBusy='1';const ms=b.id==='edOpen'?4500:b.id==='edDoUpgrade'?2200:1100;setTimeout(()=>{b.dataset.edBusy='0'},ms)},true)}
function errors(){window.addEventListener('error',e=>{if(e.error)console.error('Emoji Drops runtime error:',e.error)});window.addEventListener('unhandledrejection',e=>console.error('Emoji Drops promise error:',e.reason))}
function boot(){repair();migrateReward();actionGuard();errors();window.addEventListener('storage',()=>{repair();migrateReward()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){repair();migrateReward()}});setInterval(()=>{repair();migrateReward()},15000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
