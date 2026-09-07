(()=>{'use strict';
/* Emoji Drops — shared motion system. Visual-only: never changes economy or player state. */
const STYLE='ed-motion-system';
const reduced=()=>window.__emojiDropsPerf?.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
function inject(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
.ed-motion,.case-card,.top-pill,.profile-top,.profile-btn,.primary,.secondary,.amount,.close,.reward-btn,.case-card,.inventory-item,.preview-item,.best,.stat{transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s ease,border-color .22s ease,box-shadow .22s ease,background-color .22s ease!important}
.case-card:active,.primary:not(:disabled):active,.secondary:not(:disabled):active,.profile-btn:not(:disabled):active,.amount:not(:disabled):active,.close:not(:disabled):active{transform:scale(.975)!important}
.case-card:hover{transform:translateY(-6px) scale(1.008)}
.primary:not(:disabled):hover,.reward-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(255,123,0,.18)}
.secondary:not(:disabled):hover,.profile-btn:not(:disabled):hover,.close:not(:disabled):hover{transform:translateY(-2px)}
.case-card:focus-visible,.primary:focus-visible,.secondary:focus-visible,.profile-btn:focus-visible,.amount:focus-visible,.close:focus-visible,.case-card:focus-visible{outline:2px solid #ff9a2e;outline-offset:3px}
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
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}.modal.show,.modal.show .panel{animation:none!important}}
`;document.head.appendChild(s)}
function observe(){inject();const io=new IntersectionObserver(es=>{if(reduced())return;for(const e of es)if(e.isIntersecting){e.target.classList.add('ed-motion-visible');io.unobserve(e.target)}},{threshold:.08});document.querySelectorAll('.case-card,.live-drop').forEach(x=>io.observe(x));window.addEventListener('pagehide',()=>io.disconnect(),{once:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.__emojiDropsMotion={version:1,reduced:reduced(),visualOnly:true};
})();
