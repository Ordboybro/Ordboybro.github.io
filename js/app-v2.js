(()=>{'use strict';
/* Emoji Drops — deterministic core boot.
   The previous staged dynamic loader could leave the page with only the fallback
   case icons while critical scripts were still waiting on async DOM injection.
   Keep the core synchronous: data -> functional UI -> transaction engine -> bridge.
   Optional polish/QA must never be able to block gameplay. */
const version=16;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:3};
function write(src){document.write('<script src="'+src+'"><\\/script>')}
try{
  write('js/functional-final.js?v=stable-core-11');
  write('js/game-transaction-engine.js?v=stable-core-12');
  write('js/runtime-action-bridge.js?v=stable-core-5');
  window.__emojiDropsRuntimeLoader.loaded=['functional','engine','bridge'];
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['core'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops core boot failed',err);
}
})();
