(()=>{'use strict';
/* Emoji Drops — final runtime guard: economy, cases, upgrade and motion stability. */
const CASE_PRICES={transport:25,animals:40,food:60,nature:85,moves:110,smile:140,sport:180,games:230,space:290,ocean:360,flags:420};
const RARITY={common:55,rare:27,epic:12,mythical:5,legendary:1};
const MULT={common:.28,rare:.62,epic:1.18,mythical:2.35,legendary:4.8};
const money=n=>`${Math.max(0,Math.round(Number(n)||0))}₽`;
const val=x=>Math.max(0,Number(x?.value)||Number(String(x?.price??0).replace(/[^0-9.]/g,''))||0);
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
function normalizeCases(){
 if(typeof cases==='undefined'||typeof casePrices==='undefined')return;
 for(const [id,price] of Object.entries(CASE_PRICES)){
  if(!Array.isArray(cases[id]))continue;
  casePrices[id]=price;
  const items=cases[id];
  let cursor=0;
  for(const rarity of Object.keys(RARITY)){
   const group=items.filter(x=>x.rarity===rarity);
   group.forEach((item,i)=>{item.caseId=id;const spread=group.length<2?1:i/(group.length-1);item.value=Math.max(1,Math.round(price*MULT[rarity]*(.92+.16*spread)));item.price=money(item.value)});
   cursor+=group.length;
  }
  items.forEach(item=>{if(!item.caseId)item.caseId=id;if(!RARITY[item.rarity])item.rarity='common';if(!item.value){item.value=Math.max(1,Math.round(price*MULT.common));item.price=money(item.value)}});
 }
 document.documentElement.dataset.economy='stable';
}
function normalizeUsers(){try{const a=JSON.parse(localStorage.getItem('users')||'[]');if(!Array.isArray(a))return;for(const u of a){if(!u||typeof u!=='object')continue;u.balance=Math.max(0,Math.round(Number(u.balance)||0));u.inventory=Array.isArray(u.inventory)?u.inventory:[];u.stats=u.stats&&typeof u.stats==='object'?u.stats:{};for(const k of ['opened','upgrades','spent','received'])u.stats[k]=Math.max(0,Number(u.stats[k])||0)}localStorage.setItem('users',JSON.stringify(a))}catch{}}
function syncCaseCards(){if(typeof cases==='undefined'||typeof casePrices==='undefined')return;qsa('#cases .case-card').forEach(card=>{const id=card.dataset.case;if(!id||!cases[id])return;const name=card.querySelector('.case-name');const meta=card.querySelector('.case-meta');const price=card.querySelector('.case-price span');if(meta)meta.textContent=`${cases[id].length} предметов`;if(price)price.textContent=money(casePrices[id]) ;card.dataset.economyPrice=casePrices[id]});}
function preventDoubleActions(){let locked=false;document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const text=(b.textContent||'').trim().toLowerCase();if(!/(откры|апгрейд|upgrade|продать|получить)/.test(text))return;if(locked)return;e.stopPropagation();locked=true;b.classList.add('ed-clicking');setTimeout(()=>{locked=false;b.classList.remove('ed-clicking')},220)},true)}
function upgradeGuard(){document.addEventListener('click',e=>{const b=e.target.closest('.upgrade-submit');if(!b)return;const root=b.closest('.panel')||document;const source=root.querySelector('.upgrade-item.selected,.upgrade-item[data-selected="true"]');const target=root.querySelector('.upgrade-target.selected,.upgrade-target[data-selected="true"]');if(!source||!target)return;const sv=val({value:source.dataset.value||source.querySelector('[data-value]')?.dataset.value});const tv=val({value:target.dataset.value||target.querySelector('[data-value]')?.dataset.value});if(!sv||!tv||tv<=sv){e.preventDefault();e.stopImmediatePropagation();b.disabled=true;const old=b.textContent;b.textContent='Выберите цель дороже';setTimeout(()=>{b.disabled=false;b.textContent=old},900)}},true)}
function motionObserver(){const io=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('ed-visible');io.unobserve(x.target)}}),{threshold:.08});qsa('.case-card,.live-drop,.inventory-item,.preview-item,.upgrade-item,.upgrade-target,.stat,.profile-stat').forEach(x=>io.observe(x));}
function boot(){normalizeCases();normalizeUsers();syncCaseCards();preventDoubleActions();upgradeGuard();if('IntersectionObserver'in window)motionObserver();let i=0;const t=setInterval(()=>{normalizeCases();syncCaseCards();if(++i>=10)clearInterval(t)},400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
