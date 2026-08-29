(() => {
  'use strict';

  const STARTING_BALANCE = 100;
  const RARITY_ODDS = Object.freeze({ common: 55, rare: 28, epic: 11, mythical: 5, legendary: 1 });
  const TARGET_RTP = 0.70;
  const TARGET_COUNTS = Object.freeze({ common: 8, rare: 5, epic: 3, mythical: 2, legendary: 2 });
  const FILLERS = Object.freeze({
    common: ['🙂','🙃','😉','😊','😌','😐','😶','😴','🤍','✨'],
    rare: ['😎','🤓','🥰','😇','🤠','🫶','💙','🌸','🍀','⚡'],
    epic: ['🤩','🥳','👻','🤖','🔥','🌈','💜','🌌','🎯','🚀'],
    mythical: ['💀','👽','🦹','🌪️','☄️','❤️‍🔥','🧿','🌋','🪄','🪽'],
    legendary: ['👑','💎','🌟','🏆','🐉','🦄','🌠','🔱','🌌','☀️']
  });

  const DEFAULT_PRICES = Object.freeze({ transport: 15, animals: 25, food: 40, nature: 60, moves: 85, smile: 120, sport: 250, games: 500 });
  const CASE_PRICES = { ...DEFAULT_PRICES };

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

  function pickFiller(rarity, used) {
    const source = FILLERS[rarity] || FILLERS.common;
    const emoji = source.find(value => !used.has(value)) || source[0];
    used.add(emoji);
    return emoji;
  }

  function normalizedCaseItems(items) {
    const source = Array.isArray(items) ? items.filter(Boolean).map(item => ({ ...item, rarity: normalizeRarity(item.rarity) })) : [];
    const groups = new Map(Object.keys(RARITY_ODDS).map(rarity => [rarity, []]));
    source.forEach(item => groups.get(item.rarity).push(item));
    const used = new Set(source.map(item => item.emoji));
    const result = [];

    for (const [rarity, count] of Object.entries(TARGET_COUNTS)) {
      const group = groups.get(rarity) || [];
      if (group.length >= count) {
        const step = group.length / count;
        for (let i = 0; i < count; i += 1) result.push({ ...group[Math.min(group.length - 1, Math.floor(i * step))] });
      } else {
        group.forEach(item => result.push({ ...item }));
        while (result.filter(item => item.rarity === rarity).length < count) {
          const emoji = pickFiller(rarity, used);
          const base = rarity === 'common' ? 4 : rarity === 'rare' ? 11 : rarity === 'epic' ? 25 : rarity === 'mythical' ? 60 : 150;
          result.push({ emoji, rarity, price: `${base}₽` });
        }
      }
    }
    return result;
  }

  function uniformItemChance(items, target) {
    const pool = Array.isArray(items) ? items : [];
    const rarity = normalizeRarity(target?.rarity);
    const candidates = pool.filter(item => normalizeRarity(item?.rarity) === rarity);
    if (!candidates.length || !candidates.includes(target)) return 0;
    return (rarityWeight(rarity) / 100) / candidates.length * 100;
  }

  function chooseUniform(items) {
    if (!Array.isArray(items) || !items.length) return null;
    const roll = secureUnit() * items.length;
    return items[Math.min(items.length - 1, Math.floor(roll))];
  }

  function getRandomByChance(items) {
    const pool = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!pool.length) return null;
    const roll = secureUnit() * 100;
    let cursor = 0;
    let rarity = 'common';
    for (const [key, chance] of Object.entries(RARITY_ODDS)) {
      cursor += chance;
      if (roll < cursor) { rarity = key; break; }
    }
    const candidates = pool.filter(item => normalizeRarity(item?.rarity) === rarity);
    return chooseUniform(candidates.length ? candidates : pool);
  }

  function upgradeChance(sourceValue, targetValue) {
    const source = Number(sourceValue) || 0;
    const target = Number(targetValue) || 0;
    if (source <= 0 || target <= 0) return 0;
    if (target <= source) return 95;
    return Math.max(1, Math.min(95, (source / target) * 100));
  }

  function roundCasePrice(value) {
    const raw = Math.max(15, Math.min(500, value));
    const step = raw < 50 ? 5 : raw < 100 ? 10 : raw < 250 ? 25 : 50;
    return Math.max(15, Math.round(raw / step) * step);
  }

  function calibrateCases() {
    const sourceCases = window.cases;
    if (!sourceCases || typeof sourceCases !== 'object') return;
    for (const [key, items] of Object.entries(sourceCases)) {
      const normalized = normalizedCaseItems(items);
      sourceCases[key] = normalized;
      const expectedValue = normalized.reduce((sum, item) => {
        return sum + parsePrice(item) * (uniformItemChance(normalized, item) / 100);
      }, 0);
      CASE_PRICES[key] = roundCasePrice(expectedValue / TARGET_RTP);
    }
    if (window.casePrices && typeof window.casePrices === 'object') Object.assign(window.casePrices, CASE_PRICES);
  }

  function getCaseEconomy(items, caseKey) {
    const pool = Array.isArray(items) ? items : [];
    const price = Number(CASE_PRICES[caseKey] ?? window.casePrices?.[caseKey] ?? 0);
    const rows = pool.map(item => ({ item, chance: uniformItemChance(pool, item) }));
    const expectedValue = rows.reduce((sum, row) => sum + parsePrice(row.item) * row.chance / 100, 0);
    return { price, expectedValue, rtp: price > 0 ? expectedValue / price * 100 : 0, items: rows };
  }

  const getCaseItemChances = (items, caseKey) => {
    const economy = getCaseEconomy(items, caseKey);
    return economy.items.map(({ item, chance }) => ({ item, chance, rarityChance: rarityWeight(item?.rarity) }));
  };

  window.getRandomByChance = getRandomByChance;
  window.getItemChance = uniformItemChance;
  window.getRarityChance = rarityWeight;
  window.getUpgradeChance = upgradeChance;
  window.getCasePrice = key => Number(CASE_PRICES[key] ?? 0);
  window.getCaseEconomy = getCaseEconomy;
  window.getCaseItemChances = getCaseItemChances;
  window.EMOJI_DROPS_ECONOMY = Object.freeze({ STARTING_BALANCE, RARITY_ODDS, TARGET_RTP, TARGET_COUNTS, CASE_PRICES });

  const applyStartingBalance = () => {
    let appState = window.state;
    try { if (typeof state !== 'undefined') appState = state; } catch (_) {}
    if (!appState || appState.currentUser) return;
    if (appState.balance == null || appState.balance === 1000) appState.balance = STARTING_BALANCE;
    const balance = document.getElementById('balance');
    if (balance) balance.textContent = String(appState.balance);
  };

  const init = () => { calibrateCases(); applyStartingBalance(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();