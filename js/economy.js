(() => {
  'use strict';

  const STARTING_BALANCE = 100;
  const RARITY_ODDS = Object.freeze({ common: 55, rare: 28, epic: 11, mythical: 5, legendary: 1 });
  const CASE_PRICES = Object.freeze({ transport: 15, animals: 25, food: 40, nature: 60, moves: 85, smile: 120, sport: 250, games: 500 });

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

  // Expensive items remain obtainable but are somewhat less common inside the
  // same rarity tier. The square-root curve avoids extreme suppression.
  const priceWeight = item => 1 / Math.sqrt(parsePrice(item));

  function effectiveRarityWeights(groups) {
    const available = [...groups.keys()].filter(rarity => rarityWeight(rarity) > 0);
    if (!available.length) return new Map();
    const rawTotal = available.reduce((sum, rarity) => sum + rarityWeight(rarity), 0);
    return new Map(available.map(rarity => [rarity, (rarityWeight(rarity) / rawTotal) * 100]));
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

  function chooseRarity(groups) {
    const weights = effectiveRarityWeights(groups);
    if (!weights.size) return null;
    const roll = secureUnit() * 100;
    let cursor = 0;
    for (const [rarity, chance] of weights) {
      cursor += chance;
      if (roll < cursor) return rarity;
    }
    return [...weights.keys()][weights.size - 1];
  }

  function itemChance(items, target) {
    const built = buildItemWeights(items);
    if (!built || !target) return 0;
    const rarity = normalizeRarity(target.rarity);
    const candidates = built.groups.get(rarity) || [];
    if (!candidates.includes(target)) return 0;
    const tierChance = effectiveRarityWeights(built.groups).get(rarity) || 0;
    const total = candidates.reduce((sum, item) => sum + priceWeight(item), 0);
    return total ? tierChance * (priceWeight(target) / total) : 0;
  }

  function upgradeChance(sourceValue, targetValue) {
    const source = Number(sourceValue) || 0;
    const target = Number(targetValue) || 0;
    if (source <= 0 || target <= 0) return 0;
    if (target <= source) return 95;
    return Math.max(1, Math.min(95, (source / target) * 100));
  }

  function getRandomByChance(items) {
    const built = buildItemWeights(items);
    if (!built) return null;
    const rarity = chooseRarity(built.groups);
    const candidates = rarity ? built.groups.get(rarity) : built.pool;
    return chooseWeighted(candidates?.length ? candidates : built.pool);
  }

  window.getRandomByChance = getRandomByChance;
  window.getItemChance = itemChance;
  window.getRarityChance = rarityWeight;
  window.getUpgradeChance = upgradeChance;
  window.getCasePrice = caseKey => Number(CASE_PRICES[caseKey] ?? 0);

  window.getCaseEconomy = function getCaseEconomy(items, caseKey) {
    const built = buildItemWeights(items);
    const price = Number(CASE_PRICES[caseKey] ?? window.casePrices?.[caseKey] ?? 0);
    if (!built) return { price, expectedValue: 0, rtp: 0, items: [] };
    const rows = built.pool.map(item => ({ item, chance: itemChance(built.pool, item) }));
    const expectedValue = rows.reduce((sum, row) => sum + parsePrice(row.item) * (row.chance / 100), 0);
    return { price, expectedValue, rtp: price > 0 ? (expectedValue / price) * 100 : 0, items: rows };
  };

  window.getCaseItemChances = function getCaseItemChances(items, caseKey) {
    const built = buildItemWeights(items);
    const economy = window.getCaseEconomy(items, caseKey);
    const effective = built ? effectiveRarityWeights(built.groups) : new Map();
    return economy.items.map(({ item, chance }) => ({
      item,
      chance,
      rarityChance: effective.get(normalizeRarity(item?.rarity)) || 0
    }));
  };

  window.EMOJI_DROPS_ECONOMY = Object.freeze({
    STARTING_BALANCE,
    RARITY_ODDS,
    CASE_PRICES,
    getItemChance: itemChance,
    getRarityChance: rarityWeight,
    getUpgradeChance: upgradeChance,
    getCaseEconomy: window.getCaseEconomy,
    getCaseItemChances: window.getCaseItemChances
  });

  const applyStartingBalance = () => {
    let appState = window.state;
    try { if (typeof state !== 'undefined') appState = state; } catch (_) {}
    if (!appState || appState.currentUser) return;
    if (appState.balance == null || appState.balance === 1000) appState.balance = STARTING_BALANCE;
    const balance = document.getElementById('balance');
    if (balance) balance.textContent = String(appState.balance);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyStartingBalance, { once: true });
  else applyStartingBalance();
})();
