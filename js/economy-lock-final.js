(()=>{'use strict';
/* Final economy authority. Loaded last so legacy economy helpers cannot overwrite canonical values. */
const PRICES={transport:25,animals:40,food:60,nature:85,moves:110,smile:140,sport:180,games:230,space:290,ocean:360,flags:420};
const MULT={common:.28,rare:.62,epic:1.18,mythical:2.35,legendary:4.8};
const RANK=['common','common','common','common','common','common','common','common','common','common','common','common','common','common','rare','rare','rare','rare','rare','rare','rare','rare','rare','epic','epic','epic','epic','epic','epic','mythical','mythical','mythical','mythical','legendary','legendary'];
const money=n=>`${Math.round(Number(n)||0)}₽`;
function applyEconomy(){
 if(typeof cases==='undefined'||typeof casePrices==='undefined')return;
 for(const key of Object.keys(PRICES)){
  casePrices[key]=PRICES[key];
  const items=Array.isArray(cases[key])?cases[key]:[];
  for(let i=0;i<items.length;i++){
   const item=items[i];
   item.caseId=key;
   item.rarity=RANK[i]||item.rarity||'common';
   const spread=.92+(Math.min(i,34)/34)*.16;
   item.value=Math.max(1,Math.round(PRICES[key]*(MULT[item.rarity]||MULT.common)*spread));
   item.price=money(item.value);
  }
 }
 document.documentElement.dataset.economyAuthority='final';
}
function normalizeUser(){
 try{
  const raw=localStorage.getItem('users');if(!raw)return;
  const users=JSON.parse(raw);if(!Array.isArray(users))return;
  for(const u of users){
   if(!u||typeof u!=='object')continue;
   u.balance=Math.max(0,Math.round(Number(u.balance)||0));
   u.inventory=Array.isArray(u.inventory)?u.inventory:[];
   u.stats=u.stats&&typeof u.stats==='object'?u.stats:{};
   for(const k of ['opened','upgrades','spent','received'])u.stats[k]=Math.max(0,Number(u.stats[k])||0);
  }
  localStorage.setItem('users',JSON.stringify(users));
 }catch{}
}
function guardUpgrade(){
 document.addEventListener('click',e=>{
  const btn=e.target.closest('.upgrade-submit');if(!btn)return;
  const root=btn.closest('.panel')||document;
  const source=root.querySelector('.upgrade-item.selected,.upgrade-item[data-selected="true"]');
  const target=root.querySelector('.upgrade-target.selected,.upgrade-target[data-selected="true"]');
  if(!source||!target)return;
  const sv=Number(source.dataset.value||source.querySelector('[data-value]')?.dataset.value||0);
  const tv=Number(target.dataset.value||target.querySelector('[data-value]')?.dataset.value||0);
  if(!Number.isFinite(sv)||!Number.isFinite(tv)||sv<=0||tv<=sv){e.preventDefault();e.stopImmediatePropagation();btn.disabled=true;setTimeout(()=>{btn.disabled=false},450)}
 },true);
}
function boot(){
 applyEconomy();normalizeUser();guardUpgrade();
 let n=0;const timer=setInterval(()=>{applyEconomy();if(++n>=8)clearInterval(timer)},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
