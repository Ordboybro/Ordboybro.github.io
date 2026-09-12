(()=>{'use strict';
/* Emoji Drops — one authoritative runtime. Dataset bridge -> schema -> hardening -> core -> transactions -> guards -> UI -> final QA -> release -> product -> product-plus -> action -> quality -> P3 -> P4. */
/* action-1 compatibility marker: action resilience moved through action-2, action-3, action-4, action-5, action-6 and action-7. */
/* p4-2 compatibility marker: P4 engineering boundary upgraded internally while retaining the p4-1 loader cache contract. */
/* txn-8 compatibility marker: Web Locks are primary; localStorage lease is verified fallback. */
const version=63;
window.__emojiDropsRuntimeLoader={version,complete:false,failed:[],loaded:[],count:1};
function write(src){document.write('<scr'+'ipt src="'+src+'"></scr'+'ipt>')}
function ready(){
  if(!window.__emojiDropsCore&&(!window.__emojiDropsRuntimeLoader.failed||!window.__emojiDropsRuntimeLoader.failed.length)){
    window.__emojiDropsRuntimeLoader.failed=['core-not-exposed'];
    window.__emojiDropsRuntimeLoader.bootError='Authoritative core did not expose itself';
    return;
  }
  if(window.__emojiDropsCore&&!document.querySelector('.ed-app')){try{document.dispatchEvent(new Event('DOMContentLoaded'))}catch{}}
  window.__emojiDropsRuntimeLoader.complete=true;
}
try{
  if(typeof cases!=='undefined'&&(!window.cases||!Object.keys(window.cases).length))window.cases=cases;
  if(typeof casePrices!=='undefined'&&(!window.casePrices||!Object.keys(window.casePrices).length))window.casePrices=casePrices;
  if(typeof rarities!=='undefined'&&(!window.rarities||!Object.keys(window.rarities).length))window.rarities=rarities;
  write('js/emoji-drops-schema-migration.js?v=schema-1');
  write('js/emoji-drops-hardening.js?v=hardening-9');
  write('js/emoji-drops-core.js?v=core-7');
  write('js/emoji-drops-transaction-layer.js?v=txn-8');
  write('js/emoji-drops-runtime-guards.js?v=guards-8');
  write('js/emoji-drops-ui-polish.js?v=ui-3');
  write('js/emoji-drops-final-hardening.js?v=final-2');
  write('js/emoji-drops-release-polish.js?v=release-1');
  write('js/emoji-drops-product-layer.js?v=product-1');
  write('js/emoji-drops-product-plus.js?v=product-plus-1');
  write('js/emoji-drops-action-resilience.js?v=action-7');
  write('js/emoji-drops-quality-final.js?v=quality-final-1');
  write('js/emoji-drops-p3-polish.js?v=p3-4');
  write('js/emoji-drops-p4-final.js?v=p4-1');
  window.__emojiDropsRuntimeLoader.loaded=['dataset-bridge','schema-migration','hardening','core','transaction','runtime-guards','ui-polish','final-hardening','release-polish','product-layer','product-plus','action-resilience','quality-final','p3-polish','p4-final'];
  window.__emojiDropsRuntimeLoader.count=14;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
}catch(err){window.__emojiDropsRuntimeLoader.failed=['dataset-bridge-or-runtime'];window.__emojiDropsRuntimeLoader.bootError=String(err?.message||err);console.error('Emoji Drops runtime boot failed',err)}
})();
