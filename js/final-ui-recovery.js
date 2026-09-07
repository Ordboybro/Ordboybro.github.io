(()=>{'use strict';
/* Emoji Drops — final UI recovery + iOS viewport polish. No economy mutations. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const casesData=()=>typeof cases!=='undefined'?cases:{};
const prices=()=>typeof casePrices!=='undefined'?casePrices:{};
const money=n=>`${Math.round(Number(n)||0)}₽`;
const value=x=>Number(x?.value)||Number(x?.price)||Number(String(x?.value||x?.price||0).replace(/[^0-9.]/g,''))||0;
const rarity={common:'#9ca3af',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ff8a00'};
function css(){if($('#ed-final-ui-recovery-css'))return;const s=document.createElement('style');s.id='ed-final-ui-recovery-css';s.textContent=`
/* iOS 26/27 Safari: keep the glass rail above the home-indicator zone and fill the visual void below it. */
body:has(.live-section:not([style*="display: none"])):not(:has(.modal.show))::after{content:'';position:fixed;left:0;right:0;bottom:0;height:104px;z-index:35;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(9,9,9,.30) 30%,rgba(9,9,9,.88) 100%);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.live-section{bottom:max(4px,env(safe-area-inset-bottom))!important;width:min(1240px,calc(100vw - 20px))!important}
.live-container{background:linear-gradient(180deg,rgba(28,28,28,.86),rgba(9,9,9,.90))!important;box-shadow:0 14px 42px rgba(0,0,0,.72),0 1px 0 rgba(255,255,255,.05) inset!important;backdrop-filter:blur(20px) saturate(1.15)!important;-webkit-backdrop-filter:blur(20px) saturate(1.15)!important}
@media(max-width:700px){header{padding:0 12px!important;gap:7px!important}.logo{font-size:22px!important}.top-right{gap:7px!important}.top-pill{padding:10px 11px!important;font-size:14px!important}.profile-top{padding:10px 12px!important;font-size:14px!important}.live-section{bottom:max(5px,env(safe-area-inset-bottom))!important;width:calc(100vw - 14px)!important}.live-container{min-height:68px!important;padding:5px 3px!important}.live-drop{flex-basis:152px!important;height:59px!important}.live-emoji{width:39px!important;height:39px!important;font-size:23px!important}}
@media(max-width:370px){.logo{font-size:20px!important}.top-pill{padding:9px 9px!important;font-size:13px!important}.profile-top{padding:9px 10px!important;font-size:13px!important}.top-right{gap:4px!important}.live-section{width:calc(100vw - 10px)!important}.live-drop{flex-basis:146px!important}}
@media(prefers-reduced-motion:reduce){body:has(.live-section:not([style*="display: none"])):not(:has(.modal.show))::after{backdrop-filter:none;-webkit-backdrop-filter:none}}
`;
document.head.appendChild(s)}
function renderCase(k){
  const data=casesData()[k];if(!Array.isArray(data)||!data.length)return false;
  const modal=$('#edOpenModal'),body=modal?.querySelector('.panel-body'),engine=window.__emojiDropsEngine;if(!modal||!body||!engine?.state)return false;
  if(!localStorage.getItem('currentUser')){const auth=$('#edAuthModal');auth?.classList.add('show');auth?.setAttribute('aria-hidden','false');return true}
  engine.state.caseKey=k;engine.state.busy=false;
  const title=modal.querySelector('.panel-head h2');if(title)title.textContent=`${k[0].toUpperCase()+k.slice(1)} · ${money(prices()[k])}`;
  const amounts=$('#edAmounts');if(amounts){amounts.replaceChildren();const u=(()=>{try{return JSON.parse(localStorage.getItem('users')||'[]').find(x=>x?.email===localStorage.getItem('currentUser'))||null}catch{return null}})();const p=Number(prices()[k]||0),max=Math.min(10,p?Math.floor(Number(u?.balance)||0/p):0);const actualMax=p?Math.min(10,Math.floor((Number(u?.balance)||0)/p)):0;for(let i=1;i<=actualMax;i++){const b=document.createElement('button');b.type='button';b.className='amount'+(i===1?' active':'');b.textContent=i;b.addEventListener('click',()=>{if(engine.state.busy)return;$$('#edAmounts .amount').forEach(x=>x.classList.remove('active'));b.classList.add('active')});amounts.appendChild(b)}if(!actualMax)amounts.innerHTML='<span class="muted">Недостаточно средств</span>'}
  const cost=$('#edOpenCost');if(cost)cost.textContent=money(Number(prices()[k]||0));
  const items=$('#edCaseItems');if(items){items.replaceChildren();for(const it of data){const el=document.createElement('div');el.className='preview-item';el.style.setProperty('--rarity',rarity[it?.rarity]||rarity.common);el.innerHTML=`<strong>${it?.emoji||'📦'}</strong><span>${it?.rarity||''}</span><small>${money(value(it))}</small>`;items.appendChild(el)}}
  const reels=$('#edReels');if(reels)reels.replaceChildren();
  const open=$('#edOpen');if(open){const balance=(()=>{try{return Number(JSON.parse(localStorage.getItem('users')||'[]').find(x=>x?.email===localStorage.getItem('currentUser'))?.balance)||0}catch{return 0}})();open.disabled=!prices()[k]||balance<Number(prices()[k]||0)}
  modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-lock');return true;
}
function bind(){
  css();
  document.addEventListener('click',e=>{const card=e.target?.closest?.('.case-card[data-ed-case]');if(!card)return;const k=card.dataset.edCase;if(!k)return;e.preventDefault();e.stopImmediatePropagation();renderCase(k)},true);
  const fast=()=>{const b=$('#edFast');if(!b||b.dataset.edRecovery==='1')return;b.dataset.edRecovery='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();b.classList.toggle('active');b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false')},true)};
  fast();
  new MutationObserver(fast).observe(document.body,{childList:true,subtree:true});
  window.__emojiDropsFinalUI={version:1,caseRecovery:true,iosGlass:true,qa:()=>({caseButtons:$$('.case-card[data-ed-case]').length,openButton:!!$('#edOpen'),live:!!$('.live-section'),online:!!document.querySelector('.online-dot'),profile:!!$('.profile-top')})};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
