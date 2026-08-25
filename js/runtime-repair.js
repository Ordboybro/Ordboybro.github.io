(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const rarityColor = (rarity) => window.rarities?.[rarity]?.color || '#ff7b00';

  // Search must never restore browser/account credentials into the case filter.
  function repairSearch() {
    const input = $('#searchInput');
    if (!input) return;
    input.type = 'search';
    input.name = 'emoji_drops_case_filter';
    input.autocomplete = 'new-password';
    input.setAttribute('data-lpignore', 'true');
    input.setAttribute('data-1p-ignore', 'true');
    input.setAttribute('data-bwignore', 'true');
    input.value = '';
  }
  window.addEventListener('pageshow', repairSearch);
  window.addEventListener('load', () => setTimeout(repairSearch, 0));
  repairSearch();

  // The old app still creates live drops itself. Observe every insertion and turn it
  // into the same animated, capped feed instead of letting the legacy renderer win.
  function repairLiveDrops() {
    const container = $('#liveContainer');
    if (!container || container.dataset.repaired === '1') return;
    container.dataset.repaired = '1';

    let scheduled = false;
    const previous = new Map();
    const snapshot = () => {
      previous.clear();
      [...container.children].forEach(el => previous.set(el, el.getBoundingClientRect()));
    };
    snapshot();

    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const children = [...container.children];
        while (children.length > 25) {
          const last = children.pop();
          last?.remove();
        }
        [...container.children].forEach(el => {
          const old = previous.get(el);
          const now = el.getBoundingClientRect();
          if (!old) {
            el.classList.remove('ed-live-enter');
            void el.offsetWidth;
            el.classList.add('ed-live-enter');
          } else {
            const dx = old.left - now.left;
            if (Math.abs(dx) > 0.5) {
              el.style.transition = 'none';
              el.style.transform = `translate3d(${dx}px,0,0)`;
              requestAnimationFrame(() => {
                el.style.transition = 'transform .42s cubic-bezier(.22,1,.36,1)';
                el.style.transform = '';
              });
            }
          }
          const rarity = [...el.classList].find(c => window.rarities?.[c]);
          if (rarity) el.style.borderColor = rarityColor(rarity);
        });
        snapshot();
      });
    });
    observer.observe(container, { childList: true });
  }
  repairLiveDrops();
  window.addEventListener('load', repairLiveDrops);

  // Keep amount controls and visible roulette count in sync even when the legacy
  // inline handlers rebuild the buttons.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#openAmounts .amount-btn');
    if (!button) return;
    requestAnimationFrame(() => {
      $$('#openAmounts .amount-btn').forEach(btn => btn.classList.toggle('active', btn === button || Number(btn.textContent) === Number(window.state?.openAmount)));
      window.createRoulettes?.();
    });
  }, true);

  // Normalize profile/navigation after legacy functions have run.
  const normalize = () => {
    const user = window.state?.currentUser;
    const login = $('#loginBtn');
    const register = $('#registerBtn');
    const profile = $('#profileBtn');
    const logout = $('#logoutBtn');
    if (user) {
      if (login) login.style.display = 'none';
      if (register) register.style.display = 'none';
      if (profile) profile.style.display = 'block';
      if (logout) logout.style.display = 'block';
    }
    const page = $('#profilePage');
    if (page && page.style.display !== 'none') {
      page.style.overflowY = 'auto';
      page.style.overflowX = 'hidden';
    }
  };
  setInterval(normalize, 400);
  normalize();

  // Keep the case page structurally clean whenever it opens.
  const originalOpenCasePage = window.openCasePage;
  if (typeof originalOpenCasePage === 'function') {
    window.openCasePage = function(type) {
      const result = originalOpenCasePage(type);
      requestAnimationFrame(() => {
        const page = $('#openPage');
        if (page) {
          page.scrollTop = 0;
          page.style.overflowX = 'hidden';
        }
        window.createRoulettes?.();
      });
      return result;
    };
  }
})();