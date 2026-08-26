(() => {
  'use strict';

  // EmojiDrops economy calibration v2.
  // One deterministic source of truth for case price, item count, item price and drop odds.
  const CASE_META = Object.freeze({
    transport: { price: 15,  rtp: 0.93, count: 12 },
    animals:   { price: 25,  rtp: 0.93, count: 14 },
    food:      { price: 40,  rtp: 0.92, count: 15 },
    nature:    { price: 65,  rtp: 0.92, count: 16 },
    moves:     { price: 90,  rtp: 0.92, count: 18 },
    smile:     { price: 130, rtp: 0.91, count: 20 },
    sport:     { price: 250, rtp: 0.91, count: 22 },
    games:     { price: 500, rtp: 0.90, count: 25 }
  });

  const RARITIES = ['common', 'rare', 'epic', 'mythical', 'legendary'];
  const RARITY_ODDS = Object.freeze({ common: 55, rare: 27, epic: 12, mythical: 5, legendary: 1 });
  const BASE_VALUE_MULTIPLIERS = Object.freeze({
    common: 0.28,
    rare: 0.72,
    epic: 1.68,
    mythical: 4.40,
    legendary: 14.50
  });
  const BASE_RTP = RARITIES.reduce((sum, rarity) => sum + (RARITY_ODDS[rarity] / 100) * BASE_VALUE_MULTIPLIERS[rarity], 0);

  const COUNT_DISTRIBUTIONS = Object.freeze({
    12: [6, 3, 1, 1, 1],
    14: [7, 4, 1, 1, 1],
    15: [8, 4, 1, 1, 1],
    16: [8, 4, 2, 1, 1],
    18: [10, 5, 1, 1, 1],
    20: [11, 5, 2, 1, 1],
    22: [12, 6, 2, 1, 1],
    25: [14, 7, 2, 1, 1]
  });

  const toMoney = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const formatPrice = value => `${Math.max(1, Math.round(value))}₽`;

  function evenlyPick(items, wanted) {
    if (!Array.isArray(items) || !items.length || wanted <= 0) return [];
    if (items.length <= wanted) return items.slice();
    const sorted = items.slice().sort((a, b) => toMoney(a.price) - toMoney(b.price) || String(a.emoji).localeCompare(String(b.emoji)));
    const result = [];
    const used = new Set();
    for (let i = 0; i < wanted; i += 1) {
      const index = Math.round((i * (sorted.length - 1)) / Math.max(1, wanted - 1));
      if (!used.has(index)) { result.push(sorted[index]); used.add(index); }
    }
    for (const item of sorted) {
      if (result.length >= wanted) break;
      if (!result.includes(item)) result.push(item);
    }
    return result;
  }

  function assignRarityPrices(items, average) {
    if (!items.length) return;
    const center = (items.length - 1) / 2;
    const raw = items.map((item, index) => {
      const spread = items.length === 1 ? 1 : 0.78 + (0.44 * index / (items.length - 1));
      return { item, value: Math.max(1, average * spread), index };
    });
    const rawAverage = raw.reduce((sum, entry) => sum + entry.value, 0) / raw.length;
    const factor = average / Math.max(rawAverage, 0.0001);
    raw.forEach(entry => { entry.item.price = formatPrice(entry.value * factor); });

    // Keep the group average close to the requested EV after integer rounding.
    const current = raw.reduce((sum, entry) => sum + toMoney(entry.item.price), 0) / raw.length;
    const correction = Math.round((average - current) * raw.length);
    if (correction) {
      const middle = raw[Math.round(center)].item;
      middle.price = formatPrice(toMoney(middle.price) + correction);
    }
  }

  function calibrateCase(caseId, meta) {
    const original = Array.isArray(window.cases?.[caseId]) ? window.cases[caseId].slice() : [];
    if (!original.length) return;
    const distribution = COUNT_DISTRIBUTIONS[meta.count] || COUNT_DISTRIBUTIONS[20];
    const selected = [];

    RARITIES.forEach((rarity, index) => {
      const pool = original.filter(item => item?.rarity === rarity);
      selected.push(...evenlyPick(pool, distribution[index]));
    });

    // If an old catalogue has a missing rarity, fill from the remaining catalogue
    // rather than leaving a broken empty chance segment.
    if (selected.length < meta.count) {
      for (const item of original) {
        if (selected.length >= meta.count) break;
        if (!selected.includes(item)) selected.push(item);
      }
    }

    const scale = meta.rtp / BASE_RTP;
    RARITIES.forEach(rarity => {
      const group = selected.filter(item => item.rarity === rarity);
      const average = meta.price * BASE_VALUE_MULTIPLIERS[rarity] * scale;
      assignRarityPrices(group, average);
      const chance = RARITY_ODDS[rarity] / Math.max(1, group.length);
      group.forEach(item => { item.dropChance = chance; item.caseId = caseId; });
    });

    window.cases[caseId] = selected;
    if (window.casePrices) window.casePrices[caseId] = meta.price;
  }

  function calibrate() {
    if (!window.cases) return false;
    Object.entries(CASE_META).forEach(([caseId, meta]) => calibrateCase(caseId, meta));

    // Exact per-item odds: rarity odds stay fixed, while items inside one rarity share it.
    window.getRandomByChance = function getRandomByChance(items) {
      const pool = Array.isArray(items) ? items.filter(Boolean) : [];
      if (!pool.length) return null;
      const weighted = pool.map(item => ({ item, weight: Number(item.dropChance) || 0 }));
      const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
      if (total <= 0) return pool[Math.floor(Math.random() * pool.length)];
      let roll = Math.random() * total;
      for (const entry of weighted) {
        roll -= entry.weight;
        if (roll <= 0) return entry.item;
      }
      return weighted[weighted.length - 1].item;
    };

    window.EMOJI_DROPS_ECONOMY = Object.freeze({
      version: 2,
      startingBalance: 100,
      cases: CASE_META,
      rarityOdds: RARITY_ODDS,
      targetRtp: Object.fromEntries(Object.entries(CASE_META).map(([id, meta]) => [id, meta.rtp])),
      upgrade: Object.freeze({ houseEdge: 0.04, minIncrease: 0.05, maxMultiplier: 10 }),
      getUpgradeChance(sourceValue, targetValue) {
        const source = Math.max(0, Number(sourceValue) || 0);
        const target = Math.max(0, Number(targetValue) || 0);
        if (!source || !target || target <= source) return 0;
        const raw = (source / target) * 100;
        return Math.max(1, Math.min(95, raw * 0.96));
      }
    });

    // Update visible case prices so HTML and JS cannot drift apart again.
    document.querySelectorAll('.case').forEach(card => {
      const name = card.querySelector('.case-name')?.textContent?.trim()?.toLowerCase();
      const meta = CASE_META[name];
      if (!meta) return;
      const price = card.querySelector('.new-price');
      if (price) price.textContent = `${meta.price}₽`;
    });

    return true;
  }

  if (!calibrate()) {
    window.addEventListener('DOMContentLoaded', calibrate, { once: true });
  }
})();
