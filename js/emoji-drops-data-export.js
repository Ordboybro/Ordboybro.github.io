(()=>{'use strict';
/* Emoji Drops — bridge classic-script lexical dataset bindings into the explicit runtime namespace. */
function expose(){try{if(typeof cases!=='undefined')window.cases=cases;if(typeof casePrices!=='undefined')window.casePrices=casePrices;if(typeof rarities!=='undefined')window.rarities=rarities}catch(err){console.warn('Emoji Drops dataset export deferred',err)}}
expose();
const defer=()=>setTimeout(expose,0);
document.addEventListener('DOMContentLoaded',defer,{once:true});
window.addEventListener('pageshow',defer);
})();