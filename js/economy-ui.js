/* EmojiDrops economy presentation layer. Uses the calibrated economy as the single source of truth. */
(() => {
  'use strict';

  const money = value => Number(String(value ?? 0).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const color = item => window.rarities?.[item?.rarity]?.color || '#ff7b00';
  const chanceFor = (items, item) => {
    const calculated = window.getItemChance?.(items, item);
    if (Number.isFinite(calculated)) return calculated;
    const legacy = Number(item?.dropChance);
    return Number.isFinite(legacy) ? legacy : 0;
  };

  window.renderCaseItems = function renderCaseItems() {
    const container = document.getElementById('caseItemsList');
    const items = window.state?.currentCase || [];
    if (!container) return;

    container.replaceChildren();
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'case-item-card';
      card.innerHTML = '<div class="case-item-emoji"></div><div class="case-item-rarity"></div><div class="case-item-price"></div><div class="case-item-chance"></div>';

      const emoji = card.querySelector('.case-item-emoji');
      emoji.textContent = item.emoji || '❔';
      emoji.style.border = `3px solid ${color(item)}`;

      const rarity = card.querySelector('.case-item-rarity');
      rarity.textContent = String(item.rarity || 'common').toUpperCase();
      rarity.style.color = color(item);

      card.querySelector('.case-item-price').textContent = `${money(item.price).toLocaleString('ru-RU')}₽`;
      const chance = chanceFor(items, item);
      card.querySelector('.case-item-chance').textContent = `${chance < 0.01 ? chance.toFixed(3) : chance.toFixed(2)}%`;

      container.appendChild(card);
    }
  };

  window.startUpgrade = function startUpgrade(sourceValue, targetValue, item) {
    const source = money(sourceValue ?? item?.price);
    const target = money(targetValue);
    const chance = window.getUpgradeChance?.(source, target)
      ?? Math.max(1, Math.min(95, (source / Math.max(target, 1)) * 96));
    const success = (window.crypto?.getRandomValues
      ? (() => { const b = new Uint32Array(1); window.crypto.getRandomValues(b); return (b[0] / 4294967296) * 100; })()
      : Math.random() * 100) < chance;

    const result = document.getElementById('upgradeResult');
    const emoji = document.getElementById('upgradeResultEmoji');
    const text = document.getElementById('upgradeResultText');
    if (result) result.style.display = 'flex';
    if (emoji) emoji.textContent = success ? '👑' : '💥';
    if (text) text.textContent = success
      ? `АПГРЕЙД УСПЕШЕН · ${chance.toFixed(1)}%`
      : `НЕ УДАЛОСЬ · ${chance.toFixed(1)}%`;

    return { success, chance };
  };
})();
