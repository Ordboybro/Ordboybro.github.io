(()=>{'use strict';
/* Emoji Drops — deterministic core boot.
   Keep the core synchronous and parser-safe: data is already loaded by index,
   then functional UI -> transaction engine -> action bridge -> quality. */
const version=18;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:4};
function write(src){
  document.write('<script src="'+src+'"><\/script>');
}
try{
  write('js/functional-final.js?v=stable-core-14');
  write('js/game-transaction-engine.js?v=stable-core-14');
  write('js/runtime-action-bridge.js?v=stable-core-7');
  write('js/product-quality.js?v=quality-1');
  window.__emojiDropsRuntimeLoader.loaded=['functional','engine','bridge','quality'];
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['core'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops core boot failed',err);
}
})();
