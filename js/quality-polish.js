(() => {
  'use strict';

  // Visual/motion layer only. It must never own navigation, case opening,
  // Upgrade mechanics, economy, inventory or routing.
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  function animateIn(element, options = {}) {
    if (!(element instanceof HTMLElement) || reduced()) return;
    const animation = element.animate([
      { opacity: 0, transform: options.from || 'translate3d(0,10px,0) scale(.985)' },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
    ], {
      duration: options.duration ?? 260,
      easing: options.easing || 'cubic-bezier(.16,1,.3,1)',
      fill: 'both'
    });
    animation.addEventListener?.('finish', () => animation.cancel(), { once: true });
  }

  function normalizeSearchFields() {
    document.querySelectorAll('input[type="search"], input[name*="search" i], input[placeholder*="кейс" i], input[placeholder*="поиск" i]').forEach(input => {
      input.type = 'search';
      input.name = 'case-search';
      input.autocomplete = 'off';
      input.autocapitalize = 'none';
      input.autocorrect = 'off';
      input.spellcheck = false;
    });
  }

  function decorateWinPopup() {
    if (window.__emojiDropsWinMotion) return;
    const original = window.showWin;
    if (typeof original !== 'function') return;
    const wrapped = function showWinWithMotion(...args) {
      const result = original.apply(this, args);
      const popup = document.getElementById('winPopup');
      if (popup && !reduced()) {
        animateIn(popup, { duration: 320, from: 'translate3d(0,14px,0) scale(.94)' });
        const emoji = document.getElementById('winEmoji');
        emoji?.animate([
          { transform: 'scale(.72) rotate(-5deg)', opacity: .2 },
          { transform: 'scale(1.12) rotate(2deg)', opacity: 1, offset: .68 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 }
        ], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
      return result;
    };
    Object.defineProperty(wrapped, '__emojiDropsWinMotion', { value: true });
    window.showWin = wrapped;
    window.__emojiDropsWinMotion = true;
  }

  function observeLiveDrops() {
    if (document.documentElement.dataset.liveMotionReady === '1') return;
    const roots = document.querySelectorAll('.live-drops, #liveDrops, #liveContainer, #liveDropsContainer, .live-drops-container');
    if (!roots.length) return;
    document.documentElement.dataset.liveMotionReady = '1';
    const animateNode = node => {
      if (!(node instanceof HTMLElement) || node.dataset.motionReady === '1') return;
      node.dataset.motionReady = '1';
      if (!reduced()) node.classList.add('ed-live-enter');
    };
    roots.forEach(root => {
      [...root.children].forEach(animateNode);
      const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) for (const node of mutation.addedNodes) animateNode(node);
      });
      observer.observe(root, { childList: true });
    });
  }

  function addButtonMotion() {
    if (document.documentElement.dataset.buttonMotionReady === '1') return;
    document.documentElement.dataset.buttonMotionReady = '1';
    const set = (target, value) => {
      const button = target instanceof Element ? target.closest('button,.top-btn,.amount-btn') : null;
      if (button instanceof HTMLElement) button.style.willChange = value;
    };
    document.addEventListener('pointerdown', event => { if (!reduced()) set(event.target, 'transform'); }, { passive: true });
    const release = event => set(event.target, 'auto');
    document.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('pointercancel', release, { passive: true });
  }

  function pauseWhenHidden() {
    document.addEventListener('visibilitychange', () => {
      document.documentElement.classList.toggle('ed-page-hidden', document.hidden);
    }, { passive: true });
  }

  function init() {
    normalizeSearchFields();
    decorateWinPopup();
    observeLiveDrops();
    addButtonMotion();
    pauseWhenHidden();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
