(()=>{'use strict';
/* Emoji Drops — functional case-open bridge v4. Capture the whole case surface so opening never depends on a child hook surviving visual rerenders. */
const ID='emoji-drops-case-open-bridge-v4';
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
    const target=e.target?.closest?.('.ed-case');
    if(!target)return;
    const cards=[...document.querySelectorAll('.ed-case')];
    const index=Math.max(0,cards.indexOf(target));
    const key=keyFor(target,index);
    if(!key)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(invoke(key))return;
    /* Bounded recovery for a renderer that is momentarily unavailable during a rerender. */
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
