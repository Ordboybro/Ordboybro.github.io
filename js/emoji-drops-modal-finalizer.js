(()=>{'use strict';
/* Emoji Drops modal finalizer v7 — deterministic dismissal with short-lived reopen guard. */
const SEL='#edExact.show,#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
let closingUntil=0;
const clear=()=>{document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});document.body.classList.remove('modal-lock','modal-open','ed-modal-open');document.documentElement.classList.remove('modal-lock','modal-open','ed-modal-open')};
const finalize=()=>{closingUntil=Date.now()+700;clear();setTimeout(clear,0);setTimeout(clear,32);setTimeout(clear,120);setTimeout(clear,300);setTimeout(clear,650)};
const close=e=>{if(e.key==='Escape'){finalize();return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.edx-close,.edx-open~button,.ed-close,.v24-close,[data-close]')||e.target===m;if(hit)finalize()};
const guard=()=>{if(Date.now()<closingUntil)clear()};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);window.addEventListener('pointerdown',close,true);window.addEventListener('pointerup',close,true);
new MutationObserver(guard).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
window.EmojiDropsModalFinalizer={version:7};
})();
