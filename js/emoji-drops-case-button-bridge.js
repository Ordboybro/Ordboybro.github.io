(()=>{'use strict';
/* Emoji Drops — compatibility bridge for the transparent case action button. The authoritative renderer owns the modal; this only prevents legacy handlers from receiving the same card activation. */
let installed=false;
function install(){
  if(installed)return;
  installed=true;
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('.ed-case>.ed-btn,[data-open].ed-btn');
    if(!btn)return;
    const card=btn.closest('.ed-case,.case-card,[data-case-key],[data-case]');
    if(!card)return;
    const key=btn.getAttribute('data-open')||card.dataset.caseKey||card.dataset.case||card.getAttribute('data-key');
    if(!key||!window.EmojiDropsCaseShowcaseExact?.open)return;
    const catalog=window.cases?.[key];
    const price=Number(window.casePrices?.[key]||0);
    if(!Array.isArray(catalog)&&price<=0)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.EmojiDropsCaseShowcaseExact.open(key);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
