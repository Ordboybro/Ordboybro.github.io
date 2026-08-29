(() => {
  'use strict';

  const STORAGE_KEY = 'emoji_drops_daily_reward_v1';
  const BEST_DROP_KEY = 'emoji_drops_best_drop_v1';
  const REWARD = 250;
  const DAY = 24 * 60 * 60 * 1000;

  const text = node => String(node?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const all = selector => [...document.querySelectorAll(selector)];
  const state = () => window.state || null;

  function hideSearch() {
    all('input[type="search"], input[placeholder*="поиск" i], input[aria-label*="поиск" i], .search-wrap, .search-container, #caseSearch, .case-search').forEach(node => {
      const wrapper = node.matches('input') ? node.closest('.search-wrap,.search-container,.case-search,form') : node;
      if (wrapper) wrapper.hidden = true;
      else node.hidden = true;
    });
  }

  function decorateCaseCards() {
    all('.case,.case-card,.case-item').forEach(card => {
      card.style.removeProperty('outline');
      card.classList.add('ed-case-card');
      const price = card.querySelector('.case-price,.case-cost,.price,[data-price]');
      if (price) price.classList.add('ed-case-price');
    });
  }

  function liveRoot() {
    return document.querySelector('#liveContainer,#liveDrops,#liveDropsContainer,.live-container,.live-drops,.live-drops-container');
  }

  const rarityClass = rarity => {
    const value = String(rarity || 'common').toLowerCase();
    return ['common','rare','epic','mythical','legendary'].includes(value) ? value : 'common';
  };

  function styleLiveNode(node) {
    if (!(node instanceof Element)) return;
    if (node.matches('.live-drops-title,.live-title,#liveDropsTitle,[data-live-title]')) return;

    let rarity = node.dataset.rarity || node.getAttribute('data-rarity');
    if (!rarity) {
      const match = [...node.classList].find(name => /^.*(common|rare|epic|mythical|legendary).*$/.test(name));
      rarity = match?.match(/common|rare|epic|mythical|legendary/)?.[0];
    }
    rarity = rarityClass(rarity);
    node.classList.add('ed-live-drop','ed-live-' + rarity);
    node.style.setProperty('--rarity-color', ({
      common:'#8b949e', rare:'#3b82f6', epic:'#a855f7', mythical:'#ef4444', legendary:'#ff9f43'
    })[rarity]);
    requestAnimationFrame(() => node.classList.add('is-visible'));
  }

  function setupLiveDrops() {
    const root = liveRoot();
    if (!root || root.dataset.edLiveRecovery === '1') return;
    root.dataset.edLiveRecovery = '1';
    root.classList.add('ed-live-root');
    all('.live-drops-title,.live-title,#liveDropsTitle').forEach(node => node.classList.add('ed-live-title'));

    [...root.children].forEach(styleLiveNode);

    const observer = new MutationObserver(records => {
      const added = [];
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) added.push(node);
        });
      }
      if (!added.length) return;
      // The runtime normally appends the newest drop. Move the new block to the left.
      for (let i = added.length - 1; i >= 0; i--) {
        const node = added[i];
        if (node.parentNode === root && !node.matches('.ed-live-title')) root.prepend(node);
        styleLiveNode(node);
      }
      const drops = [...root.children].filter(node => node.classList.contains('ed-live-drop'));
      drops.slice(10).forEach(node => node.remove());
    });
    observer.observe(root, { childList:true });
  }

  function rewardState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveReward(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
    catch (_) {}
  }

  function rewardButton(button) {
    if (!button || button.dataset.edReward === '1') return;
    button.dataset.edReward = '1';
    button.classList.add('daily-reward-btn');
    button.type = 'button';

    const render = () => {
      const saved = rewardState();
      const remaining = Math.max(0, Number(saved.claimedAt || 0) + DAY - Date.now());
      if (remaining > 0) {
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        button.textContent = `Получено • ${hours}ч ${String(minutes).padStart(2,'0')}м`;
        button.disabled = true;
        button.classList.add('is-cooldown');
      } else {
        button.textContent = `Получить ${REWARD}₽`;
        button.disabled = false;
        button.classList.remove('is-cooldown');
      }
    };

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const saved = rewardState();
      if (Number(saved.claimedAt || 0) + DAY > Date.now()) return;

      const appState = state();
      if (!appState?.currentUser) {
        window.openAuth?.('login');
        return;
      }
      appState.balance = Number(appState.balance || 0) + REWARD;
      appState.currentUser.balance = appState.balance;
      saveReward({ claimedAt: Date.now(), amount: REWARD });
      window.saveUsers?.();
      window.updateBalanceUI?.();
      render();
    }, true);

    render();
    window.setInterval(render, 30000);
  }

  function installRewardButtons() {
    all('button,a').filter(node => /пополнить|депозит|deposit/i.test(text(node))).forEach(rewardButton);
    all('.balance-dropdown button,.daily-reward-btn').forEach(rewardButton);
  }

  function makeRouteButtons() {
    all('button,a,[role="button"]').forEach(node => {
      if (node.dataset.route || node.dataset.edRouteBound === '1') return;
      const value = text(node);
      let route = null;
      if (/^настройки$|настройк/.test(value)) route = '/profile/settings';
      else if (/^статистика$|статистик/.test(value)) route = '/profile/statistics';
      else if (/^апгрейд$|upgrade|улучш/.test(value)) route = '/upgrade';
      if (!route) return;
      node.dataset.route = route;
      node.dataset.edRouteBound = '1';
    });
  }

  function ensureLogout() {
    const profile = document.querySelector('#profilePage');
    if (!profile || profile.querySelector('.ed-profile-logout')) return;
    const actions = profile.querySelector('.profile-actions,.stats-actions,.upgrade-actions') || profile;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ed-profile-logout';
    button.textContent = 'Выйти';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const current = state();
      if (current) {
        current.currentUser = null;
        current.selectedCase = null;
        current.currentCase = [];
      }
      try { localStorage.removeItem('currentUser'); } catch (_) {}
      window.location.hash = '';
      window.EmojiDropsRouter?.navigate('/');
    });
    actions.appendChild(button);
  }

  function persistBestDrop() {
    const current = state();
    if (!current?.currentUser || !Array.isArray(current.winQueue) || !current.winQueue.length) return;
    const rank = { common:1, rare:2, epic:3, mythical:4, legendary:5 };
    const best = current.winQueue.slice().sort((a,b) => {
      const rarity = (rank[String(b?.rarity).toLowerCase()] || 0) - (rank[String(a?.rarity).toLowerCase()] || 0);
      if (rarity) return rarity;
      return Number(b?.price || 0) - Number(a?.price || 0);
    })[0];
    if (!best) return;
    const key = BEST_DROP_KEY + ':' + String(current.currentUser.email || current.currentUser.nickname || 'guest');
    try { localStorage.setItem(key, JSON.stringify(best)); } catch (_) {}
  }

  function installBestDropPersistence() {
    if (typeof window.showNextWin !== 'function' || window.showNextWin.__edBestWrapped) return;
    const original = window.showNextWin;
    const wrapped = function(...args) {
      persistBestDrop();
      return original.apply(this,args);
    };
    wrapped.__edBestWrapped = true;
    window.showNextWin = wrapped;
  }

  function restoreBestDropDisplay() {
    const current = state();
    if (!current?.currentUser) return;
    const key = BEST_DROP_KEY + ':' + String(current.currentUser.email || current.currentUser.nickname || 'guest');
    let best = null;
    try { best = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) {}
    if (!best) return;
    const emoji = document.querySelector('#bestDropEmoji');
    const rarity = document.querySelector('#bestDropRarity');
    if (emoji) emoji.textContent = best.emoji || '🏆';
    if (rarity) {
      rarity.textContent = String(best.rarity || 'Нет дропа').toUpperCase();
      const color = window.rarities?.[best.rarity]?.color;
      if (color) rarity.style.color = color;
    }
  }

  function lockSingleScroll() {
    const overlays = ['#settingsOverlay','#statsOverlay','#historyOverlay','#edUpgrade2','#upgradePage'];
    const open = overlays.some(selector => {
      const node = document.querySelector(selector);
      return node && !node.hidden && getComputedStyle(node).display !== 'none';
    });
    document.documentElement.classList.toggle('ed-modal-active', open);
    document.body.classList.toggle('ed-modal-active', open);
  }

  function install() {
    hideSearch();
    decorateCaseCards();
    setupLiveDrops();
    installRewardButtons();
    makeRouteButtons();
    ensureLogout();
    installBestDropPersistence();
    restoreBestDropDisplay();
    lockSingleScroll();
  }

  const observer = new MutationObserver(() => {
    hideSearch();
    decorateCaseCards();
    setupLiveDrops();
    installRewardButtons();
    makeRouteButtons();
    ensureLogout();
    installBestDropPersistence();
    restoreBestDropDisplay();
    lockSingleScroll();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
  observer.observe(document.body, { childList:true, subtree:true });
})();
