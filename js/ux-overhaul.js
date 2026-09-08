(()=>{'use strict';
/* Emoji Drops UX overhaul — visual layer only. Never decides rewards or money. */
const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}};
const lowEnd=()=>{try{return Number(navigator.hardwareConcurrency||4)<=2||Number(navigator.deviceMemory||4)<=2||navigator.connection?.saveData===true}catch{return false}};
function css(){if(document.getElementById('edUxOverhaul'))return;const s=document.createElement('style');s.id='edUxOverhaul';s.textContent=`
:root{--ed-orange:#ff7b00;--ed-orange2:#ff9a2e;--ed-surface:#121212;--ed-line:#292929}
html{scroll-behavior:smooth;overscroll-behavior-y:none}body{-webkit-tap-highlight-color:transparent;padding-bottom:env(safe-area-inset-bottom)}
header{padding-top:env(safe-area-inset-top);height:calc(76px + env(safe-area-inset-top));transition:background .25s ease,box-shadow .25s ease}
header.ed-scrolled{background:rgba(10,10,10,.97);box-shadow:0 8px 30px rgba(0,0,0,.25)}
.case-card,.profile-top,.profile-btn,.top-pill,.primary,.secondary,.reward-btn,.close,.amount,.upgrade-mult,.inventory-item,.upgrade-target{touch-action:manipulation;-webkit-user-select:none;user-select:none}
.case-card{transform:translateZ(0);backface-visibility:hidden}.case-card:active{transform:translateY(-1px) scale(.985)}
.case-card:hover .case-art{transform:translate3d(0,-3px,0) scale(1.035)}.case-art{transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.primary,.secondary,.reward-btn,.profile-top,.profile-btn,.amount,.upgrade-mult,.close,.inventory-item button{transition:transform .16s ease,border-color .18s ease,background-color .18s ease,box-shadow .18s ease}.primary:active,.secondary:active,.reward-btn:active,.profile-top:active,.profile-btn:active,.amount:active,.upgrade-mult:active,.close:active{transform:scale(.97)}
.live-container{scrollbar-width:none;scroll-snap-type:x proximity}.live-container::-webkit-scrollbar{display:none}.live-drop{scroll-snap-align:start;will-change:transform,opacity}
#onlineCount{display:inline-flex;align-items:center;gap:6px}.ed-online-dot{width:7px;height:7px;border-radius:50%;background:#54e36e;box-shadow:0 0 0 0 rgba(84,227,110,.55);animation:edOnlinePulse 1.7s ease-out infinite}.ed-online-dot.ed-dim{animation:none;opacity:.65}@keyframes edOnlinePulse{0%{box-shadow:0 0 0 0 rgba(84,227,110,.55);transform:scale(.9)}55%{box-shadow:0 0 0 7px rgba(84,227,110,0);transform:scale(1)}100%{box-shadow:0 0 0 0 rgba(84,227,110,0);transform:scale(.9)}}
.modal.show{animation:edModalIn .2s ease both}.modal.show .panel{animation:edPanelIn .24s cubic-bezier(.2,.8,.2,1) both}@keyframes edModalIn{from{opacity:0}to{opacity:1}}@keyframes edPanelIn{from{opacity:0;transform:translate3d(0,14px,0) scale(.985)}to{opacity:1;transform:none}}
.case-reel{contain:layout paint}.case-reel-track{transform:translate3d(0,0,0)}
.upgrade-arrow{will-change:transform}.upgrade-arrow.ed-spin{animation:edUpgradeSpin 1.15s cubic-bezier(.12,.72,.08,1)}@keyframes edUpgradeSpin{0%{transform:rotate(0)}75%{transform:rotate(500deg)}100%{transform:rotate(540deg)}}
.ed-focus-ring:focus-visible{outline:2px solid var(--ed-orange2);outline-offset:3px}
@media(max-width:700px){main{padding:16px 14px calc(92px + env(safe-area-inset-bottom))}.section-title{margin-top:14px}.cases{gap:10px}.case-card{min-height:224px;height:224px;border-radius:20px;padding:14px 10px 12px}.case-art{font-size:58px;height:92px}.case-name{font-size:18px}.case-meta{font-size:12px}.case-price span{font-size:18px}.live-section{margin-top:18px}.live-container{padding-bottom:7px}.live-drop{flex-basis:148px;height:58px}.panel{width:min(94vw,920px);border-radius:22px;max-height:calc(92vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))}.panel-body{padding:16px}.case-reel{height:102px}.reel-item{flex-basis:78px;height:78px}.reel-item strong{font-size:30px}.upgrade-panel{gap:10px}.upgrade-slot{min-height:145px}.u-emoji{font-size:56px}.upgrade-arrow{width:70px;height:70px}}
@media(max-width:360px){header{padding-left:10px;padding-right:10px}.top-right{gap:5px}.top-pill{padding:8px 9px}.profile-top{padding:8px 10px}.cases{gap:8px}.case-card{min-height:212px;height:212px}.case-art{font-size:52px;height:84px}.case-name{font-size:16px}.case-price span{font-size:16px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.ed-online-dot{animation:none!important;box-shadow:none!important}}
@media(max-width:700px) and (orientation:landscape){.case-card{min-height:190px;height:190px}.case-art{height:72px;font-size:48px}}
`;document.head.appendChild(s)}
function online(){const e=document.getElementById('onlineCount');if(!e)return;if(!e.querySelector('.ed-online-dot')){const d=document.createElement('span');d.className='ed-online-dot';d.setAttribute('aria-hidden','true');e.prepend(d)}const base=Number((e.textContent||'').replace(/[^0-9]/g,''));if(Number.isFinite(base)&&base>0){let last=base;setInterval(()=>{const n=Math.max(100,last+Math.floor(Math.random()*5)-2);last=n;e.lastChild.nodeType===3?e.lastChild.nodeValue=' '+n:e.appendChild(document.createTextNode(' '+n))},6500)}}
function scrollHeader(){const h=document.querySelector('header');if(!h)return;const fn=()=>h.classList.toggle('ed-scrolled',scrollY>8);fn();addEventListener('scroll',fn,{passive:true})}
function focus(){document.querySelectorAll('button').forEach(b=>b.classList.add('ed-focus-ring'))}
function boot(){css();online();scrollHeader();focus();window.__emojiDropsUX={version:1,reduced:reduced(),lowEnd:lowEnd(),ready:true}}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
