(()=>{'use strict';
/* Emoji Drops — v17: the modal shell itself is not a scroll container; only .edx-main scrolls. */
const ID='emoji-drops-reference-v17-scroll-container-fix';
function install(){if(document.getElementById(ID))return;const s=document.createElement('style');s.id=ID;s.textContent=`#edExactBox{overflow:visible!important;overflow-x:visible!important;overflow-y:visible!important}#edExactBox .edx-main{overflow:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important}#edExactBox>.edx-open{position:absolute!important;pointer-events:auto!important}`;document.head.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
