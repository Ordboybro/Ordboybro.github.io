(()=>{'use strict';
const KEY='emojiDropsStateV3';
const $=(s,r=document)=>r.querySelector(s);
const n=x=>Math.max(0,Math.round(Number(x)||0));
const rub=x=>n(x).toLocaleString('ru-RU')+' ₽';
const esc=x=>String(x??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const state=()=>window.__emojiDropsCore?.state?.()||(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}})();
function style(){
 if($('#ed-final-polish-css'))return;
 const s=document.createElement('style');s.id='ed-final-polish-css';
 s.textContent='.edfp-profile{max-width:1050px;margin:0 auto;padding:8px 0 70px}.edfp-profile-hero,.edfp-profile-panel{border:1px solid #302d29;border-radius:22px;background:linear-gradient(145deg,#171717,#090909);box-shadow:inset 0 1px #fff1,0 20px 50px #0008}.edfp-profile-hero{padding:20px;display:grid;grid-template-columns:auto 1fr;gap:14px}.edfp-avatar{width:84px;height:84px;border-radius:24px;display:grid;place-items:center;background:#111;border:1px solid #68431f;font-size:42px}.edfp-profile-hero h1{margin:0;font-size:28px}.edfp-profile-hero p{margin:5px 0;color:#777;font-size:12px}.edfp-stats{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px}.edfp-stat{border:1px solid #2f2f2f;border-radius:14px;background:#101010;padding:12px}.edfp-stat b{display:block;color:#ffb858;font-size:19px}.edfp-stat span{display:block;color:#aaa;font-size:9px;margin-top:3px;text-transform:uppercase}.edfp-profile-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:10px;margin-top:10px}.edfp-profile-panel{padding:15px}.edfp-profile-panel h2{font-size:16px;margin:0 0 10px}.edfp-inventory{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:7px}.edfp-inv{min-height:82px;border:1px solid #2d2d2d;border-radius:13px;background:#111;display:grid;place-items:center;position:relative}.edfp-inv .e{font-size:31px}.edfp-inv small{position:absolute;bottom:4px;color:#888;font-size:8px}.edfp-empty{text-align:center;color:#aaa;padding:20px;border:1px dashed #333;border-radius:14px}.edfp-up{max-width:1050px;margin:0 auto;padding:8px 0 70px}.edfp-panel{border:1px solid #302d29;border-radius:22px;background:#0d0d0d;padding:15px}.edfp-owned{display:flex;gap:8px;overflow-x:auto}.edfp-owned-card{min-width:78px;height:84px;border:1px solid #303030;border-radius:15px;background:#101010;display:grid;place-items:center}.edfp-owned-card.sel{border-color:#ff9e38}.edfp-wheel{width:min(300px,76vw);aspect-ratio:1;margin:15px auto;border-radius:50%;background:conic-gradient(#292929 0 25%,#17202d 25% 50%,#251b2e 50% 75%,#302014 75%);border:8px solid #292929;transition:transform 2.2s cubic-bezier(.12,.76,.12,1)}.edfp-spin{width:100%;min-height:60px;border:1px solid #ffd16b;border-radius:17px;background:linear-gradient(135deg,#ff8f12,#ffc35b);color:#1a1106;font-weight:950;font-size:20px}@media(max-width:700px){.edfp-profile-hero{padding:13px;border-radius:18px}.edfp-avatar{width:60px;height:60px;font-size:30px}.edfp-profile-hero h1{font-size:21px}.edfp-stats{grid-template-columns:repeat(2,1fr)}.edfp-profile-grid{grid-template-columns:1fr}.edfp-profile-panel{padding:12px}}@media(prefers-reduced-motion:reduce){.edfp-wheel{transition:none!important}}';
 
/* Touch-surface polish: hover affordances stay desktop-only, avoiding sticky transforms on touch. */
s.textContent+=`@media (hover:none),(pointer:coarse){
  .ed-nav button:hover,.ed-case:hover,.ed-case-art:hover,.case-card:hover,.case-art:hover,.upgrade-target:hover,.v26-card:hover,.v26-inv-card:hover,.edfp-owned-card:hover,.edfp-target:hover,.profile-btn:hover,.inventory-item:hover{transform:none!important}
  .ed-nav button:hover,.ed-case:hover,.case-card:hover,.upgrade-target:hover,.v26-card:hover,.v26-inv-card:hover,.edfp-owned-card:hover,.edfp-target:hover{border-color:inherit!important;box-shadow:inherit!important}
  header .logo:hover{transform:none!important;text-shadow:none!important}
}
@media (prefers-reduced-motion:reduce){
  .ed-case,.case-card,.upgrade-target,.v26-card,.v26-inv-card,.edfp-owned-card,.edfp-target,.profile-btn,.inventory-item{transition:none!important}
}
`;document.head.appendChild(s);
}
function premiumFinisher(){
 if($('#ed-premium-finisher-css'))return;
 const s=document.createElement('style');s.id='ed-premium-finisher-css';
 s.textContent=`
 :root{--ed-surface:#101010;--ed-surface-2:#151515;--ed-border:rgba(255,255,255,.075);--ed-border-hi:rgba(255,145,42,.42);--ed-orange:#ff8a18;--ed-orange-hi:#ffb34f;--ed-ease:cubic-bezier(.22,1,.36,1)}
 html{scrollbar-gutter:stable}
 body{-webkit-tap-highlight-color:transparent}
 button{-webkit-tap-highlight-color:transparent;user-select:none}
 button:focus:not(:focus-visible){outline:none}
 .ed-case,.case-card,.v26-card,.inventory-item,.edfp-profile-hero,.edfp-profile-panel,.edfp-panel,.v26-market{
   -webkit-backface-visibility:hidden;backface-visibility:hidden;
 }
 .ed-case,.case-card,.v26-card,.inventory-item,.upgrade-target,.upgrade-item,.edfp-owned-card{
   position:relative;overflow:hidden;
 }
 .ed-case::after,.case-card::after,.v26-card::after,.inventory-item::after,.upgrade-target::after,.upgrade-item::after,.edfp-owned-card::after{
   content:"";position:absolute;inset:0;pointer-events:none;opacity:0;
   background:linear-gradient(120deg,transparent 24%,rgba(255,255,255,.07) 47%,transparent 67%);
   transform:translateX(-120%);transition:opacity .18s var(--ed-ease),transform .7s var(--ed-ease);
 }
 .ed-case:hover::after,.case-card:hover::after,.v26-card:hover::after,.inventory-item:hover::after,.upgrade-target:hover::after,.upgrade-item:hover::after,.edfp-owned-card:hover::after{
   opacity:1;transform:translateX(120%);
 }
 .ed-balance,.balance,.header-balance,.ed-top-balance{
   font-variant-numeric:tabular-nums;
   text-shadow:0 0 22px rgba(255,151,54,.10);
 }
 .primary,.edfp-spin{
   box-shadow:0 12px 32px rgba(255,122,0,.14),inset 0 1px rgba(255,255,255,.16);
   transition:transform .16s var(--ed-ease),filter .16s var(--ed-ease),box-shadow .2s var(--ed-ease);
 }
 .primary:hover,.edfp-spin:hover{filter:brightness(1.045);box-shadow:0 16px 38px rgba(255,122,0,.20),inset 0 1px rgba(255,255,255,.18)}
 .primary:active,.edfp-spin:active{transform:translateY(1px) scale(.985);filter:brightness(.98)}
 .secondary:active,.close:active,.amount:active,.upgrade-mult:active{transform:scale(.97)}
 .ed-product-tools input,.v26-tools input{
   caret-color:var(--ed-orange);
 }
 .ed-product-tools input::placeholder,.v26-tools input::placeholder{color:#686868}
 .modal{overscroll-behavior:contain}
 .panel{overscroll-behavior:contain;scrollbar-width:thin}
 .panel-body{padding-bottom:max(24px,env(safe-area-inset-bottom))}
 .edx-open{padding-bottom:max(10px,env(safe-area-inset-bottom))!important}
 .edfp-profile-hero,.edfp-profile-panel,.edfp-panel{
   box-shadow:inset 0 1px rgba(255,255,255,.045),0 22px 70px rgba(0,0,0,.42);
 }
 .edfp-profile-hero{isolation:isolate}
 .edfp-profile-hero::before,.edfp-profile-panel::before,.edfp-panel::before{
   content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
   background:radial-gradient(500px 180px at 50% -20%,rgba(255,138,24,.10),transparent 72%);
 }
 .edfp-profile-hero,.edfp-profile-panel,.edfp-panel{position:relative}
 .edfp-avatar{box-shadow:0 14px 30px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.06)}
 .edfp-stat{transition:transform .2s var(--ed-ease),border-color .2s,background .2s,box-shadow .2s}
 .edfp-stat:hover{transform:translateY(-2px);border-color:var(--ed-border-hi);background:#131313;box-shadow:0 10px 24px rgba(0,0,0,.28)}
 .edfp-inv{transition:transform .2s var(--ed-ease),border-color .2s,box-shadow .2s}
 .edfp-inv:hover{transform:translateY(-3px);border-color:#75491f;box-shadow:0 12px 28px rgba(0,0,0,.34)}
 .edfp-wheel{position:relative;isolation:isolate;box-shadow:inset 0 0 0 3px #050505,0 26px 70px rgba(0,0,0,.72),0 0 70px rgba(255,138,24,.12)}
 .edfp-wheel::after{content:"";position:absolute;inset:7%;border-radius:50%;border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 0 30px rgba(255,255,255,.035);pointer-events:none}
 .edfp-owned-card.sel{box-shadow:0 0 0 2px rgba(255,138,24,.14),0 12px 28px rgba(0,0,0,.35)}
 @media(max-width:700px){
   .panel{width:min(100%,96vw);max-height:calc(100dvh - 24px);border-radius:22px}
   .panel-body{padding:16px}
   .case-reel{height:108px}
   .reel-item{flex-basis:78px;height:78px}
   .reel-item strong{font-size:30px}
   .edfp-wheel{width:min(270px,72vw)}
 }
 @media(orientation:landscape) and (max-height:520px){
   .modal{padding:8px}
   .panel{max-height:calc(100dvh - 16px);border-radius:18px}
   .panel-head{padding:12px 16px}
   .panel-body{padding:12px 16px}
   .edx-reel{height:92px!important}
   .edx-open button{min-height:50px!important}
 }
 @media(prefers-reduced-motion:reduce){
   .ed-case::after,.case-card::after,.v26-card::after,.inventory-item::after,.upgrade-target::after,.upgrade-item::after,.edfp-owned-card::after{display:none}
   .edfp-stat:hover,.edfp-inv:hover{transform:none}
 }
 `;
 s.textContent+=`
 /* 11/10 product pass: refine existing surfaces without adding controls. */
 :root{--ed-radius-sm:12px;--ed-radius-md:16px;--ed-radius-lg:22px;--ed-border-soft:rgba(255,255,255,.075);--ed-accent-soft:rgba(255,138,24,.12)}
 .v26-market,.edfp-panel,.edfp-profile-hero,.edfp-profile-panel{border-color:var(--ed-border-soft)!important}
 .v26-market,.edfp-panel{box-shadow:inset 0 1px rgba(255,255,255,.035),0 24px 70px rgba(0,0,0,.42)!important}
 .v26-title,.edfp-head h1{letter-spacing:-.035em}
 .v26-sub,.edfp-head p{line-height:1.45}
 .v26-card{border-color:var(--ed-border-soft);background:linear-gradient(145deg,#161616,#0d0d0d)}
 .v26-card strong,.v26-inv-card b{font-variant-numeric:tabular-nums}
 .v26-empty{background:linear-gradient(145deg,#111,#0b0b0b);line-height:1.5}
 .v26-tools input,.v26-tools select,.v26-tools button{border-color:var(--ed-border-soft)}
 .v26-tools button:focus-visible,.v26-price-editor input:focus-visible{outline:2px solid var(--ed-orange-hi);outline-offset:3px}
 .edfp-head{margin-bottom:12px}
 .edfp-head h1{margin-bottom:4px}
 .edfp-status,.edfp-badge{font-variant-numeric:tabular-nums}
 .edfp-panel{overflow:hidden}
 .edfp-label{letter-spacing:.04em;text-transform:uppercase}
 .edfp-owned-card,.edfp-target,.edfp-chance{transition:transform .18s var(--ed-ease),border-color .18s var(--ed-ease),box-shadow .18s var(--ed-ease)}
 .edfp-owned-card.sel,.edfp-target.selected,.edfp-chance.active{box-shadow:0 0 0 1px rgba(255,138,24,.18),0 10px 26px rgba(0,0,0,.28)}
 .edfp-spin:disabled{filter:saturate(.35);box-shadow:none!important}
 .edfp-wheel{contain:layout paint}
 #edRealLiveDrops{border-color:var(--ed-border-soft)!important;box-shadow:inset 0 1px rgba(255,255,255,.035),0 20px 55px rgba(0,0,0,.38)!important}
 #edRealLiveDrops .ed-live-head{padding-inline:2px}
 #edRealLiveDrops .ed-live-status{font-variant-numeric:tabular-nums}
 #edRealLiveDrops .ed-live-card{border-color:color-mix(in srgb,var(--rarity,#9ca3af) 58%,#292929)!important;transition:transform .18s var(--ed-ease),box-shadow .18s var(--ed-ease)}
 #edRealLiveDrops .ed-live-empty{line-height:1.45}
 .edx-name .t{letter-spacing:-.025em}
 .edx-price,.edx-odd,.edx-reel,.edx-items{border-color:var(--ed-border-soft)}
 .edx-open button{box-shadow:0 14px 34px rgba(255,123,0,.22),inset 0 1px rgba(255,255,255,.28)}
 .edx-result-actions button{transition:transform .16s var(--ed-ease),border-color .16s,filter .16s}
 .edx-result-actions button:hover{filter:brightness(1.05);border-color:#6a4b2a}
 @media(max-width:700px){
   .v26-market{padding:12px!important}
   .v26-card{border-radius:17px}
   .edfp-panel{border-radius:19px}
   .edfp-owned-card,.edfp-target,.edfp-chance{min-height:48px}
   #edRealLiveDrops{padding:10px!important}
 }
 @media(prefers-reduced-motion:reduce){
   .v26-card,.edfp-owned-card,.edfp-target,.edfp-chance,.edfp-spin,.edx-result-actions button,#edRealLiveDrops .ed-live-card{transition:none!important}
 }
 `;
 document.head.appendChild(s);
}
function upgrade(){return window.EmojiDropsUpgradeFinal?.build?.()}
function boot(){style();premiumFinisher();setTimeout(()=>{upgrade()},120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.EmojiDropsFinalProductPolish={version:4,upgrade};
})();