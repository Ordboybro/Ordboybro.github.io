(()=>{'use strict';
/* Emoji Drops — lightweight authoritative bootstrap. */
const scripts=['js/app-v2-core.js?v=20260831-17','js/emoji-drops-final.js?v=20260831-17','js/economy-content.js?v=20260831-17'];
for(const src of scripts)document.write(`<script src="${src}"><\\/script>`);
window.addEventListener('DOMContentLoaded',()=>{
 const css=document.createElement('link');css.rel='stylesheet';css.href='css/polish-final.css?v=20260831-3';document.head.appendChild(css);
 const compact=document.createElement('link');compact.rel='stylesheet';compact.href='css/compact-layout-final.css?v=20260831-1';document.head.appendChild(compact);
 const s=document.createElement('script');s.src='js/final-system.js?v=20260831-4';s.defer=false;document.body.appendChild(s);
},{once:true});
})();
