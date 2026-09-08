(()=>{'use strict';
const VERSION='transaction-hotfix-2';
const $=(s,r=document)=>r.querySelector(s);
function install(){
 window.__emojiDropsUpgradeIndex=-1;
 window.__emojiDropsUpgradeTarget=-1;
 window.__emojiDropsUpgradeMult=1.5;
 document.addEventListener('click',e=>{
  const open=e.target.closest('#edUpgrade');
  if(open){window.__emojiDropsUpgradeIndex=-1;window.__emojiDropsUpgradeTarget=-1;window.__emojiDropsUpgradeMult=1.5;return}
  const source=e.target.closest('#edUpgradeInventory .ed-final-item-btn');
  if(source){const box=$('#edUpgradeInventory');window.__emojiDropsUpgradeIndex=box?[...box.querySelectorAll('.ed-final-item-btn')].indexOf(source):-1;window.__emojiDropsUpgradeTarget=-1;return}
  const target=e.target.closest('#edTargets .ed-final-item-btn');
  if(target){const box=$('#edTargets');window.__emojiDropsUpgradeTarget=box?[...box.querySelectorAll('.ed-final-item-btn')].indexOf(target):-1;return}
  const mult=e.target.closest('[data-ed-mult]');
  if(mult){window.__emojiDropsUpgradeMult=Number(mult.dataset.edMult)||1.5;window.__emojiDropsUpgradeTarget=-1;}
 },true);
 window.__emojiDropsTransactionHotfix={version:VERSION,selectionBridge:true,safeReset:true};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();