(()=>{'use strict';
/* Emoji Drops modal finalizer v3 — all production modal shells close consistently. */
const SEL='#edExact.show,#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
const close=e=>{if(e.key==='Escape'){document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.edx-close,.edx-open~button,.ed-close,.v24-close,[data-close]')||e.target===m;if(hit){m.classList.remove('show');m.setAttribute('aria-hidden','true')}};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);
window.EmojiDropsModalFinalizer={version:3};
})();
