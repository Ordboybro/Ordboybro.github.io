(() => {
  'use strict';
  // Minimal last guard. It only normalizes stale page state; functional recovery
  // is kept in one dedicated controller instead of adding more competing handlers.
  const byId = id => document.getElementById(id);
  const close = id => {
    const element = byId(id);
    if (element) {
      element.style.display = 'none';
      element.setAttribute('aria-hidden', 'true');
    }
  };

  function normalize() {
    const state = window.state;
    if (state?.isSpinning) return;
    const page = byId('openPage');
    if (page && page.style.display === 'none') page.setAttribute('aria-hidden', 'true');
  }

  function loadRecovery() {
    if (byId('ed-recovery-controller')) return;
    const script = document.createElement('script');
    script.id = 'ed-recovery-controller';
    script.src = 'js/recovery-fixes.js?v=20260827recovery1';
    script.defer = true;
    script.onerror = () => console.error('[EmojiDrops] recovery controller failed to load');
    document.body.appendChild(script);
  }

  window.addEventListener('pageshow', normalize, { passive: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      normalize();
      loadRecovery();
    }, { once: true });
  } else {
    normalize();
    loadRecovery();
  }
})();
