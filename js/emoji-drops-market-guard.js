(()=>{'use strict';
/* Market visual guard: remove the legacy static Live Drops shell after the shared Market layer boots. */
function clean(){document.querySelectorAll('#view-cases .ed-live-slot').forEach(e=>e.remove())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
new MutationObserver(clean).observe(document.body,{childList:true,subtree:true});
})();
