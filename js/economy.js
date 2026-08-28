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

  const oddsTotal = Object.values(RARITY_ODDS).reduce((sum, value) => sum + value, 0);
  if (oddsTotal !== 100) console.warn('[EmojiDrops] Rarity odds must total 100%, got', oddsTotal);

  if (window.casePrices) Object.assign(window.casePrices, CASE_PRICES);

  const parsePrice = item => {
    const value = Number.parseFloat(String(item?.price ?? 0).replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? value : 1;
  };

  const normalizeRarity = rarity => RARITY_ODDS[rarity] != null ? rarity : 'common';
  const rarityWeight = rarity => Number(RARITY_ODDS[normalizeRarity(rarity)] || 0);

  function secureUnit() {
    if (window.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return (buffer[0] + 1) / 4294967297;
    }
    return Math.random();
  }

  function buildItemWeights(items) {
    const pool = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!pool.length) return null;

    const groups = new Map();
    for (const item of pool) {
      const rarity = normalizeRarity(item.rarity);
      if (!groups.has(rarity)) groups.set(rarity, []);
      groups.get(rarity).push(item);
    }
    return { pool, groups };
  }

  function priceWeight(item) {
    // Expensive items remain possible, but are naturally less frequent inside
    // the same rarity. sqrt keeps the curve useful instead of brutally steep.
    return 1 / Math.sqrt(parsePrice(item));
  }

  function chooseWeighted(source) {
    if (!source?.length) return null;
    const weights = source.map(priceWeight);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (!total) return source[0];

    let roll = secureUnit() * total;
    for (let index = 0; index < source.length; index += 1) {
      roll -= weights[index];
      if (roll <= 0) return source[index];
    }
    return source[source.length - 1];
  }

  function chooseRarity() {
    const roll = secureUnit() * 100;
    let cursor = 0;
    for (const [rarity, chance] of Object.entries(RARITY_ODDS)) {
      cursor += chance;
      if (roll < cursor) return rarity;
    }
    return 'common';
  }

  function itemChance(items, target) {
    const built = buildItemWeights(items);
    if (!built || !target) return 0;

    const rarity = normalizeRarity(target.rarity);
    const candidates = built.groups.get(rarity) || [];
    const targetIndex = candidates.indexOf(target);
    if (targetIndex < 0) return 0;

    const total = candidates.reduce((sum, item) => sum + priceWeight(item), 0);
    if (!total) return 0;
    return rarityWeight(rarity) * (priceWeight(target) / total);
  }

  window.getRandomByChance = function getRandomByChance(items) {
    const built = buildItemWeights(items);
    if (!built) return null;
    const rarity = chooseRarity();
    const candidates = built.groups.get(rarity);
    return chooseWeighted(candidates?.length ? candidates : built.pool);
  };

  window.getItemChance = itemChance;
  window.getRarityChance = rarityWeight;

  window.getCaseEconomy = function getCaseEconomy(items, caseKey) {
    const built = buildItemWeights(items);
    const price = Number(CASE_PRICES[caseKey] ?? window.casePrices?.[caseKey] ?? 0);
    if (!built) return { price, expectedValue: 0, rtp: 0, items: [] };

    const rows = built.pool.map(item => ({
      item,
      chance: itemChance(built.pool, item)
    }));
    const expectedValue = rows.reduce((sum, row) => sum + parsePrice(row.item) * (row.chance / 100), 0);
    return {
      price,
      expectedValue,
      rtp: price > 0 ? (expectedValue / price) * 100 : 0,
      items: rows
    };
  };

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
