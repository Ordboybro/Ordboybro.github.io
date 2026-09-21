(()=>{'use strict';
/* Emoji Drops — functional case-open bridge v23. Only the explicit Open button opens a case; scrolling or touching the card never opens it. */
const ID='emoji-drops-case-open-bridge-v24';
const KEYS=['smile','moves','nature','food','animals','transport','sport','games'];
const NAMES={smile:'Smile',moves:'Moves',nature:'Nature',food:'Food',animals:'Animals',transport:'Transport',sport:'Sport',games:'Games'};
const TOUCH_GUARD_MS=700;
function touchCss(){if(document.getElementById('ed-case-touch-css'))return;const s=document.createElement('style');s.id='ed-case-touch-css';s.textContent='.ed-case{touch-action:manipulation;-webkit-tap-highlight-color:transparent}';document.head.appendChild(s)}
function normalizeKey(value){const raw=String(value||'').trim().toLowerCase();if(KEYS.includes(raw))return raw;const stripped=raw.replace(/^case[-_:/]*/,'').replace(/[-_ ]*(case|open)$/,'');if(KEYS.includes(stripped))return stripped;const named=KEYS.find(k=>NAMES[k].toLowerCase()===raw||NAMES[k].toLowerCase()===stripped);return named||null}
function keyFor(card,index){const direct=card?.dataset?.caseKey||card?.dataset?.case||card?.dataset?.key||card?.getAttribute?.('data-open');const normalized=normalizeKey(direct);if(normalized)return normalized;const title=card?.querySelector?.('h3')?.textContent?.trim();const named=normalizeKey(title);if(named)return named;return KEYS[index]||null}
function inActiveCases(node){const card=node?.closest?.('.ed-case');return !!card&&(!!card.closest?.('#view-cases.active')||!!card.closest?.('.ed-view.active'))&&card.isConnected}
function ready(key){return !!key&&!!window.EmojiDropsCaseShowcaseExact&&typeof window.EmojiDropsCaseShowcaseExact.open==='function'}
function visible(){return !!document.querySelector('#edExact.show')}
function touchOpenGuard(){const until=Date.now()+TOUCH_GUARD_MS;window.__emojiDropsCaseTouchGuardUntil=until;window.__emojiDropsCaseTouchSessionUntil=until+900}
function invoke(key){if(!ready(key))return false;try{window.EmojiDropsCaseShowcaseExact.open(key);return visible()}catch(err){console.warn('Emoji Drops case open deferred',err);return false}}
function delayedRetry(key,node){return retry(key,node)}
function retry(key,node){let attempts=0;const run=()=>{if(!inActiveCases(node)||visible())return;if(invoke(key)||++attempts>=15)return;setTimeout(run,35)};run()}
function activate(node,key,event){if(!inActiveCases(node)||visible())return false;if(event?.type==='click'){event.preventDefault();event.stopImmediatePropagation()}const touch=event?.pointerType==='touch'||event?.pointerType==='pen';if(touch){setTimeout(()=>{if(!visible())invoke(key)},60);return true}if(invoke(key))return true;retry(key,node);setTimeout(()=>{if(!visible())invoke(key)},120);return false}
let suppressSyntheticClickUntil=0,lastTouchOpener=null;
function skipSyntheticTouchClick(){return Date.now()<suppressSyntheticClickUntil}
function bindOpener(opener,key){
 if(!opener||opener.dataset.edBridge===ID)return;
 opener.dataset.edBridge=ID;opener.setAttribute('data-open',key);
 opener.addEventListener('pointerdown',e=>{
   if(e.pointerType==='touch'||e.pointerType==='pen'){lastTouchOpener=opener}
 },{capture:true,passive:true});
 opener.addEventListener('pointerup',e=>{
   if((e.pointerType==='touch'||e.pointerType==='pen')&&lastTouchOpener===opener){
     lastTouchOpener=null;suppressSyntheticClickUntil=Date.now()+TOUCH_GUARD_MS;touchOpenGuard();
     setTimeout(()=>activate(opener,key,e),0);
   }
 },{capture:true});
 opener.addEventListener('click',e=>{
   if(skipSyntheticTouchClick()){e.preventDefault();e.stopImmediatePropagation();return}
   if(visible())return;activate(opener,key,e)
 },true);
}
function normalize(){document.querySelectorAll('#view-cases.active .ed-case').forEach((card,index)=>{const opener=card.querySelector('[data-open]')||card.querySelector('.ed-btn');const key=keyFor(opener||card,index);if(!key)return;if(card.dataset.caseKey!==key)card.dataset.caseKey=key;bindOpener(opener,key)})}
function hook(){
  if(window.__emojiDropsCaseOpenBridge===ID)return;window.__emojiDropsCaseOpenBridge=ID;touchCss();normalize();
  document.addEventListener('pointerup',e=>{if(!['touch','pen'].includes(e.pointerType))return;if(visible())return;const card=e.target?.closest?.('.ed-case');if(!card||e.target?.closest?.('[data-open]'))return;const key=keyFor(card,KEYS.indexOf(card.dataset.caseKey));if(!key)return;e.preventDefault();e.stopImmediatePropagation();suppressSyntheticClickUntil=Date.now()+TOUCH_GUARD_MS;touchOpenGuard();setTimeout(()=>activate(card,key,e),0)},true);
  document.addEventListener('keydown',e=>{if((e.key!=='Enter'&&e.key!==' ')||visible())return;const opener=e.target?.closest?.('[data-open]');if(!opener||!inActiveCases(opener))return;const key=keyFor(opener,KEYS.indexOf(opener.closest('.ed-case')?.dataset?.caseKey));if(key){e.preventDefault();e.stopImmediatePropagation();activate(opener,key,null)}},true);
  new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes?.length||m.type==='attributes'))normalize()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-open']});
  document.addEventListener('DOMContentLoaded',normalize,{once:true});window.addEventListener('pageshow',normalize);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();