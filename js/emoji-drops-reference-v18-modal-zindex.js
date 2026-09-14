(()=>{'use strict';
/* Emoji Drops — v18: exact modal is the sole top-level interactive surface. */
const ID='emoji-drops-reference-v18-modal-zindex';
function install(){if(document.getElementById(ID))return;const s=document.createElement('style');s.id=ID;s.textContent=`#edExact{z-index:2147483000!important;pointer-events:auto!important}#edExact.show{z-index:2147483000!important;pointer-events:auto!important}#edExactBox{z-index:2147483001!important;pointer-events:auto!important}#edExactBox>.edx-open{z-index:2147483002!important;pointer-events:auto!important}#edExactBox>.edx-open button{z-index:2147483003!important;pointer-events:auto!important}`;document.head.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
