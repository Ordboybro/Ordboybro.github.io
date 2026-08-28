/* EmojiDrops Device Quality Manager.
 * Adapts visual effects to the device/browser without changing game logic.
 * Uses a short passive frame probe to catch devices that look capable on paper
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
  let measuredFps = null;
  let probeStarted = false;

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

  window.emojiDropsQuality = Object.freeze({
    get quality() { return quality; },
    get fps() { return measuredFps; },
    reducedMotion: reduceMotion,
    memory,
    cores,
    dpr,
    saveData,
    effectiveType
  });

  function startFrameProbe() {
    if (probeStarted || reduceMotion || document.visibilityState !== 'visible') return;
    probeStarted = true;

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
      measuredFps = Math.round((frames * 1000) / elapsed);

      if (measuredFps < 42) setQuality('low');
      else if (measuredFps < 54 && quality === 'high') setQuality('medium');

      window.dispatchEvent(new CustomEvent('emojiDropsQualityReady', {
        detail: Object.freeze({ quality, fps: measuredFps })
      }));

      if (rafId) cancelAnimationFrame(rafId);
    };

    rafId = requestAnimationFrame(sample);
  }

  if (!reduceMotion) {
    if (document.visibilityState === 'visible') {
      startFrameProbe();
    } else {
      const onVisibility = () => {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', onVisibility);
        startFrameProbe();
      };
      document.addEventListener('visibilitychange', onVisibility, { passive: true });
    }
  } else {
    window.dispatchEvent(new CustomEvent('emojiDropsQualityReady', {
      detail: Object.freeze({ quality: 'low', fps: null })
    }));
  }
})();
