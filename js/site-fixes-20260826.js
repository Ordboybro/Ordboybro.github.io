/* EmojiDrops final functional/UI fixes — 2026-08-26 */
(() => {
  'use strict';

  const money = value => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : 0;
  };

  function normalizeMoney() {
    const state = window.state;
    if (!state) return 0;
    if (state.currentUser) {
      state.currentUser.balance = money(state.currentUser.balance);
      state.balance = state.currentUser.balance;
    } else {
      state.balance = money(state.balance);
    }
    return state.balance;
  }

  function patchBalanceUI() {
    const original = window.updateBalanceUI;
    if (typeof original !== 'function' || original.__edMoneyPatch) return false;
    const wrapped = function () {
      const balance = normalizeMoney();
      const top = document.getElementById('balance');
      const profile = document.getElementById('profileBalance');
      if (top) top.textContent = String(balance);
      if (profile) profile.textContent = String(balance);
    };
    wrapped.__edMoneyPatch = true;
    window.updateBalanceUI = wrapped;
    wrapped();
    return true;
  }

  function patchLiveDrop() {
    const original = window.addLiveDrop;
    if (typeof original !== 'function' || original.__edOwnLivePatch) return false;
    const wrapped = function (username, item) {
      original.apply(this, arguments);
      const container = document.getElementById('liveContainer');
      const card = container?.firstElementChild;
      if (card) card.classList.add('live-drop', 'own', item?.rarity || 'common');
    };
    wrapped.__edOwnLivePatch = true;
    window.addLiveDrop = wrapped;
    return true;
  }

  function markExistingOwnDrops() {
    const username = window.state?.currentUser?.nickname;
    if (!username) return;
    document.querySelectorAll('#liveContainer > *').forEach(card => {
      const user = card.querySelector('.live-user,.drop-user')?.textContent?.trim() || '';
      if (user === username || user.startsWith(username + ' ')) card.classList.add('live-drop','own');
    });
  }

  function refreshStats() {
    if (typeof window.renderPersistedBestDrop === 'function') window.renderPersistedBestDrop();
    if (typeof window.updateStatsUI === 'function') window.updateStatsUI();
  }

  function init() {
    patchBalanceUI();
    patchLiveDrop();
    normalizeMoney();
    const top = document.getElementById('balance');
    const profile = document.getElementById('profileBalance');
    const balance = money(window.state?.balance);
    if (top) top.textContent = String(balance);
    if (profile) profile.textContent = String(balance);
    markExistingOwnDrops();
    refreshStats();
  }

  const timer = setInterval(() => {
    init();
    if (window.state?.currentUser && typeof window.addLiveDrop === 'function') clearInterval(timer);
  }, 250);
  setTimeout(() => clearInterval(timer), 8000);

  document.addEventListener('click', () => setTimeout(() => {
    markExistingOwnDrops();
    refreshStats();
  }, 0));
})();
