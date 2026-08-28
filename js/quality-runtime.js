(() => {
  'use strict';

  const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const qs = (s, root = document) => root.querySelector(s);

  function setSearchAttributes() {
    const input = qs('#searchInput');
    if (!input) return;
    input.setAttribute('type', 'search');
    input.setAttribute('name', 'case-search');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('data-lpignore', 'true');
    input.setAttribute('data-1p-ignore', 'true');
  }

  function animatePage(page) {
    if (!page || prefersReduced() || typeof page.animate !== 'function') return;
    page.animate([
      { opacity: 0, transform: 'translateY(12px) scale(.985)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  function installLiveMotion() {
    const original = window.addLiveDrop;
    if (typeof original !== 'function' || original.__qualityWrapped) return;

    const wrap = (username, item) => {
      const container = qs('#liveContainer');
      if (!container) return original(username, item);

      const before = new Set(container.children);
      original(username, item);
      const added = [...container.children].find(el => !before.has(el));
      if (!added) return;

      added.classList.add('quality-live-enter');
      added.style.setProperty('--live-start-x', '-115%');
      added.style.willChange = 'transform, opacity';

      if (!prefersReduced()) {
        requestAnimationFrame(() => added.classList.add('quality-live-enter-active'));
        added.addEventListener('transitionend', () => { added.style.willChange = 'auto'; }, { once: true });
      } else {
        added.classList.add('quality-live-enter-active');
        added.style.willChange = 'auto';
      }
    };
    wrap.__qualityWrapped = true;
    window.addLiveDrop = wrap;
  }

  function installCaseOpening() {
    const originalPage = window.openCasePage;
    if (typeof originalPage === 'function' && !originalPage.__qualityWrapped) {
      const wrapPage = (type) => {
        originalPage(type);
        animatePage(qs('#openPage'));
        requestAnimationFrame(() => {
          qs('#multiRouletteContainer')?.querySelectorAll('.multi-roulette').forEach((r, i) => {
            r.style.setProperty('--roulette-delay', `${i * 45}ms`);
            r.classList.add('quality-roulette-ready');
          });
        });
      };
      wrapPage.__qualityWrapped = true;
      window.openCasePage = wrapPage;
    }

    const originalProfile = window.openProfile;
    if (typeof originalProfile === 'function' && !originalProfile.__qualityWrapped) {
      const wrapProfile = (...args) => {
        originalProfile(...args);
        animatePage(qs('#profilePage'));
      };
      wrapProfile.__qualityWrapped = true;
      window.openProfile = wrapProfile;
    }
  }

  function installGlobalMotion() {
    const style = document.createElement('style');
    style.id = 'emoji-quality-runtime-style';
    style.textContent = `
      .quality-live-enter {
        transform: translate3d(var(--live-start-x, -115%),0,0);
        opacity: 0;
        transition: transform 520ms cubic-bezier(.16,1,.3,1), opacity 360ms ease;
      }
      .quality-live-enter-active { transform: translate3d(0,0,0); opacity: 1; }
      .quality-roulette-ready { animation: qualityRouletteIn 420ms cubic-bezier(.16,1,.3,1) var(--roulette-delay,0ms) both; }
      @keyframes qualityRouletteIn {
        from { opacity: 0; transform: translate3d(0,10px,0); }
        to { opacity: 1; transform: translate3d(0,0,0); }
      }
      button, .top-btn, .case, .amount-btn, .inventory-item { -webkit-tap-highlight-color: transparent; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          scroll-behavior: auto !important;
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function boot() {
    setSearchAttributes();
    installGlobalMotion();
    installLiveMotion();
    installCaseOpening();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
