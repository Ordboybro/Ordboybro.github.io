(() => {
  'use strict';

  const DAY = 86400000;
  const REWARD = 250;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const text = node => String(node?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const all = selector => [...document.querySelectorAll(selector)];
  const state = () => window.state || null;
  const userKey = () => {
    const current = state()?.currentUser;
    return String(current?.email || current?.nickname || 'guest').trim().toLowerCase() || 'guest';
  };

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
    if (window.__emojiDropsWinMotion || typeof window.showWin !== 'function') return;
    const original = window.showWin;
    const wrapped = function (...args) {
      const result = original.apply(this, args);
      const popup = document.getElementById('winPopup');
      if (popup) animateIn(popup, { duration: 320, from: 'translate3d(0,14px,0) scale(.94)' });
      return result;
    };
    wrapped.__emojiDropsWinMotion = true;
    window.showWin = wrapped;
    window.__emojiDropsWinMotion = true;
  }

  function buttonMotion() {
    if (document.documentElement.dataset.buttonMotionReady === '1') return;
    document.documentElement.dataset.buttonMotionReady = '1';
    const press = event => {
      const button = event.target instanceof Element ? event.target.closest('button,.top-btn,.amount-btn') : null;
      if (button instanceof HTMLElement && !reduced()) button.style.willChange = 'transform';
    };
    const release = event => {
      const button = event.target instanceof Element ? event.target.closest('button,.top-btn,.amount-btn') : null;
      if (button instanceof HTMLElement) button.style.willChange = 'auto';
    };
    document.addEventListener('pointerdown', press, { passive: true });
    document.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('pointercancel', release, { passive: true });
  }

  function removeSearch() {
    all('input[type="search"],input[placeholder*="поиск" i],input[aria-label*="поиск" i],.search-wrap,.search-container,#caseSearch,.case-search').forEach(node => {
      const wrapper = node.matches('input') ? node.closest('.search-wrap,.search-container,.case-search,form') : node;
      (wrapper || node).hidden = true;
      (wrapper || node).classList.add('ed-search-removed');
    });
  }

  function caseVisuals() {
    all('.case,.case-card,.case-item').forEach(card => {
      card.classList.add('ed-case-card');
      const price = card.querySelector('.case-price,.case-cost,.price,[data-price]');
      price?.classList.add('ed-case-price');
    });
  }

  function applyRarityPalette() {
    const legendary = window.rarities?.legendary;
    if (legendary) legendary.color = '#ff9f43';
  }

  function liveDrops() {
    const root = document.querySelector('#liveContainer,#liveDrops,#liveDropsContainer,.live-container,.live-drops,.live-drops-container');
    if (!root || root.dataset.edLiveController === '1') return;
    root.dataset.edLiveController = '1';
    root.classList.add('ed-live-root');

    const colors = Object.freeze({
      common: '#8b949e',
      rare: '#3b82f6',
      epic: '#a855f7',
      mythical: '#ef4444',
      legendary: '#ff9f43'
    });

    const decorate = node => {
      if (!(node instanceof Element)) return;
      if (node.matches('.live-title,.live-drops-title,#liveDropsTitle')) return;
      let rarity = node.dataset.rarity || node.getAttribute('data-rarity') || [...node.classList].join(' ').match(/common|rare|epic|mythical|legendary/i)?.[0] || 'common';
      rarity = String(rarity).toLowerCase();
      if (!colors[rarity]) rarity = 'common';
      node.classList.add('ed-live-drop', `ed-live-${rarity}`);
      node.style.setProperty('--rarity-color', colors[rarity]);
      if (!reduced()) requestAnimationFrame(() => node.classList.add('is-visible'));
      else node.classList.add('is-visible');
    };

    [...root.children].forEach(decorate);

    const observer = new MutationObserver(records => {
      const added = [];
      for (const record of records) {
        for (const node of record.addedNodes) if (node.nodeType === 1) added.push(node);
      }
      for (let i = added.length - 1; i >= 0; i--) {
        const node = added[i];
        if (node.parentNode === root && !node.matches('.live-title,.live-drops-title,#liveDropsTitle')) root.prepend(node);
        decorate(node);
      }
      const drops = [...root.children].filter(node => node.classList.contains('ed-live-drop'));
      drops.slice(10).forEach(node => node.remove());
    });
    observer.observe(root, { childList: true });
  }

  function rewardState() {
    try {
      return JSON.parse(localStorage.getItem(`emoji_drops_daily_reward_v2:${userKey()}`) || 'null') || {};
    } catch (_) { return {}; }
  }

  function saveReward(claimedAt) {
    try {
      localStorage.setItem(`emoji_drops_daily_reward_v2:${userKey()}`, JSON.stringify({ claimedAt, amount: REWARD }));
    } catch (_) {}
  }

  function formatCooldown(left) {
    const hours = Math.floor(left / 3600000);
    const minutes = Math.floor((left % 3600000) / 60000);
    return `${hours}ч ${String(minutes).padStart(2, '0')}м`;
  }

  function renderRewardButtons() {
    const saved = rewardState();
    const left = Math.max(0, Number(saved.claimedAt || 0) + DAY - Date.now());
    all('.daily-reward-btn,.balance-dropdown button').forEach(button => {
      if (!(button instanceof HTMLButtonElement)) return;
      if (left) {
        button.textContent = `Получено • ${formatCooldown(left)}`;
        button.disabled = true;
        button.classList.add('is-cooldown');
      } else {
        button.textContent = `Получить ${REWARD}₽`;
        button.disabled = false;
        button.classList.remove('is-cooldown');
      }
    });
  }

  function claimReward(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const saved = rewardState();
    if (Number(saved.claimedAt || 0) + DAY > Date.now()) return;
    const appState = state();
    if (!appState?.currentUser) return window.openAuth?.('login');
    appState.balance = Number(appState.balance || 0) + REWARD;
    appState.currentUser.balance = appState.balance;
    saveReward(Date.now());
    window.saveUsers?.();
    window.updateBalanceUI?.();
    renderRewardButtons();
  }

  function setupRewardButtons() {
    all('button,a').forEach(button => {
      const value = text(button);
      if (!/пополнить|депозит|deposit|получить\s*\d*\s*₽/i.test(value) && !button.matches('.balance-dropdown button,.daily-reward-btn')) return;
      if (button.dataset.edRewardBound === '1') return;
      button.dataset.edRewardBound = '1';
      button.classList.add('daily-reward-btn');
      button.addEventListener('click', claimReward, true);
    });
    renderRewardButtons();
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
    if (!profile) return;
    const oldBalanceActions = profile.querySelectorAll('.balance-menu,.profile-balance,.profile-balance-card,.withdraw-hover');
    oldBalanceActions.forEach(node => { node.hidden = true; node.setAttribute('aria-hidden', 'true'); });
    if (profile.querySelector('.ed-profile-logout')) return;
    const actions = profile.querySelector('.profile-actions') || profile;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ed-profile-logout';
    button.textContent = 'Выйти';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const appState = state();
      if (appState) {
        appState.currentUser = null;
        appState.currentCase = [];
        appState.selectedCase = null;
      }
      try { localStorage.removeItem('currentUser'); } catch (_) {}
      window.EmojiDropsRouter?.navigate('/') || location.assign('/');
    }, true);
    actions.appendChild(button);
  }

  const rank = Object.freeze({ common: 1, rare: 2, epic: 3, mythical: 4, legendary: 5 });
  const bestKey = () => `emoji_drops_best_drop_v2:${userKey()}`;

  function bestDropCandidate() {
    const appState = state();
    const queue = Array.isArray(appState?.winQueue) ? appState.winQueue : [];
    return queue.reduce((best, item) => {
      if (!item) return best;
      if (!best) return item;
      const a = rank[item.rarity] || 0, b = rank[best.rarity] || 0;
      return a > b || (a === b && Number(item.price || 0) > Number(best.price || 0)) ? item : best;
    }, null);
  }

  function readBestDrop() {
    try { return JSON.parse(localStorage.getItem(bestKey()) || 'null'); } catch (_) { return null; }
  }

  function betterDrop(candidate, current) {
    if (!candidate) return current;
    if (!current) return candidate;
    const a = rank[candidate.rarity] || 0, b = rank[current.rarity] || 0;
    return a > b || (a === b && Number(candidate.price || 0) > Number(current.price || 0)) ? candidate : current;
  }

  function persistBestDrop() {
    const candidate = bestDropCandidate();
    const best = betterDrop(candidate, readBestDrop());
    if (!best) return;
    try { localStorage.setItem(bestKey(), JSON.stringify(best)); } catch (_) {}
  }

  function restoreBestDrop() {
    const best = readBestDrop();
    if (!best) return;
    const emoji = document.getElementById('bestDropEmoji');
    const rarity = document.getElementById('bestDropRarity');
    if (emoji) emoji.textContent = best.emoji || '🏆';
    if (rarity) {
      rarity.textContent = String(best.rarity || '').toUpperCase();
      const color = window.rarities?.[best.rarity]?.color;
      if (color) rarity.style.color = color;
    }
  }

  function wrapWinQueue() {
    if (typeof window.showNextWin !== 'function' || window.showNextWin.__edBestDrop) return;
    const original = window.showNextWin;
    const wrapped = function (...args) {
      persistBestDrop();
      return original.apply(this, args);
    };
    wrapped.__edBestDrop = true;
    window.showNextWin = wrapped;
  }

  function lockModalScroll() {
    const selectors = ['#settingsOverlay','#statsOverlay','#historyOverlay','#edUpgrade2','#upgradePage'];
    const active = selectors.some(selector => {
      const node = document.querySelector(selector);
      return node && !node.hidden && getComputedStyle(node).display !== 'none';
    });
    document.documentElement.classList.toggle('ed-modal-active', active);
    document.body.classList.toggle('ed-modal-active', active);
  }

  let raf = 0;
  function refresh() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      removeSearch();
      applyRarityPalette();
      caseVisuals();
      liveDrops();
      setupRewardButtons();
      routeButtons();
      logoutButton();
      wrapWinQueue();
      restoreBestDrop();
      lockModalScroll();
    });
  }

  function start() {
    refresh();
    buttonMotion();
    decorateWinPopup();
    document.addEventListener('click', refresh, { passive: true });
    window.addEventListener('popstate', refresh, { passive: true });
    document.addEventListener('visibilitychange', () => {
      document.documentElement.classList.toggle('ed-page-hidden', document.hidden);
    }, { passive: true });
    setInterval(renderRewardButtons, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();