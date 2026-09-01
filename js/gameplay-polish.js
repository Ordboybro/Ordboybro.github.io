(()=>{'use strict';
/* Final gameplay polish: longer reels, real chance geometry, responsive motion, and optional Realtime presence. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const n=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
function css(){if($('#ed-gameplay-polish'))return;const s=document.createElement('style');s.id='ed-gameplay-polish';s.textContent=`
/* Deliberately longer suspense without blocking the UI thread. */
.case-reel-track,.reel-track{transition-duration:7.2s!important;transition-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.upgrade-wheel{transition-duration:6.8s!important;transition-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.8s!important;animation-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.case-reel,.upgrade-wheel,.ed-upgrade-stage{contain:layout paint;transform:translateZ(0);backface-visibility:hidden}
.case-reel-track,.reel-track,.ed-upgrade-pointer{will-change:transform}
@media(max-width:600px){.case-reel-track,.reel-track{transition-duration:6.4s!important}.upgrade-wheel{transition-duration:6.2s!important}.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.2s!important}}
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
  ch.on('presence',{event:'sync'},()=>{
   const state=ch.presenceState();const count=Object.values(state).reduce((sum,arr)=>sum+arr.length,0);const el=$('#onlineCount');if(el)el.textContent=String(count);
  });
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
