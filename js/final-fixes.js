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
})();
