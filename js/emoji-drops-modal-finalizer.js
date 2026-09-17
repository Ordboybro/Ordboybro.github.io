(()=>{'use strict';
/* Emoji Drops modal finalizer v8 — deterministic dismissal with a short-lived, disconnected reopen guard. */
const SEL='#edExact.show,#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
let closingUntil=0,guardObserver=null;
const clear=()=>{document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});document.body.classList.remove('modal-lock','modal-open','ed-modal-open');document.documentElement.classList.remove('modal-lock','modal-open','ed-modal-open')};
const finalize=()=>{closingUntil=Date.now()+700;clear();guardObserver?.disconnect();guardObserver=new MutationObserver(()=>{if(Date.now()<closingUntil)clear();else{guardObserver?.disconnect();guardObserver=null}});guardObserver.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});setTimeout(()=>{clear();guardObserver?.disconnect();guardObserver=null},720)};
const close=e=>{if(e.key==='Escape'){finalize();return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.edx-close,.edx-open~button,.ed-close,.v24-close,[data-close]')||e.target===m;if(hit)finalize()};
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);window.addEventListener('pointerdown',close,true);window.addEventListener('pointerup',close,true);window.EmojiDropsModalFinalizer={version:8};
})();
