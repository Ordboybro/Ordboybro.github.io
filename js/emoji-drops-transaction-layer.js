(()=>{'use strict';
/* Emoji Drops transaction layer v10. Web Locks primary, lease fallback with ownership verification, journal-first atomicity, recovery and fault injection. */
const KEY='emojiDropsStateV3',JOURNAL='emojiDropsTxnV4',LOCK='emojiDropsLockV4',MAX_HISTORY=200,LOCK_MS=1800,COMMIT_GRACE_MS=1200;const PHASES=Object.freeze({PREPARING:'PREPARING',SUBMITTING:'SUBMITTING',COMMITTED:'COMMITTED',ROLLED_BACK:'ROLLED_BACK',REVEALED:'REVEALED'});
const core=()=>window.__emojiDropsCore&&typeof window.__emojiDropsCore.state==='function'?window.__emojiDropsCore:null;
const clone=x=>{try{return JSON.parse(JSON.stringify(x))}catch{return null}};
const fault=name=>Boolean(window.__emojiDropsFaults?.[name]);
let active=null,lockTimer=0,rollingBack=false,owner=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const get=k=>{if(fault('storageRead'))return null;try{return localStorage.getItem(k)}catch{return null}};
const set=(k,v)=>{if(fault('storageWrite')){if(k===KEY&&active&&!rollingBack){rollingBack=true;try{rollback(active)}finally{rollingBack=false}}throw new Error('fault_storage_write')}try{localStorage.setItem(k,v);return true}catch{return false}};
const remove=k=>{if(fault('storageWrite')){if(k===KEY&&active&&!rollingBack){rollingBack=true;try{rollback(active)}finally{rollingBack=false}}throw new Error('fault_storage_write')}try{localStorage.removeItem(k);return true}catch{return false}};
const now=()=>Date.now();
const digest=x=>{try{const s=typeof x==='string'?x:JSON.stringify(x);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}catch{return''}};
function journalWrite(x){return set(JOURNAL,JSON.stringify(x))}
function journalRead(){try{const x=JSON.parse(get(JOURNAL)||'null');return x&&typeof x==='object'?x:null}catch{return null}}
function syncPersisted(){const raw=get(KEY),s=core()?.state?.();if(!s||!raw)return false;try{const incoming=JSON.parse(raw);for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(incoming));core()?.render?.();return true}catch{return false}}
function restore(t){const s=core()?.state?.();if(!s||!t?.before)return false;try{for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(t.before));if(t.raw==null)remove(KEY);else if(!set(KEY,t.raw))return false;core()?.render?.();return true}catch{return false}}
function begin(label){if(fault('transaction'))return null;const s=core()?.state?.();if(!s||active)return null;const before=clone(s),raw=get(KEY),id=`${now()}-${Math.random().toString(36).slice(2)}`;if(!before)return null;const j={v:10,id,label:String(label||'action'),phase:PHASES.PREPARING,before,raw,beforeHash:digest(raw||''),startedAt:now(),status:'pending'};if(!journalWrite(j))return null;active={...j};return active}
function readLease(){try{return JSON.parse(get(LOCK)||'null')}catch{return null}}
function leaseOwned(){return readLease()?.owner===owner}
function commit(t){if(!t||active!==t)return false;if(t.leaseOwner&&!leaseOwned()){syncPersisted();active=null;return false}const s=core()?.state?.();if(!s){rollback(t);return false}const raw=get(KEY);let parsed=null;try{parsed=JSON.parse(raw||'null')}catch{}if(!parsed||digest(raw)!==digest(JSON.stringify(s))){rollback(t);return false}const after=clone(s);t.phase=PHASES.COMMITTED;t.status='committed';t.after=after;t.afterHash=digest(raw);t.finishedAt=now();if(!journalWrite(t)){rollback(t);return false}active=null;return true}
function rollback(t){if(!t)return false;if(t.leaseOwner&&!leaseOwned()){syncPersisted();if(active===t)active=null;return false}let ok=false;try{ok=restore(t)}catch{}try{t.phase=PHASES.ROLLED_BACK;journalWrite({v:10,id:t.id,label:t.label,phase:t.phase,before:clone(t.before),raw:t.raw,beforeHash:t.beforeHash,startedAt:t.startedAt,finishedAt:now(),status:ok?'rolled_back':'rollback_failed'})}catch{}if(active===t)active=null;return ok}
function recover(){const j=journalRead();if(!j||j.status!=='pending'||!j.before)return false;const current=get(KEY),currentHash=digest(current||'');if(j.afterHash&&currentHash===j.afterHash){journalWrite({...j,v:10,phase:PHASES.COMMITTED,status:'recovered_committed',recoveredAt:now()});return true}const s=core()?.state?.();try{if(s){for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(j.before));if(j.raw==null)remove(KEY);else if(!set(KEY,j.raw))throw Error('recovery_write_failed');core()?.render?.()}journalWrite({...j,v:10,phase:PHASES.ROLLED_BACK,status:'recovered_rolled_back',recoveredAt:now()});return true}catch{try{journalWrite({...j,v:10,status:'recovery_failed',recoveredAt:now()})}catch{}return false}}
function acquire(){const old=readLease(),t=now();if(old&&Number(old.expires)>t&&old.owner!==owner)return false;if(!set(LOCK,JSON.stringify({owner,expires:t+LOCK_MS})))return false;const ok=leaseOwned();if(ok&&!lockTimer)lockTimer=setInterval(()=>{if(active){const x=readLease();if(x?.owner===owner)set(LOCK,JSON.stringify({owner,expires:now()+LOCK_MS}))}},500);return ok}
function refresh(){if(leaseOwned())set(LOCK,JSON.stringify({owner,expires:now()+LOCK_MS}))}
function release(){if(lockTimer){clearInterval(lockTimer);lockTimer=0}if(leaseOwned())remove(LOCK)}
function withLock(fn){const locks=typeof navigator!=='undefined'&&navigator?.locks?.request;if(locks)return navigator.locks.request('emoji-drops-state',async()=>fn());if(!acquire())return Promise.reject(new Error('transaction_locked'));return Promise.resolve().then(fn).finally(release)}
async function run(label,executor,apply){
  if(typeof executor!=='function')throw new Error('transaction_executor_required');
  return withLock(async()=>{
    const t=begin(label);
    if(!t)throw new Error('transaction_busy');
    if(!(typeof navigator!=='undefined'&&navigator?.locks?.request))t.leaseOwner=true;
    let remoteCommitted=false,result;
    try{
      t.phase=PHASES.SUBMITTING;
      result=await executor();
      remoteCommitted=true;
      if(typeof apply==='function')await apply(result,t);
      try{
        const save=window.__emojiDropsEconomy?.save;
        if(typeof save==='function')save();
        else localStorage.setItem(KEY,JSON.stringify(core()?.state?.()||{}));
      }catch(persistError){
        t.persistenceDegraded=true;
        t.persistenceError=String(persistError?.message||persistError);
      }
      if(!commit(t)){
        if(remoteCommitted){
          t.phase=PHASES.COMMITTED;t.status='remote_committed_local_recovery';
          t.remoteResult=clone(result);
          t.finishedAt=now();
          try{journalWrite(t)}catch{}
          active=null;
          core()?.render?.();
          return result;
        }
        throw new Error('transaction_commit_failed');
      }
      core()?.render?.();
      return result;
    }catch(err){
      if(active===t){
        if(remoteCommitted){
          t.status='remote_committed_local_recovery';
          t.remoteResult=clone(result);
          t.error=String(err?.message||err);
          t.finishedAt=now();
          try{journalWrite(t)}catch{}
          active=null;
          core()?.render?.();
        }else rollback(t);
      }
      throw err;
    }
  });
}
function history(){const s=core()?.state?.();if(!s)return[];if(!Array.isArray(s.history))s.history=[];return s.history}
function record(label,before,after){const h=history();h.push({id:`${now()}-${Math.random().toString(36).slice(2)}`,at:now(),type:String(label||'mutation'),beforeBalance:Number(before?.balance||0),afterBalance:Number(after?.balance||0),inventoryBefore:Array.isArray(before?.inventory)?before.inventory.length:0,inventoryAfter:Array.isArray(after?.inventory)?after.inventory.length:0});if(h.length>MAX_HISTORY)h.splice(0,h.length-MAX_HISTORY)}
function wrapStorage(){if(localStorage.__edTxnV4)return;const os=localStorage.setItem.bind(localStorage),orm=localStorage.removeItem?.bind(localStorage);try{localStorage.setItem=function(k,v){if(fault('storageWrite')){if(k===KEY&&active&&!rollingBack){rollingBack=true;try{rollback(active)}finally{rollingBack=false}}throw new Error('fault_storage_write')}try{return os(k,v)}catch(err){if(k===KEY&&active&&!rollingBack){rollingBack=true;try{rollback(active)}finally{rollingBack=false}}throw err}};if(orm)localStorage.removeItem=function(k){if(k===KEY&&active&&!rollingBack){rollingBack=true;try{rollback(active)}finally{rollingBack=false}}return orm(k)};Object.defineProperty(localStorage,'__edTxnV4',{value:true})}catch{}}

recover();wrapStorage();
window.addEventListener?.('storage',e=>{if(e.key!==KEY||active||!e.newValue)return;try{const incoming=JSON.parse(e.newValue),s=core()?.state?.();if(!s)return;for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(incoming));core()?.render?.()}catch{}});
window.addEventListener?.('pagehide',release);
window.__emojiDropsTransactions={version:10,phases:PHASES,begin,commit,rollback,recover,acquire,refresh,release,withLock,run,history,record,maxHistory:MAX_HISTORY,journal:JOURNAL,lock:LOCK,commitGraceMs:COMMIT_GRACE_MS,nonBlockingLease:true,webLocksPrimary:typeof navigator!=='undefined'&&!!navigator?.locks?.request,leaseOwnershipVerified:true,faultAware:true};
})();
