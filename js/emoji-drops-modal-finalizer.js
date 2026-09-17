(()=>{'use strict';
/* Emoji Drops modal finalizer v1 — generic .ed-modal close recovery. */
const pending=new WeakSet();
document.addEventListener('pointerdown',e=>{const m=e.target?.closest?.('.ed-modal.show');if(m)pending.add(m)},true);
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.querySelectorAll('.ed-modal.show').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')})},true);
new MutationObserver(()=>{document.querySelectorAll('.ed-modal.show').forEach(m=>{if(pending.has(m)){pending.delete(m);m.classList.remove('show');m.setAttribute('aria-hidden','true')}})}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
window.EmojiDropsModalFinalizer={version:1};
})();
