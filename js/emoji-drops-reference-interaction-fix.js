(()=>{'use strict';
/* Emoji Drops reference interaction fix — modal dialog surface must not swallow clicks intended for its primary action. */
const STYLE_ID='emoji-drops-reference-interaction-fix';
function install(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='#edExactBox{pointer-events:none!important}#edExactBox .edx-head,#edExactBox .edx-main{pointer-events:auto!important}#edExactBox .edx-open{position:relative!important;z-index:1000!important;pointer-events:auto!important}#edExactBox .edx-open button{position:relative!important;z-index:1001!important;pointer-events:auto!important}';document.head.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();