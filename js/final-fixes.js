(() => {
  'use strict';

  // Final compatibility bridge. Router uses these names, while native
  // implementations expose openUpgrade/openSettings/openStats.
  if (typeof window.openUpgradeMenu !== 'function' && typeof window.openUpgrade === 'function') {
    window.openUpgradeMenu = (...args) => window.openUpgrade(...args);
  }
  if (typeof window.closeUpgradeMenu !== 'function' && typeof window.closeUpgrade === 'function') {
    window.closeUpgradeMenu = (...args) => window.closeUpgrade(...args);
  }
  if (typeof window.openSettings !== 'function') {
    window.openSettings = () => {
      const node = document.getElementById('settingsOverlay');
      if (!node) return;
      node.hidden = false; node.style.display = 'flex'; node.setAttribute('aria-hidden','false');
      document.body.classList.add('modal-open');
    };
  }
  if (typeof window.openStats !== 'function') {
    window.openStats = () => {
      const node = document.getElementById('statsOverlay');
      if (!node) return;
      node.hidden = false; node.style.display = 'flex'; node.setAttribute('aria-hidden','false');
      document.body.classList.add('modal-open');
    };
  }

  const CASE_PRICES = Object.freeze({ transport:15, animals:25, food:40, nature:65, moves:90, smile:130, sport:250, games:500 });
  function syncCasePrices() {
    document.querySelectorAll('.case').forEach(card => {
      const onclick = card.getAttribute('onclick') || '';
      const match = onclick.match(/openCasePage\(['"]([^'"]+)['"]\)/i);
      const id = match?.[1]?.toLowerCase();
      const price = CASE_PRICES[id];
      if (!price) return;
      const node = card.querySelector('.new-price,.case-price,[data-price]');
      if (!node) return;
      const target = node.classList.contains('case-price') ? node.querySelector('.new-price') : node;
      if (target) target.textContent = `${price}₽`;
    });
  }
  syncCasePrices();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncCasePrices, { once:true });
})();
