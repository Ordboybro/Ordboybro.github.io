(()=>{'use strict';
/* Emoji Drops bootstrap: load the runtime layers in a deterministic order. */
const scripts=[
  'js/app-v2-core.js?v=20260831-6',
  'js/emoji-drops-final.js?v=20260831-6',
  'js/economy-content.js?v=20260831-6'
];
/* app-v2.js is parser-blocking in index.html, so document.write keeps the
   dependency chain ordered before the later polish layers execute. */
for(const src of scripts){
  document.write(`<script src="${src}"><\/script>`);
}
})();