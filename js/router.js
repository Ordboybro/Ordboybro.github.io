(() => {
  'use strict';

  const normalize = (path = location.pathname) => {
    const value = String(path).replace(/\\+/g, '/').replace(/\/$/, '');
    return value || '/';
  };

  const getState = () => {
    if (window.state) return window.state;
    try { return state; } catch (_) { return null; }
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
    return { name: 'home' };
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  function setVisible(element, visible, display = '') {
    if (!element) return;
    element.hidden = !visible;
    element.style.display = visible ? display : 'none';
    element.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function navigate(path, replace = false) {
    const target = path.startsWith('/') ? path : `/${path}`;
    if (normalize() !== normalize(target)) {
      history[replace ? 'replaceState' : 'pushState']({}, '', target);
    }
    render();
  }

  let nativeCaseOpen = null;
  let nativeClosePage = null;

  function hideAllViews() {
    ['#profilePage', '#settingsOverlay', '#statsOverlay', '#historyOverlay', '#openPage'].forEach(selector => {
      setVisible($(selector), false);
    });
    const upgrade = $('#edUpgrade2') || $('#upgradePage');
    if (upgrade) {
      upgrade.classList.remove('open', 'closing');
      upgrade.style.display = 'none';
      upgrade.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('case-route', 'modal-open', 'ed-opening');
  }

  function setHomeChrome(visible) {
    ['header', '.top-line', '.search-wrap', '.live-drops-bar'].forEach(selector => {
      $$(selector).forEach(element => {
        if (element.closest('#profilePage, #openPage, #settingsOverlay, #statsOverlay, #historyOverlay, #upgradePage')) return;
        element.hidden = !visible;
        element.setAttribute('aria-hidden', visible ? 'false' : 'true');
      });
    });
  }

  function showCase(id) {
    const page = $('#openPage');
    const main = $('main');
    const cases = $('main .cases') || $('.cases');
    if (!page) return;

    if (main) main.hidden = false;
    if (cases) cases.hidden = true;
    setHomeChrome(false);
    document.body.classList.add('case-route');

    if (typeof nativeCaseOpen === 'function') {
      window.__edRouteRenderingCase = true;
      try { nativeCaseOpen(id); } finally { window.__edRouteRenderingCase = false; }
    }
    setVisible(page, true, 'flex');
    page.scrollTop = 0;
  }

  function showAuthenticatedView(name) {
    setHomeChrome(false);
    const main = $('main');
    if (main) main.hidden = true;

    const currentState = getState();
    if (!currentState?.currentUser) {
      navigate('/', true);
      queueMicrotask(() => window.openAuth?.('login'));
      return;
    }

    if (name === 'profile') {
      window.openProfile?.();
      setVisible($('#profilePage'), true, 'flex');
      return;
    }
    if (name === 'statistics') {
      window.openStats?.();
      setVisible($('#statsOverlay'), true, 'flex');
      document.body.classList.add('modal-open');
      return;
    }
    if (name === 'history') {
      window.openHistory?.();
      setVisible($('#historyOverlay'), true, 'flex');
      document.body.classList.add('modal-open');
      return;
    }
    if (name === 'settings') {
      window.openSettings?.();
      setVisible($('#settingsOverlay'), true, 'flex');
      document.body.classList.add('modal-open');
      return;
    }
    if (name === 'upgrade') {
      window.openUpgradeMenu?.();
      const upgrade = $('#edUpgrade2') || $('#upgradePage');
      if (upgrade) {
        upgrade.classList.add('open');
        upgrade.style.display = 'flex';
        upgrade.setAttribute('aria-hidden', 'false');
      }
    }
  }

  function render() {
    const current = route();
    hideAllViews();
    setHomeChrome(true);

    if (current.name === 'home' || current.name === 'cases') {
      const main = $('main');
      const cases = $('main .cases') || $('.cases');
      if (main) main.hidden = false;
      if (cases) cases.hidden = false;
      return;
    }
    if (current.name === 'case') {
      showCase(current.id);
      return;
    }
    showAuthenticatedView(current.name);
  }

  function installCaseBridge() {
    if (!nativeCaseOpen && typeof window.openCasePage === 'function') {
      nativeCaseOpen = window.openCasePage;
      window.openCasePage = id => window.__edRouteRenderingCase
        ? nativeCaseOpen(id)
        : navigate(`/case/${encodeURIComponent(String(id))}`);
    }

    if (!nativeClosePage && typeof window.closePage === 'function') {
      nativeClosePage = window.closePage;
      window.closePage = (...args) => route().name === 'case'
        ? navigate('/')
        : nativeClosePage(...args);
    }
  }

  /* Capture card/profile navigation before legacy inline handlers can render a
     case/profile panel inside the home page. Buttons/links inside cards keep
     their native action. */
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const card = target.closest('.case[data-case], .case-card[data-case], .case-item[data-case]');
    if (card && !target.closest('button,input,a,[data-route]')) {
      const id = card.getAttribute('data-case') || card.querySelector('.case-name,.case-title')?.textContent?.trim();
      if (id) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate(`/case/${encodeURIComponent(String(id).toLowerCase())}`);
        return;
      }
    }

    const profile = target.closest('#profileBtn, .profile-box');
    if (profile && getState()?.currentUser && !target.closest('button,a,[data-route]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate('/profile');
      return;
    }
  }, true);

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const routeButton = target.closest('[data-route]');
    if (routeButton) {
      event.preventDefault();
      navigate(routeButton.dataset.route || '/');
      return;
    }

    const back = target.closest('[data-back]');
    if (back) {
      event.preventDefault();
      navigate('/');
      return;
    }
  });

  window.addEventListener('popstate', render);
  window.EmojiDropsRouter = { navigate, render, route };
  window.openProfileRoute = () => navigate('/profile');
  window.openUpgradeRoute = () => navigate('/upgrade');
  window.openStatsRoute = () => navigate('/profile/statistics');
  window.openHistoryRoute = () => navigate('/profile/history');
  window.openSettingsRoute = () => navigate('/profile/settings');

  function init() {
    installCaseBridge();
    setTimeout(() => {
      installCaseBridge();
      render();
    }, 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
