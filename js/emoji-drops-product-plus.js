(()=>{'use strict';
const ID='ed-product-plus-style';
function boot(){
 if(!document.getElementById(ID)){
  const s=document.createElement('style');s.id=ID;s.textContent='.ed-fav{min-width:48px;min-height:48px}.ed-case-detail{display:grid;grid-template-columns:140px 1fr;gap:16px;align-items:center}.ed-case-detail-art{font-size:96px;text-align:center}.ed-history{display:grid;gap:8px}.ed-history-row{display:flex;justify-content:space-between;gap:10px;border:1px solid #292929;background:#111;border-radius:12px;padding:10px}@media(max-width:600px){.ed-case-detail{grid-template-columns:1fr}.ed-case-detail-art{font-size:72px}}';document.head.appendChild(s)
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.EmojiDropsProductPlus={version:6,run:boot};
})();