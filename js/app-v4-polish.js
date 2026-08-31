(()=>{'use strict';
const RANK={common:1,rare:2,epic:3,mythical:4,legendary:5};
const COLORS={common:'#9ca3af',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ff8a00'};
const value=i=>Number(i?.value)||Number(i?.price)||Number(String(i?.value||i?.price||0).replace(/[^0-9.]/g,''))||0;
const better=(a,b)=>!a?(b||null):!b?a:((RANK[b.rarity]||0)-(RANK[a.rarity]||0))||(value(b)-value(a))>0?b:a;
const users=()=>{try{return JSON.parse(localStorage.getItem('users')||'[]')}catch{return[]}};
const current=()=>localStorage.getItem('currentUser');
const currentUser=()=>users().find(u=>u.email===current())||null;
const nativeSet=()=>window.__edNativeSet||localStorage.setItem.bind(localStorage);
const money=n=>`${Math.round(Number(n)||0)}₽`;

function bestOf(inv){return Array.isArray(inv)?inv.reduce((b,x)=>better(b,x),null):null}
function repairBestStorage(){
 const arr=users(); let changed=false;
 for(const u of arr){
  if(!u?.email)continue;
  const key=`ed:best:${u.email}`; let stored=null;
  try{stored=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  const best=better(stored,u.bestDrop)||bestOf(u.inventory);
  if(!best)continue;
  const serialized=JSON.stringify(best);
  if(localStorage.getItem(key)!==serialized)localStorage.setItem(key,serialized);
  if(JSON.stringify(u.bestDrop)!==serialized){u.bestDrop=JSON.parse(serialized);changed=true}
 }
 if(changed)nativeSet()('users',JSON.stringify(arr));
}
function patchStorage(){
 if(localStorage.__edStablePatch)return;
 const native=localStorage.setItem.bind(localStorage); window.__edNativeSet=native;
 const wrapped=function(key,val){
  if(key==='users'){
   try{
    const arr=JSON.parse(val);
    for(const u of arr){
     if(!u?.email)continue;
     const k=`ed:best:${u.email}`; let stored=null;
     try{stored=JSON.parse(localStorage.getItem(k)||'null')}catch{}
     const best=better(stored,u.bestDrop)||bestOf(u.inventory);
     if(best){const s=JSON.stringify(best);native(k,s);u.bestDrop=JSON.parse(s)}
    }
    val=JSON.stringify(arr)
   }catch{}
  }
  return native(key,val)
 };
 try{Object.defineProperty(localStorage,'setItem',{value:wrapped,configurable:true,writable:true});Object.defineProperty(localStorage,'__edStablePatch',{value:true})}catch{}
}
function repairStats(){
 const u=currentUser(); if(!u)return;
 u.stats=u.stats||{};
 if(!Number.isFinite(Number(u.stats.received)))u.stats.received=0;
 if(!u.stats.edStableV2){
  const invValue=Array.isArray(u.inventory)?u.inventory.reduce((n,x)=>n+value(x),0):0;
  u.stats.received=Math.max(0,Number(u.stats.received)-invValue);
  u.stats.edStableV2=1;
  nativeSet()('users',JSON.stringify(users().map(x=>x.email===u.email?u:x)))
 }
}

function style(){
 if(document.getElementById('ed-stable-style'))return;
 const s=document.createElement('style');s.id='ed-stable-style';
 s.textContent=`
html{font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden}
body{min-width:0!important;width:100%;overflow-x:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
header{height:76px!important;width:100%!important;padding:0 clamp(16px,2.5vw,48px)!important;display:flex!important;align-items:center!important;gap:20px!important}
header .logo{display:flex!important;align-items:center!important;gap:11px!important;min-width:0!important;white-space:nowrap!important;flex:0 1 auto!important}
.ed-logo{width:40px!important;height:40px!important;flex:0 0 40px!important;object-fit:contain!important}
.top-right{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important;flex:0 0 auto!important}
.top-pill,.profile-top{min-height:46px!important;display:flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important}
.top-pill{padding:9px 14px!important}.profile-top{padding:9px 14px!important;max-width:220px!important;overflow:hidden!important;text-overflow:ellipsis!important}
.balance-pill{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-width:108px!important}.balance-symbol{font-size:21px!important;line-height:1!important}.balance-value{font-size:16px!important;font-weight:900!important;font-variant-numeric:tabular-nums!important}
main{width:min(2240px,calc(100% - clamp(32px,5vw,96px)))!important;max-width:none!important;margin-inline:auto!important;padding:30px 0 90px!important}
.hero{margin-bottom:22px!important}.hero h1{font-size:clamp(36px,3.1vw,56px)!important;line-height:1.04!important}
.cases{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(16px,1.7vw,28px)!important;width:100%!important}
.case-tile{min-width:0!important;width:100%!important}.case-tile .case-card{width:100%!important;height:clamp(300px,18vw,360px)!important;min-height:0!important;padding:20px!important;border-radius:26px!important;display:flex!important;flex-direction:column!important;align-items:center!important;overflow:hidden!important}
.case-tile .case-art{width:100%!important;flex:1 1 auto!important;min-height:0!important;height:auto!important;display:grid!important;place-items:center!important;font-size:clamp(70px,5vw,100px)!important}.case-info{width:100%!important;min-height:104px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important}.case-name{font-size:clamp(19px,1.4vw,24px)!important}.case-price span{font-size:clamp(19px,1.4vw,23px)!important}
.live-section{margin-top:30px!important}.live-title{display:flex!important;align-items:center!important;gap:8px!important}.live-container{scroll-behavior:smooth!important}
.live-drop{transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease!important}.live-drop:hover{transform:translateY(-2px)!important}
.panel{width:min(1180px,calc(100vw - 40px))!important;max-width:none!important}.panel-body{min-width:0!important}
.profile-layout{grid-template-columns:minmax(210px,.85fr) minmax(300px,1.3fr) minmax(210px,.85fr)!important;gap:18px!important;align-items:stretch!important}.profile-center{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;min-height:190px!important}.profile-side{justify-content:center!important}.profile-btn{min-height:54px!important}.profile-dashboard{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important;margin:24px 0 0!important;position:relative!important;z-index:2!important}.profile-stat{min-width:0!important;min-height:78px!important;text-align:center!important}.best{width:min(100%,620px)!important;min-height:88px!important;justify-content:center!important}.inventory{margin-top:30px!important}.inventory .section-title{text-align:center!important;letter-spacing:.16em!important}
#upgradeModal .panel{width:min(1260px,calc(100vw - 40px))!important}.upgrade-runtime{display:grid!important;grid-template-columns:minmax(280px,1fr) minmax(300px,340px) minmax(280px,1fr)!important;gap:24px!important;align-items:start!important}.upgrade-box{min-width:0!important}.upgrade-slot{min-height:190px!important}.upgrade-items{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(62px,1fr))!important;gap:8px!important;max-height:220px!important;overflow:auto!important}.upgrade-item{min-width:0!important;text-align:center!important}.upgrade-wheel-col{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;padding-top:2px!important;min-width:0!important}.upgrade-wheel-wrap{position:relative!important;width:300px!important;height:300px!important;display:grid!important;place-items:center!important;flex:0 0 auto!important}.upgrade-wheel{width:286px!important;height:286px!important;position:relative!important;border-radius:50%!important;border:8px solid #292929!important;overflow:hidden!important;box-shadow:0 0 0 2px #ff7b0030,0 0 50px #ff7b0038,inset 0 0 36px #000!important;will-change:transform!important;transform-origin:center center!important}.upgrade-wheel:before{content:''!important;position:absolute!important;inset:10px!important;border-radius:50%!important;border:2px solid #ffffff1a!important;box-shadow:inset 0 0 26px #000!important;pointer-events:none!important}.upgrade-wheel:after{content:''!important;position:absolute!important;inset:24px!important;border-radius:50%!important;border:1px dashed #ffffff28!important;pointer-events:none!important}.upgrade-pointer{position:absolute!important;left:50%!important;top:-3px!important;z-index:20!important;transform:translateX(-50%)!important;width:0!important;height:0!important;border-left:16px solid transparent!important;border-right:16px solid transparent!important;border-top:30px solid #ff9a2e!important;filter:drop-shadow(0 0 10px #ff7b00)!important}.upgrade-wheel .wheel-center{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:94px!important;height:94px!important;z-index:5!important;border-radius:50%!important;background:radial-gradient(circle at 50% 35%,#24170b,#0c0c0c 72%)!important;border:2px solid #ff9a2e!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;box-shadow:0 0 28px #ff7b0050,inset 0 0 20px #000!important}.chance-value{font-size:25px!important;font-weight:900!important;color:#fff!important;line-height:1!important}.chance-caption{font-size:9px!important;letter-spacing:.14em!important;color:#ff9a2e!important;font-weight:900!important;margin-top:5px!important}.wheel-label{display:none!important}.upgrade-chance{font-size:14px!important;min-height:34px!important;padding:9px 14px!important;border:1px solid #333!important;border-radius:12px!important;background:#151515!important;text-align:center!important;color:#ff9d3d!important}.upgrade-mults{margin:0!important;display:flex!important;justify-content:center!important;gap:7px!important;flex-wrap:wrap!important}.upgrade-mult{min-width:58px!important;transition:transform .18s ease,border-color .18s ease,background .18s ease!important}.upgrade-mult:hover{transform:translateY(-2px)!important}.upgrade-wheel{transition:transform 5.8s cubic-bezier(.12,.72,.08,1)!important}
#amountLabel{display:none!important}.amounts{margin:0 0 9px!important;justify-content:center!important}.amount{transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease!important}.amount.active{transform:translateY(-1px)!important;box-shadow:0 0 0 2px #ff7b0030,0 6px 18px #0008!important}.reel-actions{display:flex!important;justify-content:center!important;align-items:center!important;gap:10px!important}.reel-actions #openBtn,.reel-actions .reel-fast{min-width:190px!important;min-height:50px!important}
.ed-dot{display:inline-block!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#ff3b30!important;box-shadow:0 0 10px #ff3b30!important;animation:edPulse 1.15s ease-in-out infinite!important;flex:0 0 8px!important}@keyframes edPulse{0%,100%{opacity:.45;transform:scale(.86)}50%{opacity:1;transform:scale(1);box-shadow:0 0 16px #ff3b30}}
@media(max-width:1199px) and (min-width:701px){main{width:calc(100% - 44px)!important}.cases{grid-template-columns:repeat(3,minmax(0,1fr))!important}.case-tile .case-card{height:315px!important}.upgrade-runtime{grid-template-columns:minmax(220px,1fr) 270px minmax(220px,1fr)!important}.upgrade-wheel-wrap{width:250px!important;height:250px!important}.upgrade-wheel{width:238px!important;height:238px!important}}
@media(max-width:700px){header{height:66px!important;padding:0 10px!important;gap:7px!important}.logo{font-size:19px!important;gap:6px!important;flex:1 1 auto!important}.ed-logo{width:30px!important;height:30px!important;flex-basis:30px!important}.top-right{gap:5px!important}.top-right .top-pill{min-height:42px!important;padding:7px 8px!important}.top-right .top-pill:first-child{min-width:40px!important;font-size:0!important}.top-right .top-pill:first-child #onlineCount{font-size:12px!important}.top-right .top-pill:first-child .ed-dot{width:7px!important;height:7px!important}.balance-pill{min-width:68px!important}.balance-symbol{font-size:18px!important}.balance-value{font-size:13px!important}.profile-top{max-width:88px!important;min-height:42px!important;padding:7px 8px!important;font-size:12px!important}main{width:calc(100% - 24px)!important;padding:20px 0 60px!important}.hero{margin-bottom:14px!important}.hero h1{font-size:30px!important;line-height:1.08!important}.cases{grid-template-columns:1fr!important;gap:14px!important}.case-tile .case-card{height:252px!important;border-radius:20px!important;padding:15px!important}.case-tile .case-art{font-size:72px!important}.case-info{min-height:86px!important}.live-section{margin-top:22px!important}.live-container{overflow-x:auto!important;scrollbar-width:none!important}.live-container::-webkit-scrollbar{display:none}.modal{padding:10px!important}.panel{width:100%!important;max-width:100%!important;max-height:calc(100dvh - 20px)!important;border-radius:22px!important}.panel-head{padding:17px!important}.panel-body{padding:17px!important}.profile-layout{grid-template-columns:1fr!important;gap:10px!important}.profile-center{min-height:170px!important;padding:20px!important}.profile-layout>.profile-side:first-child,.profile-layout>.profile-side:last-child{display:grid!important;grid-template-columns:1fr 1fr!important}.profile-dashboard{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;margin-top:14px!important}.profile-stat{padding:11px 4px!important;min-height:68px!important}.profile-stat small{font-size:9px!important}.profile-stat b{font-size:15px!important}.best{width:100%!important;min-height:76px!important}.inventory{padding:18px 4px!important}.inventory-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.upgrade-runtime{grid-template-columns:1fr!important;gap:12px!important}.upgrade-box.source{order:1!important}.upgrade-wheel-col{order:2!important}.upgrade-box.target{order:3!important}.upgrade-submit{order:4!important}.upgrade-wheel-wrap{width:210px!important;height:210px!important}.upgrade-wheel{width:198px!important;height:198px!important}.upgrade-pointer{border-left-width:12px!important;border-right-width:12px!important;border-top-width:23px!important}.upgrade-wheel .wheel-center{width:66px!important;height:66px!important}.chance-value{font-size:18px!important}.chance-caption{font-size:7px!important}.upgrade-items{grid-template-columns:repeat(4,minmax(0,1fr))!important;max-height:250px!important}.upgrade-item{min-height:62px!important;font-size:23px!important}.reel-actions{display:grid!important;grid-template-columns:1fr 1fr!important}.reel-actions #openBtn,.reel-actions .reel-fast{min-width:0!important;width:100%!important}}
@media(max-width:380px){.logo{font-size:17px!important}.profile-top{max-width:76px!important;font-size:11px!important}.hero h1{font-size:28px!important}.profile-stat b{font-size:14px!important}.upgrade-wheel-wrap{width:190px!important;height:190px!important}.upgrade-wheel{width:180px!important;height:180px!important}}
@media(prefers-reduced-motion:reduce){.ed-dot,.case-card,.live-drop,.amount,.upgrade-mult,.upgrade-wheel{animation:none!important;transition:none!important}}
`;
 document.head.appendChild(s)
}

function updateWheel(){
 const w=document.getElementById('upgradeWheel'); if(!w)return;
 const active=document.querySelector('.upgrade-mult.active');
 const mult=Number(active?.dataset.mult||2); const chance=100/mult; const deg=Math.max(0,Math.min(360,chance*3.6));
 const bg=`conic-gradient(from -90deg,#ff9a2e 0deg ${deg}deg,#252525 ${deg}deg 360deg)`;
 if(w.dataset.edBg!==bg){w.style.background=bg;w.dataset.edBg=bg}
 let c=w.querySelector('.wheel-center');
 if(!c){c=document.createElement('div');c.className='wheel-center';w.appendChild(c)}
 const v=`${chance.toFixed(chance%1?1:0)}%`;
 if(c.dataset.chance!==v){c.dataset.chance=v;c.innerHTML=`<span class="chance-value">${v}</span><span class="chance-caption">ШАНС</span>`}
}
function polishUpgrade(){
 updateWheel();
 const ch=document.querySelector('.upgrade-chance');
 if(ch){const a=document.querySelector('.upgrade-mult.active');const m=Number(a?.dataset.mult||2);const text=`${(100/m).toFixed(m%1?1:0)}% шанс · цель ≥ ×${m}`;if(ch.textContent!==text)ch.textContent=text}
}
function profileRepair(){
 const u=currentUser();if(!u)return;repairBestStorage();
 let stored=null;try{stored=JSON.parse(localStorage.getItem(`ed:best:${u.email}`)||'null')}catch{}
 const best=better(stored,u.bestDrop)||bestOf(u.inventory); const el=document.getElementById('bestDrop');if(!el)return;
 if(best){el.innerHTML=`<strong>${best.emoji||'🏆'}</strong><span>${best.rarity?.toUpperCase()||'DROP'}</span><small>${money(value(best))}</small>`;el.style.setProperty('--rarity',COLORS[best.rarity]||COLORS.common)}else el.innerHTML='<strong>🏆</strong><span>Нет дропа</span>'
}
function wrap(name,fn){const old=window[name];if(typeof old!=='function'||old.__edStableWrap)return;const w=function(...args){const r=old.apply(this,args);requestAnimationFrame(fn);return r};w.__edStableWrap=true;window[name]=w}
function init(){
 style();patchStorage();repairBestStorage();repairStats();
 wrap('renderAll',()=>{repairBestStorage();repairStats();profileRepair();polishUpgrade()});
 wrap('profileSync',profileRepair);wrap('openUpgrade',()=>setTimeout(polishUpgrade,0));
 document.addEventListener('click',e=>{if(e.target.closest('.upgrade-mult,[data-src],[data-target],#upgradeSubmit'))setTimeout(polishUpgrade,30)},{passive:true});
 let scheduled=false;
 const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(document.getElementById('upgradeWheel'))polishUpgrade()})});
 observer.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>{repairBestStorage();repairStats();profileRepair();polishUpgrade()},80)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();