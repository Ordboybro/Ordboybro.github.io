(()=>{'use strict';
/* Emoji Drops — one runtime only. Legacy patch layers are intentionally not loaded. */
const version=20;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:1};
function write(src){document.write('<script src="'+src+'"><\\/script>')}
try{
  write('js/emoji-drops-core.js?v=core-2');
  write('js/emoji-drops-hardening.js?v=hardening-1');
  window.__emojiDropsRuntimeLoader.loaded=['core','hardening'];
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['core-or-hardening'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops runtime boot failed',err)
}
})();
