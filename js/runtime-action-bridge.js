(()=>{'use strict';
/* Emoji Drops — final action bridge. The authoritative transaction engine owns money/inventory mutations. */
const engine=window.__emojiDropsEngine;
if(!engine?.upgrade||!engine?.openCase){console.error('Emoji Drops action bridge: transaction engine unavailable');return}
const guarded=new WeakSet();
function bind(){
 const upgrade=document.getElementById('edDoUpgrade');
 if(upgrade&&!guarded.has(upgrade)){
  guarded.add(upgrade);
  upgrade.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();Promise.resolve(engine.upgrade()).catch(err=>console.error('Emoji Drops upgrade action failed:',err))},{capture:true});
 }
 const open=document.getElementById('edOpen');
 if(open&&!guarded.has(open)){
  guarded.add(open);
  open.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();Promise.resolve(engine.openCase()).catch(err=>console.error('Emoji Drops case action failed:',err))},{capture:true});
 }
}
window.__emojiDropsActionBridge={version:1,authoritative:true};
bind();
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();
