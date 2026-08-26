(() => {
  'use strict';

  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const edge = () => Number(window.EMOJI_DROPS_ECONOMY?.upgrade?.houseEdge ?? 0.04);
  const allItems = () => Object.values(window.cases || {}).flatMap(items => Array.isArray(items) ? items : []);
  const user = () => window.state?.currentUser || null;
  const inventory = () => Array.isArray(user()?.inventory) ? user().inventory : [];
  const findTarget = button => {
    if (!button) return null;
    const emoji = button.querySelector('.ed-u-emoji')?.textContent?.trim();
    const price = money(button.querySelector('.ed-u-price')?.textContent);
    return allItems().find(item => item.emoji === emoji && money(item.price) === price) || null;
  };

  let busy = false;

  function selectedItems(overlay) {
    const buttons = [...overlay.querySelectorAll('#edUInventory .ed-u-item')];
    const inv = inventory();
    return buttons
      .map((button, index) => ({ button, item: inv[index] }))
      .filter(entry => entry.button.classList.contains('selected') && entry.item)
      .map(entry => entry.item);
  }

  function getChance(source, target) {
    const fn = window.EMOJI_DROPS_ECONOMY?.getUpgradeChance;
    if (typeof fn === 'function') return fn(source, target);
    if (!source || !target || target <= source) return 0;
    return Math.max(1, Math.min(95, (source / target) * (1 - edge()) * 100));
  }

  function sync(overlay) {
    if (!overlay || !overlay.classList.contains('open')) return;
    const start = overlay.querySelector('#edUStart');
    const selected = selectedItems(overlay);
    const target = findTarget(overlay.querySelector('#edUTargets .ed-u-item.selected'));
    const sourceValue = selected.reduce((sum, item) => sum + money(item.price), 0);
    const targetValue = money(target?.price);
    const chance = getChance(sourceValue, targetValue);
    const chanceEl = overlay.querySelector('#edUChance');
    const multEl = overlay.querySelector('#edUMult');
    if (chanceEl) chanceEl.textContent = chance ? `Шанс ${chance.toFixed(1)}% · edge ${(edge() * 100).toFixed(0)}%` : 'Выберите цель';
    if (multEl) multEl.textContent = sourceValue && targetValue ? `${(targetValue / sourceValue).toFixed(2)}x` : '1.00x';
    if (start) {
      start.disabled = busy || !selected.length || !target || targetValue <= sourceValue || chance <= 0;
      start.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        run(overlay);
      };
    }
  }

  async function run(overlay) {
    if (busy) return;
    const selected = selectedItems(overlay);
    const target = findTarget(overlay.querySelector('#edUTargets .ed-u-item.selected'));
    const sourceValue = selected.reduce((sum, item) => sum + money(item.price), 0);
    const targetValue = money(target?.price);
    const chance = getChance(sourceValue, targetValue);
    if (!selected.length || !target || targetValue <= sourceValue || !chance) return;

    busy = true;
    sync(overlay);
    const wheel = overlay.querySelector('#edUWheel');
    const result = overlay.querySelector('#edUResult');
    if (result) result.className = 'ed-u-result';
    if (wheel) {
      wheel.classList.add('spinning');
      wheel.style.transform = `rotate(${1440 + Math.random() * 720}deg)`;
    }
    await new Promise(resolve => setTimeout(resolve, 1900));

    const success = Math.random() * 100 < chance;
    if (wheel) {
      wheel.classList.remove('spinning');
      wheel.style.transform = 'rotate(0deg)';
    }

    const current = user();
    if (!current) { busy = false; sync(overlay); return; }
    const chosen = new Set(selected);
    current.inventory = inventory().filter(item => !chosen.has(item));
    if (success) {
      current.inventory.push({ ...target });
      if (window.state?.stats) window.state.stats.upgrades = (window.state.stats.upgrades || 0) + 1;
    }
    if (typeof saveStats === 'function') saveStats();
    if (typeof saveUsers === 'function') saveUsers();
    if (typeof renderInventory === 'function') renderInventory();

    if (result) {
      result.className = `ed-u-result ${success ? 'success' : 'fail'}`;
      result.innerHTML = success
        ? `<strong>✓ УСПЕШНЫЙ АПГРЕЙД</strong><br>${target.emoji} · ${targetValue.toLocaleString('ru-RU')}₽<br><small>Шанс был ${chance.toFixed(1)}%</small>`
        : `<strong>✕ НЕ УДАЛОСЬ</strong><br>Предметы на ${sourceValue.toLocaleString('ru-RU')}₽ потеряны<br><small>Шанс был ${chance.toFixed(1)}%</small>`;
    }

    busy = false;
    // Original Upgrade state can still contain old selected references. Reopen cleanly after a result.
    setTimeout(() => sync(overlay), 0);
  }

  function patchOverlay() {
    const overlay = document.getElementById('edUpgrade2');
    if (!overlay || overlay.dataset.economyPatched === '1') return;
    overlay.dataset.economyPatched = '1';
    overlay.addEventListener('click', () => queueMicrotask(() => sync(overlay)));
    const observer = new MutationObserver(() => sync(overlay));
    observer.observe(overlay, { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] });
    sync(overlay);
  }

  function install() {
    const originalOpen = window.openUpgradeMenu;
    if (typeof originalOpen === 'function' && !originalOpen.__economyWrapped) {
      const wrapped = function (...args) {
        const value = originalOpen.apply(this, args);
        queueMicrotask(() => { patchOverlay(); sync(document.getElementById('edUpgrade2')); });
        return value;
      };
      wrapped.__economyWrapped = true;
      window.openUpgradeMenu = wrapped;
    }
    patchOverlay();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
