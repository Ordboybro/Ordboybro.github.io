(()=>{'use strict';
/* Emoji Drops — functional case-open bridge. Keeps visual authority in v21 and routes case cards to the authoritative exact showcase. */
const ID='emoji-drops-case-open-bridge-v1';
function hook(){
  if(window.__emojiDropsCaseOpenBridge===ID)return;
  window.__emojiDropsCaseOpenBridge=ID;
  document.addEventListener('click',e=>{
    const opener=e.target?.closest?.('.ed-case [data-open]');
    if(!opener)return;
    const key=opener.getAttribute('data-open');
    const exact=window.EmojiDropsCaseShowcaseExact;
    if(!key||!exact?.open)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    exact.open(key);
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
})();
