(() => {
  'use strict';

  const DAY = 86400000;
  const REWARD = 250;
  const RARITY = Object.freeze({
    common: '#8b949e',
    rare: '#3b82f6',
    epic: '#a855f7',
    mythical: '#ef4444',
    legendary: '#ff9f43'
  });
  const text = node => String(node?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const all = selector => [...document.querySelectorAll(selector)];
  const userKey = () => {
    const user = window.state?.currentUser;
    return String(user?.email || user?.nickname || 'guest').trim().toLowerCase() || 'guest';
  };
  const rewardKey = () => `emoji_drops_daily_reward_v2:${userKey()}`;
  const bestKey = () => `emoji_drops_best_drop_v2:${userKey()}`;
  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  function styleRuntime() {
    if (document.getElementById('emojiDropsFinalRuntimeStyles')) return;
    const style = document.createElement('style');
    style.id = 'emojiDropsFinalRuntimeStyles';
    style.textContent = `
      :root{--ed-accent:#ff7b00;--ed-accent-soft:rgba(255,123,0,.18)}
      .ed-primary-action,.ed-profile-logout{min-height:44px!important;padding:11px 18px!important;border:1px solid var(--ed-accent)!important;border-radius:12px!important;background:linear-gradient(135deg,rgba(255,123,0,.13),rgba(255,61,0,.08))!important;color:#fff!important;font-weight:800!important;box-shadow:0 0 0 1px rgba(255,123,0,.04),0 8px 24px rgba(255,123,0,.08)!important;transition:transform .18s ease,box-shadow .18s ease,background .18s ease!important}
      .ed-primary-action:hover,.ed-profile-logout:hover{transform:translateY(-2px)!important;box-shadow:0 0 0 1px rgba(255,123,0,.12),0 10px 30px rgba(255,123,0,.16)!important}
      .ed-primary-action:active,.ed-profile-logout:active{transform:translateY(0) scale(.98)!important}
      .case:hover,.case-card:hover,.case-item:hover{border-color:var(--ed-accent)!important;box-shadow:0 0 0 1px rgba(255,123,0,.16),0 12px 32px rgba(255,123,0,.1)!important}
      .ed-case-price{border-color:var(--ed-accent)!important;color:#fff!important}
      .ed-live-root{display:flex!important;align-items:center!important;gap:9px!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important}
      .ed-live-root::-webkit-scrollbar{display:none!important}
      .ed-live-drop{flex:0 0 138px!important;min-width:138px!important;border:1px solid var(--rarity-color)!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--rarity-color) 20%,transparent),0 8px 22px rgba(0,0,0,.18)!important;transition:transform .25s ease,opacity .28s ease,border-color .2s ease!important}
      .ed-live-drop.is-visible{opacity:1!important;transform:translateX(0)!important}
      .ed-live-drop:not(.is-visible){opacity:0!important;transform:translateX(-18px)!important}
      .ed-live-legendary{background:linear-gradient(135deg,#17151b 0%,#211a14 55%,#15161b 100%)!important;border-color:#ff9f43!important;box-shadow:0 0 18px rgba(255,159,67,.18),inset 0 0 22px rgba(255,159,67,.05)!important}
      .ed-live-legendary::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 38%,rgba(255,180,100,.18) 50%,transparent 62%);transform:translateX(-120%);animation:edLegendaryShine 2.4s ease-in-out infinite;pointer-events:none}
      @keyframes edLegendaryShine{0%,20%{transform:translateX(-120%)}65%,100%{transform:translateX(120%)}}
      .live-drops-bar.ed-moved-live{margin:24px auto 34px!important;width:min(1180px,calc(100% - 32px))!important}
      .live-drops-bar.ed-moved-live .live-title,.live-drops-bar.ed-moved-live .live-drops-title,#liveDropsTitle{font-size:18px!important;line-height:1.2!important}
      .live-drops-bar.ed-moved-live .live-container{max-height:74px!important;min-height:64px!important}
      .profile-page{overflow-y:auto!important;overflow-x:hidden!important}
      .profile-page .profile-content,.profile-page .inventory-grid{overflow:visible!important;max-height:none!important}
      #settingsOverlay,#statsOverlay,#historyOverlay{overflow:hidden!important}
      #settingsOverlay>div,#statsOverlay>div,#historyOverlay>div{max-height:calc(100vh - 32px);overflow-y:auto;overscroll-behavior:contain}
      #settingsOverlay .settings-content,#statsOverlay .stats-content,#historyOverlay .history-content{overflow-y:auto;max-height:calc(100vh - 120px);overscroll-behavior:contain}
      #profilePage .profile-balance,#profilePage .profile-balance-card,#profilePage [data-profile-balance],#profilePage .balance-menu{display:none!important}
      #profilePage .ed-profile-logout{display:inline-flex!important;align-items:center;justify-content:center}
      .ed-search-removed{display:none!important}
      @media(max-width:700px){.ed-primary-action,.ed-profile-logout{min-height:42px!important;padding:10px 14px!important}.ed-live-drop{flex-basis:118px!important;min-width:118px!important}.live-drops-bar.ed-moved-live{width:calc(100% - 24px)!important}}
      @media(prefers-reduced-motion:reduce){.ed-live-legendary::after{animation:none!important}.ed-primary-action,.ed-profile-logout,.ed-live-drop{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function removeSearch() {
    all('.search-wrap,.search-container,.case-search,#caseSearch').forEach(node => {
      node.hidden = true;
      node.classList.add('ed-search-removed');
      node.setAttribute('aria-hidden','true');
    });
    all('#searchInput,input[type="search"],input[placeholder*="поиск" i]').forEach(input => {
      const node = input.closest('.search-wrap,.search-container,.case-search,form') || input;
      node.hidden = true;
      node.classList.add('ed-search-removed');
      node.setAttribute('aria-hidden','true');
    });
  }

  function moveLiveDrops() {
    const bar = document.querySelector('.live-drops-bar');
    const cases = document.querySelector('.cases,.cases-grid,.case-grid,#casesContainer');
    if (!bar || !cases || bar.dataset.edMoved === '1') return;
    cases.parentNode?.insertBefore(bar, cases.nextSibling);
    bar.dataset.edMoved = '1';
    bar.classList.add('ed-moved-live');
    const root = bar.querySelector('#liveContainer,#liveDrops,#liveDropsContainer,.live-container,.live-drops,.live-drops-container');
    if (!root || root.dataset.edFinal === '1') return;
    root.dataset.edFinal = '1';
    const decorate = node => {
      if (!(node instanceof HTMLElement)) return;
      const raw = `${node.dataset.rarity || ''} ${node.className}`.toLowerCase();
      const rarity = Object.keys(RARITY).find(key => raw.includes(key)) || 'common';
      node.classList.add('ed-live-drop',`ed-live-${rarity}`);
      node.style.setProperty('--rarity-color',RARITY[rarity]);
      if (!reduced()) requestAnimationFrame(() => node.classList.add('is-visible'));
      else node.classList.add('is-visible');
    };
    [...root.children].forEach(decorate);
    const observer = new MutationObserver(records => {
      const added=[];
      records.forEach(record => record.addedNodes.forEach(node => { if(node.nodeType===1) added.push(node); }));
      added.reverse().forEach(node => { if(node.parentNode===root) root.prepend(node); decorate(node); });
      [...root.children].filter(node => node.classList.contains('ed-live-drop')).slice(10).forEach(node => node.remove());
    });
    observer.observe(root,{childList:true});
  }

  function patchRarityVisuals() {
    const palette = window.rarities || {};
    if (palette.legendary) palette.legendary.color = RARITY.legendary;
    all('.item,.case-item-emoji,.live-drop,.inventory-emoji').forEach(node => {
      const raw = `${node.dataset?.rarity || ''} ${node.className}`.toLowerCase();
      const rarity = Object.keys(RARITY).find(key => raw.includes(key));
      if (!rarity) return;
      node.style.borderColor = RARITY[rarity];
      node.style.setProperty('--rarity-color',RARITY[rarity]);
    });
  }

  function rewardRecord() {
    try { return JSON.parse(localStorage.getItem(rewardKey()) || '{}'); } catch (_) { return {}; }
  }
  function rewardLeft() { return Math.max(0, Number(rewardRecord().claimedAt || 0) + DAY - Date.now()); }
  function rewardTimer(ms) {
    const total = Math.ceil(ms / 1000), h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function renderReward() {
    const left = rewardLeft();
    all('.balance-dropdown button,.daily-reward-btn').forEach(button => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.dataset.dailyReward = '1';
      button.classList.add('ed-primary-action');
      button.disabled = left > 0;
      button.textContent = left > 0 ? `Получено · ${rewardTimer(left)}` : `Получить ${REWARD}₽`;
    });
  }

  function ensureProfileLogout() {
    const page = document.getElementById('profilePage');
    if (!page) return;
    all('.profile-balance,.profile-balance-card,[data-profile-balance],.balance-menu',page).forEach(node => { node.hidden=true; node.setAttribute('aria-hidden','true'); });
    let button = page.querySelector('.ed-profile-logout');
    if (!button) {
      const host = page.querySelector('.profile-actions,.ed-profile-actions,.profile-content') || page;
      button = document.createElement('button');
      button.type='button'; button.className='ed-profile-logout'; button.textContent='Выйти';
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopImmediatePropagation();
        if (window.state) { window.state.currentUser=null; window.state.pendingUser=null; }
        try { localStorage.removeItem('currentUser'); } catch (_) {}
        try { window.saveUsers?.(); } catch (_) {}
        window.EmojiDropsRouter?.navigate('/') || location.assign('/');
      }, true);
      host.appendChild(button);
    }
  }

  function bestRecord() { try { return JSON.parse(localStorage.getItem(bestKey()) || 'null'); } catch (_) { return null; } }
  function saveBest(item) {
    if (!item) return;
    const rank={common:1,rare:2,epic:3,mythical:4,legendary:5};
    const current=bestRecord(), a=rank[item.rarity]||0, b=rank[current?.rarity]||0;
    if(current && (b>a || (b===a && money(current.price)>=money(item.price)))) return;
    const value={emoji:item.emoji,rarity:item.rarity,price:item.price,updatedAt:Date.now()};
    try { localStorage.setItem(bestKey(),JSON.stringify(value)); } catch (_) {}
    renderBest();
  }
  function renderBest() {
    const best=bestRecord(); if(!best) return;
    const color=RARITY[best.rarity]||'#ff7b00';
    all('#bestDropEmoji,.best-drop-emoji').forEach(n=>n.textContent=best.emoji||'🏆');
    all('#bestDropRarity,.best-drop-rarity').forEach(n=>{n.textContent=String(best.rarity||'DROP').toUpperCase();n.style.color=color;});
    all('#bestDropPrice,.best-drop-price').forEach(n=>n.textContent=`${best.price||0}`);
  }
  function patchBestDrop() {
    if (typeof window.showNextWin !== 'function' || window.showNextWin.__edFinalBest) return;
    const original=window.showNextWin;
    const wrapped=function(...args){
      (Array.isArray(window.state?.winQueue)?window.state.winQueue:[]).forEach(saveBest);
      const result=original.apply(this,args);
      const current=window.state?.lastWin;
      if(current) saveBest(current);
      renderBest();
      return result;
    };
    wrapped.__edFinalBest=true;
    window.showNextWin=wrapped;
  }

  function semanticRoutes() {
    all('button,a,[role="button"]').forEach(node => {
      const value=text(node);
      if (/настройки/.test(value)) node.dataset.route='/profile/settings';
      else if (/статистика/.test(value)) node.dataset.route='/profile/statistics';
      else if (/^апгрейд$|upgrade|улучш/.test(value)) node.dataset.route='/upgrade';
      if (/апгрейд|статист|настрой|получить|выйти|пополнить/.test(value)) node.classList.add('ed-primary-action');
    });
  }

  function modalScrollGuard() {
    ['settingsOverlay','statsOverlay','historyOverlay'].forEach(id => {
      const overlay=document.getElementById(id); if(!overlay) return;
      overlay.style.overflow='hidden';
      const candidates=[...overlay.children,...overlay.querySelectorAll('.settings-box,.settings-content,.stats-box,.stats-content,.history-box,.history-content')];
      candidates.forEach(node=>{ if(node instanceof HTMLElement){node.style.maxHeight='calc(100vh - 32px)';node.style.overflowY='auto';node.style.overscrollBehavior='contain';} });
    });
  }

  function tick() {
    styleRuntime(); removeSearch(); moveLiveDrops(); patchRarityVisuals(); renderReward(); ensureProfileLogout(); renderBest(); semanticRoutes(); modalScrollGuard(); patchBestDrop();
  }

  function install() {
    tick();
    let last=0;
    const observer=new MutationObserver(() => { const now=Date.now(); if(now-last<120)return; last=now; tick(); });
    observer.observe(document.body,{childList:true,subtree:true});
    setInterval(() => { renderReward(); renderBest(); ensureProfileLogout(); }, 1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
