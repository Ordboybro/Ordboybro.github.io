(()=>{'use strict';
const VERSION='transaction-hotfix-1';
const $=(s,r=document)=>r.querySelector(s);
function install(){
 document.addEventListener('click',e=>{
  const source=e.target.closest('#edUpgradeInventory .ed-final-item-btn');
  if(source){
   window.__emojiDropsUpgradeIndex=[...$('#edUpgradeInventory').querySelectorAll('.ed-final-item-btn')].indexOf(source);
   window.__emojiDropsUpgradeTarget=null;
   return;
  }
  const target=e.target.closest('#edTargets .ed-final-item-btn');
  if(target){
   window.__emojiDropsUpgradeTarget=[...$('#edTargets').querySelectorAll('.ed-final-item-btn')].indexOf(target);
   return;
  }
  const mult=e.target.closest('[data-ed-mult]');
  if(mult){window.__emojiDropsUpgradeMult=Number(mult.dataset.edMult)||1.5;window.__emojiDropsUpgradeTarget=null;}
 },true);
 window.__emojiDropsUpgradeMult=1.5;
 window.__emojiDropsTransactionHotfix={version:VERSION,selectionBridge:true};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();