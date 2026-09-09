(()=>{'use strict';
/* Emoji Drops — deterministic core boot.
   Keep the core synchronous and parser-safe: data is already loaded by index,
   then functional UI -> transaction engine -> action bridge. */
const version=17;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:3};
function write(src){
  /* The escaped closing tag must contain ONE backslash in the JS source.
     Two backslashes would write a literal backslash into HTML and can leave
     the parser waiting for a closing script tag on Safari/iOS. */
  document.write('<script src="'+src+'"><\/script>');
}
try{
  write('js/functional-final.js?v=stable-core-13');
  write('js/game-transaction-engine.js?v=stable-core-13');
  write('js/runtime-action-bridge.js?v=stable-core-6');
  window.__emojiDropsRuntimeLoader.loaded=['functional','engine','bridge'];
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['core'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops core boot failed',err);
}
})();
