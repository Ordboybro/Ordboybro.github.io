/* EmojiDrops Device Quality Manager.
 * Chooses rendering effects from measured capability, not a browser brand.
 * It never changes game logic or economy; it only toggles visual quality.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const nav = navigator;
  const connection = nav.connection || nav.webkitConnection || nav.mozConnection;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const memory = Number(nav.deviceMemory || 0);
  const cores = Number(nav.hardwareConcurrency || 0);
  const width = Math.max(window.innerWidth || 0, window.screen?.width || 0);
  const dpr = Math.min(3, Math.max(1, Number(window.devicePixelRatio || 1)));
  const saveData = Boolean(connection?.saveData);
  const slowNetwork = /(^|-)2g$|3g/i.test(String(connection?.effectiveType || ''));

  let score = 0;
  if (memory >= 8) score += 3; else if (memory >= 4) score += 2; else if (memory >= 2) score += 1;
  if (cores >= 12) score += 3; else if (cores >= 8) score += 2; else if (cores >= 4) score += 1;
  if (width >= 2200) score += 1;
  if (dpr >= 2.5) score -= 1;
  if (saveData || slowNetwork) score -= 2;
  if (reduceMotion) score = 0;

  const quality = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
  root.dataset.edQuality = quality;
  root.classList.add(`ed-quality-${quality}`);
  if (reduceMotion) root.classList.add('ed-reduced-motion');

  // Public diagnostic state for settings/debugging without exposing identifying data.
  window.emojiDropsQuality = Object.freeze({ quality, reducedMotion: reduceMotion, memory, cores, dpr });

  const applyVisibility = () => {
    root.style.setProperty('--ed-particle-count', quality === 'high' ? '1' : quality === 'medium' ? '.65' : '.35');
    root.style.setProperty('--ed-glow-strength', quality === 'high' ? '1' : quality === 'medium' ? '.65' : '.35');
  };

  applyVisibility();
  window.addEventListener('resize', applyVisibility, { passive: true });
})();
