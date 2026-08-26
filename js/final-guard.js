(() => {
  'use strict';
  // Last, tiny safety layer. It does not replace the game engine.
  const byId=id=>document.getElementById(id);
  const safeClick=(id,fn)=>{const e=byId(id);if(!e||e.dataset.edGuard)return;e.dataset.edGuard='1';e.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();fn();},true)};
  const state=()=>window.state;
  const close=(id)=>{const e=byId(id);if(e){e.style.display='none';e.setAttribute('aria-hidden','true')}};
  function install(){
    safeClick('caseBackButton',()=>window.closePage?.());
    safeClick('profileBackBtn',()=>window.closeProfile?.());
    safeClick('profileUpgradeBtn',()=>window.openUpgradeMenu?.());
    safeClick('profileStatsBtn',()=>window.openStats?.());
    safeClick('profileHistoryBtn',()=>window.openHistory?.());
    safeClick('profileLogoutBtn',()=>window.logout?.());
    safeClick('settingsCloseBtn',()=>window.closeSettings?.());
    safeClick('statsCloseBtn',()=>window.closeStats?.());
    safeClick('historyCloseBtn',()=>window.closeHistory?.());
    safeClick('upgradeBackBtn',()=>window.closeUpgradeMenu?.());
    // If an older script reopens a page with stale state, normalize its geometry.
    const normalize=()=>{
      const s=state();
      if(s?.isSpinning)return;
      const p=byId('openPage');
      if(p&&p.style.display!=='none')p.setAttribute('aria-hidden','false');
    };
    window.addEventListener('pageshow',normalize,{passive:true});
    setTimeout(normalize,0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
