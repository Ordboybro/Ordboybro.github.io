(()=>{'use strict';
/* Emoji Drops — lightweight authoritative bootstrap. */
const scripts=['js/app-v2-core.js?v=20260831-16','js/emoji-drops-final.js?v=20260831-16','js/economy-content.js?v=20260831-16'];
for(const src of scripts)document.write(`<script src="${src}"><\\/script>`);
window.addEventListener('DOMContentLoaded',()=>{
 const css=document.createElement('link');css.rel='stylesheet';css.href='css/polish-final.css?v=20260831-2';document.head.appendChild(css);
 const s=document.createElement('script');s.src='js/final-system.js?v=20260831-3';s.defer=false;document.body.appendChild(s);
},{once:true});
})();
