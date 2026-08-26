(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();
  ready(() => {
    const cases = document.querySelector('.cases');
    if (!cases) return;
    if (!document.getElementById('caseToolbar')) {
      const bar = document.createElement('div');
      bar.id = 'caseToolbar';
      bar.className = 'case-toolbar';
      bar.innerHTML = `<div class="case-toolbar-copy"><span class="case-toolbar-kicker">CASES</span><strong>Выбери свой кейс</strong></div><label class="case-search"><span>⌕</span><input id="caseSearch" type="search" inputmode="search" autocomplete="off" placeholder="Поиск кейсов…"></label><div class="case-filters" role="group" aria-label="Фильтр кейсов"><button type="button" class="case-filter active" data-filter="all">Все</button><button type="button" class="case-filter" data-filter="sale">Акции</button><button type="button" class="case-filter" data-filter="cheap">До 100₽</button></div>`;
      cases.parentNode.insertBefore(bar, cases);
      const search = bar.querySelector('#caseSearch');
      const filters = [...bar.querySelectorAll('.case-filter')];
      const apply = () => {
        const q = search.value.trim().toLowerCase();
        const mode = bar.querySelector('.case-filter.active')?.dataset.filter || 'all';
        cases.querySelectorAll('.case').forEach(card => {
          const text = card.textContent.toLowerCase();
          const sale = !!card.querySelector('.old-price');
          const price = Number((card.querySelector('.new-price')?.textContent || '').replace(/[^0-9.]/g,'')) || 0;
          const visible = (!q || text.includes(q)) && (mode === 'all' || (mode === 'sale' && sale) || (mode === 'cheap' && price <= 100));
          card.hidden = !visible;
        });
      };
      search.addEventListener('input', apply);
      filters.forEach(btn => btn.addEventListener('click', () => {filters.forEach(x => x.classList.remove('active'));btn.classList.add('active');apply();}));
    }

    const online = document.querySelector('.online-box');
    if (online) online.setAttribute('aria-label', 'Сейчас онлайн');
    const profile = document.querySelector('.profile-box');
    if (profile) profile.setAttribute('aria-label', 'Профиль');

    const sync = () => {
      const count = document.getElementById('onlineCount');
      if (count && !count.dataset.polished) { count.dataset.polished = '1'; count.textContent = String(Math.max(1, Number(count.textContent) || 128)); }
    };
    sync();
  });
})();
