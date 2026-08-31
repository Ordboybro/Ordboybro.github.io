(()=>{'use strict';
/* Emoji Drops — final motion system. Adds consistent, performant micro/macro animations without changing gameplay. */
if(window.__edAnimationFinal)return;window.__edAnimationFinal=true;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const style=document.createElement('style');style.id='ed-animation-final-style';style.textContent=`
:root{--ed-ease:cubic-bezier(.22,1,.36,1);--ed-spring:cubic-bezier(.16,1,.3,1)}
@keyframes edReveal{from{opacity:0;transform:translateY(18px) scale(.985);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes edPop{0%{opacity:0;transform:scale(.82)}70%{transform:scale(1.035)}100%{opacity:1;transform:scale(1)}}
@keyframes edDrop{0%{opacity:0;transform:translateY(-16px) scale(.94)}100%{opacity:1;transform:none}}
@keyframes edToast{0%{opacity:0;transform:translateY(12px) scale(.96)}12%,82%{opacity:1;transform:none}100%{opacity:0;transform:translateY(8px) scale(.98)}}
@keyframes edWin{0%{transform:scale(.75) rotate(-2deg);opacity:0;filter:brightness(.7)}55%{transform:scale(1.06) rotate(1deg);opacity:1;filter:brightness(1.25)}100%{transform:scale(1) rotate(0);filter:none}}
@keyframes edShine{0%{transform:translateX(-120%) rotate(12deg);opacity:0}20%{opacity:.35}55%,100%{transform:translateX(120%) rotate(12deg);opacity:0}}
@keyframes edBalance{0%{transform:scale(1)}35%{transform:scale(1.08)}100%{transform:scale(1)}}
@keyframes edShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.ed-reveal{animation:edReveal .52s var(--ed-ease) both}.ed-pop{animation:edPop .42s var(--ed-spring) both}.ed-drop{animation:edDrop .4s var(--ed-ease) both}.ed-win{animation:edWin .62s var(--ed-spring) both}.ed-balance{animation:edBalance .42s var(--ed-spring)}.ed-shake{animation:edShake .3s ease}.ed-shine{position:relative;overflow:hidden}.ed-shine:after{content:'';position:absolute;z-index:20;top:-40%;bottom:-40%;left:0;width:24%;background:linear-gradient(90deg,transparent,#ffffff22,transparent);transform:translateX(-120%) rotate(12deg);pointer-events:none}.ed-shine.ed-shine-run:after{animation:edShine .75s ease-out both}
.case-card,.inventory-item,.profile-stat,.stat,.upgrade-item,.live-drop,.best,.setting{will-change:transform,opacity}.case-card:hover{transform:translateY(-6px) scale(1.012)!important}.case-art{transition:transform .45s var(--ed-ease),filter .45s var(--ed-ease)}.case-card:hover .case-art{transform:translateY(-3px) scale(1.07) rotate(-1deg);filter:drop-shadow(0 14px 26px #000)}
button,.profile-top,.close{transition:transform .2s var(--ed-spring),border-color .2s ease,box-shadow .2s ease,background-color .2s ease,filter .2s ease!important}.primary:hover,.reward-btn:hover{box-shadow:0 10px 28px #ff7b0030!important;filter:brightness(1.06)}button:focus-visible{transition:none!important}
.modal{transition:background-color .25s ease,backdrop-filter .25s ease}.modal:not(.show){pointer-events:none}.modal.show .panel{animation:edReveal .32s var(--ed-ease) both}.panel{transform-origin:center}.win-card .emoji{animation:edWin .65s var(--ed-spring) both}.win-card{animation:edPop .5s var(--ed-spring) both}.live-drop{transition:transform .28s var(--ed-spring),box-shadow .28s ease,filter .28s ease!important}.live-drop:hover{transform:translateY(-4px) scale(1.025);filter:brightness(1.08);box-shadow:0 12px 28px #0009}.inventory-item:hover,.profile-stat:hover,.stat:hover{transform:translateY(-4px) scale(1.01)!important}.inventory-item button:hover{box-shadow:0 7px 18px #0008}.upgrade-item:hover,.upgrade-target:hover{transform:translateY(-3px) scale(1.025);transition:transform .2s var(--ed-spring),border-color .2s ease,box-shadow .2s ease}.upgrade-wheel{transform-origin:center;backface-visibility:hidden}.case-reel{box-shadow:inset 0 1px 0 #ffffff0a,0 8px 30px #0006}.reel-item{transition:transform .22s var(--ed-spring),filter .22s ease,box-shadow .22s ease}.reel-item:hover{transform:scale(1.04);filter:brightness(1.08);box-shadow:0 6px 18px #0008}.amount.active,.upgrade-mult.active{box-shadow:0 0 0 2px #ff7b0030,0 8px 22px #0008!important}
.ed-ripple{position:relative;overflow:hidden}.ed-ripple-wave{position:absolute;width:12px;height:12px;border-radius:50%;background:#fff4;transform:translate(-50%,-50%) scale(0);pointer-events:none;animation:edRipple .55s ease-out forwards}@keyframes edRipple{to{transform:translate(-50%,-50%) scale(18);opacity:0}}
@media(max-width:700px){.case-card:hover{transform:none!important}.case-card:active{transform:scale(.985)!important}.live-drop:hover{transform:none}.live-drop:active{transform:scale(.985)}button:not(:disabled):active{transform:scale(.975)!important}.panel{animation-duration:.26s}.case-art{font-size:clamp(64px,18vw,80px)}}
@media(prefers-reduced-motion:reduce){.ed-reveal,.ed-pop,.ed-drop,.ed-win,.ed-balance,.ed-shake,.ed-shine.ed-shine-run:after{animation:none!important}.case-card,.case-art,.live-drop,button,.inventory-item,.profile-stat,.stat,.upgrade-item,.upgrade-target{transition:none!important}.ed-ripple-wave{display:none!important}}
`;document.head.appendChild(style);
function reveal(){
 const selectors=['.case-tile','.live-drop','.profile-stat','.stat','.inventory-item','.upgrade-item','.upgrade-target','.preview-item','.win-item','.setting'];
 if(reduce){$$(selectors.join(',')).forEach(x=>x.style.opacity='1');return}
 const els=$$(selectors.join(','));
 els.forEach((el,i)=>{if(el.dataset.edMotion)return;el.dataset.edMotion='1';el.classList.add('ed-reveal');el.style.animationDelay=Math.min(i*35,420)+'ms';});
}
function shine(el){if(reduce||!el||el.dataset.edShine)return;el.dataset.edShine='1';el.classList.add('ed-shine');setTimeout(()=>el.classList.add('ed-shine-run'),80)}
function ripple(e){if(reduce)return;const b=e.currentTarget;if(!b||b.disabled)return;b.classList.add('ed-ripple');const r=b.getBoundingClientRect(),w=document.createElement('span');w.className='ed-ripple-wave';w.style.left=(e.clientX-r.left)+'px';w.style.top=(e.clientY-r.top)+'px';b.appendChild(w);w.addEventListener('animationend',()=>w.remove(),{once:true})}
function observe(){const mo=new MutationObserver(ms=>{let changed=false;for(const m of ms){if(m.addedNodes.length){changed=true;for(const n of m.addedNodes){if(n.nodeType===1&&n.matches?.('.win-card,.live-drop,.inventory-item'))n.classList.add('ed-pop')}}}if(changed)reveal()});mo.observe(document.body,{childList:true,subtree:true})}
function bind(){
 document.addEventListener('click',ripple,true);
 document.addEventListener('click',e=>{const t=e.target.closest?.('.case-card,.inventory-item,.win-card,.best');if(t)shine(t)},true);
 document.addEventListener('ed:balance',e=>{const el=$('#balance');if(el&&!reduce){el.classList.remove('ed-balance');void el.offsetWidth;el.classList.add('ed-balance')}});
 document.addEventListener('ed:success',e=>{const el=e.detail?.element;if(el&&!reduce){el.classList.remove('ed-win');void el.offsetWidth;el.classList.add('ed-win')}});
}
function init(){reveal();bind();observe();setTimeout(reveal,100);setTimeout(reveal,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
