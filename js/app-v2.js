(()=>{'use strict';
/* Emoji Drops — deterministic bootstrap. Compact geometry is loaded last. */
const scripts=['js/app-v2-core.js?v=20260831-19','js/emoji-drops-final.js?v=20260831-19','js/economy-content.js?v=20260831-19'];
for(const src of scripts)document.write(`<script src="${src}"><\\/script>`);
window.addEventListener('DOMContentLoaded',()=>{
 const addCss=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l);return l};
 const addJs=src=>{const s=document.createElement('script');s.src=src;s.defer=false;document.body.appendChild(s);return s};
 addCss('css/polish-final.css?v=20260831-5');
 addJs('js/final-system.js?v=20260831-6');
 addCss('css/compact-layout-final.css?v=20260831-3');
},{once:true});
})();
