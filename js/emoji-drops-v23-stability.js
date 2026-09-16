(()=>{'use strict';
/* v23 stability shim: the legacy studio observer only schedules its own repaint loop. Keep other observers untouched. */
if(window.__emojiDropsV23ObserverGuard)return;
window.__emojiDropsV23ObserverGuard=true;
try{
  const Native=window.MutationObserver;
  if(!Native)return;
  window.MutationObserver=function(callback){
    const source=String(callback||'');
    const legacy=/q\s*=\s*1[\s\S]*requestAnimationFrame[\s\S]*run\(\)/.test(source);
    const observer=new Native(callback);
    if(legacy){
      const nativeObserve=observer.observe.bind(observer);
      observer.observe=(target,options)=>{if(target===document.body&&options?.childList&&options?.subtree)return;return nativeObserve(target,options)};
    }
    return observer;
  };
  window.MutationObserver.prototype=Native.prototype;
}catch{}
})();
