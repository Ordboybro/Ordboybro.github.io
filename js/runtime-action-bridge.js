(()=>{'use strict';
/* Emoji Drops — final action bridge. The transaction engine is authoritative for Case + Upgrade mutations. */
const engine=window.__emojiDropsEngine;
if(!engine?.upgrade||!engine?.openCase){console.error('Emoji Drops action bridge: transaction engine unavailable');return}
const guarded=new WeakSet();
function runSafely(label,fn){
  Promise.resolve().then(fn).catch(err=>console.error(`Emoji Drops ${label} action failed:`,err));
}
function bind(){
  const upgrade=document.getElementById('edDoUpgrade');
  if(upgrade&&!guarded.has(upgrade)){
    guarded.add(upgrade);
    upgrade.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      runSafely('upgrade',()=>engine.upgrade());
    },{capture:true});
  }
  const open=document.getElementById('edOpen');
  if(open&&!guarded.has(open)){
    guarded.add(open);
    open.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      runSafely('case',()=>engine.openCase());
    },{capture:true});
  }
}
window.__emojiDropsActionBridge={version:2,authoritative:true};
bind();
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
