(() => {
  'use strict';

  // EmojiDrops economy — single source of truth.
  // Case price, catalogue size, rarity odds and item EV are calibrated together.
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
  const VALUE_MULTIPLIERS = Object.freeze({ common: 0.28, rare: 0.72, epic: 1.68, mythical: 4.40, legendary: 14.50 });
  const COUNTS = Object.freeze({
    12:[6,3,1,1,1], 14:[7,4,1,1,1], 15:[8,4,1,1,1], 16:[8,4,2,1,1],
    18:[10,5,1,1,1], 20:[11,5,2,1,1], 22:[12,6,2,1,1], 25:[14,7,2,1,1]
  });
  const BASE_RTP = RARITIES.reduce((sum, rarity) => sum + RARITY_ODDS[rarity] / 100 * VALUE_MULTIPLIERS[rarity], 0);
  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const formatMoney = value => `${Math.max(1, Math.round(value))}₽`;
  const secureRandom = () => {
    if (window.crypto?.getRandomValues) {
      const bytes = new Uint32Array(1);
      window.crypto.getRandomValues(bytes);
      return (bytes[0] + 1) / 4294967297;
    }
    return Math.random();
  };

  function getCases() {
    try { if (typeof cases !== 'undefined' && cases) return cases; } catch (_) {}
    return window.cases || null;
  }
  function getCasePrices() {
    try { if (typeof casePrices !== 'undefined' && casePrices) return casePrices; } catch (_) {}
    window.casePrices ||= {};
    return window.casePrices;
  }
  function pickEvenly(items, count) {
    if (!items.length || count <= 0) return [];
    if (items.length <= count) return items.slice();
    const sorted = items.slice().sort((a,b) => money(a.price) - money(b.price));
    return Array.from({length: count}, (_, i) => sorted[Math.round(i * (sorted.length - 1) / Math.max(1, count - 1))]);
  }
  function setGroupPrices(group, average) {
    if (!group.length) return;
    const values = group.map((item, i) => average * (0.78 + 0.44 * i / Math.max(1, group.length - 1)));
    const factor = average / Math.max(0.0001, values.reduce((a,b) => a + b, 0) / values.length);
    values.forEach((value, i) => { group[i].price = formatMoney(value * factor); });
    const target = Math.round(average * group.length);
    const actual = group.reduce((sum, item) => sum + money(item.price), 0);
    group[Math.floor(group.length / 2)].price = formatMoney(money(group[Math.floor(group.length / 2)].price) + target - actual);
  }
  function calibrateCase(id, meta) {
    const source = getCases()?.[id];
    if (!Array.isArray(source) || !source.length) return;
    const distribution = COUNTS[meta.count] || COUNTS[20];
    const selected = [];
    RARITIES.forEach((rarity, index) => selected.push(...pickEvenly(source.filter(item => item?.rarity === rarity), distribution[index])));
    if (selected.length < meta.count) {
      for (const item of source) {
        if (selected.length >= meta.count) break;
        if (!selected.includes(item)) selected.push(item);
      }
    }
    const scale = meta.rtp / BASE_RTP;
    RARITIES.forEach(rarity => {
      const group = selected.filter(item => item?.rarity === rarity);
      setGroupPrices(group, meta.price * VALUE_MULTIPLIERS[rarity] * scale);
      const perItemChance = RARITY_ODDS[rarity] / Math.max(1, group.length);
      group.forEach(item => { item.dropChance = perItemChance; item.caseId = id; });
    });
    const allCases = getCases();
    if (allCases) allCases[id] = selected;
    getCasePrices()[id] = meta.price;
  }
  function calibrate() {
    const allCases = getCases();
    if (!allCases) return false;
    Object.entries(CASE_META).forEach(([id, meta]) => calibrateCase(id, meta));
    window.getRandomByChance = function getRandomByChance(items) {
      const pool = Array.isArray(items) ? items.filter(Boolean) : [];
      if (!pool.length) return null;
      const total = pool.reduce((sum, item) => sum + (Number(item.dropChance) || 0), 0);
      if (total <= 0) return pool[Math.floor(secureRandom() * pool.length)];
      let roll = secureRandom() * total;
      for (const item of pool) {
        roll -= Number(item.dropChance) || 0;
        if (roll <= 0) return item;
      }
      return pool[pool.length - 1];
    };
    window.getUpgradeChance = function getUpgradeChance(source, target) {
      const a = Math.max(0, Number(source) || 0), b = Math.max(0, Number(target) || 0);
      if (!a || !b || b <= a) return 0;
      return Math.max(1, Math.min(95, a / b * 96));
    };
    window.getCasePrice = id => Number(CASE_META[id]?.price || getCasePrices()[id] || 0);
    window.getCaseEconomy = (items, id) => {
      const pool = Array.isArray(items) ? items : [];
      const price = window.getCasePrice(id);
      const expectedValue = pool.reduce((sum, item) => sum + money(item?.price) * (Number(item?.dropChance) || 0) / 100, 0);
      return { price, expectedValue, rtp: price ? expectedValue / price * 100 : 0, items: pool.map(item => ({ item, chance: Number(item?.dropChance) || 0 })) };
    };
    window.EMOJI_DROPS_ECONOMY = Object.freeze({ version: 3, startingBalance: 1000, cases: CASE_META, rarityOdds: RARITY_ODDS, targetRtp: Object.fromEntries(Object.entries(CASE_META).map(([id,m]) => [id,m.rtp])), upgrade: { houseEdge: 0.04, maxChance: 95 } });
    window.__emojiDropsCalibrate = calibrate;
    return true;
  }

  if (!calibrate()) window.addEventListener('DOMContentLoaded', calibrate, { once: true });
})();
