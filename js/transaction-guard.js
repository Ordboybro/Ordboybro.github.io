(()=>{'use strict';
/* Transaction guard: legacy recovery only. The authoritative engine owns new transactions. */
const KEYS={upgrade:'emojiDrops.upgradeTx.v2',case:'emojiDrops.caseTx.v1'};
const rawGet=Storage.prototype.getItem,rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;let restoring=false;
const users=()=>{try{const x=JSON.parse(rawGet.call(localStorage,'users')||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const readTx=type=>{try{return JSON.parse(rawGet.call(localStorage,KEYS[type])||'null')}catch{return null}};
const clear=type=>{try{rawRemove.call(localStorage,KEYS[type])}catch{}};
const clone=x=>JSON.parse(JSON.stringify(x));
function recover(type){const tx=readTx(type);if(!tx||tx.status!=='started'||!tx.email||!tx.user)return;const list=users(),i=list.findIndex(x=>x?.email===tx.email);if(i<0){clear(type);return}restoring=true;try{list[i]=clone(tx.user);rawSet.call(localStorage,'users',JSON.stringify(list));clear(type);console.warn(`Emoji Drops: recovered legacy interrupted ${type} transaction`,tx.id)}finally{restoring=false}}
function recoverAll(){recover('upgrade');recover('case')}
function boot(){recoverAll();window.__emojiDropsTxGuard={version:3,mode:'legacy-recovery-only',keys:KEYS,recover:recoverAll}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();