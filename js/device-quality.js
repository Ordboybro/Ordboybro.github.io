/* EmojiDrops Device Quality Manager.
 * Adapts visual effects to the device/browser without changing game logic.
 * Uses a short, passive frame probe to catch devices that look capable on paper
 * but cannot sustain the visual workload. No identifying device data is stored.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const nav = navigator;
  const connection = nav.connection || nav.webkitConnection || nav.mozConnection;
  const reduceMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const memory = Number(nav.deviceMemory || 0);
  const cores = Number(nav.hardwareConcurrency || 0);
  const width = Math.max(window.innerWidth || 0, window.screen?.width || 0);
  const dpr = Math.min(3, Math.max(1, Number(window.devicePixelRatio || 1)));
  const saveData = Boolean(connection?.saveData);
  const effectiveType = String(connection?.effectiveType || '').toLowerCase();
  const slowNetwork = /(^|-)2g$|3g/.test(effectiveType);

  let score = 0;
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else if (memory >= 2) score += 1;

  if (cores >= 12) score += 3;
  else if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;

  if (width >= 2200) score += 1;
  if (dpr >= 2.5) score -= 1;
  if (saveData || slowNetwork) score -= 2;
  if (reduceMotion) score = 0;

  const baseQuality = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
  let quality = baseQuality;

  function setQuality(nextQuality) {
    if (quality === nextQuality && root.classList.contains(`ed-quality-${nextQuality}`)) return;

    root.classList.remove('ed-quality-low', 'ed-quality-medium', 'ed-quality-high');
    root.classList.add(`ed-quality-${nextQuality}`);
    root.dataset.edQuality = nextQuality;
    quality = nextQuality;

    root.style.setProperty('--ed-particle-count', nextQuality === 'high' ? '1' : nextQuality === 'medium' ? '.65' : '.35');
    root.style.setProperty('--ed-glow-strength', nextQuality === 'high' ? '1' : nextQuality === 'medium' ? '.65' : '.35');
  }

  setQuality(quality);
  if (reduceMotion) root.classList.add('ed-reduced-motion');

  // Keep only non-identifying capability information available to the app.
  window.emojiDropsQuality = Object.freeze({
    get quality() { return quality; },
    reducedMotion: reduceMotion,
    memory,
    cores,
    dpr
  });

  // A short real-frame probe catches thermal throttling, low-power devices and
  // browser conditions that static hardware hints cannot describe reliably.
  // It runs once, only while the page is visible, and stops immediately when
  // enough samples are collected.
  if (!reduceMotion && document.visibilityState === 'visible') {
    let frames = 0;
    let start = 0;
    let rafId = 0;
    const sampleDuration = 900;

    const sample = timestamp => {
      if (!start) start = timestamp;
      frames += 1;

      if (timestamp - start < sampleDuration) {
        rafId = requestAnimationFrame(sample);
        return;
      }

      const elapsed = Math.max(1, timestamp - start);
      const fps = (frames * 1000) / elapsed;

      if (fps < 42) setQuality('low');
      else if (fps < 54 && quality === 'high') setQuality('medium');

      window.dispatchEvent(new CustomEvent('emojiDropsQualityReady', {
        detail: Object.freeze({ quality, fps: Math.round(fps) })
      }));
    };

    rafId = requestAnimationFrame(sample);

    const stopProbe = () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', stopProbe);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') stopProbe();
    }, { once: true, passive: true });
  }
})();
