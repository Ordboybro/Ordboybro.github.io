(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const text = node => (node?.textContent || '').trim().toLocaleLowerCase('ru-RU');
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  const REWARD = 250;
  const REWARD_KEY = 'emojiDrops.dailyReward.v2';
  const BEST_KEY = 'emojiDrops.bestDrop.v2';
  const RARITY_COLORS = Object.freeze({
    common: '#8b949e',
    rare: '#3b82f6',
    epic: '#a855f7',
    mythical: '#ef4444',
    legendary: '#ff9f43'
  });

  function rewardData() {
    try { return JSON.parse(localStorage.getItem(REWARD_KEY) || '{}'); }
    catch { return {}; }
  }

  function rewardAvailable() {
    return Date.now() >= Number(rewardData().nextAt || 0);
  }

  function formatTimer(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function refreshBalance() {
    try { window.updateBalanceUI?.(); } catch (_) {}
    const value = Number(window.state?.balance);
    if (!Number.isFinite(value)) return;
    $$('[data-balance], #balance, .balance-value, .balance-amount').forEach(node => {
      if (node.id === 'balance' || node.closest('.balance-menu,.balance-dropdown')) node.textContent = `${value}₽`;
    });
  }

  function claimReward(button) {
    if (!rewardAvailable()) return false;
    const state = window.state;
    const user = state?.currentUser;
    if (!state || !user) {
      window.openAuth?.('login');
      return false;
    }

    state.balance = (Number(state.balance) || 0) + REWARD;
    user.balance = state.balance;
    localStorage.setItem(REWARD_KEY, JSON.stringify({ nextAt: Date.now() + 86400000 }));
    try { window.saveUsers?.(); } catch (_) {}
    refreshBalance();
    updateRewardButtons();
    button?.blur();
    return true;
  }

  function updateRewardButtons() {
    const nextAt = Number(rewardData().nextAt || 0);
    const available = Date.now() >= nextAt;
    const seen = new Set();

    const candidates = [
      ...$$('.balance-dropdown button'),
      ...$$('.daily-reward-btn'),
      ...$$('[data-daily-reward]'),
      ...$$('#profilePage button')
    ];

    candidates.forEach(button => {
      if (seen.has(button)) return;
      const value = text(button);
      const isReward = button.dataset.dailyReward === '1' ||
        button.dataset.action === 'deposit' ||
        button.classList.contains('daily-reward-btn') ||
        value === 'пополнить';
      if (!isReward) return;
      seen.add(button);
      button.dataset.dailyReward = '1';
      button.disabled = !available;
      button.classList.toggle('is-cooldown', !available);
      button.textContent = available
        ? `Получить ${REWARD}₽`
        : `Получено · ${formatTimer(nextAt - Date.now())}`;
    });
  }

  function removeSearch() {
    const selectors = [
      '.search-wrap', '.search-container', '#caseSearch', '.case-search',
      'input[type="search"]', 'input[name*="search" i]',
      'input[placeholder*="поиск" i]', 'input[placeholder*="кейс" i]', '#searchInput'
    ];

    $$(selectors.join(',')).forEach(node => {
      const target = node.matches('input')
        ? (node.closest('.search-wrap,.search-container,.case-search,.case-search-box,form') || node)
        : node;
      target.hidden = true;
      target.style.setProperty('display', 'none', 'important');
      target.setAttribute('aria-hidden', 'true');
    });
  }

  function syncUpgradeBridge() {
    if (typeof window.openUpgrade === 'function' && typeof window.openUpgradeMenu !== 'function') {
      window.openUpgradeMenu = (...args) => window.openUpgrade(...args);
    }
    if (typeof window.closeUpgrade === 'function' && typeof window.closeUpgradeMenu !== 'function') {
      window.closeUpgradeMenu = (...args) => window.closeUpgrade(...args);
    }
  }

  function bestData() {
    try { return JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); }
    catch { return null; }
  }

  function saveBestDrop(item) {
    if (!item) return;
    const value = Number.parseFloat(String(item.price ?? 0).replace(',', '.')) || 0;
    const current = bestData();
    const currentValue = Number.parseFloat(String(current?.price ?? 0).replace(',', '.')) || 0;
    if (value <= currentValue) return;
    localStorage.setItem(BEST_KEY, JSON.stringify({
      emoji: item.emoji,
      rarity: item.rarity,
      price: item.price,
      updatedAt: Date.now()
    }));
    syncBestDrop();
  }

  function syncBestDrop() {
    const best = bestData();
    if (!best) return;
    const color = RARITY_COLORS[best.rarity] || '#ff7b00';
    $$('#bestDrop,.best-drop,.best-drop-card').forEach(node => {
      const emoji = node.querySelector('.best-drop-emoji,.drop-emoji,#bestDropEmoji');
      const rarity = node.querySelector('.best-drop-rarity,#bestDropRarity');
      const price = node.querySelector('.best-drop-price,.drop-price');
      if (emoji) emoji.textContent = best.emoji || '🏆';
      if (rarity) {
        rarity.textContent = String(best.rarity || 'DROP').toUpperCase();
        rarity.style.color = color;
      }
      if (price) price.textContent = `${best.price || 0}₽`;
    });
    const emoji = $('bestDropEmoji');
    const rarity = $('bestDropRarity');
    if (emoji) emoji.textContent = best.emoji || '🏆';
    if (rarity) {
      rarity.textContent = String(best.rarity || 'DROP').toUpperCase();
      rarity.style.color = color;
    }
  }

  window.saveBestDrop = saveBestDrop;

  function bridgeBestDrop() {
    const original = window.showNextWin;
    if (typeof original !== 'function' || original.__edBestDropBridge) return;
    const wrapped = function (...args) {
      const queue = Array.isArray(window.state?.winQueue) ? window.state.winQueue : [];
      queue.forEach(saveBestDrop);
      const result = original.apply(this, args);
      syncBestDrop();
      return result;
    };
    wrapped.__edBestDropBridge = true;
    window.showNextWin = wrapped;
  }

  function profileLogout() {
    const page = $('profilePage');
    if (!page || $('.ed-profile-logout', page)) return;

    $$('.profile-balance,.profile-balance-card,[data-profile-balance]', page).forEach(node => {
      node.hidden = true;
      node.style.display = 'none';
    });

    const host = $('.profile-content,.profile-header', page) || page;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ed-profile-logout ed-primary-action';
    button.textContent = 'Выйти';
    button.setAttribute('aria-label', 'Выйти из профиля');
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (window.state) window.state.currentUser = null;
      try { window.saveUsers?.(); } catch (_) {}
      window.EmojiDropsRouter?.navigate('/');
    });
    host.appendChild(button);
  }

  function routeSemanticButtons(event) {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('button,a,[role="button"]');
    if (!button) return;

    const value = text(button);
    const label = `${value} ${button.getAttribute('aria-label') || ''} ${button.getAttribute('title') || ''}`.toLocaleLowerCase('ru-RU');
    const router = window.EmojiDropsRouter;

    if (button.dataset.dailyReward === '1' || value.startsWith('получить ') || value.startsWith('получено ·')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!button.disabled) claimReward(button);
      return;
    }

    if (!router) return;
    if (label.includes('настрой')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      router.navigate('/profile/settings');
      return;
    }
    if (label.includes('статист')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      router.navigate('/profile/statistics');
      return;
    }
    if (label === 'апгрейд' || label.includes('upgrade')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      router.navigate('/upgrade');
    }
  }

  function normalizeLiveDrops() {
    const root = $('liveContainer') || $('liveDrops') || $('liveDropsContainer') || document.querySelector('.live-drops-container,.live-drops');
    if (!root || root.dataset.edLiveReady === '1') return;
    root.dataset.edLiveReady = '1';
    root.classList.add('ed-live-root');

    const decorate = node => {
      if (!(node instanceof HTMLElement)) return;
      const raw = `${node.className} ${node.dataset.rarity || ''}`.toLowerCase();
      const rarity = Object.keys(RARITY_COLORS).find(key => raw.includes(key)) || 'common';
      node.classList.add('ed-live-drop', `ed-live-${rarity}`);
      node.style.setProperty('--rarity-color', RARITY_COLORS[rarity]);
      if (!reduced()) {
        node.classList.remove('is-visible');
        requestAnimationFrame(() => node.classList.add('is-visible'));
      } else node.classList.add('is-visible');
    };

    [...root.children].forEach(decorate);
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          decorate(node);
          if (root.firstElementChild !== node) root.prepend(node);
        }
      }
      while (root.children.length > 7) root.lastElementChild?.remove();
    });
    observer.observe(root, { childList: true });
  }

  function fixProfileScroll() {
    const page = $('profilePage');
    if (!page) return;
    page.style.overflow = 'auto';
    const content = $('.profile-content', page);
    if (content) {
      content.style.overflow = 'visible';
      content.style.maxHeight = 'none';
    }
  }

  function stylePrimaryButtons() {
    $$('button').forEach(button => {
      const value = text(button);
      const label = `${value} ${button.getAttribute('aria-label') || ''}`;
      if (/апгрейд|статист|настрой|пополн|получить|выйти|upgrade/i.test(label)) {
        button.classList.add('ed-primary-action');
      }
    });
  }

  function install() {
    syncUpgradeBridge();
    removeSearch();
    profileLogout();
    updateRewardButtons();
    syncBestDrop();
    bridgeBestDrop();
    normalizeLiveDrops();
    fixProfileScroll();
    stylePrimaryButtons();

    document.addEventListener('click', routeSemanticButtons, true);

    window.setInterval(() => {
      removeSearch();
      updateRewardButtons();
      syncBestDrop();
      bridgeBestDrop();
      normalizeLiveDrops();
      profileLogout();
      fixProfileScroll();
      stylePrimaryButtons();
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
