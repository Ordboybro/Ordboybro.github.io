(()=>{'use strict';
/* Final case-authority handoff: v24 is a visual shell, never the owner of the canonical case API. */
const api=window.__emojiDropsExactAuthoritativeApi;
if(api&&typeof api.open==='function'){window.EmojiDropsCaseShowcaseExact=api;window.__emojiDropsCaseCanonicalApi=api}
function hideLegacy(){document.querySelectorAll('.ed-modal.show,[role="dialog"].show:not(#edExact)').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});['edV24Case','edV24Reward'].forEach(id=>{const m=document.getElementById(id);if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}})}
function closeExact(){const m=document.getElementById('edExact');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}document.body.classList.remove('modal-lock');window.__emojiDropsCaseClosingUntil=Date.now()+5000;hideLegacy();setTimeout(()=>{if(Date.now()>=Number(window.__emojiDropsCaseClosingUntil||0)){delete window.__emojiDropsCaseClosingUntil;hideLegacy()}},5100)}
document.addEventListener('click',e=>{if(e.target?.closest?.('.edx-close'))return;if(e.target?.closest?.('[aria-label="Close"]'))closeExact()},{capture:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#edV24Case.show,#edV24Reward.show,[role="dialog"].show:not(#edExact)'))closeExact()},{capture:true});
const mo=new MutationObserver(()=>{const closing=Date.now()<Number(window.__emojiDropsCaseClosingUntil||0);const exact=document.getElementById('edExact');if(closing||exact?.classList.contains('show'))hideLegacy()});
if(document.body)mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();
