(()=>{'use strict';
/* Emoji Drops — functional hardening layer. No visual redesign. */
const LEGACY_IDS=['authModal','openModal','winModal','profileModal','settingsModal','statsModal','upgradeModal'];
const q=(s,r=document)=>r.querySelector(s);
function removeLegacyShells(){for(const id of LEGACY_IDS){const el=document.getElementById(id);if(el)el.remove()}}
function storageGuard(){
  try{JSON.parse(localStorage.getItem('users')||'[]')}catch{localStorage.setItem('users','[]')}
  const u=localStorage.getItem('currentUser');
  if(u&&typeof u!=='string')localStorage.removeItem('currentUser');
}
function lockDuplicateActions(){
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b||b.disabled)return;
    if(b.matches('#edOpen,#edDoUpgrade,#edReward,#rewardHeader,#edSellAll')){
      if(b.dataset.busy==='1'){e.preventDefault();e.stopImmediatePropagation();return}
      b.dataset.busy='1';
      const release=()=>{b.dataset.busy='0'};
      setTimeout(release,b.id==='edOpen'?1200:700);
    }
  },true);
}
function escapeSafety(){
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const open=[...document.querySelectorAll('.modal.show')].pop();
    if(open){open.classList.remove('show');open.setAttribute('aria-hidden','true');document.body.classList.remove('modal-lock')}
  });
}
function modalA11y(){
  document.addEventListener('click',e=>{
    const m=e.target.closest('.modal');
    if(m&&e.target===m){m.classList.remove('show');m.setAttribute('aria-hidden','true');if(!document.querySelector('.modal.show'))document.body.classList.remove('modal-lock')}
  });
  document.addEventListener('focusin',e=>{
    const m=e.target.closest('.modal.show');if(!m)return;
    if(!m.contains(document.activeElement))m.querySelector('button,input,[tabindex]')?.focus();
  });
}
function rewardTicker(){
  const tick=()=>{
    const b=q('#rewardHeader');if(!b)return;
    try{
      const email=localStorage.getItem('currentUser')||'guest';
      const raw=JSON.parse(localStorage.getItem(`emojiDrops.dailyReward.v7:${email}`)||'{}');
      const left=Math.max(0,Number(raw.nextAt||0)-Date.now());
      b.disabled=left>0;
      b.textContent=left?`Получено · ${time(left)}`:'Получить 250₽';
    }catch{}
  };
  const time=ms=>{let s=Math.ceil(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`};
  tick();setInterval(tick,1000);window.addEventListener('storage',tick);
}
function runtimeErrorGuard(){window.addEventListener('error',e=>{if(String(e.message||'').includes('Emoji Drops'))console.error('Emoji Drops runtime error:',e.error||e.message)})}
function boot(){removeLegacyShells();storageGuard();lockDuplicateActions();escapeSafety();modalA11y();rewardTicker();runtimeErrorGuard()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
