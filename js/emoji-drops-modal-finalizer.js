(()=>{'use strict';
/* Emoji Drops modal finalizer v2 — generic .ed-modal close recovery without polling or observers. */
const close=e=>{if(e.key==='Escape'){document.querySelectorAll('.ed-modal.show').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});return}const m=e.target?.closest?.('.ed-modal.show');if(!m)return;const hit=e.target?.closest?.('.ed-close,[data-close]')||e.target===m;if(hit){m.classList.remove('show');m.setAttribute('aria-hidden','true')}};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);
window.EmojiDropsModalFinalizer={version:2};
})();
