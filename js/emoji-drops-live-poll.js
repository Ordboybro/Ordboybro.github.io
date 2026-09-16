(()=>{'use strict';
/* Live Drops cloud polling fallback for the REST client; presentation stays owned by Market v2. */
const run=()=>{try{window.EmojiDropsMarketV2?.loadLive?.()}catch{}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
setInterval(run,10000);
})();
