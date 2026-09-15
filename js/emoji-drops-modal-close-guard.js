(()=>{'use strict';
/* Deterministic modal close guard: capture close controls before delegated UI handlers. */
function hideAll(){const exact=document.getElementById('edExact');if(exact){exact.classList.remove('show');exact.setAttribute('aria-hidden','true')}document.querySelectorAll('.ed-modal.show').forEach(m=>m.classList.remove('show'));document.body.classList.remove('modal-lock')}
document.addEventListener('click',e=>{if(!e.target.closest?.('#edExact .edx-close,.ed-modal .ed-close,.ed-modal [data-close]'))return;e.preventDefault();e.stopImmediatePropagation();window.EmojiDropsCaseShowcaseExact?.close?.();hideAll()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(document.getElementById('edExact')?.classList.contains('show')||document.querySelector('.ed-modal.show'))){e.preventDefault();window.EmojiDropsCaseShowcaseExact?.close?.();hideAll()}},true);
})();