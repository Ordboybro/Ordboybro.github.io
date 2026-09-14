(()=>{'use strict';
/* Emoji Drops — functional case-open bridge v3. Deterministic opener routing with event-scoped readiness recovery. */
const ID='emoji-drops-case-open-bridge-v3';
const KEYS=['smile','moves','nature','food','animals','transport','sport','games'];
const NAMES={smile:'Smile',moves:'Moves',nature:'Nature',food:'Food',animals:'Animals',transport:'Transport',sport:'Sport',games:'Games'};
function keyFor(card,index){
  const direct=card.dataset.caseKey||card.dataset.case||card.dataset.key||card.getAttribute('data-open');
  if(direct&&window.cases?.[direct])return direct;
  const title=card.querySelector('h3')?.textContent?.trim();
  if(title){const k=KEYS.find(x=>NAMES[x].toLowerCase()===title.toLowerCase());if(k)return k}
  return KEYS[index]||null;
}
function normalize(){
  document.querySelectorAll('.ed-case').forEach((card,index)=>{
    const key=keyFor(card,index);if(!key)return;
    if(card.dataset.caseKey!==key)card.dataset.caseKey=key;
    const opener=card.querySelector('[data-open]')||card.querySelector('.ed-btn');
    if(opener&&opener.getAttribute('data-open')!==key)opener.setAttribute('data-open',key);
  });
}
function invoke(key){
  const exact=window.EmojiDropsCaseShowcaseExact;
  if(!key||typeof exact?.open!=='function')return false;
  exact.open(key);return true;
}
function hook(){
  if(window.__emojiDropsCaseOpenBridge===ID)return;
  window.__emojiDropsCaseOpenBridge=ID;
  normalize();
  document.addEventListener('click',e=>{
    const opener=e.target?.closest?.('.ed-case [data-open]');
    if(!opener)return;
    const key=opener.getAttribute('data-open');
    if(!key)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(invoke(key))return;
    /* The app loader is synchronous, but keep the user action recoverable if a renderer
       is momentarily unavailable. This is bounded to this click; no background polling. */
    let attempts=0;
    const retry=()=>{if(invoke(key)||++attempts>=12)return;requestAnimationFrame(retry)};
    requestAnimationFrame(retry);
  },true);
  new MutationObserver(mutations=>{
    if(mutations.some(m=>m.addedNodes?.length))normalize();
  }).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();
