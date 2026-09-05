(()=>{'use strict';
/* Emoji Drops — integrity layer. No visual/UI changes. */
const $=(s,r=document)=>r.querySelector(s);
const ITEM_RANK={common:1,rare:2,epic:3,mythical:4,legendary:5};
const catalog=()=>Object.values(typeof cases!=='undefined'?cases:{}).flat().filter(Boolean);
const num=(v)=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:0};
const itemValue=(x)=>num(x?.value||x?.price);
const canonicalItem=(x)=>{if(!x||typeof x!=='object')return null;const v=itemValue(x),hit=catalog().find(c=>c.emoji===x.emoji&&c.rarity===x.rarity&&itemValue(c)===v);return hit?{emoji:hit.emoji,rarity:hit.rarity,price:hit.price}:null};
const validEmail=(x)=>typeof x==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)&&x.length<=254;
function cleanUser(u){
  if(!u||typeof u!=='object'||!validEmail(u.email)||typeof u.password!=='string')return null;
  const nickname=typeof u.nickname==='string'&&u.nickname.trim()?u.nickname.trim().slice(0,24):'User';
  const stats=u.stats&&typeof u.stats==='object'?u.stats:{};
  const inventory=Array.isArray(u.inventory)?u.inventory.map(canonicalItem).filter(Boolean):[];
  return {...u,nickname,balance:Math.max(0,num(u.balance)),stats:{opened:Math.max(0,num(stats.opened)),upgrades:Math.max(0,num(stats.upgrades)),spent:Math.max(0,num(stats.spent)),received:Math.max(0,num(stats.received))},inventory};
}
function snapshot(){try{const raw=JSON.parse(localStorage.getItem('users')||'[]');return Array.isArray(raw)?raw:null}catch{return null}}
function repair(){
  const raw=snapshot();
  if(!raw){localStorage.setItem('users','[]');return}
  const cleaned=raw.map(cleanUser).filter(Boolean);
  const current=localStorage.getItem('currentUser');
  if(current&&!cleaned.some(u=>u.email===current))localStorage.removeItem('currentUser');
  const before=JSON.stringify(raw),after=JSON.stringify(cleaned);
  if(before!==after)localStorage.setItem('users',after);
}
function duplicateActionGuard(){
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b||b.disabled||!b.matches('#edOpen,#edDoUpgrade,#edReward,#rewardHeader,#edSellAll'))return;
    if(b.dataset.edBusy==='1'){e.preventDefault();e.stopImmediatePropagation();return}
    b.dataset.edBusy='1';
    const ms=b.id==='edOpen'?3500:1000;
    setTimeout(()=>{b.dataset.edBusy='0'},ms);
  },true);
}
function errorGuard(){window.addEventListener('error',e=>{if(e.error)console.error('Emoji Drops runtime error:',e.error)})}
function boot(){repair();duplicateActionGuard();errorGuard();window.addEventListener('storage',repair);setInterval(repair,5000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
