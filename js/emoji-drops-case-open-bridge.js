(()=>{'use strict';
/* Emoji Drops — functional case-open bridge v5. Bind the opener itself and the whole card so programmatic .click(), touch, and rerendered cards all resolve to the authoritative exact renderer. */
const ID='emoji-drops-case-open-bridge-v5';
const KEYS=['smile','moves','nature','food','animals','transport','sport','games'];
const NAMES={smile:'Smile',moves:'Moves',nature:'Nature',food:'Food',animals:'Animals',transport:'Transport',sport:'Sport',games:'Games'};
function keyFor(card,index){
  const direct=card?.dataset?.caseKey||card?.dataset?.case||card?.dataset?.key||card?.getAttribute?.('data-open');
  if(direct)return direct;
  const title=card?.querySelector?.('h3')?.textContent?.trim();
  if(title){const k=KEYS.find(x=>NAMES[x].toLowerCase()===title.toLowerCase());if(k)return k}
  return KEYS[index]||null;
}
function invoke(key){
  const exact=window.EmojiDropsCaseShowcaseExact;
  if(!key||typeof exact?.open!=='function')return false;
  exact.open(key);return true;
}
function bindOpener(opener,key){
  if(!opener||opener.dataset.edBridge===ID)return;
  opener.dataset.edBridge=ID;opener.setAttribute('data-open',key);
  opener.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(invoke(key))return;
    let attempts=0;const retry=()=>{if(invoke(key)||++attempts>=12)return;requestAnimationFrame(retry)};requestAnimationFrame(retry);
  },true);
}
function normalize(){
  document.querySelectorAll('.ed-case').forEach((card,index)=>{
    const key=keyFor(card,index);if(!key)return;
    card.dataset.caseKey=key;
    bindOpener(card.querySelector('[data-open]')||card.querySelector('.ed-btn'),key);
  });
}
function hook(){
  if(window.__emojiDropsCaseOpenBridge===ID)return;
  window.__emojiDropsCaseOpenBridge=ID;normalize();
  document.addEventListener('click',e=>{
    const target=e.target?.closest?.('.ed-case');if(!target)return;
    const cards=[...document.querySelectorAll('.ed-case')];const key=keyFor(target,Math.max(0,cards.indexOf(target)));if(!key)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(invoke(key))return;
    let attempts=0;const retry=()=>{if(invoke(key)||++attempts>=12)return;requestAnimationFrame(retry)};requestAnimationFrame(retry);
  },true);
  new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes?.length))normalize()}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();
