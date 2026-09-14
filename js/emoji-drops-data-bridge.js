(()=>{'use strict';
/* Emoji Drops — bridge legacy global case data into the modern runtime namespace. */
try{
  if(typeof cases!=='undefined'&&cases&&typeof cases==='object')window.cases=cases;
  if(typeof casePrices!=='undefined'&&casePrices&&typeof casePrices==='object')window.casePrices=casePrices;
  if(typeof rarities!=='undefined'&&rarities&&typeof rarities==='object')window.rarities=rarities;
  window.__emojiDropsDataBridge={version:1,ready:true,caseKeys:Object.keys(window.cases||{})};
}catch(err){
  window.__emojiDropsDataBridge={version:1,ready:false,error:String(err?.message||err)};
  console.error('Emoji Drops data bridge failed',err);
}
})();
