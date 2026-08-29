(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const REWARD = 250;
  const DAY = 86400000;
  const key = 'emojiDrops.dailyReward.v2';

  function rewardLeft(){
    try {
      const data=JSON.parse(localStorage.getItem(key)||'{}');
      return Math.max(0,Number(data.nextAt||0)-Date.now());
    } catch { return 0; }
  }
  function timer(ms){
    const t=Math.ceil(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function claim(){
    if(rewardLeft()>0)return;
    const st=window.state,u=st?.currentUser;
    if(!st||!u){window.openAuth?.('login');return;}
    st.balance=(Number(st.balance)||0)+REWARD;
    u.balance=st.balance;
    localStorage.setItem(key,JSON.stringify({claimedAt:Date.now(),nextAt:Date.now()+DAY}));
    try{window.saveUsers?.()}catch{}
    window.updateBalanceUI?.();
    renderReward();
  }
  function renderReward(){
    const left=rewardLeft();
    $$('.balance-dropdown button,#profilePage .ed-profile-reward').forEach(button=>{
      button.disabled=left>0;
      button.textContent=left>0?`Получено · ${timer(left)}`:`Получить ${REWARD}₽`;
      button.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();claim();};
    });
  }

  function profile(){
    const page=$('#profilePage');if(!page)return;
    const sides=$$('.profile-side',page);
    const balanceButton=page.querySelector('#profileBalance')?.closest('button');
    const deposit=[...page.querySelectorAll('.profile-mini-btn')].find(b=>/пополн/.test(b.textContent||''));

    if(balanceButton){
      balanceButton.classList.remove('profile-mini-btn');
      balanceButton.classList.add('ed-profile-logout');
      balanceButton.textContent='Выйти';
      balanceButton.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();window.logout?.();window.EmojiDropsRouter?.navigate('/')||location.assign('/')};
    } else if(!page.querySelector('.ed-profile-logout')) {
      const button=document.createElement('button');
      button.type='button';button.className='ed-profile-logout';button.textContent='Выйти';
      button.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();window.logout?.();window.EmojiDropsRouter?.navigate('/')||location.assign('/')};
      (sides[0]||page.querySelector('.profile-main')||page).prepend(button);
    }
    if(deposit){
      deposit.classList.add('ed-profile-reward');
      deposit.textContent='Получить 250₽';
      deposit.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();claim();};
    }
    renderReward();
  }

  function modals(){
    const settings=$('#settingsPage'),stats=$('#statsPage');
    if(settings)settings.setAttribute('aria-label','Настройки');
    if(stats)stats.setAttribute('aria-label','Статистика');
    window.openSettings=()=>{ if(stats){stats.hidden=true;stats.style.display='none';} if(settings){settings.hidden=false;settings.style.display='flex';document.body.classList.add('modal-open');} };
    window.closeSettings=()=>{if(settings){settings.hidden=true;settings.style.display='none';}document.body.classList.remove('modal-open');};
    window.openStats=()=>{if(settings){settings.hidden=true;settings.style.display='none';}if(stats){stats.hidden=false;stats.style.display='flex';document.body.classList.add('modal-open');try{window.updateStatsUI?.()}catch{}}};
    window.closeStats=()=>{if(stats){stats.hidden=true;stats.style.display='none';}document.body.classList.remove('modal-open');};
  }

  function install(){
    modals();profile();renderReward();
    if(!document.body.dataset.edFinalOverride){
      document.body.dataset.edFinalOverride='1';
      document.addEventListener('keydown',e=>{if(e.key==='Escape'){window.closeSettings?.();window.closeStats?.();}},true);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setInterval(()=>{profile();renderReward();},1000);
})();
