(()=>{'use strict';
/* Emoji Drops — one runtime only. Dataset bridge -> hardening -> core -> transactions -> guards -> UI -> final QA -> release polish -> product quality -> product-plus. */
const version=38;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:1};
function write(src){document.write('<scr'+'ipt src="'+src+'"><\/scr'+'ipt>')}
try{
  if(typeof cases!=='undefined'&&(!window.cases||!Object.keys(window.cases).length))window.cases=cases;
  if(typeof casePrices!=='undefined'&&(!window.casePrices||!Object.keys(window.casePrices).length))window.casePrices=casePrices;
  if(typeof rarities!=='undefined'&&(!window.rarities||!Object.keys(window.rarities).length))window.rarities=rarities;
  write('js/emoji-drops-hardening.js?v=hardening-9');
  write('js/emoji-drops-core.js?v=core-7');
  write('js/emoji-drops-transaction-layer.js?v=txn-4');
  write('js/emoji-drops-runtime-guards.js?v=guards-8');
  write('js/emoji-drops-ui-polish.js?v=ui-3');
  write('js/emoji-drops-final-hardening.js?v=final-2');
  write('js/emoji-drops-release-polish.js?v=release-1');
  write('js/emoji-drops-product-layer.js?v=product-1');
  write('js/emoji-drops-product-plus.js?v=product-plus-1');
  window.__emojiDropsRuntimeLoader.loaded=['dataset-bridge','hardening','core','transaction','runtime-guards','ui-polish','final-hardening','release-polish','product-layer','product-plus'];
  window.__emojiDropsRuntimeLoader.count=9;
  window.__emojiDropsRuntimeLoader.complete=true;
}catch(err){
  window.__emojiDropsRuntimeLoader.failed=['dataset-bridge-or-runtime'];
  window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);
  console.error('Emoji Drops runtime boot failed',err)
}
})();
