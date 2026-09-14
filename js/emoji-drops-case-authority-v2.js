(()=>{'use strict';
const open=key=>{const api=window.EmojiDropsCaseShowcaseExact;if(!api||typeof api.open!=='function')return false;api.open(String(key));return true};
const hideLegacy=()=>{document.querySelectorAll('#edModal.show,#openModal.show,#winModal.show').forEach(el=>{el.classList.remove('show');el.style.display='none'});document.body.style.overflow=''};
document.addEventListener('click',e=>{const t=e.target.closest?.('button[data-open], [data-open]');if(!t)return;const key=t.getAttribute('data-open');if(!key)return;if(open(key)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();hideLegacy()}},true);
window.addEventListener('pageshow',hideLegacy);
window.__emojiDropsCaseAuthority={version:2,open};
})();
