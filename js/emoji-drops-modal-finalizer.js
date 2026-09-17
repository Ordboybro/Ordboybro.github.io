(()=>{'use strict';
/* Emoji Drops modal finalizer v4 — one close action clears every blocking modal shell. */
const SEL='#edExact.show,#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
const clear=()=>document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});
const close=e=>{if(e.key==='Escape'){clear();return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.edx-close,.edx-open~button,.ed-close,.v24-close,[data-close]')||e.target===m;if(hit)clear()};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);window.EmojiDropsModalFinalizer={version:4};
})();
