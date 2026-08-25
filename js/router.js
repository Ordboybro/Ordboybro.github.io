(() => {
  'use strict';
  const normalize = (path = location.pathname) => (path.replace(/\/+/g, '/').replace(/\/$/, '') || '/');
  const bootstrapRedirect = () => {
    const p = new URLSearchParams(location.search).get('ed_route');
    if (!p) return;
    history.replaceState({}, '', p);
  };
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
    (replace ? history.replaceState : history.pushState).call(history, {}, '', target);
    render();
  };
  const root = () => {
    let el = document.getElementById('routeRoot');
    if (!el) { el = document.createElement('main'); el.id = 'routeRoot'; el.className = 'route-root'; document.body.appendChild(el); }
    return el;
  };
  const hide = sel => document.querySelectorAll(sel).forEach(el => { el.style.display='none'; el.setAttribute('aria-hidden','true'); });
  const show = (el, display='flex') => { if(el){el.style.display=display;el.setAttribute('aria-hidden','false');} };
  const animate = () => { const el=root(); el.classList.remove('route-enter'); void el.offsetWidth; el.classList.add('route-enter'); };

  function render(){
    const r=route(), rr=root();
    hide('#routeRoot,#openPage,#profilePage,#upgradePage,#settingsOverlay,#statsOverlay,#historyOverlay');
    document.body.classList.remove('case-route'); rr.innerHTML=''; rr.style.display='none';
    document.querySelectorAll('body > header,body > .top-line,body > .search-wrap,body > main,body > .live-drops-bar').forEach(el=>el.style.display='none');
    if(r.name==='home'||r.name==='cases'){
      ['header','.top-line','.search-wrap','main','.live-drops-bar'].forEach(sel=>{const el=document.querySelector(`body > ${sel}`);if(el)el.style.display='';});
      if(r.name==='cases') document.querySelectorAll('.case').forEach(c=>c.style.display='flex');
      animate(); return;
    }
    if(r.name==='case'){document.body.classList.add('case-route');window.__edOpenCasePage?.(r.id);show(document.getElementById('openPage'));animate();return;}
    if(r.name==='profile'){if(!window.state?.currentUser){navigate('/');setTimeout(()=>window.openAuth?.('login'),0);return;}window.__edOpenProfile?.();show(document.getElementById('profilePage'));animate();return;}
    if(['statistics','history','settings'].includes(r.name)&&!window.state?.currentUser){navigate('/');setTimeout(()=>window.openAuth?.('login'),0);return;}
    if(r.name==='statistics'){window.__edOpenStats?.();show(document.getElementById('statsOverlay'));animate();return;}
    if(r.name==='history'){window.__edOpenHistory?.();show(document.getElementById('historyOverlay'));animate();return;}
    if(r.name==='settings'){window.__edOpenSettings?.();show(document.getElementById('settingsOverlay'));animate();return;}
    if(r.name==='upgrade'){window.__edOpenUpgrade?.();show(document.getElementById('upgradePage'));animate();return;}
    if(r.name==='battle'){rr.style.display='block';rr.innerHTML='<section class="route-page"><div class="route-page-head"><button class="ed-route-back" data-back>← Назад</button><div><div class="route-kicker">EMOJI DROPS</div><h1>Case Battle</h1></div></div><div class="route-empty"><div class="route-empty-icon">⚔️</div><h2>Case Battle</h2><p>Боевой режим подготовлен как отдельный экран.</p></div></section>';animate();}
  }

  document.addEventListener('click',e=>{
    const profile=e.target.closest('#profileBtn,.profile-box');
    if(profile&&window.state?.currentUser){e.preventDefault();e.stopPropagation();navigate('/profile');return;}
    const card=e.target.closest('.case');
    if(card&&!e.target.closest('button,input')){const name=card.querySelector('.case-name')?.textContent?.trim().toLowerCase();if(name&&window.cases?.[name]){e.preventDefault();e.stopPropagation();navigate(`/case/${encodeURIComponent(name)}`);}}
  },true);
  document.addEventListener('click',e=>{const link=e.target.closest('[data-route]');if(link){e.preventDefault();navigate(link.dataset.route);return;}if(e.target.closest('[data-back]')){e.preventDefault();history.length>1?history.back():navigate('/');}});
  window.addEventListener('popstate',render);
  window.EmojiDropsRouter={navigate,render,route};
  window.openProfileRoute=()=>navigate('/profile');window.openCasesRoute=()=>navigate('/cases');window.openCaseRoute=id=>navigate(`/case/${encodeURIComponent(id)}`);window.openUpgradeRoute=()=>navigate('/upgrade');window.openStatsRoute=()=>navigate('/profile/statistics');window.openHistoryRoute=()=>navigate('/profile/history');window.openSettingsRoute=()=>navigate('/profile/settings');
  document.addEventListener('DOMContentLoaded',()=>{bootstrapRedirect();window.__edOpenCasePage=window.openCasePage;window.__edOpenProfile=window.openProfile;window.__edOpenStats=window.openStats;window.__edOpenHistory=window.openHistory;window.__edOpenSettings=window.openSettings;window.__edOpenUpgrade=window.openUpgradeMenu;render();});
})();
