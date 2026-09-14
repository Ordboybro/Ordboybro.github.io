(()=>{'use strict';
/* Emoji Drops — functional case-open bridge v8. Deterministic activation for physical and programmatic openers, resilient to rerenders and late data. */
const ID='emoji-drops-case-open-bridge-v8';
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
function visible(key){return !!key&&!!document.querySelector('#edExact.show')&&!!document.querySelector('#edExactBox .edx-open button');}
function invoke(key){if(!ready(key))return false;try{window.EmojiDropsCaseShowcaseExact.open(key);return visible(key)}catch(err){console.warn('Emoji Drops case open deferred',err);return false}}
function retry(key){let attempts=0;const run=()=>{if(invoke(key)||++attempts>=90)return;requestAnimationFrame(run)};run()}
function delayedRetry(key){retry(key);setTimeout(()=>retry(key),80);setTimeout(()=>retry(key),250);setTimeout(()=>retry(key),700);setTimeout(()=>retry(key),1400);setTimeout(()=>retry(key),2200)}
function activate(opener,key,event){
  if(event){event.preventDefault();event.stopImmediatePropagation();}
  if(!invoke(key))delayedRetry(key);
  return false;
}
function bindOpener(opener,key){
  if(!opener)return;
  opener.dataset.edBridge=ID;opener.setAttribute('data-open',key);
  if(!opener.__edBridgeClick){
    opener.__edBridgeClick=true;
    opener.addEventListener('click',e=>activate(opener,key,e),true);
    opener.click=()=>activate(opener,key,null);
  }
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
  normalize();
  document.addEventListener('click',e=>{
    const opener=e.target?.closest?.('.ed-case [data-open],.ed-case .ed-btn');
    if(opener){
      const card=opener.closest('.ed-case');
      const cards=[...document.querySelectorAll('.ed-case')];
      const key=keyFor(opener,Math.max(0,cards.indexOf(card)));
      activate(opener,key,e);return;
    }
    const card=e.target?.closest?.('.ed-case');
    if(!card)return;
    const cards=[...document.querySelectorAll('.ed-case')];
    const key=keyFor(card,Math.max(0,cards.indexOf(card)));if(!key)return;
    activate(card,key,e);
  },true);
  new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes?.length||m.type==='attributes'))normalize()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-open']});
  document.addEventListener('DOMContentLoaded',normalize,{once:true});
  window.addEventListener('pageshow',normalize);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();