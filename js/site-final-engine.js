(()=>{'use strict';
/* Emoji Drops — final presentation engine.
   One small, last-loaded layer. It does not replace game state or invent results. */
const root=document.documentElement;
const qs=(s,r=document)=>r.querySelector(s);
const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const money=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;

function installStyle(){
 if(qs('#ed-final-engine-style'))return;
 const s=document.createElement('style');s.id='ed-final-engine-style';
 s.textContent=`
html{width:100%;min-width:0;overflow-x:hidden}body{width:100%;min-width:0;overflow-x:hidden}
/* One source of truth for the public layout */
.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(12px,1.35vw,22px)!important;box-sizing:border-box!important}
.case-tile,.case-card{min-width:0;box-sizing:border-box}
.case-card{transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s ease,filter .28s ease!important}
@media (hover:hover){.case-card:hover{transform:translateY(-4px)!important}.case-card:active{transform:translateY(-1px) scale(.992)!important}}
.home-divider,.ed-home-divider{display:block!important;height:2px!important;width:100%!important;opacity:1!important;position:relative!important;top:-3px!important;margin:0 0 clamp(22px,2.2vw,30px)!important;background:linear-gradient(90deg,transparent 0,#ff7b00 6%,#ff7b00 94%,transparent 100%)!important;box-shadow:0 0 16px rgba(255,123,0,.18)!important}
/* Live Drops: offset like content, then all the way to viewport edge */
.live-section{left:clamp(12px,2vw,36px)!important;right:0!important;width:auto!important;max-width:none!important;margin-right:0!important;transform:none!important;box-sizing:border-box!important}
.live-section .live-container,.live-container{width:100%!important;max-width:none!important;margin-right:0!important;box-sizing:border-box!important}
/* Long, light animations */
.case-reel-track,.reel-track{will-change:transform;backface-visibility:hidden;transform:translate3d(0,0,0)}
.case-reel-track.ed-opening,.reel-track.ed-opening{transition-property:transform!important;transition-duration:7.8s!important;transition-timing-function:cubic-bezier(.08,.72,.08,1)!important}
.upgrade-wheel{will-change:transform;backface-visibility:hidden;transform:translateZ(0)}
.ed-upgrade-pointer{will-change:transform;backface-visibility:hidden;transform-origin:50% 88%!important}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:7.2s!important;animation-timing-function:cubic-bezier(.08,.72,.08,1)!important}
/* Don't let fixed overlays steal the profile */
body:has(.profile-page.active) .live-section,body:has(.profile.active) .live-section,body:has([data-page="profile"].active) .live-section{display:none!important}
/* Profile motion without expensive filters */
.profile-card,.profile-stat,.profile-item,.profile-section{transition:transform .24s ease,opacity .24s ease,box-shadow .24s ease!important}
@media (hover:hover){.profile-card:hover,.profile-stat:hover{transform:translateY(-2px)}}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:600px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.case-card{min-height:0!important}.live-section{left:12px!important;right:0!important}.case-reel-track.ed-opening,.reel-track.ed-opening{transition-duration:7s!important}.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.6s!important}}
@media(max-width:360px){.cases{gap:7px!important}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
`;
 document.head.appendChild(s);
}

function removeBestDropSellAll(){
 const candidates=qsa('button,[role="button"],a');
 for(const el of candidates){
  const text=(el.textContent||'').trim().toLowerCase();
  if(!/продать\s*все|sell\s*all/.test(text))continue;
  const section=el.closest('.best-drop,.bestDrop,.best-item,.profile-best-drop,[data-best-drop],.drop-result');
  if(section)el.remove();
 }
}

function refreshCaseButtons(){
 const balanceSelectors=['#balance','.balance','.user-balance','.header-balance','[data-balance]'];
 let balance=0;for(const s of balanceSelectors){const e=qs(s);if(e){balance=money(e.dataset.balance||e.textContent);if(balance)break}}
 if(!Number.isFinite(balance))return;
 qsa('.case-card,.case-tile,[data-case-price]').forEach(card=>{
  const price=money(card.dataset.price||card.dataset.casePrice||qs('[data-price],.case-price,.price',card)?.textContent);
  if(price<=0)return;
  const disabled=balance+1e-9<price;
  const button=qs('button,[role="button"]',card);
  if(button){button.disabled=disabled;button.setAttribute('aria-disabled',String(disabled));button.classList.toggle('is-disabled',disabled)}
  card.classList.toggle('is-locked',disabled);
 });
}

function markOpening(track){track.classList.add('ed-opening');setTimeout(()=>track.classList.remove('ed-opening'),8500)}
function observeOpening(){
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-case-open],.open-case,.case-open,.case-card button');
  if(!trigger)return;
  const modal=qs('.case-modal,#caseModal,.case-opening,.opening-modal');
  if(!modal)return;
  const track=qs('.case-reel-track,.reel-track,.case-reel-track',modal);
  if(track)markOpening(track);
 },true);
}
function performance(){
 root.style.setProperty('--ed-motion-scale',matchMedia('(prefers-reduced-motion: reduce)').matches?'0':'1');
}
function boot(){installStyle();removeBestDropSellAll();refreshCaseButtons();observeOpening();performance();
 const schedule=()=>{if(document.hidden)return;removeBestDropSellAll();refreshCaseButtons()};
 window.addEventListener('focus',schedule,{passive:true});window.addEventListener('pageshow',schedule,{passive:true});
 document.addEventListener('visibilitychange',schedule,{passive:true});
 window.addEventListener('emoji-drops-balance-change',schedule);
 window.addEventListener('emoji-drops-state-change',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();