(()=>{'use strict';
/* Emoji Drops performance guard. Suppresses the legacy 15s balance-only polling timer during core boot without changing UI. */
const nativeSetInterval=window.setInterval;
const nativeClearInterval=window.clearInterval;
const blocked=[];
window.setInterval=function(fn,ms,...args){
  if(Number(ms)===15000 && typeof fn==='function' && String(fn).includes('edBalance')){
    const id={blocked:true};blocked.push(id);return id;
  }
  return nativeSetInterval(fn,ms,...args);
};
window.__emojiDropsRestoreTimerApi=()=>{
  window.setInterval=nativeSetInterval;
  window.clearInterval=nativeClearInterval;
  blocked.length=0;
  delete window.__emojiDropsRestoreTimerApi;
};
})();
