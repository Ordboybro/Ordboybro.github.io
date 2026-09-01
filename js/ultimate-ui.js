(()=>{'use strict';
/* Emoji Drops final UI runtime — one authoritative responsive layer. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const num=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
const currentUser=()=>{try{const email=localStorage.getItem('currentUser');return JSON.parse(localStorage.getItem('users')||'[]').find(u=>u.email===email)||null}catch{return null}};
const balance=()=>Number(currentUser()?.balance??num($('#balance')?.textContent))||0;
const emit=()=>{window.dispatchEvent(new CustomEvent('emoji-drops-state-change'));};

function installCSS(){
 if($('#ed-final-css'))return;
 const s=document.createElement('style');s.id='ed-final-css';
 s.textContent=`
:root{--ed-orange:#ff7b00;--ed-orange2:#ff9a2e;--ed-bg:#090909;--ed-card:#141414;--ed-line:#292929}
html,body{width:100%;min-width:0;overflow-x:hidden}body{scroll-behavior:smooth}
main,.main,.container,.content{width:100%!important;max-width:none!important;box-sizing:border-box}
main{padding-left:clamp(12px,2vw,36px)!important;padding-right:clamp(12px,2vw,36px)!important}
.home-divider{display:block!important;width:100%!important;height:2px!important;margin:-1px 0 21px!important;background:linear-gradient(90deg,transparent 0,var(--ed-orange) 7%,var(--ed-orange) 93%,transparent 100%)!important;border:0!important;opacity:1!important;box-shadow:0 0 14px #ff7b0033!important;position:relative!important;top:-1px!important}
.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.35vw,22px)!important;margin-top:9px!important}
.case-tile,.case-card{min-width:0!important;width:100%!important}.case-tile .case-card{height:clamp(250px,20vw,330px)!important;min-height:250px!important;transform:translateZ(0);backface-visibility:hidden}
.case-card:hover{transform:translate3d(0,-4px,0)!important}.case-card:active{transform:translate3d(0,-1px,0) scale(.992)!important}
.live-section{position:fixed!important;z-index:900!important;left:clamp(12px,2vw,36px)!important;right:auto!important;bottom:0!important;width:calc(100vw - clamp(12px,2vw,36px))!important;max-width:none!important;margin:0!important;padding:8px 0 max(8px,env(safe-area-inset-bottom))!important;box-sizing:border-box!important}
.live-title{width:100%!important;margin:0 0 5px!important}.live-container{display:flex!important;width:100%!important;max-width:none!important;overflow-x:auto!important;padding:2px 0!important;scrollbar-width:none!important}.live-container::-webkit-scrollbar{display:none}
.live-drop{flex:0 0 165px!important}.live-section{transition:opacity .2s ease,transform .2s ease}.ed-hide-live .live-section{display:none!important}
.best-wrap{overflow:visible!important}.best-wrap button,.best-wrap [data-action="sell-all"],.best-wrap [data-action*="sell"],.best-wrap [onclick*="sell" i]{display:none!important}.best{max-width:100%!important;overflow:visible!important}
.profile-stat,.profile-btn,.inventory-item,.case-card,.upgrade-target,.upgrade-mult{transition:transform .2s ease,opacity .2s ease,border-color .2s ease,box-shadow .2s ease!important}
.profile-stat:hover,.inventory-item:hover{transform:translateY(-2px)}
.case-reel,.case-reel-track,.reel-track{contain:layout paint;backface-visibility:hidden;-webkit-backface-visibility:hidden}.case-reel-track,.reel-track{will-change:transform}
.case-reel{height:118px!important}.reel-item{contain:layout paint}
.reel-marker{filter:drop-shadow(0 0 8px #ff8a00)}
.reel-actions button:disabled{filter:grayscale(1);cursor:not-allowed!important}
/* Final Upgrade */
.ed-upgrade-stage{position:relative;width:min(300px,30vw);aspect-ratio:1;margin:0 auto;border-radius:50%;display:grid;place-items:center;isolation:isolate;background:#0d0d10;box-shadow:0 20px 65px #000b,0 0 0 1px #ffffff12;overflow:visible}
.ed-upgrade-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from -90deg,#32d583 0 var(--chance),#303036 var(--chance) 100%);padding:9px;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;filter:drop-shadow(0 0 18px #32d5832e)}
.ed-upgrade-disc{position:absolute;inset:17px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#29292e,#111114 62%,#09090a);border:1px solid #ffffff16;box-shadow:inset 0 0 40px #000}
.ed-upgrade-ticks{position:absolute;inset:8px;border-radius:50%;background:repeating-conic-gradient(#ffffff28 0 1deg,transparent 1deg 10deg);mask:radial-gradient(circle,transparent 0 78%,#000 79%)}
.ed-upgrade-center{position:absolute;z-index:5;width:96px;height:96px;border-radius:50%;display:grid;place-items:center;text-align:center;background:#0a0a0c;border:2px solid #ff9a2e;color:#fff;font-size:22px;font-weight:1000;box-shadow:0 0 28px #ff7b0044,inset 0 0 18px #000}
.ed-upgrade-pointer{position:absolute;z-index:8;left:50%;top:-12px;width:18px;height:51%;transform:translateX(-50%) rotate(0deg);transform-origin:50% 100%;will-change:transform}
.ed-upgrade-pointer:before{content:"";position:absolute;left:50%;top:2px;transform:translateX(-50%);width:5px;height:100%;border-radius:999px;background:linear-gradient(#fff,#ff8a00);box-shadow:0 0 14px #ff7b00}
.ed-upgrade-pointer:after{content:"";position:absolute;left:50%;top:-2px;transform:translateX(-50%);border-left:11px solid transparent;border-right:11px solid transparent;border-top:19px solid #ff9a2e;filter:drop-shadow(0 0 7px #ff7b00)}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation:edUpgradeSpin 4.2s cubic-bezier(.08,.72,.06,1) forwards}
.ed-upgrade-stage.win{box-shadow:0 20px 65px #000b,0 0 55px #32d58355}.ed-upgrade-stage.loss{box-shadow:0 20px 65px #000b,0 0 55px #ff405044}
@keyframes edUpgradeSpin{0%{transform:translateX(-50%) rotate(0deg)}12%{transform:translateX(-50%) rotate(110deg)}72%{transform:translateX(-50%) rotate(calc(var(--stop) - 70deg))}100%{transform:translateX(-50%) rotate(var(--stop))}}
.upgrade-target.is-invalid{opacity:.25!important;filter:grayscale(1)!important;pointer-events:none!important}.upgrade-target.is-valid{opacity:1!important}
.profile-stat,.inventory-item{will-change:transform}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}.case-tile .case-card{height:285px!important;min-height:285px!important}.ed-upgrade-stage{width:min(300px,62vw)}}
@media(max-width:600px){main{padding-left:12px!important;padding-right:12px!important}.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.case-tile .case-card{height:245px!important;min-height:245px!important;border-radius:19px!important}.live-section{left:12px!important;width:calc(100vw - 12px)!important;padding-top:6px!important}.live-drop{flex-basis:150px!important}.ed-upgrade-stage{width:190px}.ed-upgrade-center{width:72px;height:72px;font-size:18px}.upgrade-runtime{grid-template-columns:1fr!important;gap:12px!important}.upgrade-wheel-col{order:2!important}.upgrade-runtime .source{order:1!important}.upgrade-runtime .target{order:3!important}.upgrade-submit{order:4!important}.profile-dashboard{grid-template-columns:repeat(3,minmax(0,1fr))!important}.profile-stat{padding:11px 7px!important}.profile-stat b{font-size:18px!important}.inventory-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:360px){.cases{gap:7px!important}.case-tile .case-card{height:225px!important;min-height:225px!important}.case-art{font-size:62px!important}.live-drop{flex-basis:142px!important}.ed-upgrade-stage{width:170px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition:none!important;scroll-behavior:auto!important}}
/* Never let the old device class force a one-column case grid. */
.ed-ios .cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.ed-ios .case-tile .case-card{height:245px!important;min-height:245px!important}.ed-ios .live-section{left:12px!important;width:calc(100vw - 12px)!important}
`;
 document.head.appendChild(s);
}

function layout(){
 const c=$('.cases');if(c)c.style.gridTemplateColumns=innerWidth<=1100?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))';
 const l=$('.live-section');if(l){const left=innerWidth<=600?12:Math.min(36,Math.max(12,innerWidth*.02));l.style.left=left+'px';l.style.right='auto';l.style.width=`calc(100vw - ${left}px)`;l.style.maxWidth='none';l.style.transform='none'}
 const d=$('.home-divider');if(d){d.style.top='-1px';d.style.marginBottom='21px'}
}
function profileLive(){
 const modal=$('#profileModal');const open=!!modal?.classList.contains('show')||document.body.classList.contains('profile-open');document.body.classList.toggle('ed-hide-live',open);
}
function bestDrop(){
 $$('.best-wrap button,.best-wrap [data-action],.best-wrap [onclick]').forEach(x=>{const t=((x.textContent||'')+' '+(x.getAttribute('data-action')||'')+' '+(x.getAttribute('onclick')||'')).toLowerCase();if(/продать|sell/.test(t))x.remove()});
}
function caseState(){
 $$('.case-tile,.case-card').forEach(card=>{const price=num(card.dataset.price||card.querySelector('.case-price')?.textContent);const b=card.querySelector('button,[data-action="open-case"],[data-action="open"]');if(!b||!price)return;const ok=balance()>=price;b.disabled=!ok;b.setAttribute('aria-disabled',String(!ok));b.style.opacity=ok?'1':'.45';b.style.pointerEvents=ok?'auto':'none';card.classList.toggle('ed-no-funds',!ok)});
 const modal=$('.modal.show');if(!modal)return;const price=num($('.open-cost',modal)?.textContent);const b=$('.reel-actions .primary,[data-action="open"]',modal);if(b&&price){const ok=balance()>=price;b.disabled=!ok;b.style.opacity=ok?'1':'.45';b.style.pointerEvents=ok?'auto':'none'}
}
function targetRules(){
 const panel=$('#upgradeModal')||$('.upgrade-runtime')?.closest('.panel')||$('.upgrade-modal');if(!panel)return;
 const source=panel.querySelector('.source .u-value,.upgrade-slot:first-child .u-value,[data-upgrade-source-price]');const sv=num(source?.textContent||source?.dataset?.price);const multEl=panel.querySelector('.upgrade-mult.active');const mult=num(multEl?.textContent)||2;const max=sv*mult;
 $$('.upgrade-target',panel).forEach(t=>{const tv=num(t.dataset.price||t.querySelector('small')?.textContent||t.textContent);const valid=sv>0&&tv>sv&&tv<=max+1e-9;t.classList.toggle('is-invalid',!valid);t.classList.toggle('is-valid',valid);t.setAttribute('aria-disabled',String(!valid));if(!valid)t.classList.remove('selected')});
 const selected=panel.querySelector('.upgrade-target.selected');const tv=selected?num(selected.dataset.price||selected.querySelector('small')?.textContent||selected.textContent):0;const chance=selected&&tv>sv?Math.min(100,Math.max(0,sv/tv*95)):0;
 let stage=panel.querySelector('.ed-upgrade-stage');if(!stage){const host=panel.querySelector('.upgrade-wheel-col')||panel.querySelector('.upgrade-runtime')||panel;stage=document.createElement('div');stage.className='ed-upgrade-stage';stage.innerHTML='<div class="ed-upgrade-ring"></div><div class="ed-upgrade-disc"></div><div class="ed-upgrade-ticks"></div><div class="ed-upgrade-pointer"></div><div class="ed-upgrade-center">0%</div>';host.prepend(stage)}
 stage.style.setProperty('--chance',chance+'%');$('.ed-upgrade-center',stage).textContent=chance.toFixed(chance<10?1:0)+'%';const ch=panel.querySelector('.upgrade-chance');if(ch)ch.textContent=`Шанс: ${chance.toFixed(chance<10?1:0)}%`;
}
function upgradeSpin(e){
 const submit=e.target.closest('.upgrade-submit');if(!submit)return;const panel=submit.closest('.panel')||$('#upgradeModal');const selected=panel?.querySelector('.upgrade-target.selected');if(!selected||selected.classList.contains('is-invalid')){e.preventDefault();e.stopImmediatePropagation();return}
 const chance=Math.min(100,Math.max(0,num(panel.querySelector('.upgrade-chance')?.textContent)));const win=Math.random()*100<chance;const sector=win?Math.random()*chance:chance+Math.random()*(100-chance);const stop=720+sector*3.6;const stage=panel.querySelector('.ed-upgrade-stage');if(!stage)return;e.preventDefault();e.stopImmediatePropagation();stage.style.setProperty('--stop',stop+'deg');stage.classList.remove('spin','win','loss');void stage.offsetWidth;stage.classList.add('spin');setTimeout(()=>stage.classList.add(win?'win':'loss'),4250);setTimeout(()=>window.dispatchEvent(new CustomEvent('emoji-drops-upgrade-result',{detail:{win,chance}})),4300);
}
function bind(){
 document.addEventListener('click',e=>{const bad=e.target.closest('.upgrade-target.is-invalid');if(bad){e.preventDefault();e.stopImmediatePropagation();return}setTimeout(()=>{layout();profileLive();bestDrop();caseState();targetRules()},0)},true);
 document.addEventListener('click',upgradeSpin,true);
 window.addEventListener('resize',layout,{passive:true});window.addEventListener('storage',()=>{caseState();targetRules();emit()});window.addEventListener('emoji-drops-state-change',()=>{caseState();targetRules()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){layout();profileLive();caseState();targetRules()}});
 setInterval(()=>{if(!document.hidden){profileLive();caseState();targetRules()}},900);
}
installCSS();layout();profileLive();bestDrop();caseState();targetRules();bind();
})();