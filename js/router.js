(() => {
  'use strict';

  const normalize = (path = location.pathname) => (path.replace(/\/+/g, '/').replace(/\/$/, '') || '/');
  const route = () => {
    const path = normalize();
    const m = path.match(/^\/case\/([a-z0-9_-]+)$/i);
    if (m) return { name: 'case', id: m[1].toLowerCase() };
    if (path === '/cases') return { name: 'cases' };
    if (path === '/profile') return { name: 'profile' };
    if (path === '/profile/statistics') return { name: 'statistics' };
    if (path === '/profile/history') return { name: 'history' };
    if (path === '/profile/settings') return { name: 'settings' };
    if (path === '/upgrade') return { name: 'upgrade' };
    if (path === '/battle') return { name: 'battle' };
    return { name: 'home' };
  };

  const navigate = (path, replace = false) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    if (normalize() !== normalize(target)) (replace ? history.replaceState : history.pushState).call(history, {}, '', target);
    window.scrollTo({ top: 0, behavior: 'instant' });
    render();
  };

  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const setVisible = (el, visible, display = '') => {
    if (!el) return;
    el.style.display = visible ? display : 'none';
    el.setAttribute('aria-hidden', visible ? 'false' : 'true');
  };
  const call = (name, ...args) => typeof window[name] === 'function' ? window[name](...args) : undefined;
  let nativeOpenCasePage = null;

  function closeTransient() {
    ['profilePage','settingsOverlay','statsOverlay','historyOverlay','upgradePage','routeRoot'].forEach(id => setVisible(document.getElementById(id), false));
    const open = document.getElementById('openPage');
    if (open) setVisible(open, false);
    document.body.classList.remove('case-route');
  }

  function restoreHomeChrome() {
    setVisible(q('body > header'), true);
    setVisible(q('body > .top-line'), true);
    setVisible(q('body > .search-wrap'), true);
    setVisible(q('body > .live-drops-bar'), true);
  }

  function showCaseRoute(id) {
    const main = q('body > main');
    const casesGrid = q('main > .cases');
    const page = document.getElementById('openPage');
    setVisible(main, true);
    setVisible(casesGrid, false);
    setVisible(q('body > .search-wrap'), false);
    setVisible(q('body > .live-drops-bar'), false);
    setVisible(q('body > header'), false);
    setVisible(q('body > .top-line'), false);
    document.body.classList.add('case-route');
    setVisible(page, true, 'flex');
    window.__edRouteRenderingCase = true;
    try { (nativeOpenCasePage || window.openCasePage)?.(id); }
    finally { window.__edRouteRenderingCase = false; }
    setVisible(page, true, 'flex');
  }

  function render() {
    const r = route();
    const main = q('body > main');
    const casesGrid = q('main > .cases');
    const search = q('body > .search-wrap');

    closeTransient();
    restoreHomeChrome();

    if (r.name === 'home' || r.name === 'cases') {
      setVisible(main, true);
      setVisible(casesGrid, true);
      if (r.name === 'cases') {
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        qa('.case').forEach(card => card.style.display = 'flex');
      }
      return;
    }

    if (r.name === 'case') { showCaseRoute(r.id); return; }

    setVisible(main, false);
    setVisible(search, false);
    setVisible(q('body > .live-drops-bar'), false);
    setVisible(q('body > header'), false);
    setVisible(q('body > .top-line'), false);

    if (r.name === 'profile') {
      if (!window.state?.currentUser) { navigate('/'); setTimeout(() => call('openAuth','login'), 0); return; }
      call('openProfile');
      setVisible(document.getElementById('profilePage'), true, 'flex');
      return;
    }
    if (['statistics','history','settings'].includes(r.name) && !window.state?.currentUser) {
      navigate('/'); setTimeout(() => call('openAuth','login'), 0); return;
    }
    if (r.name === 'statistics') { call('openStats'); setVisible(document.getElementById('statsOverlay'), true, 'flex'); return; }
    if (r.name === 'history') { call('openHistory'); setVisible(document.getElementById('historyOverlay'), true, 'flex'); return; }
    if (r.name === 'settings') { call('openSettings'); setVisible(document.getElementById('settingsOverlay'), true, 'flex'); return; }
    if (r.name === 'upgrade') { call('openUpgradeMenu'); setVisible(document.getElementById('upgradePage'), true, 'flex'); return; }
    if (r.name === 'battle') {
      let root = document.getElementById('routeRoot');
      if (!root) { root = document.createElement('main'); root.id = 'routeRoot'; document.body.appendChild(root); }
      root.style.display = 'block';
      root.innerHTML = '<section class="route-page"><div class="route-page-head"><button class="ed-route-back" data-back>← Назад</button><div><div class="route-kicker">EMOJI DROPS</div><h1>Case Battle</h1></div></div><div class="route-empty"><div class="route-empty-icon">⚔️</div><h2>Case Battle</h2><p>Режим развивается как отдельная игровая страница.</p></div></section>';
    }
  }

  function installCaseBridge() {
    if (nativeOpenCasePage || typeof window.openCasePage !== 'function') return;
    nativeOpenCasePage = window.openCasePage;
    window.openCasePage = function(id) {
      if (window.__edRouteRenderingCase) return nativeOpenCasePage.call(this, id);
      navigate(`/case/${encodeURIComponent(id)}`);
    };
    const nativeClose = window.closePage;
    if (typeof nativeClose === 'function') {
      window.closePage = function() {
        if (route().name === 'case') { navigate('/'); return; }
        return nativeClose.apply(this, arguments);
      };
    }
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('[data-route]');
    if (link) { e.preventDefault(); e.stopImmediatePropagation(); navigate(link.dataset.route); return; }
    if (e.target.closest('[data-back]')) { e.preventDefault(); e.stopImmediatePropagation(); history.length > 1 ? history.back() : navigate('/'); return; }
    const profile = e.target.closest('#profileBtn,.profile-box');
    if (profile && window.state?.currentUser) { e.preventDefault(); e.stopImmediatePropagation(); navigate('/profile'); return; }
    const card = e.target.closest('.case');
    if (card && !e.target.closest('button,input')) {
      const id = card.getAttribute('data-case') || card.querySelector('.case-name')?.textContent?.trim().toLowerCase();
      if (id && window.cases?.[id]) { e.preventDefault(); e.stopImmediatePropagation(); navigate(`/case/${encodeURIComponent(id)}`); }
    }
  }, true);

  window.addEventListener('popstate', render);
  window.EmojiDropsRouter = { navigate, render, route };
  window.openProfileRoute = () => navigate('/profile');
  window.openCasesRoute = () => navigate('/cases');
  window.openCaseRoute = id => navigate(`/case/${encodeURIComponent(id)}`);
  window.openUpgradeRoute = () => navigate('/upgrade');
  window.openStatsRoute = () => navigate('/profile/statistics');
  window.openHistoryRoute = () => navigate('/profile/history');
  window.openSettingsRoute = () => navigate('/profile/settings');

  const init = () => {
    installCaseBridge();
    setTimeout(() => { installCaseBridge(); render(); }, 0);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();