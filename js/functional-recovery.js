(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const text = node => (node?.textContent || '').trim().toLocaleLowerCase('ru-RU');

  const syncUpgradeBridge = () => {
    if (typeof window.openUpgrade === 'function') window.openUpgradeMenu = (...args) => window.openUpgrade(...args);
    if (typeof window.closeUpgrade === 'function') window.closeUpgradeMenu = (...args) => window.closeUpgrade(...args);
    if (typeof window.openUpgrade === 'function') window.startUpgrade = (...args) => window.openUpgrade(...args);
  };
  syncUpgradeBridge();

  const removeSearch = () => {
    document.querySelectorAll('.search-wrap,.search-container,#caseSearch,.case-search').forEach(node => { node.hidden = true; });
    const input = $('searchInput');
    if (input) input.closest('.search-wrap,.search-container,form')?.setAttribute('hidden', '');
  };
  window.searchCases = () => removeSearch();

  const REWARD = 250;
  const REWARD_KEY = 'emojiDrops.dailyReward.v1';
  const readReward = () => { try { return JSON.parse(localStorage.getItem(REWARD_KEY) || '{}'); } catch { return {}; } };
  const saveReward = value => localStorage.setItem(REWARD_KEY, JSON.stringify(value));
  const rewardState = () => { const saved = readReward(); return { nextAt: Number(saved.nextAt) || 0 }; };
  const rewardAvailable = () => Date.now() >= rewardState().nextAt;
  const formatTimer = ms => { const total=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; };
  const claimReward = () => {
    if (!rewardAvailable()) return false;
    const state = window.state, user = state?.currentUser;
    if (!state || !user) { window.openAuth?.('login'); return false; }
    state.balance = (Number(state.balance) || 0) + REWARD;
    user.balance = state.balance;
    saveReward({ nextAt: Date.now() + 86400000 });
    try { window.saveUsers?.(); } catch (_) {}
    try { window.updateBalanceUI?.(); } catch (_) {}
    updateRewardButtons();
    return true;
  };
  const updateRewardButtons = () => {
    const available=rewardAvailable(), nextAt=rewardState().nextAt;
    document.querySelectorAll('.balance-dropdown button,[data-daily-reward],.daily-reward-btn').forEach(button => {
      button.textContent=available?`Получить ${REWARD}₽`:`Получено · ${formatTimer(nextAt-Date.now())}`; button.disabled=!available; button.classList.toggle('is-cooldown',!available); button.dataset.dailyReward='1';
    });
    document.querySelectorAll('#profilePage button').forEach(button => {
      if (text(button)==='пополнить' || button.dataset.action==='deposit') { button.textContent=available?`Получить ${REWARD}₽`:`Получено · ${formatTimer(nextAt-Date.now())}`; button.disabled=!available; button.dataset.dailyReward='1'; }
    });
  };

  const rarityColors=Object.freeze({common:'#8b949e',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ff9f43'});
  const liveContainer=()=> $('liveContainer')||$('liveDrops')||$('liveDropsContainer')||document.querySelector('.live-drops-container,.live-drops');
  const addLiveDrop=(nickname,item)=>{
    const container=liveContainer(); if(!container||!item)return;
    const rarity=String(item.rarity||'common').toLowerCase(),node=document.createElement('div');
    node.className=`ed-live-drop ed-live-${rarity}`; node.style.setProperty('--rarity-color',rarityColors[rarity]||rarityColors.common);
    node.innerHTML=`<span class="ed-live-emoji">${item.emoji||'❔'}</span><span class="ed-live-info"><b>${nickname||'Игрок'}</b><small>${rarity}</small></span>`;
    container.prepend(node); while(container.children.length>7)container.lastElementChild?.remove(); requestAnimationFrame(()=>node.classList.add('is-visible'));
  };
  window.addLiveDrop=addLiveDrop;

  const BEST_KEY='emojiDrops.bestDrop.v1';
  const readBest=()=>{try{return JSON.parse(localStorage.getItem(BEST_KEY)||'null')}catch{return null}};
  const saveBest=item=>{
    if(!item)return; const value=Number.parseFloat(String(item.price??0).replace(',','.'))||0,current=readBest(),currentValue=Number.parseFloat(String(current?.price??0).replace(',','.'))||0;
    if(value<=currentValue)return; localStorage.setItem(BEST_KEY,JSON.stringify({emoji:item.emoji,rarity:item.rarity,price:item.price,updatedAt:Date.now()})); try{window.updateBestDrop?.()}catch(_){ }
  };
  window.saveBestDrop=saveBest;
  const bridgeBestDrop=()=>{
    const original=window.showNextWin; if(typeof original!=='function'||original.__edBestDropBridge)return;
    const wrapped=function(...args){const wins=Array.isArray(window.state?.winQueue)?window.state.winQueue:[];wins.forEach(saveBest);return original.apply(this,args)}; wrapped.__edBestDropBridge=true; window.showNextWin=wrapped;
  };
  const bridgeBestDropUi=()=>{
    const original=window.updateBestDrop; if(typeof original!=='function'||original.__edBestUiBridge)return;
    const wrapped=function(...args){const result=original.apply(this,args),best=readBest();if(best){const emoji=$('bestDropEmoji'),rarity=$('bestDropRarity');if(emoji)emoji.textContent=best.emoji||'🏆';if(rarity){rarity.textContent=String(best.rarity||'DROP').toUpperCase();rarity.style.color=rarityColors[best.rarity]||'#ff7b00'}}return result};
    wrapped.__edBestUiBridge=true; window.updateBestDrop=wrapped;
  };
  const syncBestDrop=()=>{const best=readBest();if(!best)return;document.querySelectorAll('#bestDrop,.best-drop,.best-drop-card').forEach(node=>{const emoji=node.querySelector('.best-drop-emoji,.drop-emoji'),price=node.querySelector('.best-drop-price,.drop-price');if(emoji)emoji.textContent=best.emoji||'❔';if(price)price.textContent=`${best.price||0}₽`})};

  const ensureProfileLogout=()=>{
    const page=$('profilePage'); if(!page||page.querySelector('.ed-profile-logout'))return;
    const host=page.querySelector('.profile-header,.profile-content')||page,button=document.createElement('button');
    button.type='button';button.className='ed-profile-logout ed-primary-action';button.textContent='Выйти';button.setAttribute('aria-label','Выйти из профиля');
    button.addEventListener('click',event=>{event.preventDefault();const state=window.state;if(state)state.currentUser=null;try{window.saveUsers?.()}catch(_){ }window.EmojiDropsRouter?.navigate('/')}); host.appendChild(button);
  };

  const markPrimaryButtons=()=>document.querySelectorAll('button').forEach(button=>{const value=text(button);if(value.includes('апгрейд')||value.includes('статистика')||value.includes('настройки')||value.includes('пополнить')||value.includes('выйти'))button.classList.add('ed-primary-action')});
  const routeSemanticButtons=event=>{
    const button=event.target instanceof Element?event.target.closest('button,a,[role="button"]'):null;if(!button)return;const value=text(button);
    if(button.dataset.dailyReward==='1'||value.startsWith('получить ')||value.startsWith('получено ·')){event.preventDefault();event.stopImmediatePropagation();claimReward();return}
    if(value.includes('настройки')){event.preventDefault();event.stopImmediatePropagation();window.EmojiDropsRouter?.navigate('/profile/settings');return}
    if(value.includes('статистика')){event.preventDefault();event.stopImmediatePropagation();window.EmojiDropsRouter?.navigate('/profile/statistics');return}
    if(value==='апгрейд'||value.includes('upgrade')){event.preventDefault();event.stopImmediatePropagation();window.EmojiDropsRouter?.navigate('/upgrade');return}
  };
  const ensureViewVisibility=()=>[$('settingsOverlay'),$('statsOverlay'),$('edUpgrade2'),$('upgradePage')].filter(Boolean).forEach(view=>{if(view.classList.contains('open')){view.hidden=false;view.style.display='flex'}});

  const install=()=>{
    removeSearch();ensureProfileLogout();markPrimaryButtons();bridgeBestDrop();bridgeBestDropUi();updateRewardButtons();syncBestDrop();ensureViewVisibility();
    document.addEventListener('click',routeSemanticButtons,true); document.querySelectorAll('.balance-dropdown button').forEach(button=>button.dataset.dailyReward='1');
    setInterval(()=>{updateRewardButtons();syncBestDrop();bridgeBestDrop();bridgeBestDropUi();ensureProfileLogout()},1000);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();