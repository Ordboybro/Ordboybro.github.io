(()=>{'use strict';
/* Deterministic modal close guard: capture close controls before delegated UI handlers. */
function close(e){const b=e.target.closest?.('#edExact .edx-close');if(!b)return;e.preventDefault();e.stopImmediatePropagation();window.EmojiDropsCaseShowcaseExact?.close?.();const m=document.getElementById('edExact');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}document.body.classList.remove('modal-lock')}
document.addEventListener('click',close,true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('edExact')?.classList.contains('show')){e.preventDefault();window.EmojiDropsCaseShowcaseExact?.close?.()}},true);
})();