(() => {
  'use strict';

  const normalize = (path = location.pathname) => {
    const value = String(path).replace(/\\+/g, '/').replace(/\/$/, '');
    return value || '/';
  };
  const getState = () => window.state || null;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

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
  let casePageParent = null;
  let casePageNextSibling = null;

  function rememberCaseMount() {
    const page = $('#openPage');
    if (!page || casePageParent) return;
    casePageParent = page.parentNode;
    casePageNextSibling = page.nextSibling;
  }

  function detachCasePage() {
    const page = $('#openPage');
    if (!page) return;
    rememberCaseMount();
    if (page.parentNode !== document.body) document.body.appendChild(page);
  }

  function restoreCasePage() {
    const page = $('#openPage');
    if (!page || !casePageParent) return;
    if (page.parentNode === casePageParent) return;
    if (casePageNextSibling && casePageNextSibling.parentNode === casePageParent) {
      casePageParent.insertBefore(page, casePageNextSibling);
    } else {
      casePageParent.appendChild(page);
    }
  }

  function restoreMainChildren() {
    const main = $('main');
    if (!main) return;
    [...main.children].forEach(child => {
      child.hidden = false;
      child.removeAttribute('aria-hidden');
      if (child.dataset.edCasesRouteHidden === '1') {
        child.style.removeProperty('display');
        delete child.dataset.edCasesRouteHidden;
      }
    });
  }

  function showCasesOnly() {
    const main = $('main');
    if (!main) return;

    [...main.children].forEach(child => {
      const ownsCases = Boolean(child.matches('.cases, .cases-section, .cases-container, #casesContainer') ||
        child.querySelector?.('.cases, .cases-grid, .case-grid, #casesContainer'));
      const ownsSearch = Boolean(child.matches('.search-wrap, .search-container') ||
        child.querySelector?.('.search-wrap, .search-container, #caseSearch, .case-search'));

      if (ownsCases || ownsSearch) {
        child.hidden = false;
        child.removeAttribute('aria-hidden');
        child.style.removeProperty('display');
        return;
      }

      child.hidden = true;
      child.setAttribute('aria-hidden', 'true');
      child.dataset.edCasesRouteHidden = '1';
    });
  }

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
    if (!page) return;
    detachCasePage();
    const main = $('main');
    if (main) main.hidden = true;
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
    if (!getState()?.currentUser) {
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
        setVisible(upgrade, true, 'flex');
        upgrade.classList.add('open');
      }
    }
  }

  function render() {
    const current = route();
    hideAllViews();

    if (current.name === 'home') {
      restoreCasePage();
      restoreMainChildren();
      setHomeChrome(true);
      const main = $('main');
      if (main) main.hidden = false;
      return;
    }

    if (current.name === 'cases') {
      restoreCasePage();
      showCasesOnly();
      setHomeChrome(true);
      const main = $('main');
      if (main) main.hidden = false;
      const cases = $('main .cases, main .cases-grid, main .case-grid, #casesContainer, .cases');
      cases?.scrollIntoView({ block: 'start', behavior: 'auto' });
      return;
    }

    if (current.name === 'case') return showCase(current.id);
    restoreCasePage();
    showAuthenticatedView(current.name);
  }

  function installCaseBridge() {
    rememberCaseMount();
    if (!nativeCaseOpen && typeof window.openCasePage === 'function') {
      nativeCaseOpen = window.openCasePage;
      window.openCasePage = id => window.__edRouteRenderingCase
        ? nativeCaseOpen(id)
        : navigate(`/case/${encodeURIComponent(String(id))}`);
    }
    if (!nativeClosePage && typeof window.closePage === 'function') {
      nativeClosePage = window.closePage;
      window.closePage = (...args) => route().name === 'case' ? navigate('/') : nativeClosePage(...args);
    }
  }

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
    }
  });

  window.addEventListener('popstate', render);
  window.EmojiDropsRouter = { navigate, render, route };
  window.openProfileRoute = () => navigate('/profile');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { installCaseBridge(); render(); }, { once: true });
  } else {
    installCaseBridge();
    render();
  }
})();
