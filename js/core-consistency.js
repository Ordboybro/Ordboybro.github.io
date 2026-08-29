(() => {
  'use strict';

  // One source of truth for gameplay-facing random selection.
  // app.js historically defined a second rarity table (3/5/17/30/45),
  // while economy.js defines the current public economy. Keep the legacy
  // function name for compatibility, but delegate the implementation.
  const canonicalRandom = window.getRandomByChance;
  if (typeof canonicalRandom === 'function' && window.EMOJI_DROPS_ECONOMY?.RARITY_ODDS) {
    window.getRandomByChance = function getRandomByChance(items) {
      const pool = Array.isArray(items) ? items.filter(Boolean) : [];
      if (!pool.length) return null;
      return canonicalRandom(pool);
    };
  }

  // Keep the visible balance in sync when gameplay changes state.balance.
  // This avoids stale header/profile values without polling.
  const syncBalance = () => {
    const value = Number(window.state?.balance);
    if (!Number.isFinite(value)) return;
    document.querySelectorAll('#balance, #profileBalance').forEach((node) => {
      if (node.textContent !== String(value)) node.textContent = String(value);
    });
  };

  const originalUpdateBalance = window.updateBalanceUI;
  window.updateBalanceUI = function updateBalanceUIConsistent(...args) {
    if (typeof originalUpdateBalance === 'function') originalUpdateBalance.apply(this, args);
    syncBalance();
  };

  // A small, non-invasive observer handles UI nodes created after navigation.
  // It is deliberately scoped to balance elements rather than the whole DOM.
  const observer = new MutationObserver(syncBalance);
  observer.observe(document.body, { childList: true, subtree: true });
  syncBalance();

  window.__emojiDropsCoreConsistency = Object.freeze({
    version: 1,
    economyConnected: typeof window.getRandomByChance === 'function' && !!window.EMOJI_DROPS_ECONOMY
  });
})();
