(() => {
  'use strict';

  // Single source of truth for the virtual economy.
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

  if (window.casePrices) Object.assign(window.casePrices, CASE_PRICES);

  const parsePrice = item => {
    const value = Number.parseFloat(String(item?.price ?? 0).replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? value : 1;
  };

  const rarityWeight = rarity => Number(RARITY_ODDS[rarity] || 0);

  function buildItemWeights(items) {
    const pool = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!pool.length) return [];

    const groups = new Map();
    for (const item of pool) {
      const rarity = RARITY_ODDS[item.rarity] != null ? item.rarity : 'common';
      if (!groups.has(rarity)) groups.set(rarity, []);
      groups.get(rarity).push(item);
    }

    return { pool, groups };
  }

  function chooseWeighted(source) {
    if (!source.length) return null;

    // A square-root price bias keeps expensive items meaningfully rarer without
    // making low-priced items dominate a rarity completely.
    const weights = source.map(item => 1 / Math.sqrt(parsePrice(item)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;

    for (let index = 0; index < source.length; index += 1) {
      roll -= weights[index];
      if (roll <= 0) return source[index];
    }
    return source[source.length - 1];
  }

  window.getRandomByChance = function getRandomByChance(items) {
    const built = buildItemWeights(items);
    if (!built) return null;

    const roll = Math.random() * 100;
    let cursor = 0;
    let rarity = 'common';

    for (const [name, chance] of Object.entries(RARITY_ODDS)) {
      cursor += chance;
      if (roll < cursor) {
        rarity = name;
        break;
      }
    }

    const candidates = built.groups.get(rarity);
    return chooseWeighted(candidates?.length ? candidates : built.pool);
  };

  window.getItemChance = function getItemChance(items, target) {
    const pool = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!pool.length || !target) return 0;

    const rarity = RARITY_ODDS[target.rarity] != null ? target.rarity : 'common';
    const candidates = pool.filter(item => (RARITY_ODDS[item.rarity] != null ? item.rarity : 'common') === rarity);
    if (!candidates.length) return 0;

    const weights = candidates.map(item => 1 / Math.sqrt(parsePrice(item)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const targetIndex = candidates.indexOf(target);
    if (targetIndex < 0 || !total) return 0;

    return (rarityWeight(rarity) / 100) * (weights[targetIndex] / total) * 100;
  };

  window.getRarityChance = rarity => rarityWeight(rarity);

  window.EMOJI_DROPS_ECONOMY = Object.freeze({
    STARTING_BALANCE,
    RARITY_ODDS,
    CASE_PRICES
  });

  const applyStartingBalance = () => {
    const state = window.state;
    if (!state || state.currentUser) return;
    if (state.balance === 1000 || state.balance == null) state.balance = STARTING_BALANCE;
    const balance = document.getElementById('balance');
    if (balance) balance.textContent = String(state.balance);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyStartingBalance, { once: true });
  } else {
    applyStartingBalance();
  }
})();
