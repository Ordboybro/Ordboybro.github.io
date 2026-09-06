(()=>{'use strict';
/* Transaction guard: protects the local demo Upgrade flow from reloads during its animation. */
const KEY='emojiDrops.upgradeTx.v1';
const rawSet=Storage.prototype.setItem;
const rawGet=Storage.prototype.getItem;
const rawRemove=Storage.prototype.removeItem;
let restoring=false;
const users=()=>{try{const x=JSON.parse(rawGet.call(localStorage,'users')||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const email=()=>rawGet.call(localStorage,'currentUser');
const readTx=()=>{try{return JSON.parse(rawGet.call(localStorage,KEY)||'null')}catch{return null}};
const clear=()=>{try{rawRemove.call(localStorage,KEY)}catch{}};
const saveTx=x=>{try{rawSet.call(localStorage,KEY,JSON.stringify(x))}catch{}};
const clone=x=>JSON.parse(JSON.stringify(x));
function start(){document.addEventListener('click',e=>{const b=e.target.closest('#edDoUpgrade');if(!b||b.disabled)return;const em=email();if(!em)return;const u=users().find(x=>x?.email===em);if(!u||!Array.isArray(u.inventory))return;saveTx({type:'upgrade',status:'started',email:em,user:clone(u),at:Date.now()})},true)}
function completed(before,after,em){const a=before.find(x=>x?.email===em),b=after.find(x=>x?.email===em);if(!a||!b)return false;const au=Number(a.stats?.upgrades)||0,bu=Number(b.stats?.upgrades)||0;return bu>au&&JSON.stringify(a.inventory)!==JSON.stringify(b.inventory)}
function patch(){const current=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){const result=current.call(this,k,v);if(k==='users'&&!restoring){const tx=readTx();if(tx?.type==='upgrade'&&tx.status==='started'){try{const after=JSON.parse(v);if(completed(tx.user,after,tx.email))clear()}catch{}}}return result}}
function recover(){const tx=readTx();if(!tx||tx.type!=='upgrade'||!tx.email||!tx.user)return;const list=users();if(!list.length){clear();return}const i=list.findIndex(x=>x?.email===tx.email);if(i<0){clear();return}restoring=true;try{list[i]=tx.user;rawSet.call(localStorage,'users',JSON.stringify(list));clear();console.warn('Emoji Drops: recovered interrupted Upgrade transaction')}finally{restoring=false}}
function boot(){recover();patch();start();window.__emojiDropsTxGuard={version:1,key:KEY,recover:recover}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
