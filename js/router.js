(() => {
  'use strict';

  const normalize = (path = location.pathname) => {
    const clean = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    return clean;
  };

  const route = () => {
    const path = normalize();
    const caseMatch = path.match(/^\/case\/([a-z0-9_-]+)$/i);
    if (caseMatch) return { name: 'case', id: caseMatch[1].toLowerCase() };
    if (path === '/cases') return { name: 'cases' };
    if (path === '/profile') return { name: 'profile' };
    if (path === '/profile/statistics') return { name: 'statistics' };
    if (path === '/profile/history') return { name: 'history' };
    if (path === '/profile/settings') return { name: 'settings' };
    if (path === '/upgrade') return { name: 'upgrade' };
    if (path === '/battle') return { name: 'battle' };
    return { name: 'home' };
  };

  const hide = (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      el.dataset.routerHidden = '1';
      el.style.display = 'none';
    });
  };

  const show = (el, display = 'flex') => {
    if (!el) return;
    el.dataset.routerHidden = '0';
    el.style.display = display;
    el.setAttribute('aria-hidden', 'false');
  };

  function ensurePageRoot() {
    let root = document.getElementById('routeRoot');
    if (root) return root;
    root = document.createElement('main');
    root.id = 'routeRoot';
    root.className = 'route-root';
    root.setAttribute('aria-live', 'polite');
    document.body.appendChild(root);
    return root;
  }

  function navigate(path, replace = false) {
    const target = path.startsWith('/') ? path : `/${path}`;
    if (replace) history.replaceState({}, '', target);
    else history.pushState({}, '', target);
    render();
  }

  function pageTransition() {
    const root = ensurePageRoot();
    root.classList.remove('route-enter');
    void root.offsetWidth;
    root.classList.add('route-enter');
  }

  function render() {
    const r = route();
    const root = ensurePageRoot();

    hide('#openPage, #profilePage, #upgradePage, #settingsOverlay, #statsOverlay, #historyOverlay, #routeRoot');
    document.querySelectorAll('body > header, body > .top-line, body > .search-wrap, body > main, body > .live-drops-bar').forEach(el => el.style.display = 'none');
    root.style.display = 'block';
    root.innerHTML = '';

    if (r.name === 'home' || r.name === 'cases') {
      const header = document.querySelector('body > header');
      const line = document.querySelector('body > .top-line');
      const search = document.querySelector('body > .search-wrap');
      const main = document.querySelector('body > main');
      const live = document.querySelector('body > .live-drops-bar');
      if (header) header.style.display = '';
      if (line) line.style.display = '';
      if (search) search.style.display = '';
      if (main) main.style.display = '';
      if (live) live.style.display = '';
      if (r.name === 'cases') {
        document.querySelectorAll('.case').forEach(c => c.style.display = 'flex');
        document.getElementById('searchInput')?.focus({ preventScroll: true });
      }
      pageTransition();
      return;
    }

    if (r.name === 'case') {
      if (typeof openCasePage === 'function') openCasePage(r.id);
      const page = document.getElementById('openPage');
      show(page);
      document.body.classList.add('case-route');
      pageTransition();
      return;
    }

    if (r.name === 'profile') {
      if (typeof openProfile === 'function') openProfile();
      const page = document.getElementById('profilePage');
      show(page);
      pageTransition();
      return;
    }

    if (r.name === 'statistics') {
      if (!state.currentUser) return navigate('/profile');
      if (typeof openStats === 'function') openStats();
      show(document.getElementById('statsOverlay'));
      pageTransition();
      return;
    }

    if (r.name === 'history') {
      if (!state.currentUser) return navigate('/profile');
      if (typeof openHistory === 'function') openHistory();
      show(document.getElementById('historyOverlay'));
      pageTransition();
      return;
    }

    if (r.name === 'settings') {
      if (!state.currentUser) return navigate('/profile');
      if (typeof openSettings === 'function') openSettings();
      show(document.getElementById('settingsOverlay'));
      pageTransition();
      return;
    }

    if (r.name === 'upgrade') {
      if (typeof openUpgradeMenu === 'function') openUpgradeMenu();
      const page = document.getElementById('upgradePage');
      show(page);
      pageTransition();
      return;
    }

    if (r.name === 'battle') {
      root.innerHTML = `<section class="route-page"><div class="route-page-head"><button class="ed-route-back" data-back>← Назад</button><div><div class="route-kicker">EMOJI DROPS</div><h1>Case Battle</h1></div></div><div class="route-empty"><div class="route-empty-icon">⚔️</div><h2>Case Battle</h2><p>Боевой режим готовится к отдельному экрану.</p></div></section>`;
      pageTransition();
    }
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('[data-route]');
    if (link) {
      e.preventDefault();
      navigate(link.dataset.route);
      return;
    }
    if (e.target.closest('[data-back]')) {
      e.preventDefault();
      if (history.length > 1) history.back(); else navigate('/');
    }
  });

  window.addEventListener('popstate', render);
  window.EmojiDropsRouter = { navigate, render, route };
  window.openProfileRoute = () => navigate('/profile');
  window.openCasesRoute = () => navigate('/cases');
  window.openCaseRoute = id => navigate(`/case/${encodeURIComponent(id)}`);
  window.openUpgradeRoute = () => navigate('/upgrade');
  window.openStatsRoute = () => navigate('/profile/statistics');
  window.openHistoryRoute = () => navigate('/profile/history');
  window.openSettingsRoute = () => navigate('/profile/settings');

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(render, 0);
  });
})();
