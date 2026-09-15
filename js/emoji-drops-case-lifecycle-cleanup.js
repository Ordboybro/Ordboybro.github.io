(()=>{'use strict';
/* Emoji Drops — reclaim hidden exact-case DOM after close. Keeps the modal shell reusable without retaining result/item trees. */
const cleanup=()=>{
  const modal=document.getElementById('edExact');
  if(!modal||modal.classList.contains('show'))return;
  const box=document.getElementById('edExactBox');
  if(!box)return;
  if(document.activeElement&&box.contains(document.activeElement))document.activeElement.blur?.();
  box.replaceChildren();
};
let observer=null;
const attach=()=>{
  const modal=document.getElementById('edExact');
  if(!modal||observer)return;
  observer=new MutationObserver(mutations=>{
    for(const m of mutations){
      if(m.type==='attributes'&&m.attributeName==='class'&&!modal.classList.contains('show')){
        queueMicrotask(cleanup);
        break;
      }
    }
  });
  observer.observe(modal,{attributes:true,attributeFilter:['class']});
};
const boot=()=>{
  attach();
  if(!observer){
    const rootObserver=new MutationObserver(()=>{
      attach();
      if(observer)rootObserver.disconnect();
    });
    rootObserver.observe(document.body,{childList:true});
  }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.__emojiDropsCaseLifecycleCleanup={version:1,ready:true};
})();
