(()=>{'use strict';
/* Emoji Drops bootstrap: deterministic runtime order. */
const scripts=[
  'js/app-v2-core.js?v=20260831-8',
  'js/emoji-drops-final.js?v=20260831-8',
  'js/economy-content.js?v=20260831-8'
];
for(const src of scripts){
  document.write(`<script src="${src}"><\\/script>`);
}
window.addEventListener('DOMContentLoaded',()=>{
  for(const [src,async] of [
    ['js/quality-final.js?v=20260831-2',false],
    ['js/animation-final.js?v=20260831-1',false]
  ]){
    const s=document.createElement('script');s.src=src;s.async=async;document.body.appendChild(s);
  }
},{once:true});
})();
