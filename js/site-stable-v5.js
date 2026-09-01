(()=>{'use strict';
/* Emoji Drops — final UI/gameplay guard. No duplicate renderers. */
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
const style=()=>{if(q('#ed-stable-v5'))return;const s=document.createElement('style');s.id='ed-stable-v5';s.textContent=`
/* ONE responsive grid */
html,body{width:100%;max-width:100%;overflow-x:hidden}
main,.main{width:100%!important;max-width:none!important;margin-inline:0!important;padding-left:clamp(12px,2vw,36px)!important;padding-right:clamp(12px,2vw,36px)!important;box-sizing:border-box!important}
.cases,#cases{display:grid!important;width:100%!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.35vw,22px)!important}
.case-tile{min-width:0!important}.case-tile .case-card{width:100%!important;min-width:0!important;height:clamp(245px,19vw,330px)!important;min-height:0!important;box-sizing:border-box!important;contain:layout paint;backface-visibility:hidden;transition:transform .24s cubic-bezier(.2,.8,.2,1),box-shadow .24s ease,border-color .24s ease!important}
@media(hover:hover){.case-tile .case-card:hover{transform:translate3d(0,-4px,0)!important}.case-tile .case-card:active{transform:translate3d(0,-1px,0) scale(.995)!important}}
/* home divider */
.home-divider,.ed-home-divider{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:2px!important;position:relative!important;top:-1px!important;margin:0 0 20px!important;background:linear-gradient(90deg,transparent,#ff7b00 7%,#ff9a2e 50%,#ff7b00 93%,transparent)!important;border:0!important;border-radius:999px!important;box-shadow:0 0 14px #ff7b0040!important}
/* live drops: only home, full remaining width */
.live-section{position:fixed!important;left:clamp(12px,2vw,36px)!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;z-index:900!important;box-sizing:border-box!important;padding-right:0!important}
.live-section .live-container{width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
body:has(#profileModal.show) .live-section,body:has(.profile-modal.show) .live-section,body:has(.modal.profile.show) .live-section{display:none!important}
/* never show live drops over other modal/game screens */
body:has(.modal.show) .live-section{display:none!important}
/* best drop */
.best-wrap .best button,.best-wrap .best .remove-all,.best-wrap .best [data-action*=remove],.best-wrap .best [data-action*=clear]{display:none!important}.best-wrap .best{overflow:visible!important}
/* case reel: long, GPU-friendly */
.case-reel-track,.reel-track{backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;will-change:transform;transform:translate3d(0,0,0)}
.case-reel-track.ed-opening,.reel-track.ed-opening{transition-property:transform!important;transition-duration:7.8s!important;transition-timing-function:cubic-bezier(.075,.72,.08,1)!important}
/* ONE upgrade wheel: use existing DOM, never create another */
.upgrade-wheel-wrap{position:relative!important;width:min(270px,72vw)!important;height:min(270px,72vw)!important;margin:auto!important;display:grid!important;place-items:center!important;contain:layout paint!important}
.upgrade-wheel{width:100%!important;height:100%!important;border-radius:50%!important;border:7px solid #222!important;overflow:hidden!important;position:relative!important;box-shadow:0 0 0 2px #ff7b0045,0 16px 50px #000b,inset 0 0 35px #000!important;will-change:transform!important;transform-origin:center!important;transition:transform 7.2s cubic-bezier(.07,.74,.08,1)!important;background:conic-gradient(from -90deg,#35d98a 0deg var(--ed-win,0deg),#242428 var(--ed-win,0deg) 360deg)!important}
.upgrade-wheel:before{content:'';position:absolute;inset:13px;border-radius:50%;background:repeating-conic-gradient(#ffffff18 0deg 1deg,transparent 1deg 12deg);mask:radial-gradient(circle,transparent 0 69%,#000 70%);pointer-events:none}
.upgrade-wheel:after{content:'';position:absolute;inset:25%;border-radius:50%;background:#0d0d0d;border:2px solid #ff9a2e;box-shadow:0 0 25px #ff7b0055;pointer-events:none}
.upgrade-pointer{position:absolute!important;z-index:10!important;left:50%!important;top:-10px!important;transform:translateX(-50%)!important;width:0!important;height:0!important;border-left:14px solid transparent!important;border-right:14px solid transparent!important;border-top:27px solid #ff9a2e!important;filter:drop-shadow(0 0 9px #ff7b00)!important;pointer-events:none!important}
.upgrade-pointer.ed-spin{animation:edPointerSpin 7.2s cubic-bezier(.07,.74,.08,1) forwards!important}
@keyframes edPointerSpin{from{transform:translateX(-50%) rotate(0deg)}12%{transform:translateX(-50%) rotate(110deg)}70%{transform:translateX(-50%) rotate(650deg)}100%{transform:translateX(-50%) rotate(720deg)}}
.upgrade-wheel .wheel-center{position:absolute!important;z-index:4!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:76px!important;height:76px!important;border-radius:50%!important;background:#0d0d0d!important;border:2px solid #ff9a2e!important;color:#ff9a2e!important;display:grid!important;place-items:center!important;font-size:22px!important;font-weight:950!important;box-shadow:0 0 0 5px #111,0 0 26px #ff7b0055!important}
/* valid upgrade targets only */
.upgrade-target.ed-invalid{display:none!important}.upgrade-target[aria-disabled=true]{pointer-events:none!important;opacity:.38!important;filter:grayscale(.6)!important}
/* smooth UI */
button,.case-card,.inventory-item,.profile-stat,.profile-btn,.upgrade-item,.upgrade-target,.top-pill{transition:transform .2s cubic-bezier(.2,.8,.2,1),border-color .2s ease,box-shadow .2s ease,background-color .2s ease,opacity .2s ease!important}
button:active{transform:translateY(1px) scale(.99)}button:disabled{cursor:not-allowed!important;opacity:.5!important}
@media(max-width:1100px){.cases,#cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}.case-tile .case-card{height:290px!important}.upgrade-panel{grid-template-columns:1fr!important}.upgrade-arrow{margin:auto!important}}
@media(max-width:600px){main,.main{padding-left:10px!important;padding-right:10px!important}.cases,#cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.case-tile .case-card{height:245px!important;border-radius:18px!important}.live-section{left:10px!important}.upgrade-wheel-wrap{width:min(235px,76vw)!important;height:min(235px,76vw)!important}.upgrade-wheel{transition-duration:6.8s!important}.upgrade-pointer.ed-spin{animation-duration:6.8s!important}.upgrade-wheel .wheel-center{width:64px!important;height:64px!important;font-size:18px!important}}
@media(max-width:360px){.cases,#cases{gap:6px!important}.case-tile .case-card{height:220px!important}.upgrade-wheel-wrap{width:210px!important;height:210px!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important}.case-card,.inventory-item,.profile-stat,.profile-btn,.upgrade-wheel,.upgrade-pointer{animation:none!important;transition:none!important}}
`;document.head.appendChild(s)};
function targets(){const root=q('#upgradeModal')||q('.upgrade-runtime')?.closest('.panel')||q('.upgrade-modal');if(!root)return;const src=root.querySelector('.upgrade-item.selected,[data-upgrade-source]');if(!src)return;const sv=money(src.dataset?.price||src.dataset?.value||src.textContent);const mEl=root.querySelector('.upgrade-mult.active,[data-multiplier].active');const m=money(mEl?.dataset?.multiplier||mEl?.dataset?.mult||mEl?.textContent)||2;const max=sv*m;qa('.upgrade-target',root).forEach(t=>{const v=money(t.dataset?.price||t.dataset?.value||t.textContent);const ok=v>sv&&v<=max+1e-9;t.classList.toggle('ed-invalid',!ok);t.setAttribute('aria-disabled',String(!ok));if(!ok)t.classList.remove('selected')});const selected=root.querySelector('.upgrade-target.selected');const tv=money(selected?.dataset?.price||selected?.dataset?.value||selected?.textContent);const chance=sv&&tv>sv?Math.min(95,(sv/tv)*95):0;const wheel=root.querySelector('.upgrade-wheel');if(wheel){wheel.style.setProperty('--ed-win',(chance*3.6)+'deg');const center=wheel.querySelector('.wheel-center');if(center)center.textContent=chance?`${chance.toFixed(chance<10?1:0)}%`:'0%';}}
function bind(){document.addEventListener('click',e=>{const bad=e.target.closest('.upgrade-target.ed-invalid');if(bad){e.preventDefault();e.stopImmediatePropagation();return}if(e.target.closest('.upgrade-item,.upgrade-target,.upgrade-mult,[data-multiplier]'))requestAnimationFrame(targets);},true);window.addEventListener('resize',()=>requestAnimationFrame(targets),{passive:true});window.addEventListener('emoji-drops-state-change',()=>requestAnimationFrame(targets));window.addEventListener('storage',()=>requestAnimationFrame(targets));}
style();bind();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',targets,{once:true});else targets();
})();
