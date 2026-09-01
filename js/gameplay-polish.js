(()=>{'use strict';
/* Final gameplay polish: longer reels, real chance geometry, responsive motion, and optional Realtime presence. */
const $=(s,r=document)=>r.querySelector(s);
const n=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
function css(){if($('#ed-gameplay-polish'))return;const s=document.createElement('style');s.id='ed-gameplay-polish';s.textContent=`
/* One final responsive authority: remove the old one-column mobile override. */
html,body{overflow-x:hidden;width:100%;min-width:0}
.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.35vw,22px)!important}
.home-divider{display:block!important;height:2px!important;width:100%!important;opacity:1!important;position:relative!important;top:-2px!important;margin-bottom:22px!important;background:linear-gradient(90deg,transparent 0,#ff7b00 7%,#ff7b00 93%,transparent 100%)!important;box-shadow:0 0 14px #ff7b0033!important}
.live-section{position:fixed!important;left:clamp(12px,2vw,36px)!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;box-sizing:border-box!important}
.live-container{width:100%!important;max-width:none!important}
/* Deliberately longer suspense without blocking the UI thread. */
.case-reel-track,.reel-track{transition-duration:7.2s!important;transition-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.upgrade-wheel{transition-duration:6.8s!important;transition-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.8s!important;animation-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.case-reel,.upgrade-wheel,.ed-upgrade-stage{contain:layout paint;transform:translateZ(0);backface-visibility:hidden}
.case-reel-track,.reel-track,.ed-upgrade-pointer{will-change:transform}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:600px){
 .cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
 .case-tile .case-card{height:245px!important;min-height:245px!important}
 .live-section{left:12px!important;right:0!important;width:auto!important}
 .case-reel-track,.reel-track{transition-duration:6.4s!important}
 .upgrade-wheel{transition-duration:6.2s!important}
 .ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.2s!important}
}
@media(max-width:360px){.cases{gap:7px!important}.case-tile .case-card{height:225px!important;min-height:225px!important}}
@media(prefers-reduced-motion:reduce){.case-reel-track,.reel-track,.upgrade-wheel,.ed-upgrade-stage.spin .ed-upgrade-pointer{transition-duration:.001ms!important;animation-duration:.001ms!important}}
`;
document.head.appendChild(s)}
function normalizeTargets(){
 const root=$('#upgradeModal')||$('.upgrade-runtime')?.closest('.panel')||$('.upgrade-modal');if(!root)return;
 const source=root.querySelector('[data-upgrade-source-price],.source .u-value,.source .upgrade-value,.upgrade-slot:first-child .u-value');
 const sourcePrice=n(source?.dataset?.upgradeSourcePrice||source?.dataset?.price||source?.textContent);
 const active=root.querySelector('.upgrade-mult.active,[data-multiplier].active');
 const mult=n(active?.dataset?.multiplier||active?.textContent)||2;
 if(sourcePrice<=0)return;
 root.dataset.sourcePrice=String(sourcePrice);root.dataset.multiplier=String(mult);
 root.querySelectorAll('.upgrade-target,.upgrade-item.target').forEach(item=>{
   const price=n(item.dataset.price||item.dataset.value||item.querySelector('.item-value,.u-value,small')?.textContent);
   const valid=price>sourcePrice&&price<=sourcePrice*mult+0.000001;
   item.classList.toggle('is-invalid',!valid);item.setAttribute('aria-disabled',String(!valid));
   if(!valid)item.classList.remove('selected','active');
 });
 const selected=root.querySelector('.upgrade-target.selected,.upgrade-target.active,.upgrade-item.target.selected');
 const targetPrice=n(selected?.dataset?.price||selected?.dataset?.value||selected?.querySelector('.item-value,.u-value,small')?.textContent);
 const chance=targetPrice>sourcePrice?Math.min(100,(sourcePrice/targetPrice)*95):0;
 root.dataset.chance=String(chance);
 const label=root.querySelector('.upgrade-chance');if(label)label.textContent=`Шанс: ${chance.toFixed(chance<10?2:1)}%`;
 const stage=root.querySelector('.ed-upgrade-stage');if(stage){stage.style.setProperty('--chance',chance+'%');const c=$('.ed-upgrade-center',stage);if(c)c.textContent=chance.toFixed(chance<10?1:0)+'%'}
}
function guard(e){
 const target=e.target.closest('.upgrade-target,.upgrade-item.target');if(target?.classList.contains('is-invalid')){e.preventDefault();e.stopImmediatePropagation();return}
 if(e.target.closest('.upgrade-mult,[data-multiplier]'))setTimeout(normalizeTargets,0);
 if(target)setTimeout(normalizeTargets,0);
}
function presence(){
 const A=window.EmojiDropsAuth;if(!A?.configured||!A.onlineChannel)return;
 try{
  const ch=A.onlineChannel();
  ch.on('presence',{event:'sync'},()=>{const state=ch.presenceState();const count=Object.values(state).reduce((sum,arr)=>sum+arr.length,0);const el=$('#onlineCount');if(el)el.textContent=String(count)});
  ch.subscribe(async status=>{if(status==='SUBSCRIBED'){const session=await A.getSession();await ch.track({user_id:session?.user?.id||null,page:location.pathname,at:Date.now()})}});
  window.addEventListener('beforeunload',()=>{try{ch.untrack()}catch{}});
 }catch(err){console.warn('[Emoji Drops] Presence unavailable',err)}
}
function liveDrops(){
 const A=window.EmojiDropsAuth;if(!A?.configured||!A.liveDropsChannel)return;
 try{const ch=A.liveDropsChannel();ch.on('postgres_changes',{event:'INSERT',schema:'public',table:'live_drops'},payload=>window.dispatchEvent(new CustomEvent('emoji-drops-live-drop',{detail:payload.new}))).subscribe()}catch(err){console.warn('[Emoji Drops] Live Drops realtime unavailable',err)}
}
css();document.addEventListener('click',guard,true);window.addEventListener('emoji-drops-auth-change',()=>{presence();liveDrops()});setTimeout(()=>{normalizeTargets();presence();liveDrops()},500);setInterval(()=>{if(!document.hidden)normalizeTargets()},1000);
})();
