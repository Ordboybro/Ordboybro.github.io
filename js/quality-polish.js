(() => {
  'use strict';

  // Visual/motion layer only. It must never own navigation, case opening,
  // Upgrade mechanics, economy, inventory or routing.
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  function animateIn(element, options = {}) {
    if (!(element instanceof HTMLElement) || reduced()) return;
    const animation = element.animate([
      { opacity: 0, transform: options.from || 'translate3d(0,10px,0) scale(.985)' },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
    ], {
      duration: options.duration ?? 260,
      easing: options.easing || 'cubic-bezier(.16,1,.3,1)',
      fill: 'both'
    });
    animation.addEventListener?.('finish', () => animation.cancel(), { once: true });
  }

  function decorateWinPopup() {
    if (window.__emojiDropsWinMotion) return;
    const original = window.showWin;
    if (typeof original !== 'function') return;
    const wrapped = function showWinWithMotion(...args) {
      const result = original.apply(this, args);
      const popup = document.getElementById('winPopup');
      if (popup && !reduced()) {
        animateIn(popup, { duration: 320, from: 'translate3d(0,14px,0) scale(.94)' });
        document.getElementById('winEmoji')?.animate([
          { transform: 'scale(.72) rotate(-5deg)', opacity: .2 },
          { transform: 'scale(1.12) rotate(2deg)', opacity: 1, offset: .68 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 }
        ], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
      return result;
    };
    Object.defineProperty(wrapped, '__emojiDropsWinMotion', { value: true });
    window.showWin = wrapped;
    window.__emojiDropsWinMotion = true;
  }

  function addButtonMotion() {
    if (document.documentElement.dataset.buttonMotionReady === '1') return;
    document.documentElement.dataset.buttonMotionReady = '1';
    document.addEventListener('pointerdown', event => {
      const button = event.target instanceof Element ? event.target.closest('button,.top-btn,.amount-btn') : null;
      if (button instanceof HTMLElement && !reduced()) button.style.willChange = 'transform';
    }, { passive: true });
    const release = event => {
      const button = event.target instanceof Element ? event.target.closest('button,.top-btn,.amount-btn') : null;
      if (button instanceof HTMLElement) button.style.willChange = 'auto';
    };
    document.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('pointercancel', release, { passive: true });
  }

  function pauseWhenHidden() {
    document.addEventListener('visibilitychange', () => {
      document.documentElement.classList.toggle('ed-page-hidden', document.hidden);
    }, { passive: true });
  }

  const text = node => String(node?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const all = selector => [...document.querySelectorAll(selector)];
  const getState = () => window.state || null;
  const DAY = 86400000;
  const REWARD = 250;

  function removeSearch() {
    all('input[type="search"],input[placeholder*="поиск" i],input[aria-label*="поиск" i],.search-wrap,.search-container,#caseSearch,.case-search').forEach(node => {
      const wrapper = node.matches('input') ? node.closest('.search-wrap,.search-container,.case-search,form') : node;
      if (wrapper) { wrapper.hidden = true; wrapper.classList.add('ed-search-removed'); }
      else { node.hidden = true; node.classList.add('ed-search-removed'); }
    });
  }

  function caseVisuals() {
    all('.case,.case-card,.case-item').forEach(card => {
      card.classList.add('ed-case-card');
      const price = card.querySelector('.case-price,.case-cost,.price,[data-price]');
      if (price) price.classList.add('ed-case-price');
    });
  }

  function setupLiveDrops() {
    const root = document.querySelector('#liveContainer,#liveDrops,#liveDropsContainer,.live-container,.live-drops,.live-drops-container');
    if (!root || root.dataset.edLiveRecovery === '1') return;
    root.dataset.edLiveRecovery = '1';
    root.classList.add('ed-live-root');
    const rarityColors = { common:'#8b949e',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ff9f43' };
    const decorate = node => {
      if (!(node instanceof Element) || node.matches('.live-title,.live-drops-title,#liveDropsTitle')) return;
      let rarity = node.dataset.rarity || node.getAttribute('data-rarity') || '';
      if (!rarity) {
        const cls = [...node.classList].join(' ');
        rarity = cls.match(/common|rare|epic|mythical|legendary/i)?.[0] || 'common';
      }
      rarity = String(rarity).toLowerCase();
      if (!rarityColors[rarity]) rarity = 'common';
      node.classList.add('ed-live-drop','ed-live-' + rarity);
      node.style.setProperty('--rarity-color', rarityColors[rarity]);
      requestAnimationFrame(() => node.classList.add('is-visible'));
    };
    [...root.children].forEach(decorate);
    new MutationObserver(records => {
      const nodes = [];
      records.forEach(record => record.addedNodes.forEach(node => node.nodeType === 1 && nodes.push(node)));
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node.parentNode === root && !node.matches('.live-title,.live-drops-title,#liveDropsTitle')) root.prepend(node);
        decorate(node);
      }
      [...root.children].filter(node => node.classList.contains('ed-live-drop')).slice(10).forEach(node => node.remove());
    }).observe(root, { childList:true });
  }

  function rewardButtons() {
    const buttons = all('button,a').filter(node => /пополнить|депозит|deposit/i.test(text(node)) || node.matches('.balance-dropdown button,.daily-reward-btn'));
    buttons.forEach(button => {
      if (button.dataset.edReward === '1') return;
      button.dataset.edReward = '1';
      button.classList.add('daily-reward-btn');
      const render = () => {
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('emoji_drops_daily_reward_v1') || '{}'); } catch (_) {}
        const left = Math.max(0, Number(saved.claimedAt || 0) + DAY - Date.now());
        if (left > 0) {
          button.textContent = `Получено • ${Math.floor(left/3600000)}ч ${String(Math.floor((left%3600000)/60000)).padStart(2,'0')}м`;
          button.disabled = true;
          button.classList.add('is-cooldown');
        } else {
          button.textContent = `Получить ${REWARD}₽`;
          button.disabled = false;
          button.classList.remove('is-cooldown');
        }
      };
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopImmediatePropagation();
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem('emoji_drops_daily_reward_v1') || '{}'); } catch (_) {}
        if (Number(saved.claimedAt || 0) + DAY > Date.now()) return;
        const appState = getState();
        if (!appState?.currentUser) return window.openAuth?.('login');
        appState.balance = Number(appState.balance || 0) + REWARD;
        appState.currentUser.balance = appState.balance;
        try { localStorage.setItem('emoji_drops_daily_reward_v1', JSON.stringify({ claimedAt:Date.now(), amount:REWARD })); } catch (_) {}
        window.saveUsers?.(); window.updateBalanceUI?.(); render();
      }, true);
      render();
    });
  }

  function routeButtons() {
    all('button,a,[role="button"]').forEach(node => {
      if (node.dataset.route) return;
      const value = text(node);
      if (/настройки/.test(value)) node.dataset.route = '/profile/settings';
      else if (/статистика/.test(value)) node.dataset.route = '/profile/statistics';
      else if (/апгрейд|upgrade|улучш/.test(value)) node.dataset.route = '/upgrade';
    });
  }

  function logoutButton() {
    const profile = document.querySelector('#profilePage');
    if (!profile || profile.querySelector('.ed-profile-logout')) return;
    const actions = profile.querySelector('.profile-actions') || profile;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'ed-profile-logout'; button.textContent = 'Выйти';
    button.addEventListener('click', event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const appState = getState();
      if (appState) { appState.currentUser = null; appState.currentCase = []; appState.selectedCase = null; }
      try { localStorage.removeItem('currentUser'); } catch (_) {}
      window.EmojiDropsRouter?.navigate('/');
    }, true);
    actions.appendChild(button);
  }

  function bestDrop() {
    const appState = getState();
    if (!appState?.currentUser || !Array.isArray(appState.winQueue) || !appState.winQueue.length) return;
    const rank = { common:1,rare:2,epic:3,mythical:4,legendary:5 };
    const best = appState.winQueue.slice().sort((a,b) => (rank[b?.rarity]||0)-(rank[a?.rarity]||0) || Number(b?.price||0)-Number(a?.price||0))[0];
    if (!best) return;
    const key = 'emoji_drops_best_drop_v1:' + String(appState.currentUser.email || appState.currentUser.nickname || 'guest');
    try { localStorage.setItem(key, JSON.stringify(best)); } catch (_) {}
  }

  function restoreBestDrop() {
    const appState = getState();
    if (!appState?.currentUser) return;
    const key = 'emoji_drops_best_drop_v1:' + String(appState.currentUser.email || appState.currentUser.nickname || 'guest');
    let best = null; try { best = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
    if (!best) return;
    const emoji = document.getElementById('bestDropEmoji');
    const rarity = document.getElementById('bestDropRarity');
    if (emoji) emoji.textContent = best.emoji || '🏆';
    if (rarity) { rarity.textContent = String(best.rarity || '').toUpperCase(); const color = window.rarities?.[best.rarity]?.color; if (color) rarity.style.color = color; }
  }

  function wrapWinQueue() {
    if (typeof window.showNextWin !== 'function' || window.showNextWin.__edBestDrop) return;
    const original = window.showNextWin;
    const wrapped = function(...args) { bestDrop(); return original.apply(this,args); };
    wrapped.__edBestDrop = true;
    window.showNextWin = wrapped;
  }

  function lockModalScroll() {
    const selectors = ['#settingsOverlay','#statsOverlay','#historyOverlay','#edUpgrade2','#upgradePage'];
    const active = selectors.some(selector => { const node = document.querySelector(selector); return node && !node.hidden && getComputedStyle(node).display !== 'none'; });
    document.documentElement.classList.toggle('ed-modal-active', active);
    document.body.classList.toggle('ed-modal-active', active);
  }

  function init() {
    removeSearch(); caseVisuals(); setupLiveDrops(); rewardButtons(); routeButtons(); logoutButton(); wrapWinQueue(); restoreBestDrop(); lockModalScroll();
  }

  function initObservers() {
    if (document.documentElement.dataset.edFinalRecovery === '1') return;
    document.documentElement.dataset.edFinalRecovery = '1';
    new MutationObserver(() => init()).observe(document.body, { childList:true, subtree:true });
  }

  function start() { init(); initObservers(); decorateWinPopup(); addButtonMotion(); pauseWhenHidden(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})();