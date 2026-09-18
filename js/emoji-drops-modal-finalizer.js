(()=>{'use strict';
/* Emoji Drops modal finalizer v10 — authoritative overlay stacking/pointer ownership plus safe close lifecycle. */
const SEL='#edV24Case.show,#edModal.show,#edV24Reward.show,.ed-modal.show';
const clear=()=>{document.querySelectorAll(SEL).forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});document.body.classList.remove('modal-lock','modal-open','ed-modal-open');document.documentElement.classList.remove('modal-lock','modal-open','ed-modal-open')};
const finalize=()=>{clear();setTimeout(clear,0);setTimeout(clear,40);setTimeout(clear,140);setTimeout(clear,320)};
const close=e=>{if(e.key==='Escape'){if(document.querySelector(SEL)){finalize()}return}const m=e.target?.closest?.(SEL);if(!m)return;const hit=e.target?.closest?.('.ed-close,.v24-close,[data-close]')||e.target===m;if(hit)finalize()};
const harden=()=>{const m=document.getElementById('edExact');if(m&&m.parentElement!==document.body)document.body.appendChild(m);if(!m)return;m.style.setProperty('position','fixed','important');m.style.setProperty('z-index','2147483647','important');m.style.setProperty('pointer-events','auto','important');m.style.setProperty('isolation','isolate','important');const b=m.firstElementChild;if(b){b.style.setProperty('pointer-events','auto','important');b.style.setProperty('position','relative','important');b.style.setProperty('z-index','1','important')}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',harden,{once:true});else harden();
window.addEventListener('click',close,true);window.addEventListener('keydown',close,true);window.EmojiDropsModalFinalizer={version:10};
})();
