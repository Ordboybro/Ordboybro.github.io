(()=>{'use strict';
/* Emoji Drops — stable presentation layer. One layout, one upgrade visual, no DOM observers. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const num=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
function css(){if($('#ed-stable-v4'))return;const s=document.createElement('style');s.id='ed-stable-v4';s.textContent=`
:root{--ed-orange:#ff7b00;--ed-orange2:#ff9a2e;--ed-bg:#090909}
html,body{width:100%;max-width:100%;overflow-x:hidden;background:var(--ed-bg)}
main,.main{width:100%!important;max-width:none!important;margin:0!important;padding-left:clamp(12px,2vw,36px)!important;padding-right:clamp(12px,2vw,36px)!important;box-sizing:border-box!important}
.hero{display:none!important}
.home-divider,.ed-home-divider{display:block!important;visibility:visible!important;opacity:1!important;height:2px!important;width:100%!important;position:relative!important;top:-4px!important;margin:0 0 22px!important;background:linear-gradient(90deg,transparent,#ff7b00 7%,#ff9a2e 50%,#ff7b00 93%,transparent)!important;box-shadow:0 0 14px #ff7b0030!important;border:0!important;border-radius:999px!important}
#cases,.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.35vw,22px)!important;margin-top:10px!important;box-sizing:border-box!important}
.case-tile{min-width:0!important;width:100%!important}.case-tile .case-card{width:100%!important;min-width:0!important;height:clamp(245px,19vw,330px)!important;box-sizing:border-box!important;transition:transform .24s cubic-bezier(.2,.8,.2,1),box-shadow .24s ease,border-color .24s ease!important;contain:layout paint;backface-visibility:hidden}
@media(hover:hover){.case-card:hover{transform:translate3d(0,-4px,0)!important;box-shadow:0 14px 34px #0009!important}.case-card:active{transform:translate3d(0,-1px,0) scale(.994)!important}}
.live-section{position:fixed!important;left:clamp(12px,2vw,36px)!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;padding-left:0!important;padding-right:0!important;z-index:900!important;box-sizing:border-box!important}.live-section .live-container,.live-container{width:100%!important;max-width:none!important;margin:0!important;box-sizing:border-box!important}
.best-wrap .best button,.best-wrap .best .remove-all,.best-wrap .best [data-action*=remove],.best-wrap .best [data-action*=clear]{display:none!important}.best-wrap .best{overflow:visible!important}
.case-reel-track,.reel-track{will-change:transform!important;backface-visibility:hidden!important;transform:translate3d(0,0,0)}
.case-reel-track.ed-opening,.reel-track.ed-opening{transition-property:transform!important;transition-duration:7.8s!important;transition-timing-function:cubic-bezier(.08,.72,.08,1)!important}
.case-card.is-locked,.case-card.is-disabled{filter:saturate(.45)!important}
button:disabled{cursor:not-allowed!important}
/* exactly one upgrade visual */
.upgrade-v2-wheel,.upgrade-wheel-shell,.ed-upgrade-stage{display:none!important}
.ed-stable-upgrade{position:relative;width:min(330px,78vw);aspect-ratio:1;margin:6px auto 14px;display:grid;place-items:center;contain:layout paint}
.ed-stable-face{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from -90deg,#36d68a 0deg var(--ed-win-deg,0deg),#2a2a2f var(--ed-win-deg,0deg) 360deg);border:8px solid #151515;box-shadow:0 0 0 2px #ff7b0050,0 16px 45px #000b,inset 0 0 34px #000;overflow:hidden}
.ed-stable-face:before{content:'';position:absolute;inset:14px;border-radius:50%;background:repeating-conic-gradient(#ffffff14 0deg 1deg,transparent 1deg 12deg);mask:radial-gradient(circle,transparent 0 69%,#000 70%);opacity:.75}
.ed-stable-center{position:absolute;z-index:5;width:88px;height:88px;border-radius:50%;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 35% 25%,#303030,#0a0a0a 70%);border:2px solid #ff9a2e;color:#fff;font-weight:950;font-size:22px;box-shadow:0 0 0 6px #111,0 0 30px #ff7b0055}
.ed-stable-pointer{position:absolute;z-index:7;left:50%;top:4px;width:7px;height:47%;border-radius:999px;background:linear-gradient(#fff,#ffdba4 22%,#ff9a2e 58%,#ff5d00);transform:translateX(-50%) rotate(0deg);transform-origin:50% 100%;box-shadow:0 0 10px #fff8,0 0 24px #ff7b00;will-change:transform;pointer-events:none}
.ed-stable-pointer:before{content:'';position:absolute;left:50%;top:-9px;transform:translateX(-50%);width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px #ff7b00,0 0 18px #ff7b00}
.ed-stable-chance{position:absolute;left:50%;bottom:-28px;transform:translateX(-50%);font-size:14px;font-weight:900;color:#ff9d3d;white-space:nowrap}
.ed-stable-wheel.spinning .ed-stable-pointer{animation:edStableSpin 7.2s cubic-bezier(.08,.72,.08,1) forwards}
@keyframes edStableSpin{0%{transform:translateX(-50%) rotate(0deg)}12%{transform:translateX(-50%) rotate(120deg)}72%{transform:translateX(-50%) rotate(calc(var(--ed-stop,720deg) - 50deg))}100%{transform:translateX(-50%) rotate(var(--ed-stop,720deg))}}
.upgrade-target.ed-invalid{display:none!important}.upgrade-target[aria-disabled=true]{pointer-events:none!important}
.profile-card,.profile-stat,.inventory-item,.stat,.setting,.profile-btn,.profile-top{transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease,background-color .22s ease!important}
@media(hover:hover){.profile-stat:hover,.inventory-item:hover{transform:translateY(-2px)!important}}
@media(max-width:1100px){#cases,.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}.case-tile .case-card{height:285px!important}}
@media(max-width:600px){main,.main{padding-left:10px!important;padding-right:10px!important}#cases,.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.case-tile .case-card{height:calc(78vw + 55px)!important;min-height:200px!important;max-height:255px!important;border-radius:18px!important}.live-section{left:10px!important;right:0!important}.ed-stable-upgrade{width:min(285px,84vw)}.ed-stable-center{width:74px;height:74px;font-size:18px}.ed-stable-pointer{width:5px}.case-reel-track.ed-opening,.reel-track.ed-opening{transition-duration:7s!important}}
@media(max-width:360px){#cases,.cases{gap:6px!important}.case-tile .case-card{height:195px!important}.ed-stable-upgrade{width:250px}}
@media(prefers-reduced-motion:reduce){.case-card,.profile-stat,.inventory-item,.ed-stable-pointer{transition:none!important;animation:none!important}}
`;document.head.appendChild(s)}
function cleanupUpgrade(){
 $$('[data-ed-generated-upgrade],.upgrade-v2-wheel,.upgrade-wheel-shell,.ed-upgrade-stage').forEach(x=>x.remove());
 const old=$('.upgrade-wheel'); if(old)old.style.display='none';
}
function sourceTarget(root){
 const src=root?.querySelector('.upgrade-item.selected,[data-upgrade-source],.source .u-value');
 const tgt=root?.querySelector('.upgrade-target.selected,.target .u-value');
 return {s:num(src?.dataset?.price||src?.dataset?.value||src?.textContent),t:num(tgt?.dataset?.price||tgt?.dataset?.value||tgt?.textContent)};
}
function syncTargets(root){
 const src=root?.querySelector('.upgrade-item.selected,[data-upgrade-source]'); if(!src)return;
 const sv=num(src.dataset?.price||src.dataset?.value||src.textContent);
 const mEl=root.querySelector('.upgrade-mult.active,[data-multiplier].active');const m=num(mEl?.dataset?.multiplier||mEl?.dataset?.mult||mEl?.textContent)||2;const max=sv*m;
 root.querySelectorAll('.upgrade-target').forEach(t=>{const v=num(t.dataset?.price||t.dataset?.value||t.textContent);const good=v>sv&&v<=max+1e-9;t.classList.toggle('ed-invalid',!good);t.setAttribute('aria-disabled',String(!good));if(!good)t.classList.remove('selected')});
}
function buildUpgrade(){
 const root=$('#upgradeModal')||$('.upgrade-runtime')?.closest('.panel')||$('.upgrade-modal');if(!root)return;
 cleanupUpgrade();syncTargets(root);
 const {s,t}=sourceTarget(root);const active=root.querySelector('.upgrade-mult.active,[data-multiplier].active');const m=num(active?.dataset?.multiplier||active?.dataset?.mult||active?.textContent)||2;const chance=s&&t&&t>s?Math.min(95,(s/t)*95):0;
 const host=root.querySelector('.upgrade-wheel-col')||root.querySelector('.upgrade-runtime')||root.querySelector('.upgrade-panel')||root;
 const wrap=document.createElement('div');wrap.className='ed-stable-upgrade';wrap.dataset.edGeneratedUpgrade='1';wrap.innerHTML='<div class="ed-stable-face"></div><div class="ed-stable-center">0%</div><div class="ed-stable-pointer"></div><div class="ed-stable-chance"></div>';
 const oldTitle=host.querySelector('.upgrade-chance');if(oldTitle)oldTitle.style.display='none';host.prepend(wrap);
 const face=$('.ed-stable-face',wrap),center=$('.ed-stable-center',wrap),label=$('.ed-stable-chance',wrap);const deg=Math.max(.1,chance)*3.6;face.style.setProperty('--ed-win-deg',deg+'deg');center.textContent=chance?chance.toFixed(chance<10?1:0)+'%':'0%';label.textContent=chance?`Шанс ${chance.toFixed(chance<10?1:0)}% · ×${m}`:'Выберите цель';
 const submit=root.querySelector('.upgrade-submit,#edUpgradeDo');if(submit)submit.disabled=!(s&&t&&chance>0);
}
function bind(){
 document.addEventListener('click',e=>{const bad=e.target.closest('.upgrade-target.ed-invalid');if(bad){e.preventDefault();e.stopImmediatePropagation();return}if(e.target.closest('.upgrade-item,.upgrade-target,.upgrade-mult,[data-multiplier]'))requestAnimationFrame(buildUpgrade)},true);
 window.addEventListener('resize',()=>requestAnimationFrame(buildUpgrade),{passive:true});window.addEventListener('emoji-drops-state-change',()=>requestAnimationFrame(buildUpgrade));window.addEventListener('storage',()=>requestAnimationFrame(buildUpgrade));
 setInterval(()=>{const root=$('#upgradeModal')||$('.upgrade-runtime')?.closest('.panel')||$('.upgrade-modal');if(root?.offsetParent!==null)buildUpgrade()},1000);
}
css();bind();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildUpgrade,{once:true});else buildUpgrade();
})();
