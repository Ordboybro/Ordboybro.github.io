(()=>{'use strict';
/* Emoji Drops — one runtime only. Hardening boots before core so persisted state is repaired before gameplay reads it. */
const version=21;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:1};
function write(src){document.write('<script src="'+src+'"><\\/script>')}
try{
  write('js/emoji-drops-hardening.js?v=hardening-3');
  write('js/emoji-drops-core.js?v=core-3');
  window.__emojiDropsRuntimeLoader.loaded=['hardening','core'];
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['hardening-or-core'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops runtime boot failed',err)
}
})();
