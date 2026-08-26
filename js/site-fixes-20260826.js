/* EmojiDrops final functional/UI fixes — 2026-08-26 */
(() => {
  'use strict';

  const money = value => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : 0;
  };

  function syncMoney() {
    const state = window.state;
    if (!state) return;
    if (state.currentUser) {
      state.currentUser.balance = money(state.currentUser.balance);
      state.balance = state.currentUser.balance;
    } else {
      state.balance = money(state.balance);
    }
    if (typeof window.updateBalanceUI === 'function') window.updateBalanceUI();
  }

  function patchBalanceUI() {
    const original = window.updateBalanceUI;
    if (typeof original !== 'function' || original.__edMoneyPatch) return false;
    const wrapped = function () {
      syncMoney();
      const balance = money(window.state?.balance);
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
      const cards = container ? [...container.children] : [];
      const own = cards.find(card => {
        const user = card.querySelector('.live-user')?.textContent?.trim();
        return user === String(username).trim();
      });
      if (own && window.state?.currentUser?.nickname === username) own.classList.add('own');
    };
    wrapped.__edOwnLivePatch = true;
    window.addLiveDrop = wrapped;
    return true;
  }

  function markExistingOwnDrops() {
    const username = window.state?.currentUser?.nickname;
    if (!username) return;
    document.querySelectorAll('.live-drop').forEach(card => {
      if (card.querySelector('.live-user')?.textContent?.trim() === username) card.classList.add('own');
    });
  }

  function refreshStats() {
    if (typeof window.updateStatsUI === 'function') window.updateStatsUI();
    if (typeof window.renderPersistedBestDrop === 'function') window.renderPersistedBestDrop();
  }

  function init() {
    patchBalanceUI();
    patchLiveDrop();
    syncMoney();
    markExistingOwnDrops();
    refreshStats();
  }

  const timer = setInterval(() => {
    init();
    if (window.state?.currentUser) clearInterval(timer);
  }, 250);
  setTimeout(() => clearInterval(timer), 8000);

  document.addEventListener('click', () => setTimeout(() => {
    markExistingOwnDrops();
    refreshStats();
  }, 0));
})();
