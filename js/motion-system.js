(()=>{'use strict';
/* Emoji Drops — shared motion + UI polish. Visual-only: never changes economy or player state. */
const STYLE='ed-motion-system';
const reduced=()=>window.__emojiDropsPerf?.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
function inject(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
.ed-motion,.case-card,.top-pill,.profile-top,.profile-btn,.primary,.secondary,.amount,.close,.reward-btn,.inventory-item,.preview-item,.best,.stat{transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s ease,border-color .22s ease,box-shadow .22s ease,background-color .22s ease!important}
.case-card:active,.primary:not(:disabled):active,.secondary:not(:disabled):active,.profile-btn:not(:disabled):active,.amount:not(:disabled):active,.close:not(:disabled):active{transform:scale(.975)!important}
.case-card:hover{transform:translateY(-6px) scale(1.008)}
.primary:not(:disabled):hover,.reward-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(255,123,0,.18)}
.secondary:not(:disabled):hover,.profile-btn:not(:disabled):hover,.close:not(:disabled):hover{transform:translateY(-2px)}
.case-card:focus-visible,.primary:focus-visible,.secondary:focus-visible,.profile-btn:focus-visible,.amount:focus-visible,.close:focus-visible{outline:2px solid #ff9a2e;outline-offset:3px}
.modal.show{animation:edModalIn .2s ease both}.modal.show .panel{animation:edPanelIn .28s cubic-bezier(.2,.85,.2,1) both}
@keyframes edModalIn{from{opacity:0}to{opacity:1}}@keyframes edPanelIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
.live-drop{animation:edLiveIn .45s cubic-bezier(.2,.85,.2,1) both}.live-drop:nth-child(2){animation-delay:.025s}.live-drop:nth-child(3){animation-delay:.05s}
@keyframes edLiveIn{from{opacity:0;transform:translateX(-22px) scale(.96)}to{opacity:1;transform:none}}
.ed-final-item{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease!important}.ed-final-item:hover{transform:translateY(-2px);filter:brightness(1.08)}
.ed-final-win{animation:edWinIn .35s cubic-bezier(.2,.85,.2,1) both}.ed-final-win:nth-child(2){animation-delay:.035s}.ed-final-win:nth-child(3){animation-delay:.07s}.ed-final-win:nth-child(4){animation-delay:.105s}.ed-final-win:nth-child(5){animation-delay:.14s}.ed-final-win:nth-child(6){animation-delay:.175s}
@keyframes edWinIn{from{opacity:0;transform:translateY(9px) scale(.97)}to{opacity:1;transform:none}}
.ed-final-item-btn.selected{animation:edSelected .22s ease both}@keyframes edSelected{from{transform:scale(.96)}to{transform:scale(1)}}
.ed-final-wheel-circle.ed-upgrade-spin{animation:edUpgradeSpin .82s cubic-bezier(.18,.82,.2,1) both}.ed-final-wheel-circle.ed-upgrade-win{animation:edUpgradeWin .5s cubic-bezier(.2,.9,.2,1) both}.ed-final-wheel-circle.ed-upgrade-lose{animation:edUpgradeLose .48s ease both}
@keyframes edUpgradeSpin{0%{transform:rotate(0) scale(.94);filter:brightness(1)}55%{transform:rotate(250deg) scale(1.07);filter:brightness(1.25)}100%{transform:rotate(720deg) scale(1);filter:brightness(1)}}
@keyframes edUpgradeWin{0%{transform:scale(.86);filter:brightness(1)}55%{transform:scale(1.13);filter:brightness(1.45)}100%{transform:scale(1);filter:brightness(1)}}
@keyframes edUpgradeLose{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.ed-final-marker{animation:edMarkerPulse 1.1s ease-in-out infinite}@keyframes edMarkerPulse{0%,100%{opacity:.82}50%{opacity:1;filter:brightness(1.25)}}
.live-section{position:fixed!important;left:50%!important;bottom:10px!important;transform:translateX(-50%)!important;width:min(1240px,calc(100vw - 24px))!important;margin:0!important;z-index:40!important;padding:0!important}
.live-title{display:none!important}
.live-container{padding:4px 2px 4px!important;min-height:70px!important;align-items:center!important;border-radius:18px;background:rgba(10,10,10,.78);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid #292929;box-shadow:0 10px 35px #0008}
body:has(.modal.show) .live-section{display:none!important}
.online-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;box-shadow:0 0 8px #ef4444;vertical-align:middle;margin-right:5px;animation:edOnlineBlink 1.1s ease-in-out infinite}
@keyframes edOnlineBlink{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
.open-cost{display:none!important}
.ed-final-actions{margin-top:0!important;margin-bottom:14px!important}
.ed-final-actions button{min-height:46px}
header{min-width:0}.logo{flex:0 1 auto;white-space:nowrap;min-width:0}.top-right{min-width:0;flex:0 1 auto;white-space:nowrap}.top-pill,.profile-top{white-space:nowrap}
@media(max-width:700px){header{padding:0 10px!important;gap:6px}.logo{font-size:21px!important}.top-right{gap:5px!important}.top-pill{padding:8px 8px!important;font-size:13px}.profile-top{padding:8px 9px!important;font-size:13px}.live-section{bottom:8px!important;width:calc(100vw - 16px)!important}.live-container{gap:8px!important;min-height:66px!important}.live-drop{flex-basis:150px!important;height:58px!important}.live-emoji{width:38px!important;height:38px!important;font-size:23px!important}}
@media(max-width:360px){.logo{font-size:19px!important}.top-pill{padding:7px 6px!important;font-size:12px}.profile-top{padding:7px!important;font-size:12px}.top-right{gap:3px!important}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}.modal.show,.modal.show .panel{animation:none!important}}
`;
document.head.appendChild(s)}
function patchOnline(){const n=document.getElementById('onlineCount');if(!n)return;const host=n.parentElement;if(!host||host.dataset.edOnlinePatched==='1')return;host.innerHTML=`<span class="online-dot" aria-hidden="true"></span><span id="onlineCount">${n.textContent||'128'}</span> online`;host.dataset.edOnlinePatched='1'}
function patchCaseModal(){const modal=document.getElementById('edOpenModal');if(!modal)return;const body=modal.querySelector('.panel-body');const actions=modal.querySelector('.ed-final-actions');const items=modal.querySelector('#edCaseItems');if(body&&actions&&items&&items.previousElementSibling!==actions)body.insertBefore(actions,items);const cost=modal.querySelector('.open-cost');if(cost)cost.remove()}
function patch(){inject();patchOnline();patchCaseModal()}
function observe(){patch();const mo=new MutationObserver(()=>patch());mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('pagehide',()=>mo.disconnect(),{once:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.__emojiDropsMotion={version:3,reduced:reduced(),visualOnly:true};
})();
