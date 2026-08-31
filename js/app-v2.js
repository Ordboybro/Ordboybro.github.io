(()=>{'use strict';
/* Emoji Drops — lightweight authoritative bootstrap. */
const scripts=['js/app-v2-core.js?v=20260831-14','js/emoji-drops-final.js?v=20260831-14','js/economy-content.js?v=20260831-14'];
for(const src of scripts)document.write(`<script src="${src}"><\\/script>`);
window.addEventListener('DOMContentLoaded',()=>{
 const s=document.createElement('script');s.src='js/final-system.js?v=20260831-1';s.defer=false;document.body.appendChild(s);
},{once:true});
})();
