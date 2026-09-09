(()=>{'use strict';
/* Emoji Drops — one runtime only. Bridge classic-script dataset bindings before hardening/core/transaction/guards/UI boot. */
const version=32;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:1};
function write(src){document.write('<scr'+'ipt src="'+src+'"><\/scr'+'ipt>')}
try{
  if(typeof cases!=='undefined'&&(!window.cases||!Object.keys(window.cases).length))window.cases=cases;
  if(typeof casePrices!=='undefined'&&(!window.casePrices||!Object.keys(window.casePrices).length))window.casePrices=casePrices;
  if(typeof rarities!=='undefined'&&(!window.rarities||!Object.keys(window.rarities).length))window.rarities=rarities;
  write('js/emoji-drops-hardening.js?v=hardening-9');
  write('js/emoji-drops-core.js?v=core-7');
  write('js/emoji-drops-transaction-layer.js?v=txn-1');
  write('js/emoji-drops-runtime-guards.js?v=guards-8');
  write('js/emoji-drops-ui-polish.js?v=ui-3');
  window.__emojiDropsRuntimeLoader.loaded=['dataset-bridge','hardening','core','transaction','runtime-guards','ui-polish'];
  window.__emojiDropsRuntimeLoader.count=5;
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['dataset-bridge-or-runtime'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops runtime boot failed',err)
}
})();
