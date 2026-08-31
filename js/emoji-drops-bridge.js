(()=>{'use strict';
/* Expose the data objects used by the legacy core so the final repair layer can work with the real catalogue. */
try{if(typeof cases!=='undefined')window.cases=cases}catch{}
try{if(typeof casePrices!=='undefined')window.casePrices=casePrices}catch{}
})();