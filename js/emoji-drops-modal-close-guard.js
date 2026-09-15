(()=>{'use strict';
/* Deterministic modal close guard: pointer activation + direct binding + capture fallback, no polling. */
function hideAll(){const exact=document.getElementById('edExact');if(exact){exact.classList.remove('show');exact.setAttribute('aria-hidden','true');exact.style.removeProperty('display')}document.querySelectorAll('.ed-modal.show').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true');m.style.removeProperty('display')});document.body.classList.remove('modal-lock')}
function guard(e){if(!e.target.closest?.('#edExact .edx-close,.ed-modal .ed-close,.ed-modal [data-close]'))return;e.preventDefault();e.stopImmediatePropagation();window.EmojiDropsCaseShowcaseExact?.close?.();hideAll()}
function bind(){document.querySelectorAll('#edExact .edx-close,.ed-modal .ed-close,.ed-modal [data-close]').forEach(b=>{if(b.dataset.edCloseGuard==='1')return;b.dataset.edCloseGuard='1';b.addEventListener('pointerdown',guard,{capture:true});b.addEventListener('click',guard,{capture:true})})}
document.addEventListener('pointerdown',guard,true);document.addEventListener('click',guard,true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(document.getElementById('edExact')?.classList.contains('show')||document.querySelector('.ed-modal.show'))){e.preventDefault();window.EmojiDropsCaseShowcaseExact?.close?.();hideAll()}},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();