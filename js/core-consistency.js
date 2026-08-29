(() => {
  'use strict';

  // economy.js is the single source of truth for rarity/item selection.
  // app.js keeps the legacy function name for compatibility, but economy.js
  // overwrites window.getRandomByChance when it boots. Do not wrap that
  // function here: wrapping the legacy implementation would reintroduce the
  // old 3/5/17/30/45 rarity table.

  const syncBalance = () => {
    const value = Number(window.state?.balance);
    if (!Number.isFinite(value)) return;
    const text = String(value);
    document.querySelectorAll('#balance, #profileBalance').forEach((node) => {
      if (node.textContent !== text) node.textContent = text;
    });
  };

  const originalUpdateBalance = window.updateBalanceUI;
  if (typeof originalUpdateBalance === 'function' && !originalUpdateBalance.__emojiDropsConsistent) {
    const wrapped = function updateBalanceUIConsistent(...args) {
      originalUpdateBalance.apply(this, args);
      syncBalance();
    };
    Object.defineProperty(wrapped, '__emojiDropsConsistent', { value: true });
    window.updateBalanceUI = wrapped;
  }

  syncBalance();

  window.__emojiDropsCoreConsistency = Object.freeze({
    version: 3,
    economyConnected: typeof window.getRandomByChance === 'function' && !!window.EMOJI_DROPS_ECONOMY
  });
})();
