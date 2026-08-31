(()=>{'use strict';
/* Emoji Drops bootstrap: load the runtime layers in a deterministic order. */
const scripts=[
  'js/app-v2-core.js?v=20260831-7',
  'js/emoji-drops-final.js?v=20260831-7',
  'js/economy-content.js?v=20260831-7'
];
/* app-v2.js is parser-blocking in index.html, so document.write keeps the
   dependency chain ordered before the later polish layers execute. */
for(const src of scripts){
  document.write(`<script src="${src}"><\\/script>`);
}
/* QA runs after the whole document and the existing polish layers have loaded. */
window.addEventListener('DOMContentLoaded',()=>{
  const s=document.createElement('script');
  s.src='js/quality-final.js?v=20260831-1';
  s.async=false;
  document.body.appendChild(s);
},{once:true});
})();
