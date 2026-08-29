(() => {
  'use strict';

  const ACCENT = '#ff7b00';
  const RARITY = Object.freeze({
    common: '#8b949e',
    rare: '#3b82f6',
    epic: '#a855f7',
    mythical: '#ef4444',
    legendary: '#ff9f43'
  });
  const REWARD = 250;
  const DAY = 86400000;
  const rewardKey = () => `emojiDrops.reward:${String(window.state?.currentUser?.email || 'guest').toLowerCase()}`;
  const bestKey = () => `emojiDrops.best:${String(window.state?.currentUser?.email || 'guest').toLowerCase()}`;
  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  function installStyles() {
    if ($('#emojiDropsFinalFixStyles')) return;
    const style = document.createElement('style');
    style.id = 'emojiDropsFinalFixStyles';
    style.textContent = `
      :root{--ed-accent:${ACCENT}}

      /* CASES */
      .cases .case{border:2px solid #292929!important;background:linear-gradient(145deg,#171717,#111)!important;border-radius:22px!important;box-shadow:0 10px 30px rgba(0,0,0,.22)!important;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease!important}
      .cases .case:hover{transform:translateY(-5px)!important;border-color:${ACCENT}!important;box-shadow:0 0 0 1px rgba(255,123,0,.16),0 16px 38px rgba(255,123,0,.12)!important}
      .cases .case-price{left:14px!important;bottom:14px!important;padding:7px 12px!important;border:1px solid rgba(255,123,0,.55)!important;border-radius:12px!important;background:linear-gradient(135deg,rgba(255,123,0,.16),rgba(20,20,20,.95))!important;box-shadow:0 5px 18px rgba(0,0,0,.3)!important;backdrop-filter:blur(8px)!important}
      .cases .case-price .new-price{font-size:18px!important;color:#fff!important;font-weight:800!important}
      .cases .case-price .old-price{font-size:11px!important;color:#777!important}
      .cases .case-emoji{filter:drop-shadow(0 0 12px rgba(255,123,0,.08))!important}
      .cases .case:hover .case-emoji{filter:drop-shadow(0 0 15px rgba(255,123,0,.42))!important}

      /* SEARCH IS GONE */
      .search-wrap,#searchInput,.search-container,.case-search{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important}

      /* LIVE DROPS: real horizontal rail, not the old floating column */
      .live-drops-bar.live-drops-floating,.live-drops-bar.ed-moved-live{position:relative!important;right:auto!important;bottom:auto!important;left:auto!important;top:auto!important;z-index:20!important;width:min(1160px,calc(100% - 32px))!important;margin:26px auto 36px!important;padding:0!important;background:transparent!important}
      .live-drops-bar .live-title{font-size:18px!important;line-height:1.2!important;margin:0 0 10px!important;padding-left:2px!important;color:#fff!important;text-shadow:0 0 12px rgba(255,123,0,.24)!important;letter-spacing:.8px!important}
      #liveContainer{display:flex!important;flex-direction:row!important;align-items:stretch!important;gap:9px!important;width:100%!important;max-width:none!important;height:76px!important;max-height:76px!important;overflow:hidden!important;padding:2px!important;scrollbar-width:none!important}
      #liveContainer::-webkit-scrollbar{display:none!important}
      #liveContainer .live-drop,#liveContainer .drop-item{position:relative!important;box-sizing:border-box!important;flex:0 0 142px!important;width:142px!important;min-width:142px!important;height:70px!important;margin:0!important;padding:9px 10px!important;border:1px solid var(--ed-rarity,#555)!important;border-radius:14px!important;background:linear-gradient(145deg,#191a1d,#111214)!important;box-shadow:0 7px 20px rgba(0,0,0,.22)!important;overflow:hidden!important;animation:edLiveIn .38s cubic-bezier(.22,.8,.24,1) both!important;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}
      #liveContainer .live-drop:hover,#liveContainer .drop-item:hover{transform:translateY(-3px)!important;box-shadow:0 10px 24px rgba(0,0,0,.3)!important}
      #liveContainer .live-drop.common,#liveContainer .common-drop{--ed-rarity:${RARITY.common}!important;border-color:${RARITY.common}!important}
      #liveContainer .live-drop.rare,#liveContainer .rare-drop{--ed-rarity:${RARITY.rare}!important;border-color:${RARITY.rare}!important}
      #liveContainer .live-drop.epic,#liveContainer .epic-drop{--ed-rarity:${RARITY.epic}!important;border-color:${RARITY.epic}!important}
      #liveContainer .live-drop.mythical,#liveContainer .mythical-drop{--ed-rarity:${RARITY.mythical}!important;border-color:${RARITY.mythical}!important}
      #liveContainer .live-drop.legendary,#liveContainer .legendary-drop{--ed-rarity:${RARITY.legendary}!important;border-color:${RARITY.legendary}!important;background:radial-gradient(circle at 30% 20%,rgba(255,159,67,.12),transparent 45%),linear-gradient(145deg,#1b1714,#111214)!important;box-shadow:0 0 16px rgba(255,159,67,.12),inset 0 0 20px rgba(255,159,67,.035)!important}
      #liveContainer .legendary-drop::after,#liveContainer .live-drop.legendary::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 34%,rgba(255,200,130,.18) 50%,transparent 66%);transform:translateX(-130%);animation:edLegendaryShine 2.8s ease-in-out infinite;pointer-events:none}
      #liveContainer .live-emoji,#liveContainer .drop-emoji{font-size:30px!important;line-height:1!important;filter:drop-shadow(0 4px 8px rgba(0,0,0,.22))}
      #liveContainer .live-user,#liveContainer .drop-user{font-size:12px!important;font-weight:800!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #liveContainer .live-rarity,#liveContainer .drop-rarity{font-size:10px!important;font-weight:800!important;letter-spacing:.8px!important;color:var(--ed-rarity,#999)!important;margin-top:3px}
      @keyframes edLiveIn{from{opacity:0;transform:translateX(-26px) scale(.98)}to{opacity:1;transform:translateX(0) scale(1)}}
      @keyframes edLegendaryShine{0%,22%{transform:translateX(-130%)}68%,100%{transform:translateX(130%)}}

      /* reward */
      .balance-dropdown{min-width:170px!important}
      .balance-dropdown button,.ed-profile-reward{border:1px solid ${ACCENT}!important;background:linear-gradient(135deg,#ff7b00,#ff4d00)!important;color:#fff!important;border-radius:14px!important;padding:12px 18px!important;min-height:44px!important;font-weight:800!important;box-shadow:0 8px 24px rgba(255,123,0,.14)!important}
      .balance-dropdown button:disabled{cursor:default!important;opacity:.8!important;background:#242424!important;border-color:#444!important;box-shadow:none!important}

      /* profile actions */
      #profilePage .profile-mini-btn,#profilePage .ed-profile-logout{min-height:46px!important;padding:0 19px!important;border:1px solid ${ACCENT}!important;border-radius:13px!important;background:linear-gradient(135deg,#171717,#111)!important;color:#fff!important;box-shadow:0 7px 20px rgba(255,123,0,.07)!important;font-weight:800!important;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important}
      #profilePage .profile-mini-btn:hover,#profilePage .ed-profile-logout:hover{transform:translateY(-2px)!important;border-color:#ff9b42!important;box-shadow:0 10px 25px rgba(255,123,0,.15)!important}
      #profilePage .profile-side{gap:12px!important}
      #profilePage .profile-balance,#profilePage .profile-balance-card,#profilePage [data-profile-balance]{display:none!important}

      /* profile / modal scroll: exactly one scroll owner */
      #profilePage{overflow-y:auto!important;overflow-x:hidden!important}
      #profilePage .profile-content{overflow:visible!important;max-height:none!important}
      #settingsPage,#statsPage{overflow:hidden!important}
      #settingsPage>.settings-box,#statsPage>.settings-box{max-height:calc(100vh - 32px)!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important}
      #settingsPage .settings-list,#statsPage .stats-list{overflow:visible!important;max-height:none!important}

      /* best drop */
      #profilePage .best-drop-card{border-color:${ACCENT}!important;background:linear-gradient(145deg,#181818,#111)!important;box-shadow:0 12px 30px rgba(255,123,0,.08)!important}
      #profilePage .best-drop-emoji{border-color:var(--best-rarity,${ACCENT})!important;box-shadow:0 0 20px color-mix(in srgb,var(--best-rarity,${ACCENT}) 25%,transparent)!important}

      @media(max-width:700px){
        .live-drops-bar.live-drops-floating,.live-drops-bar.ed-moved-live{width:calc(100% - 24px)!important}
        #liveContainer .live-drop,#liveContainer .drop-item{flex-basis:124px!important;width:124px!important;min-width:124px!important}
        #liveContainer{height:68px!important;max-height:68px!important}
        #liveContainer .live-drop,#liveContainer .drop-item{height:62px!important}
      }
      @media(prefers-reduced-motion:reduce){#liveContainer .live-drop,#liveContainer .drop-item,#liveContainer .legendary-drop::after{animation:none!important;transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function hideSearch() {
    $$('.search-wrap,#searchInput,.search-container,.case-search').forEach(node => {
      node.hidden = true;
      node.setAttribute('aria-hidden','true');
      node.style.setProperty('display','none','important');
    });
  }

  const CASE_PRICES = Object.freeze({transport:15,animals:25,food:40,nature:65,moves:90,smile:130,sport:250,games:500});
  function syncCasePrices() {
    $$('.case').forEach(card => {
      const match=(card.getAttribute('onclick')||'').match(/openCasePage\(['"]([^'"]+)['"]\)/i);
      const id=match?.[1]?.toLowerCase();
      const price=CASE_PRICES[id];
      if(!price)return;
      let node=card.querySelector('.new-price');
      if(!node){
        node=document.createElement('div');
        node.className='new-price';
        card.querySelector('.case-price')?.appendChild(node);
      }
      node.textContent=`${price}₽`;
    });
  }

  function moveLiveDrops() {
    const bar=$('.live-drops-bar');
    const cases=$('.cases');
    if(!bar||!cases)return;
    if(bar.parentNode!==cases.parentNode || bar.previousElementSibling!==cases) cases.parentNode.insertBefore(bar,cases.nextSibling);
    bar.classList.add('ed-moved-live');
    bar.classList.remove('live-drops-floating');
    const root=$('#liveContainer');
    if(!root)return;
    root.style.flexDirection='row';
    root.style.display='flex';
    root.style.overflow='hidden';
    // Native code uses prepend(), so DOM order is already newest -> oldest.
    // CSS flex row therefore gives the requested left -> right chronology.
    [...root.children].forEach(decorateLive);
    while(root.children.length>10)root.lastElementChild?.remove();
  }

  function decorateLive(node) {
    if(!(node instanceof HTMLElement))return;
    const raw=`${node.dataset.rarity||''} ${node.className} ${node.querySelector('.live-rarity,.drop-rarity')?.textContent||''}`.toLowerCase();
    const rarity=Object.keys(RARITY).find(key=>raw.includes(key))||'common';
    node.classList.add(`ed-live-${rarity}`);
    node.style.setProperty('--ed-rarity',RARITY[rarity]);
    if(node.dataset.edFinalLive!=='1'){
      node.dataset.edFinalLive='1';
      if(!reduced()){
        node.classList.remove('ed-live-enter');
        void node.offsetWidth;
        node.classList.add('ed-live-enter');
      }
    }
    const rarityText=node.querySelector('.live-rarity,.drop-rarity');
    if(rarityText){rarityText.textContent=rarity.toUpperCase();rarityText.style.color=RARITY[rarity];}
  }

  function installLiveObserver() {
    const root=$('#liveContainer');
    if(!root||root.dataset.edObserver==='1')return;
    root.dataset.edObserver='1';
    new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(!(node instanceof HTMLElement))continue;
          decorateLive(node);
          if(node.parentNode===root && root.firstElementChild!==node)root.insertBefore(node,root.firstElementChild);
        }
      }
      while(root.children.length>10)root.lastElementChild?.remove();
    }).observe(root,{childList:true});
  }

  function rewardRecord(){try{return JSON.parse(localStorage.getItem(rewardKey())||'{}')}catch{return {}}}
  function rewardLeft(){const r=rewardRecord();return Math.max(0,Number(r.claimedAt||0)+DAY-Date.now())}
  function rewardTimer(ms){const t=Math.ceil(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
  function claimReward(){
    if(rewardLeft()>0)return;
    const state=window.state,user=state?.currentUser;
    if(!state||!user){window.openAuth?.('login');return}
    state.balance=(Number(state.balance)||0)+REWARD;
    user.balance=state.balance;
    try{window.saveUsers?.()}catch{}
    localStorage.setItem(rewardKey(),JSON.stringify({claimedAt:Date.now()}));
    renderReward();
    try{window.updateBalanceUI?.()}catch{}
  }
  function renderReward(){
    const left=rewardLeft();
    $$('.balance-dropdown button,#profilePage .profile-mini-btn').forEach(button=>{
      const value=(button.textContent||'').toLowerCase();
      const isProfileDeposit=/пополн/.test(value);
      const isTop=button.closest('.balance-dropdown');
      if(!isTop&&!isProfileDeposit)return;
      button.classList.add(isTop?'ed-reward-top':'ed-profile-reward');
      button.dataset.edReward='1';
      button.disabled=left>0;
      button.textContent=left>0?`Получено · ${rewardTimer(left)}`:`Получить ${REWARD}₽`;
      button.onclick=event=>{event.preventDefault();event.stopImmediatePropagation();claimReward()};
    });
  }

  function openOverlay(id){
    const node=document.getElementById(id);if(!node)return false;
    node.hidden=false;node.style.display='flex';node.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
    return true;
  }
  function closeOverlay(id){
    const node=document.getElementById(id);if(!node)return;
    node.hidden=true;node.style.display='none';node.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
  }
  // These are the real IDs in index.html: settingsPage and statsPage.
  window.openSettings=()=>openOverlay('settingsPage');
  window.closeSettings=()=>closeOverlay('settingsPage');
  window.openStats=()=>openOverlay('statsPage');
  window.closeStats=()=>closeOverlay('statsPage');

  function profileLogout(){
    const page=$('#profilePage');if(!page)return;
    let button=page.querySelector('.ed-profile-logout');
    const oldDeposit=[...page.querySelectorAll('.profile-mini-btn')].find(b=>/пополн/.test((b.textContent||'').toLowerCase()));
    if(oldDeposit){oldDeposit.textContent='Получить 250₽';oldDeposit.classList.add('ed-profile-reward')}
    if(!button){
      button=document.createElement('button');button.type='button';button.className='ed-profile-logout';button.textContent='Выйти';
      const side=[...page.querySelectorAll('.profile-side')].pop()||page.querySelector('.profile-main')||page;
      side.appendChild(button);
      button.onclick=event=>{event.preventDefault();event.stopImmediatePropagation();window.logout?.();window.EmojiDropsRouter?.navigate('/')};
    }
    button.style.display='inline-flex';button.style.alignItems='center';button.style.justifyContent='center';
  }

  function patchBest(){
    if(typeof window.showWin==='function'&&!window.showWin.__edBestPatch){
      const original=window.showWin;
      const wrapped=function(item){
        if(item)saveBest(item);
        return original.apply(this,arguments);
      };
      wrapped.__edBestPatch=true;window.showWin=wrapped;
    }
  }
  function saveBest(item){
    if(!item)return;
    const rank={common:1,rare:2,epic:3,mythical:4,legendary:5};
    let current=null;try{current=JSON.parse(localStorage.getItem(bestKey())||'null')}catch{}
    if(current&&(rank[current.rarity]||0)>(rank[item.rarity]||0))return;
    if(current&&(rank[current.rarity]||0)===(rank[item.rarity]||0)&&money(current.price)>=money(item.price))return;
    try{localStorage.setItem(bestKey(),JSON.stringify({emoji:item.emoji,rarity:item.rarity,price:item.price,updatedAt:Date.now()}))}catch{}
    renderBest();
  }
  function renderBest(){
    let best=null;try{best=JSON.parse(localStorage.getItem(bestKey())||'null')}catch{}
    if(!best)return;
    const color=RARITY[best.rarity]||ACCENT;
    $$('.best-drop-emoji,#bestDropEmoji').forEach(n=>{n.textContent=best.emoji||'🏆';n.style.setProperty('--best-rarity',color)});
    $$('.best-drop-rarity,#bestDropRarity').forEach(n=>{n.textContent=String(best.rarity||'DROP').toUpperCase();n.style.color=color});
  }

  function patchSemanticClicks(){
    document.addEventListener('click',event=>{
      const target=event.target instanceof Element?event.target:null;
      const button=target?.closest('button,a,[role="button"]');
      if(!button)return;
      const label=`${button.textContent||''} ${button.getAttribute('aria-label')||''} ${button.getAttribute('title')||''}`.toLowerCase();
      if(label.includes('настрой')){event.preventDefault();event.stopImmediatePropagation();window.openSettings();return}
      if(label.includes('статист')){event.preventDefault();event.stopImmediatePropagation();window.openStats();return}
      if(label.trim()==='апгрейд'||label.includes('upgrade')){event.preventDefault();event.stopImmediatePropagation();window.openUpgradeMenu?.();return}
    },true);
  }

  function fixModalClose(){
    ['settingsPage','statsPage'].forEach(id=>{
      const node=$(`#${id}`);if(!node||node.dataset.edClose==='1')return;
      node.dataset.edClose='1';
      node.addEventListener('click',event=>{if(event.target===node)closeOverlay(id)});
    });
    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape')return;
      ['settingsPage','statsPage'].forEach(id=>{const n=$(`#${id}`);if(n&&!n.hidden)closeOverlay(id)});
    });
  }

  function tick(){
    installStyles();hideSearch();syncCasePrices();moveLiveDrops();installLiveObserver();renderReward();profileLogout();renderBest();patchBest();fixModalClose();
    if(window.state?.currentUser){try{window.updateStatsUI?.()}catch{}}
  }

  function install(){
    tick();
    patchSemanticClicks();
    let last=0;
    new MutationObserver(()=>{const now=Date.now();if(now-last<150)return;last=now;tick()}).observe(document.body,{childList:true,subtree:true});
    setInterval(()=>{renderReward();renderBest();moveLiveDrops();profileLogout()},1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
