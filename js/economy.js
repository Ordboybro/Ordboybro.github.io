(() => {
  'use strict';

  // Single source of truth for the virtual economy.
  // This is intentionally separate from the UI so prices/odds can be tuned safely.
  const STARTING_BALANCE = 100;
  const RARITY_ODDS = Object.freeze({
    common: 55,
    rare: 28,
    epic: 11,
    mythical: 5,
    legendary: 1
  });
  const CASE_PRICES = Object.freeze({
    transport: 15,
    animals: 25,
    food: 40,
    nature: 60,
    moves: 85,
    smile: 120,
    sport: 250,
    games: 500
  });

  // Keep the existing item catalogue, but make case prices consistent everywhere.
  if (window.casePrices) Object.assign(window.casePrices, CASE_PRICES);
  window.EMOJI_DROPS_ECONOMY = Object.freeze({ STARTING_BALANCE, RARITY_ODDS, CASE_PRICES });

  // Select a rarity first, then select an item inside that rarity with a price-aware
  // weight. Expensive items are possible, but naturally rarer than cheaper items of
  // the same rarity. The rarity percentages always add up to exactly 100%.
  window.getRandomByChance = function getRandomByChance(items) {
    const pool = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!pool.length) return null;

    const roll = Math.random() * 100;
    let cursor = 0;
    let rarity = 'common';
    for (const [name, chance] of Object.entries(RARITY_ODDS)) {
      cursor += chance;
      if (roll < cursor) { rarity = name; break; }
    }

    const candidates = pool.filter(item => item.rarity === rarity);
    const source = candidates.length ? candidates : pool;
    const weights = source.map(item => {
      const price = Number.parseFloat(String(item.price ?? 0).replace(',', '.')) || 1;
      return 1 / Math.sqrt(Math.max(price, 1));
    });
    const total = weights.reduce((sum, value) => sum + value, 0);
    let pick = Math.random() * total;
    for (let i = 0; i < source.length; i += 1) {
      pick -= weights[i];
      if (pick <= 0) return source[i];
    }
    return source[source.length - 1];
  };

  // New local users get a useful but deliberately modest starting balance.
  // Existing logged-in users are never overwritten.
  const applyStartingBalance = () => {
    const state = window.state;
    if (!state || state.currentUser) return;
    if (state.balance === 1000 || state.balance == null) state.balance = STARTING_BALANCE;
    const balance = document.getElementById('balance');
    if (balance) balance.textContent = String(state.balance);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyStartingBalance, { once: true });
  else applyStartingBalance();
})();
