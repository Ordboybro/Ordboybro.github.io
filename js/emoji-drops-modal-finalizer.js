(()=>{'use strict';
/* Emoji Drops modal finalizer v5 — final close runs after existing handlers to prevent reopen races. */
const SEL='#edExact.show,#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
const clear=()=>{document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});document.body.classList.remove('modal-lock','modal-open','ed-modal-open');document.documentElement.classList.remove('modal-lock','modal-open','ed-modal-open')};
const close=e=>{if(e.key==='Escape'){setTimeout(clear,0);return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.edx-close,.edx-open~button,.ed-close,.v24-close,[data-close]')||e.target===m;if(hit)setTimeout(clear,0)};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);window.EmojiDropsModalFinalizer={version:5};
})();
