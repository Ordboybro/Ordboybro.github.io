(()=>{'use strict';
/* Emoji Drops — functional case-open bridge. Keeps visual authority in v21 and routes case cards to the authoritative exact showcase. */
const ID='emoji-drops-case-open-bridge-v2';
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
    card.dataset.caseKey=key;
    const opener=card.querySelector('[data-open]')||card.querySelector('.ed-btn');
    if(opener)opener.setAttribute('data-open',key);
  });
}
function hook(){
  if(window.__emojiDropsCaseOpenBridge===ID)return;
  window.__emojiDropsCaseOpenBridge=ID;
  normalize();
  document.addEventListener('click',e=>{
    const opener=e.target?.closest?.('.ed-case [data-open]');
    if(!opener)return;
    const key=opener.getAttribute('data-open');
    const exact=window.EmojiDropsCaseShowcaseExact;
    if(!key||!exact?.open)return;
    e.preventDefault();e.stopImmediatePropagation();exact.open(key);
  },true);
  new MutationObserver(()=>normalize()).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();
