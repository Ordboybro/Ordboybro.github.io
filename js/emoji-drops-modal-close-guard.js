(()=>{'use strict';
/* Deterministic modal close guard: pointer-safe close without retargeting touch events. */
let pending=false;
function hideAll(){const exact=document.getElementById('edExact');if(exact){exact.classList.remove('show');exact.setAttribute('aria-hidden','true');exact.style.removeProperty('display')}document.querySelectorAll('.ed-modal.show').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true');m.style.removeProperty('display')});document.body.classList.remove('modal-lock')}
function isCloseTarget(e){return !!e.target.closest?.('#edExact .edx-close,.ed-modal .ed-close,.ed-modal [data-close]')}
function pointerDown(e){if(!isCloseTarget(e))return;e.preventDefault();e.stopImmediatePropagation();pending=true}
function finishClose(e){if(!pending&&!isCloseTarget(e))return;if(isCloseTarget(e))e.preventDefault();e.stopImmediatePropagation();pending=false;window.EmojiDropsCaseShowcaseExact?.close?.();hideAll();queueMicrotask(hideAll)}
function bind(){document.querySelectorAll('#edExact .edx-close,.ed-modal .ed-close,.ed-modal [data-close]').forEach(b=>{if(b.dataset.edCloseGuard==='1')return;b.dataset.edCloseGuard='1';b.addEventListener('pointerdown',pointerDown,{capture:true});b.addEventListener('pointerup',finishClose,{capture:true});b.addEventListener('click',finishClose,{capture:true})})}
document.addEventListener('pointerdown',pointerDown,true);document.addEventListener('pointerup',finishClose,true);document.addEventListener('click',finishClose,true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(document.getElementById('edExact')?.classList.contains('show')||document.querySelector('.ed-modal.show'))){e.preventDefault();e.stopImmediatePropagation();pending=false;window.EmojiDropsCaseShowcaseExact?.close?.();hideAll();queueMicrotask(hideAll)}},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
