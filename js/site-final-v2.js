(()=>{'use strict';
/* Emoji Drops — consolidated presentation/animation guard. Last-loaded. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
const style=document.createElement('style');style.id='ed-final-v2-style';style.textContent=`
html,body{width:100%;min-width:0;overflow-x:hidden}
main{width:100%!important;max-width:none!important;box-sizing:border-box!important;margin-left:0!important;margin-right:0!important}
.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(12px,1.35vw,24px)!important;box-sizing:border-box!important}
.case-tile,.case-card{min-width:0!important;box-sizing:border-box!important}
.case-tile .case-card{width:100%!important;height:clamp(250px,22vw,340px)!important;min-height:0!important}
.case-card{transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s ease,filter .28s ease!important}
@media(hover:hover){.case-card:hover{transform:translate3d(0,-4px,0)!important}.case-card:active{transform:scale(.992)!important}}
.home-divider,.ed-home-divider{display:block!important;visibility:visible!important;opacity:1!important;height:2px!important;width:100%!important;position:relative!important;top:-3px!important;margin:0 0 clamp(20px,2vw,28px)!important;background:#ff7b00!important;box-shadow:0 0 14px rgba(255,123,0,.22)!important}
.live-section{position:fixed!important;left:clamp(12px,2vw,36px)!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;box-sizing:border-box!important}
.live-section .live-container,.live-container{width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
.case-reel-track,.reel-track{will-change:transform!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;transform:translate3d(0,0,0);transition-property:transform!important;transition-duration:7.8s!important;transition-timing-function:cubic-bezier(.08,.72,.08,1)!important}
.upgrade-wheel{will-change:transform!important;backface-visibility:hidden!important;transform:translateZ(0)}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:7.2s!important;animation-timing-function:cubic-bezier(.08,.72,.08,1)!important;will-change:transform}
body:has(.profile-page.active) .live-section,body:has(.profile.active) .live-section,body:has([data-page="profile"].active) .live-section{display:none!important}
.profile-card,.profile-stat,.profile-item,.profile-section{transition:transform .24s ease,opacity .24s ease,box-shadow .24s ease!important}
@media(hover:hover){.profile-card:hover,.profile-stat:hover{transform:translateY(-2px)!important}}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}.case-tile .case-card{height:290px!important}}
@media(max-width:600px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.case-tile .case-card{height:245px!important}.live-section{left:12px!important;right:0!important}.case-reel-track,.reel-track{transition-duration:7s!important}.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.8s!important}.upgrade-runtime{grid-template-columns:1fr!important}.upgrade-wheel-wrap{width:190px!important;height:190px!important}.upgrade-wheel{width:180px!important;height:180px!important}}
@media(max-width:360px){.cases{gap:7px!important}.case-tile .case-card{height:225px!important}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
/* Neutralize the two legacy rules that were overriding the responsive layout. */
.ed-ios .cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.ed-ios .case-tile .case-card{height:245px!important;min-height:0!important}.ed-ios main{max-width:none!important;width:100%!important;padding-left:clamp(12px,2vw,36px)!important;padding-right:clamp(12px,2vw,36px)!important}
`;
document.head.appendChild(style);
function removeBestSell(){for(const el of $$('button,[role="button"],a')){if(!/^(продать\s*все|sell\s*all)$/i.test((el.textContent||'').trim()))continue;const box=el.closest('.best-drop,.bestDrop,.best-item,[data-best-drop],.drop-result,.best-wrap');if(box)el.remove()}}
function balance(){for(const s of ['#balance','.balance','.user-balance','.header-balance','[data-balance]']){const e=$(s);if(e){const n=money(e.dataset.balance||e.textContent);if(n||n===0)return n}}return NaN}
function syncCases(){const b=balance();if(!Number.isFinite(b))return;$$('.case-card,.case-tile,[data-case-price]').forEach(card=>{const p=money(card.dataset.price||card.dataset.casePrice||$('[data-price],.case-price,.price',card)?.textContent);if(p<=0)return;const dis=b+1e-9<p;const btn=$('button,[role="button"]',card);if(btn){btn.disabled=dis;btn.setAttribute('aria-disabled',String(dis));btn.classList.toggle('is-disabled',dis)}card.classList.toggle('is-locked',dis)})}
function markReel(){for(const t of $$('.case-reel-track,.reel-track')){t.classList.add('ed-opening');t.style.setProperty('transition-duration','7.8s','important');setTimeout(()=>t.classList.remove('ed-opening'),8200)}}
function bind(){document.addEventListener('click',e=>{const trigger=e.target.closest('.case-card button,.case-card,[data-case-open],.open-case,.case-open');if(trigger){requestAnimationFrame(markReel)}},true);window.addEventListener('emoji-drops-balance-change',syncCases);window.addEventListener('emoji-drops-state-change',syncCases);window.addEventListener('focus',syncCases,{passive:true});window.addEventListener('pageshow',syncCases,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){removeBestSell();syncCases()}},{passive:true});setInterval(()=>{if(!document.hidden){removeBestSell();syncCases()}},1500)}
function boot(){removeBestSell();syncCases();bind();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();