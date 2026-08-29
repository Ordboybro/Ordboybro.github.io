(() => {
  'use strict';
  // Compatibility shim: the canonical economy lives in economy.js.
  const run = () => {
    if (typeof window.__emojiDropsCalibrate === 'function') window.__emojiDropsCalibrate();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
