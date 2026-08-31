(()=>{'use strict';
/* Emoji Drops — deterministic runtime bootstrap. */
const scripts=['js/app-v2-core.js?v=20260831-12','js/emoji-drops-final.js?v=20260831-12','js/economy-content.js?v=20260831-12'];
for(const src of scripts)document.write(`<script src="${src}"><\\/script>`);
window.addEventListener('DOMContentLoaded',()=>{
 for(const [src,async] of [['js/quality-final.js?v=20260831-6',false],['js/animation-final.js?v=20260831-5',false],['css/responsive-final.css?v=20260831-4',false],['css/ui-final.css?v=20260831-3',false],['js/economy-lock-final.js?v=20260831-1',false]]){
  if(src.endsWith('.css')){const l=document.createElement('link');l.rel='stylesheet';l.href=src;document.head.appendChild(l)}
  else{const s=document.createElement('script');s.src=src;s.async=async;document.body.appendChild(s)}
 }
},{once:true});
})();
