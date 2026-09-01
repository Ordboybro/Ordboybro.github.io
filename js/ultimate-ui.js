(()=>{'use strict';
const V='20260901-17';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=e=>Number(String(e?.dataset?.price??e?.textContent??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
const user=()=>{try{const email=localStorage.getItem('currentUser');const a=JSON.parse(localStorage.getItem('users')||'[]');return a.find(x=>x.email===email)||null}catch{return null}};
const bal=()=>Number(user()?.balance??$('#balance')?.textContent?.replace(/[^0-9.,-]/g,'').replace(',','.')??0)||0;
function style(){if($('#ed-ultimate-css'))return;const s=document.createElement('style');s.id='ed-ultimate-css';s.textContent=`
:root{--ed-orange:#ff7b00;--ed-bg:#0b0b0c;--ed-card:#141416;--ed-line:#ff7b00}
html,body{width:100%;min-width:0;overflow-x:hidden}body{scroll-behavior:smooth}
main,.main,.container,.content{box-sizing:border-box;width:100%!important;max-width:none!important}
main{padding-left:clamp(14px,2.3vw,38px)!important;padding-right:clamp(14px,2.3vw,38px)!important}
.home-divider{display:block!important;height:2px!important;background:linear-gradient(90deg,transparent 0,var(--ed-orange) 8%,var(--ed-orange) 92%,transparent 100%)!important;border:0!important;opacity:.95!important;position:relative!important;top:-3px!important;margin:0 0 18px!important}
.cases{width:100%!important;max-width:none!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(12px,1.5vw,24px)!important;margin-top:7px!important}
.case-tile,.case-card{min-width:0!important;width:100%!important}.case-tile .case-card{height:clamp(270px,20vw,350px)!important;min-height:270px!important}
.live-section{position:fixed!important;z-index:40!important;left:clamp(14px,2.3vw,38px)!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;margin:0!important;padding:0!important;box-sizing:border-box!important}
.live-title,.live-container{width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important}.live-container{padding-right:clamp(14px,2.3vw,38px)!important;box-sizing:border-box!important}
#profileModal.show~.live-section,.profile-open .live-section{display:none!important}
.best-wrap button,.best-wrap [data-action="sell-all"],.best-wrap [data-action*="sell"],.best-wrap [onclick*="sell" i]{display:none!important}.best-wrap{overflow:visible!important}.best{overflow:visible!important;max-width:100%!important}
.profile-stat,.profile-btn,.inventory-item,.case-card,.upgrade-target,.upgrade-mult{transition:transform .22s ease,opacity .22s ease,border-color .22s ease,box-shadow .22s ease!important}.profile-stat:hover,.inventory-item:hover{transform:translateY(-2px)}
.case-card{transform:translateZ(0);backface-visibility:hidden}.case-card:active{transform:scale(.985)}
.reel-track,.case-reel-track{will-change:transform;backface-visibility:hidden;contain:layout paint}
.reel-item{contain:layout paint}
.upgrade-runtime{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(250px,300px) minmax(0,1fr)!important;gap:22px!important;align-items:start!important}
.ed-upgrade-stage{position:relative;width:min(280px,28vw);aspect-ratio:1;margin:auto;border-radius:50%;background:#101012;box-shadow:0 16px 55px #0009,0 0 0 1px #ffffff12;display:grid;place-items:center;isolation:isolate}
.ed-upgrade-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from -90deg,var(--ed-orange) 0 var(--chance),#29292d var(--chance) 100%);padding:8px;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;filter:drop-shadow(0 0 18px #ff7b0030)}
.ed-upgrade-disc{position:absolute;inset:16px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#25252a,#111114 62%,#0b0b0d);border:1px solid #ffffff18;box-shadow:inset 0 0 35px #000}
.ed-upgrade-center{position:absolute;z-index:3;width:92px;height:92px;border-radius:50%;display:grid;place-items:center;background:#0b0b0d;border:2px solid var(--ed-orange);color:#fff;font-size:23px;font-weight:1000;box-shadow:0 0 25px #ff7b0040;text-align:center;line-height:1}
.ed-upgrade-pointer{position:absolute;z-index:6;left:50%;top:-15px;width:18px;height:46%;transform:translateX(-50%) rotate(0deg);transform-origin:50% 100%;will-change:transform}
.ed-upgrade-pointer:before{content:'';position:absolute;left:50%;top:0;transform:translateX(-50%);width:5px;height:100%;border-radius:999px;background:linear-gradient(#fff,var(--ed-orange));box-shadow:0 0 13px #ff7b00}
.ed-upgrade-pointer:after{content:'';position:absolute;left:50%;top:-3px;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:18px solid #ff9b35;filter:drop-shadow(0 0 7px #ff7b00)}
.ed-upgrade-ticks{position:absolute;inset:7px;border-radius:50%;background:repeating-conic-gradient(#ffffff22 0 1deg,transparent 1deg 10deg);mask:radial-gradient(circle,transparent 0 77%,#000 78%)}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation:edUltimateSpin 3.9s cubic-bezier(.08,.78,.08,1) forwards}
@keyframes edUltimateSpin{0%{transform:translateX(-50%) rotate(0deg)}8%{transform:translateX(-50%) rotate(45deg)}68%{transform:translateX(-50%) rotate(calc(var(--stop) - 55deg))}100%{transform:translateX(-50%) rotate(var(--stop))}}
.ed-upgrade-stage.win{box-shadow:0 16px 55px #0009,0 0 45px #35dc8740}.ed-upgrade-stage.loss{box-shadow:0 16px 55px #0009,0 0 45px #ff405040}
.upgrade-target.is-invalid{opacity:.28!important;filter:grayscale(1)!important;pointer-events:none!important}.upgrade-target.is-valid{opacity:1!important}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}.upgrade-runtime{grid-template-columns:1fr!important}.ed-upgrade-stage{width:min(280px,70vw)}}
@media(max-width:600px){main{padding-left:12px!important;padding-right:12px!important}.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.case-tile .case-card{height:250px!important;min-height:250px!important}.live-section{left:12px!important}.live-container{padding-right:12px!important}.ed-upgrade-stage{width:190px}.ed-upgrade-center{width:70px;height:70px;font-size:19px}.upgrade-runtime{gap:12px!important}.profile-dashboard{grid-template-columns:repeat(3,minmax(0,1fr))!important}.profile-stat{padding:11px 7px!important}.profile-stat b{font-size:18px!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition:none!important}}
`;document.head.appendChild(s)}
function layout(){
 const c=$('.cases');if(c)c.style.gridTemplateColumns=innerWidth<=1100?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))';
 const l=$('.live-section');if(l){l.style.left='clamp(12px,2.3vw,38px)';l.style.right='0';l.style.width='auto';l.style.maxWidth='none';l.style.transform='none'}
 const d=$('.home-divider');if(d)d.style.top='-3px';
}
function affordability(){
 $$('.case-tile,.case-card').forEach(card=>{const p=money(card);const b=card.querySelector('button,[data-action="open-case"],[data-action="open"]');if(!b||!p)return;const ok=bal()>=p-1e-9;b.disabled=!ok;b.setAttribute('aria-disabled',String(!ok));card.classList.toggle('ed-no-funds',!ok);b.style.opacity=ok?'1':'.45';b.style.pointerEvents=ok?'':'none'});
 const panel=$('.panel.show,.modal.show');if(!panel)return;const cost=money($('.open-cost',panel));const b=$('.reel-actions .primary,[data-action="open"]',panel);if(b&&cost){const ok=bal()>=cost-1e-9;b.disabled=!ok;b.style.pointerEvents=ok?'':'none';b.style.opacity=ok?'1':'.45'}
}
function best(){ $$('.best-wrap button,.best-wrap [data-action],.best-wrap [onclick]').forEach(x=>{const t=((x.textContent||'')+' '+(x.getAttribute('data-action')||'')+' '+(x.getAttribute('onclick')||'')).toLowerCase();if(t.includes('продать')||t.includes('sell'))x.remove()}) }
function upgrade(){
 const panel=$('#upgradeModal')||$('.upgrade-runtime')?.closest('.panel')||$('.upgrade-modal');if(!panel)return;
 const src=panel.querySelector('.source .u-value,.upgrade-slot:first-child .u-value,.source [data-price]');const sv=money(src);const active=panel.querySelector('.upgrade-mult.active');const mult=Number(String(active?.textContent||'').replace(/[^0-9.]/g,''))||2;const max=sv*mult;
 const targets=$$('.upgrade-target',panel);targets.forEach(t=>{const tv=money(t);const ok=sv>0&&tv>sv&&tv<=max+1e-9;t.classList.toggle('is-invalid',!ok);t.classList.toggle('is-valid',ok);t.setAttribute('aria-disabled',String(!ok));if(!ok)t.classList.remove('selected')});
 let selected=panel.querySelector('.upgrade-target.selected');if(selected&&!selected.classList.contains('is-invalid')){}else selected=null;
 const tv=money(selected);const chance=selected&&tv>sv?Math.min(100,Math.max(0,sv/tv*95)):0;
 let stage=panel.querySelector('.ed-upgrade-stage');if(!stage){const old=panel.querySelector('.upgrade-wheel-wrap,.upgrade-wheel,.upgrade-arrow');const host=old?.parentElement||panel.querySelector('.upgrade-wheel-col')||panel;if(old)old.style.display='none';stage=document.createElement('div');stage.className='ed-upgrade-stage';stage.innerHTML='<div class="ed-upgrade-ring"></div><div class="ed-upgrade-disc"></div><div class="ed-upgrade-ticks"></div><div class="ed-upgrade-pointer"></div><div class="ed-upgrade-center">0%</div>';host.prepend(stage)}
 stage.style.setProperty('--chance',chance+'%');const center=$('.ed-upgrade-center',stage);if(center)center.textContent=chance.toFixed(chance<10?1:0)+'%';
 const ch=panel.querySelector('.upgrade-chance');if(ch)ch.textContent=`Шанс: ${chance.toFixed(chance<10?1:0)}%`;
}
function upgradeAnimation(e){
 const submit=e.target.closest('.upgrade-submit');if(!submit)return;const panel=submit.closest('.panel')||$('#upgradeModal');if(!panel)return;const selected=panel.querySelector('.upgrade-target.selected');if(!selected||selected.classList.contains('is-invalid')){e.preventDefault();e.stopImmediatePropagation();return}
 const ch=money(panel.querySelector('.upgrade-chance'));const chance=Math.min(100,Math.max(0,ch));const stage=panel.querySelector('.ed-upgrade-stage');if(!stage)return;const win=Math.random()*100<chance;const sector=win?(Math.random()*chance):(chance+Math.random()*(100-chance));const stop=720+sector*3.6;stage.style.setProperty('--stop',stop+'deg');stage.classList.remove('spin','win','loss');void stage.offsetWidth;stage.classList.add('spin');setTimeout(()=>stage.classList.add(win?'win':'loss'),3950);
}
function bind(){
 document.addEventListener('click',e=>{const bad=e.target.closest('.upgrade-target.is-invalid');if(bad){e.preventDefault();e.stopImmediatePropagation();return}setTimeout(()=>{layout();best();affordability();upgrade()},0)},true);
 window.addEventListener('resize',layout,{passive:true});window.addEventListener('storage',()=>{affordability();upgrade()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){affordability();upgrade()}});
 document.addEventListener('click',upgradeAnimation,true);
 setInterval(()=>{if(!document.hidden){affordability();best();upgrade()}},700);
}
style();layout();best();affordability();upgrade();bind();
})();