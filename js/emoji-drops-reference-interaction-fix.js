(()=>{'use strict';
/* Emoji Drops reference interaction fix — keep modal artwork/content visually inert so the primary action remains pointer-actionable. */
const STYLE_ID='emoji-drops-reference-interaction-fix';
function install(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='#edExactBox .edx-main{pointer-events:none!important}#edExactBox .edx-open{pointer-events:auto!important;position:relative!important;z-index:100!important}#edExactBox .edx-open button{pointer-events:auto!important;position:relative!important;z-index:101!important}';document.head.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();