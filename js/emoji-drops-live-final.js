(()=>{'use strict';
/* Emoji Drops — Live Drops final owner. Real Supabase rows only; Realtime with controlled polling fallback. */
const ROOT='#view-cases',ID='edRealLiveDrops';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const rub=v=>Math.round(Number(v)||0).toLocaleString('ru-RU')+' ₽';
let timer=0,interval=0,rotateTimer=0,observer=0,channel=0,lastKey='',inFlight=false,booted=false,authReady=0,authChange=0,visibilityHandler=0,pagehideHandler=0,pageshowHandler=0,lastRows=[],rotationPaused=false;
function cfg(){return window.EMOJI_DROPS_SUPABASE||{}}
function client(){return window.EmojiDropsAuth?.client||null}
function css(){
 if(document.getElementById('ed-live-final-css'))return;
 const s=document.createElement('style');s.id='ed-live-final-css';
 s.textContent='#edRealLiveDrops{margin:14px 0 18px;padding:14px;border:1px solid #302a23;border-radius:20px;background:radial-gradient(circle at 0 0,#ff8a0012,transparent 38%),linear-gradient(145deg,#151515,#0a0a0a);box-shadow:inset 0 1px #fff1,0 14px 34px #0007}#edRealLiveDrops .ed-live-head{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:10px}#edRealLiveDrops h2{font-size:16px;margin:0}#edRealLiveDrops .ed-live-status{font-size:9px;color:#8ddf9a;font-weight:900;letter-spacing:.08em}#edRealLiveDrops .ed-live-list{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none;padding:2px 1px 4px}#edRealLiveDrops .ed-live-list::-webkit-scrollbar{display:none}#edRealLiveDrops .ed-live-card{flex:0 0 190px;min-width:0;display:grid;grid-template-columns:44px 1fr;gap:9px;align-items:center;padding:9px;border:1px solid #292929;border-radius:14px;background:#121212}#edRealLiveDrops .ed-live-card .e{width:44px;height:44px;display:grid;place-items:center;border-radius:11px;background:#0b0b0b;font-size:25px}#edRealLiveDrops .ed-live-card b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#edRealLiveDrops .ed-live-card span{display:block;color:#888;font-size:9px;margin-top:3px}#edRealLiveDrops .ed-live-card strong{display:block;color:#ffbd62;font-size:10px;margin-top:3px}#edRealLiveDrops .ed-live-empty{padding:18px 12px;text-align:center;color:#999;border:1px dashed #39332b;border-radius:14px;min-width:100%;background:linear-gradient(145deg,#111,#0b0b0b)}#edRealLiveDrops .ed-live-empty b{display:block;color:#ddd;margin-bottom:5px}@media(max-width:600px){#edRealLiveDrops{margin-top:14px;padding:10px;border-radius:17px}#edRealLiveDrops .ed-live-card{flex-basis:170px}}@media(prefers-reduced-motion:reduce){#edRealLiveDrops *{animation:none!important;transition:none!important}}';
 document.head.appendChild(s)
}
function host(){return document.querySelector(ROOT)}
function paint(rows,configured,error){
 const root=host();if(!root)return;
 let section=document.getElementById(ID);
 if(!section){section=document.createElement('section');section.id=ID;const cases=root.querySelector('.ed-cases');if(cases)root.insertBefore(section,cases);else root.appendChild(section)}else{const cases=root.querySelector('.ed-cases');if(cases&&section.nextElementSibling!==cases)root.insertBefore(section,cases)}
 const clean=Array.isArray(rows)?rows.slice(0,20):[];lastRows=clean;
 const key=JSON.stringify(clean.map(x=>[x.id,x.created_at,x.item_price]));
 if(key===lastKey&&section.childElementCount&&!error)return;
 lastKey=key;
 const cards=clean.map(function(d){
   const i=d&&d.item||{};
   return '<article class="ed-live-card"><div class="e">'+esc(i.emoji||'🎁')+'</div><div><b>'+esc(d.nickname||'Player')+' · '+esc(String(i.rarity||'common').toUpperCase())+'</b><span>'+esc(d.case_id||i.case_id||'Case')+' · '+(d.created_at?new Date(d.created_at).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'')+'</span><strong>'+rub(d.item_price??i.price)+'</strong></div></article>'
 }).join('');
 section.innerHTML='<div class="ed-live-head"><div><h2>Live Drops</h2><div style="color:#777;font-size:10px;margin-top:3px">Реальные открытия игроков</div></div><span class="ed-live-status">'+(error?'● ERROR':configured?'● DATABASE':'● OFFLINE')+'</span></div><div class="ed-live-list">'+(error?'<div class="ed-live-empty"><b>Не удалось загрузить открытия</b>Проверь соединение с базой и попробуй обновить страницу.</div>':cards||'<div class="ed-live-empty"><b><span class="ed-live-pulse">●</span> Лента активна</b><span>Ожидаем первое реальное открытие игроков…</span><small style="display:block;margin-top:7px;color:#666">Новые события проверяются каждые 3 секунды.</small></div>')+'</div>';bindInteractionPause()
}
async function refresh(){
 if(inFlight)return;
 const c=client(),ok=Boolean(cfg().url&&cfg().anonKey&&c);
 if(!ok){paint([],false,false);return}
 inFlight=true;
 try{
   const q=c.from('live_drops').select('id,nickname,item,case_id,item_price,created_at').order('created_at',{ascending:false}).limit(20);
   const r=await q;if(r?.error)throw r.error;
   paint(Array.isArray(r?.data)?r.data:[],true,false)
 }catch(e){paint(lastRows,true,true)}
 finally{inFlight=false}
}
function schedule(){clearTimeout(timer);timer=setTimeout(refresh,60)}
function subscribe(){const c=client();if(!c?.channel||channel)return;try{channel=c.channel('emoji-drops-live-final').on('postgres_changes',{event:'INSERT',schema:'public',table:'live_drops'},()=>schedule()).subscribe()}catch{channel=0}}
function stopLoops(unsubscribe=false){if(interval){clearInterval(interval);interval=0}if(rotateTimer){clearInterval(rotateTimer);rotateTimer=0}if(unsubscribe&&channel){try{channel.unsubscribe?.()}catch{}channel=0}}
function startLoops(){if(!booted||document.hidden)return;if(!interval)interval=window.setInterval(refresh,3000);if(!rotateTimer&&!rotationPaused&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)rotateTimer=window.setInterval(()=>{const list=document.querySelector('#edRealLiveDrops .ed-live-list');if(list&&lastRows.length>1&&!rotationPaused)list.scrollBy({left:190,behavior:'smooth'});},3000)}
function bindInteractionPause(){const root=document.getElementById(ID);const list=root?.querySelector('.ed-live-list');if(!list||list.dataset.pauseBound)return;list.dataset.pauseBound='1';const pause=()=>{rotationPaused=true;if(rotateTimer){clearInterval(rotateTimer);rotateTimer=0}};const resume=()=>{rotationPaused=false;startLoops()};list.addEventListener('pointerenter',pause,{passive:true});list.addEventListener('pointerleave',resume,{passive:true});list.addEventListener('touchstart',pause,{passive:true});list.addEventListener('touchend',resume,{passive:true});list.addEventListener('touchcancel',resume,{passive:true})}
function boot(){
 if(booted)return;booted=true;css();schedule();subscribe();startLoops();bindInteractionPause();
 authReady=()=>{schedule();subscribe()};authChange=()=>{try{channel?.unsubscribe?.()}catch{}channel=0;schedule();subscribe()};window.addEventListener('emoji-drops-auth-ready',authReady,{passive:true});
 window.addEventListener('emoji-drops-auth-change',authChange,{passive:true});
 observer=new MutationObserver(function(m){if(!m.some(x=>x.addedNodes?.length))return;if(host()&&!document.getElementById(ID))schedule()});
 observer.observe(document.body,{childList:true,subtree:true});
 visibilityHandler=()=>{if(document.hidden)stopLoops(true);else{schedule();subscribe();startLoops()}};
 pagehideHandler=()=>stopLoops(true);
 pageshowHandler=startLoops;
 document.addEventListener('visibilitychange',visibilityHandler);
 window.addEventListener('pagehide',pagehideHandler,{passive:true});
 window.addEventListener('pageshow',pageshowHandler,{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.EmojiDropsLiveFinal={refresh:refresh,version:5,destroy:function(){clearTimeout(timer);stopLoops();observer?.disconnect();try{channel?.unsubscribe?.()}catch{}channel=0;if(authReady)window.removeEventListener('emoji-drops-auth-ready',authReady);if(authChange)window.removeEventListener('emoji-drops-auth-change',authChange);if(visibilityHandler)document.removeEventListener('visibilitychange',visibilityHandler);if(pagehideHandler)window.removeEventListener('pagehide',pagehideHandler);if(pageshowHandler)window.removeEventListener('pageshow',pageshowHandler);authReady=0;authChange=0;visibilityHandler=0;pagehideHandler=0;pageshowHandler=0;booted=false}};
})();