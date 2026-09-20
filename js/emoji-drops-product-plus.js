(()=>{'use strict';
/* Emoji Drops product-plus v3 (product-plus-3): activity history, market cancellation, case details, keyboard UX and Live Drops DOM ownership. Favorite UI is delegated to final-ux when that owner is present. */
const KEY='emojiDropsStateV3',META='emojiDropsProductV1',FAV='emojiDropsFavoritesV1',HIST='emojiDropsHistoryV1';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],safe=f=>{try{return f()}catch{return null}};
const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const get=(k,d)=>safe(()=>JSON.parse(localStorage.getItem(k)||'null'))??d;
const set=(k,v)=>safe(()=>localStorage.setItem(k,JSON.stringify(v)));
let favorites=new Set(get(FAV,[])), history=get(HIST,[]);if(!Array.isArray(history))history=[];
function saveFavorites(){set(FAV,[...favorites])}
function log(type,payload){history=[{at:Date.now(),type,...payload},...history].slice(0,100);set(HIST,history)}
function style(){if(q('#ed-product-plus-style'))return;const s=document.createElement('style');s.id='ed-product-plus-style';s.textContent=`.ed-fav{position:absolute;right:10px;top:10px;width:48px;height:48px;min-width:48px;min-height:48px;border:1px solid #333;border-radius:12px;background:#111;color:#aaa;z-index:7;display:grid;place-items:center;padding:0;line-height:1}.ed-fav.active{color:#ff9d3d;border-color:#ff7b00;box-shadow:0 0 18px #ff8a2026}.ed-case{position:relative}.ed-case-detail{display:grid;grid-template-columns:140px 1fr;gap:16px;align-items:center}.ed-case-detail-art{font-size:96px;text-align:center}.ed-history{display:grid;gap:8px}.ed-history-row{display:flex;justify-content:space-between;gap:10px;border:1px solid #292929;background:#111;border-radius:12px;padding:10px}.ed-market-card{position:relative}.ed-market-cancel{margin-top:8px}@media(max-width:600px){.ed-case-detail{grid-template-columns:1fr}.ed-case-detail-art{font-size:72px}.ed-fav{right:8px;top:8px}}`;document.head.appendChild(s)}
function liveSlot(){return})();