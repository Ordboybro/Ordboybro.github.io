(()=>{'use strict';
/* Emoji Drops — functional case-open bridge v7. Waits for authoritative case data, supports programmatic/physical activation, and recovers after rerenders. */
const ID='emoji-drops-case-open-bridge-v7';
const KEYS=['smile','moves','nature','food','animals','transport','sport','games'];
const NAMES={smile:'Smile',moves:'Moves',nature:'Nature',food:'Food',animals:'Animals',transport:'Transport',sport:'Sport',games:'Games'};
function keyFor(card,index){
  const direct=card?.dataset?.caseKey||card?.dataset?.case||card?.dataset?.key||card?.getAttribute?.('data-open');
  if(direct)return String(direct);
  const title=card?.querySelector?.('h3')?.textContent?.trim();
  if(title){const k=KEYS.find(x=>NAMES[x].toLowerCase()===title.toLowerCase());if(k)return k}
  return KEYS[index]||null;
}
function ready(key){return !!key&&!!window.EmojiDropsCaseShowcaseExact&&typeof window.EmojiDropsCaseShowcaseExact.open==='function'&&Array.isArray(window.cases?.[key])&&Number.isFinite(Number(window.casePrices?.[key]));}
function invoke(key){if(!ready(key))return false;try{window.EmojiDropsCaseShowcaseExact.open(key);return !!document.querySelector('#edExact.show')}catch(err){console.warn('Emoji Drops case open deferred',err);return false}}
function retry(key){let attempts=0;const run=()=>{if(invoke(key)||++attempts>=60)return;requestAnimationFrame(run)};run()}
function delayedRetry(key){retry(key);setTimeout(()=>retry(key),80);setTimeout(()=>retry(key),250);setTimeout(()=>retry(key),700);setTimeout(()=>retry(key),1400)}
function bindOpener(opener,key){
  if(!opener||opener.dataset.edBridge===ID)return;
  opener.dataset.edBridge=ID;opener.setAttribute('data-open',key);
  opener.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!invoke(key))delayedRetry(key);
  },true);
}
function normalize(){
  document.querySelectorAll('.ed-case').forEach((card,index)=>{
    const opener=card.querySelector('[data-open]')||card.querySelector('.ed-btn');
    const key=keyFor(opener||card,index);if(!key)return;
    card.dataset.caseKey=key;
    bindOpener(opener,key);
  });
}
function hook(){
  if(window.__emojiDropsCaseOpenBridge===ID)return;
  window.__emojiDropsCaseOpenBridge=ID;
  const nativeClick=Element.prototype.click;
  Element.prototype.click=function(){
    const opener=this?.matches?.('.ed-case [data-open],.ed-case .ed-btn');
    if(opener){
      const card=this.closest('.ed-case');
      const cards=[...document.querySelectorAll('.ed-case')];
      const key=keyFor(this,Math.max(0,cards.indexOf(card)));
      if(invoke(key))return;
      delayedRetry(key);
      return;
    }
    return nativeClick.call(this);
  };
  normalize();
  document.addEventListener('click',e=>{
    const opener=e.target?.closest?.('.ed-case [data-open],.ed-case .ed-btn');
    if(opener){
      const card=opener.closest('.ed-case');
      const cards=[...document.querySelectorAll('.ed-case')];
      const key=keyFor(opener,Math.max(0,cards.indexOf(card)));
      e.preventDefault();e.stopImmediatePropagation();
      if(!invoke(key))delayedRetry(key);
      return;
    }
    const card=e.target?.closest?.('.ed-case');
    if(!card)return;
    const cards=[...document.querySelectorAll('.ed-case')];
    const key=keyFor(card,Math.max(0,cards.indexOf(card)));if(!key)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!invoke(key))delayedRetry(key);
  },true);
  new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes?.length||m.type==='attributes'))normalize()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-open']});
  document.addEventListener('DOMContentLoaded',normalize,{once:true});
  window.addEventListener('pageshow',normalize);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();