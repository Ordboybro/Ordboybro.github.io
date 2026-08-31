(()=>{'use strict';
/* Emoji Drops — deterministic bootstrap. Load final runtime first, then the layout override AFTER it has executed. */
const scripts=['js/app-v2-core.js?v=20260831-21','js/emoji-drops-final.js?v=20260831-21','js/economy-content.js?v=20260831-21'];
for(const src of scripts)document.write(`<script src="${src}"><\\/script>`);
window.addEventListener('DOMContentLoaded',()=>{
 const addCss=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);return l};
 const addJs=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.defer=false;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
 addCss('css/polish-final.css?v=20260831-7');
 /* final-system may inject its own styles. Wait for it to finish before loading the authoritative home-layout CSS. */
 addJs('js/final-system.js?v=20260831-8')
   .catch(()=>{})
   .finally(()=>{
     /* MUST be the final stylesheet in the cascade. */
     addCss('css/compact-layout-final.css?v=20260831-5');
   });
},{once:true});
})();
