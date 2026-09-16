(()=>{'use strict';
/* Final case-authority handoff: v24 is a visual shell, never the owner of the canonical case API. */
const api=window.__emojiDropsExactAuthoritativeApi;
if(api&&typeof api.open==='function'){window.EmojiDropsCaseShowcaseExact=api;window.__emojiDropsCaseCanonicalApi=api}
function hideLegacy(){document.querySelectorAll('.ed-modal.show,[role="dialog"].show').forEach(m=>{m.classList.remove('show');m.setAttribute('aria-hidden','true')});['edV24Case','edV24Reward'].forEach(id=>{const m=document.getElementById(id);if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}})}
function closeExact(){const m=document.getElementById('edExact');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}document.body.classList.remove('modal-lock');hideLegacy();window.__emojiDropsCaseClosingUntil=Date.now()+2500;setTimeout(()=>{if(Date.now()>=Number(window.__emojiDropsCaseClosingUntil||0)){delete window.__emojiDropsCaseClosingUntil;hideLegacy()}},2600)}
document.addEventListener('click',e=>{if(e.target?.closest?.('.edx-close,[aria-label="Close"]'))closeExact()},{capture:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#edExact.show,#edV24Case.show,#edV24Reward.show,[role="dialog"].show'))closeExact()},{capture:true});
const mo=new MutationObserver(()=>{if(document.getElementById('edExact')?.classList.contains('show')||Date.now()<Number(window.__emojiDropsCaseClosingUntil||0))hideLegacy()});
if(document.body)mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();
