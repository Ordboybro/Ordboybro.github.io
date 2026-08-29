(() => {
  'use strict';

  // app.js historically defined a second rarity table. economy.js is now the
  // canonical source; keep the legacy function name for compatibility.
  const canonicalRandom = window.getRandomByChance;
  if (typeof canonicalRandom === 'function' && window.EMOJI_DROPS_ECONOMY?.RARITY_ODDS) {
    window.getRandomByChance = function getRandomByChance(items) {
      const pool = Array.isArray(items) ? items.filter(Boolean) : [];
      return pool.length ? canonicalRandom(pool) : null;
    };
  }

  // Keep visible balances synchronized when the existing application updates
  // them. Avoid observing the whole DOM because roulette/inventory rendering
  // can create many mutations per frame.
  const syncBalance = () => {
    const value = Number(window.state?.balance);
    if (!Number.isFinite(value)) return;
    const text = String(value);
    document.querySelectorAll('#balance, #profileBalance').forEach((node) => {
      if (node.textContent !== text) node.textContent = text;
    });
  };

  const originalUpdateBalance = window.updateBalanceUI;
  window.updateBalanceUI = function updateBalanceUIConsistent(...args) {
    if (typeof originalUpdateBalance === 'function') originalUpdateBalance.apply(this, args);
    syncBalance();
  };

  syncBalance();

  window.__emojiDropsCoreConsistency = Object.freeze({
    version: 2,
    economyConnected: typeof window.getRandomByChance === 'function' && !!window.EMOJI_DROPS_ECONOMY
  });
})();
