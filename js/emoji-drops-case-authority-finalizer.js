(()=>{'use strict';
/* Final case-authority handoff: v24 is a visual shell, never the owner of the canonical case API. */
const api=window.__emojiDropsExactAuthoritativeApi;
if(api&&typeof api.open==='function'){
  window.EmojiDropsCaseShowcaseExact=api;
  window.__emojiDropsCaseCanonicalApi=api;
}
function hideLegacy(){document.querySelectorAll('.ed-modal.show').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')})}
document.addEventListener('click',e=>{if(e.target?.closest?.('.edx-close')){const m=document.getElementById('edExact');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-lock')}hideLegacy()}},{capture:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=document.getElementById('edExact');if(m?.classList.contains('show')){m.classList.remove('show');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-lock');hideLegacy()}}},{capture:true});
})();
