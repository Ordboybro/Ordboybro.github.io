(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const style=()=>{if($('#ed-upgrade-polish'))return;const s=document.createElement('style');s.id='ed-upgrade-polish';s.textContent=`
/* Upgrade wheel */
.upgrade-arrow{position:relative!important;width:156px!important;height:156px!important;border-radius:50%!important;padding:8px!important;border:0!important;background:conic-gradient(from -18deg,#ff7b00 0 18deg,#17110c 18deg 42deg,#ff9d3d 42deg 60deg,#17110c 60deg 84deg,#7c3aed 84deg 104deg,#17110c 104deg 132deg,#ef4444 132deg 150deg,#17110c 150deg 180deg,#ff7b00 180deg 198deg,#17110c 198deg 222deg,#ff9d3d 222deg 240deg,#17110c 240deg 264deg,#7c3aed 264deg 284deg,#17110c 284deg 312deg,#ef4444 312deg 330deg,#17110c 330deg 360deg)!important;box-shadow:0 0 35px #ff7b0033,0 0 0 1px #ff7b0066!important;display:grid!important;place-items:center!important;color:#ffb35c!important;font-size:0!important;transition:filter .2s,box-shadow .2s!important}
.upgrade-arrow:before{content:'➤';position:absolute;z-index:5;left:50%;top:-18px;transform:translateX(-50%) rotate(90deg);width:34px;height:34px;display:grid;place-items:center;font-size:25px;color:#ff9d3d;text-shadow:0 0 12px #ff7b00;filter:drop-shadow(0 3px 4px #000);pointer-events:none}
.upgrade-arrow:after{content:'';width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 50% 45%,#2b190b 0 26%,#111 27% 48%,#20140b 49% 58%,#0d0d0d 59% 100%);border:2px solid #ffb35c;box-shadow:inset 0 0 25px #ff7b0022;grid-area:1/1;pointer-events:none}
.upgrade-arrow.spinning{animation:edUpgradeSpin 1.65s cubic-bezier(.12,.78,.08,1);filter:brightness(1.12);box-shadow:0 0 55px #ff7b0055,0 0 0 2px #ff9d3d88!important}
@keyframes edUpgradeSpin{0%{transform:rotate(0)}15%{transform:rotate(110deg)}55%{transform:rotate(760deg)}82%{transform:rotate(1030deg)}100%{transform:rotate(1080deg)}}
.upgrade-panel{align-items:center!important}.upgrade-arrow{justify-self:center}.upgrade-slot{transition:transform .2s,box-shadow .2s,border-color .2s}.upgrade-slot:hover{transform:translateY(-2px);box-shadow:0 12px 30px #0008}.upgrade-item,.upgrade-target,.upgrade-mult,.primary,.secondary,.profile-btn,.amount,.reel-fast,.close{transition:transform .18s,border-color .18s,background .18s,box-shadow .18s,filter .18s}.upgrade-item:hover,.upgrade-target:hover,.amount:hover{transform:translateY(-2px)}.primary:hover,.profile-btn.reward:hover{transform:translateY(-1px);filter:brightness(1.06);box-shadow:0 10px 25px #ff7b0022}.secondary:hover,.reel-fast:hover,.close:hover{transform:translateY(-1px)}
.modal{transition:opacity .18s ease}.modal:not(.show){pointer-events:none}.panel{animation:edPanelIn .22s cubic-bezier(.2,.8,.2,1)}@keyframes edPanelIn{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
.case-card,.inventory-item,.best,.profile-center,.stat,.upgrade-slot{backface-visibility:hidden;contain:layout paint}.case-card:active,.primary:active,.secondary:active,.profile-btn:active{transform:scale(.985)}
@media(max-width:900px){.upgrade-arrow{width:142px!important;height:142px!important}.upgrade-arrow:before{top:-16px}.upgrade-panel{gap:12px!important}}
@media(max-width:520px){.upgrade-arrow{width:128px!important;height:128px!important}.upgrade-arrow:before{top:-15px;width:30px;height:30px;font-size:22px}.upgrade-panel{padding:0!important}.panel{width:min(96vw,920px)!important;border-radius:20px!important}.panel-body{padding:18px!important}.case-reel{height:104px!important}.reel-item{font-size:.9em}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;
document.head.appendChild(s)};
function hook(){const btn=$('#upgradeDo');if(btn&&!btn.dataset.wheelHook){btn.dataset.wheelHook='1';btn.addEventListener('click',()=>{const wheel=$('.upgrade-arrow');if(!wheel)return;wheel.classList.remove('spinning');void wheel.offsetWidth;wheel.classList.add('spinning');window.setTimeout(()=>wheel.classList.remove('spinning'),1700)},true)}}
function init(){style();hook();new MutationObserver(hook).observe(document.body,{subtree:true,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
