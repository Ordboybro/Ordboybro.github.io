(()=>{'use strict';
/* Transaction guard: protects local demo Case + Upgrade flows from reloads during animations. */
const KEYS={upgrade:'emojiDrops.upgradeTx.v2',case:'emojiDrops.caseTx.v1'};
const rawSet=Storage.prototype.setItem;
const rawGet=Storage.prototype.getItem;
const rawRemove=Storage.prototype.removeItem;
let restoring=false;
const users=()=>{try{const x=JSON.parse(rawGet.call(localStorage,'users')||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const email=()=>rawGet.call(localStorage,'currentUser');
const clone=x=>JSON.parse(JSON.stringify(x));
const readTx=type=>{try{return JSON.parse(rawGet.call(localStorage,KEYS[type])||'null')}catch{return null}};
const clear=type=>{try{rawRemove.call(localStorage,KEYS[type])}catch{}};
const saveTx=(type,x)=>{try{rawSet.call(localStorage,KEYS[type],JSON.stringify(x))}catch{}};
const now=()=>Date.now();
const activeUser=()=>{const em=email();return em?users().find(x=>x?.email===em)||null:null};
function startUpgrade(){document.addEventListener('click',e=>{const b=e.target.closest('#edDoUpgrade');if(!b||b.disabled)return;const u=activeUser();if(!u||!Array.isArray(u.inventory))return;saveTx('upgrade',{id:`up-${now()}-${Math.random().toString(36).slice(2,8)}`,type:'upgrade',status:'started',email:u.email,user:clone(u),at:now()})},true)}
function startCase(){document.addEventListener('click',e=>{const b=e.target.closest('#edOpen');if(!b||b.disabled)return;const u=activeUser();if(!u)return;const amount=Math.max(1,Number(document.querySelector('#edAmounts .active')?.textContent)||1);const costText=document.getElementById('edOpenCost')?.textContent||'';const cost=Math.max(0,Number(costText.replace(/[^0-9.]/g,''))||0);saveTx('case',{id:`case-${now()}-${Math.random().toString(36).slice(2,8)}`,type:'case',status:'started',email:u.email,user:clone(u),amount,cost,at:now()})},true)}
function upgradeCompleted(before,after,em){const a=before.find(x=>x?.email===em),b=after.find(x=>x?.email===em);if(!a||!b)return false;return(Number(b.stats?.upgrades)||0)>(Number(a.stats?.upgrades)||0)&&JSON.stringify(a.inventory)!==JSON.stringify(b.inventory)}
function caseCompleted(tx,before,after,em){const a=before.find(x=>x?.email===em),b=after.find(x=>x?.email===em);if(!a||!b)return false;const openedDelta=(Number(b.stats?.opened)||0)-(Number(a.stats?.opened)||0);const balanceDelta=(Number(a.balance)||0)-(Number(b.balance)||0);return openedDelta>=Number(tx.amount||1)&&Math.abs(balanceDelta-Number(tx.cost||0))<0.01}
function patch(){const current=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){const result=current.call(this,k,v);if(k!=='users'||restoring)return result;for(const type of ['upgrade','case']){const tx=readTx(type);if(!tx||tx.status!=='started')continue;try{const after=JSON.parse(v);const done=type==='upgrade'?upgradeCompleted(tx.user,after,tx.email):caseCompleted(tx,tx.user,after,tx.email);if(done){tx.status='completed';tx.completedAt=now();saveTx(type,tx);clear(type)}}catch{}}return result}}
function recover(type){const tx=readTx(type);if(!tx||tx.status!=='started'||!tx.email||!tx.user)return;const list=users();const i=list.findIndex(x=>x?.email===tx.email);if(i<0){clear(type);return}restoring=true;try{list[i]=tx.user;rawSet.call(localStorage,'users',JSON.stringify(list));clear(type);console.warn(`Emoji Drops: recovered interrupted ${type} transaction`,tx.id)}finally{restoring=false}}
function recoverAll(){recover('upgrade');recover('case')}
function loadEngine(){if(window.__emojiDropsEngineLoader||window.__emojiDropsEngine)return;window.__emojiDropsEngineLoader=true;const s=document.createElement('script');s.src='js/game-transaction-engine.js';s.defer=true;s.onload=()=>console.log('Emoji Drops: authoritative transaction engine loaded');s.onerror=()=>{window.__emojiDropsEngineLoader=false;console.error('Emoji Drops: failed to load transaction engine')};document.head.appendChild(s)}
function boot(){recoverAll();patch();startUpgrade();startCase();window.__emojiDropsTxGuard={version:2,keys:KEYS,recover:recoverAll};loadEngine()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
