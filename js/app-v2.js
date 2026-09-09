(()=>{'use strict';
/* Emoji Drops — one runtime only. Hardening boots before core so persisted state is repaired before gameplay reads it. */
const version=22;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:1};
function write(src){document.write('<scr'+'ipt src="'+src+'"><\/scr'+'ipt>')}
try{
  write('js/emoji-drops-hardening.js?v=hardening-4');
  write('js/emoji-drops-core.js?v=core-4');
  window.__emojiDropsRuntimeLoader.loaded=['hardening','core'];
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['hardening-or-core'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops runtime boot failed',err)
}
})();
