(()=>{'use strict';
/* Emoji Drops — v15 exact case opener precedence. Prevent the legacy core modal handler from racing the authoritative exact modal. */
const ID='emoji-drops-reference-v15-case-precedence';
function install(){if(document.getElementById(ID))return;const s=document.createElement('style');s.id=ID;s.textContent=`#edModal{pointer-events:none!important}`;document.head.appendChild(s);window.addEventListener('click',e=>{const opener=e.target?.closest?.('.ed-case [data-open]');if(!opener)return;const k=opener.getAttribute('data-open');if(!k||!window.EmojiDropsCaseShowcaseExact?.open)return;e.preventDefault();e.stopImmediatePropagation();window.EmojiDropsCaseShowcaseExact.open(k)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
