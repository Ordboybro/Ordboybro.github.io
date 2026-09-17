(()=>{'use strict';
/* Emoji Drops modal finalizer v6 — close is finalized after legacy handlers/timers so modals cannot reopen after user dismissal. */
const SEL='#edExact.show,#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
const clear=()=>{document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});document.body.classList.remove('modal-lock','modal-open','ed-modal-open');document.documentElement.classList.remove('modal-lock','modal-open','ed-modal-open')};
const finalize=()=>{clear();setTimeout(clear,32);setTimeout(clear,120)};
const close=e=>{if(e.key==='Escape'){finalize();return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.edx-close,.edx-open~button,.ed-close,.v24-close,[data-close]')||e.target===m;if(hit)finalize()};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);window.addEventListener('pointerup',close,true);window.EmojiDropsModalFinalizer={version:6};
})();
