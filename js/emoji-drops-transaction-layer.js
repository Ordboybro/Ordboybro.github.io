(()=>{'use strict';
/* Emoji Drops transaction layer v2. Atomic journal, immediate commit verification, recovery and cross-tab lease. No visual changes. */
const KEY='emojiDropsStateV3',JOURNAL='emojiDropsTxnV2',LOCK='emojiDropsLockV2',MAX_HISTORY=200,LOCK_MS=1800;
const core=()=>window.__emojiDropsCore&&typeof window.__emojiDropsCore.state==='function'?window.__emojiDropsCore:null;
const clone=x=>{try{return JSON.parse(JSON.stringify(x))}catch{return null}};
const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
const remove=k=>{try{localStorage.removeItem(k);return true}catch{return false}};
const now=()=>Date.now();
let active=null;
function journalWrite(x){return set(JOURNAL,JSON.stringify(x))}
function journalRead(){try{const x=JSON.parse(get(JOURNAL)||'null');return x&&typeof x==='object'?x:null}catch{return null}}
function restore(t){const s=core()?.state?.();if(!s||!t)return false;try{for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(t.before));if(t.raw==null)remove(KEY);else set(KEY,t.raw);return true}catch{return false}}
function begin(label){const s=core()?.state?.();if(!s||active)return null;const before=clone(s),raw=get(KEY),id=`${now()}-${Math.random().toString(36).slice(2)}`;active={id,label:String(label||'action'),before,raw,startedAt:now(),status:'pending'};journalWrite({v:2,id:active.id,label:active.label,state:before,raw,startedAt:active.startedAt,status:'pending'});return active}
function commit(t){if(!t||active!==t)return false;const s=core()?.state?.();if(!s){rollback(t);return false}const raw=get(KEY);let parsed=null;try{parsed=JSON.parse(raw||'null')}catch{}if(!parsed||JSON.stringify(parsed)!==JSON.stringify(s)){rollback(t);return false}t.status='committed';t.finishedAt=now();journalWrite({v:2,id:t.id,label:t.label,state:clone(s),raw,startedAt:t.startedAt,finishedAt:t.finishedAt,status:'committed'});active=null;return true}
function rollback(t){if(!t)return false;const ok=restore(t);journalWrite({v:2,id:t.id,label:t.label,state:clone(t.before),raw:t.raw,startedAt:t.startedAt,finishedAt:now(),status:'rolled_back'});if(active===t)active=null;return ok}
function recover(){const j=journalRead();if(!j||j.status!=='pending'||!j.state)return false;const current=get(KEY);if(current!==j.raw){const s=core()?.state?.();try{if(s){for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(j.state));if(j.raw==null)remove(KEY);else set(KEY,j.raw)}}catch{}journalWrite({...j,status:'recovered',recoveredAt:now()});return true}journalWrite({...j,status:'recovered',recoveredAt:now()});return false}
function acquire(){const owner=`${now()}-${Math.random().toString(36).slice(2)}`;let old=null;try{old=JSON.parse(get(LOCK)||'null')}catch{}if(old&&Number(old.expires)>now())return false;return set(LOCK,JSON.stringify({owner,expires:now()+LOCK_MS}))}
function release(){remove(LOCK)}
function history(){const s=core()?.state?.();if(!s)return[];if(!Array.isArray(s.history))s.history=[];return s.history}
function record(label,before,after){const h=history();h.push({id:`${now()}-${Math.random().toString(36).slice(2)}`,at:now(),type:String(label||'mutation'),beforeBalance:Number(before?.balance||0),afterBalance:Number(after?.balance||0),inventoryBefore:Array.isArray(before?.inventory)?before.inventory.length:0,inventoryAfter:Array.isArray(after?.inventory)?after.inventory.length:0});if(h.length>MAX_HISTORY)h.splice(0,h.length-MAX_HISTORY)}
function wrapStorage(){if(localStorage.__edTxnV2)return;const os=localStorage.setItem.bind(localStorage),orm=localStorage.removeItem?.bind(localStorage);try{localStorage.setItem=function(k,v){if(k===KEY&&active)journalWrite({v:2,id:active.id,label:active.label,state:active.before,raw:active.raw,startedAt:active.startedAt,status:'pending'});try{const r=os(k,v);if(k===KEY&&active){active.wrote=true;commit(active)}return r}catch(err){if(k===KEY&&active)rollback(active);throw err}};if(orm)localStorage.removeItem=function(k){if(k===KEY&&active)rollback(active);return orm(k)};Object.defineProperty(localStorage,'__edTxnV2',{value:true})}catch{}}
function install(){document.addEventListener?.('click',e=>{const b=e.target?.closest?.('[data-do-open],[data-sell],[data-sell-all],[data-upgrade],[data-buy],[data-list-random],[data-daily]');if(!b)return;if(!acquire()){e.preventDefault?.();e.stopImmediatePropagation?.();return}const keys=['doOpen','sell','sellAll','upgrade','buy','listRandom','daily'];const label=keys.find(k=>b.dataset&&b.dataset[k]!==undefined)||'action';const t=begin(label);if(!t){release();return}const before=clone(t.before);setTimeout(()=>{if(active===t){const after=clone(core()?.state?.());if(after)record(label,before,after);if(active===t)commit(t)}release()},0);setTimeout(release,LOCK_MS)},true)}
recover();wrapStorage();install();
window.addEventListener?.('storage',e=>{if(e.key!==KEY||active||!e.newValue)return;try{const incoming=JSON.parse(e.newValue),s=core()?.state?.();if(!s)return;for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(incoming));core()?.render?.()}catch{}});
window.__emojiDropsTransactions={version:2,begin,commit,rollback,recover,acquire,release,history,record,maxHistory:MAX_HISTORY};
})();
