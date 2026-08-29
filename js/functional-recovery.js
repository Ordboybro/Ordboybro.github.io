(() => {
  'use strict';

  // Keep legacy inline handlers working while routing them to the current UI.
  if (typeof window.openUpgrade === 'function') {
    window.openUpgradeMenu = (...args) => window.openUpgrade(...args);
  }
  if (typeof window.closeUpgrade === 'function') {
    window.closeUpgradeMenu = (...args) => window.closeUpgrade(...args);
  }

  // The old search implementation switched grid cards to display:flex when a
  // match was found, which destroys the card grid geometry. Use hidden state
  // instead so the card keeps its grid-item layout when visible.
  window.searchCases = function searchCasesFixed() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.trim().toLocaleLowerCase('ru-RU');
    document.querySelectorAll('.case').forEach(card => {
      const name = card.querySelector('.case-name')?.textContent?.toLocaleLowerCase('ru-RU') || '';
      card.hidden = query.length > 0 && !name.includes(query);
    });
  };

  // The legacy Upgrade handler used a hard-coded 48% result. Route old inline
  // calls to the maintained Upgrade UI instead of keeping a second probability
  // implementation alive.
  if (typeof window.openUpgrade === 'function') {
    window.startUpgrade = (...args) => window.openUpgrade(...args);
  }

  // Avoid duplicate live-drop observers from old polish generations.
  document.documentElement.dataset.functionalRecovery = '1';
})();
