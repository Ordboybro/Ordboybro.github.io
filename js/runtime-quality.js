(() => {
  'use strict';

  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const rarityColor = rarity => window.rarities?.[rarity]?.color || '#ff7a18';
  let opening = false;

  function weighted(items) {
    if (typeof window.getRandomByChance === 'function') return window.getRandomByChance(items);
    return items[Math.floor(Math.random() * items.length)] || null;
  }

  function updateOpenButton() {
    const button = document.querySelector('.open-buttons .main-btn');
    if (!button || !window.state?.selectedCase) return;
    const price = (window.casePrices?.[window.state.selectedCase] || 0) * (window.state.openAmount || 1);
    const sub = button.querySelector('.btn-subtext');
    if (sub) sub.textContent = `${price}₽`;
  }

  function buildTrack(track, items, winner, offset) {
    if (!track || !items?.length || !winner) return null;
    const winIndex = 34 + offset;
    const total = 52;
    track.innerHTML = '';
    for (let index = 0; index < total; index += 1) {
      const item = index === winIndex ? winner : weighted(items);
      const node = document.createElement('div');
      node.className = 'item';
      node.dataset.rarity = item.rarity;
      node.textContent = item.emoji;
      node.style.border = `3px solid ${rarityColor(item.rarity)}`;
      if (index === winIndex) node.classList.add('winning-slot');
      track.appendChild(node);
    }
    return winIndex;
  }

  async function spinOne(roulette, winner, index) {
    const track = roulette?.querySelector('.multi-track');
    if (!track) return;
    const winIndex = buildTrack(track, window.state.currentCase, winner, index % 3);
    const itemWidth = 160;
    const viewport = roulette.getBoundingClientRect().width || 960;
    const centerOffset = viewport / 2 - itemWidth / 2;
    const distance = -(winIndex * itemWidth) + centerOffset - (Math.random() * 26 + 8);
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
    track.getBoundingClientRect();

    if (prefersReduced()) {
      track.style.transform = `translate3d(${distance}px,0,0)`;
      return;
    }

    const duration = 2900 + index * 120;
    track.style.willChange = 'transform';
    track.style.transition = `transform ${duration}ms cubic-bezier(.08,.82,.18,1)`;
    requestAnimationFrame(() => { track.style.transform = `translate3d(${distance}px,0,0)`; });
    await sleep(duration + 80);
    track.style.willChange = 'auto';
    const slot = track.children[winIndex];
    if (slot?.animate) slot.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)', filter: `drop-shadow(0 0 16px ${rarityColor(winner.rarity)})` },
      { transform: 'scale(1)' }
    ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
  }

  async function openCaseQuality(count = window.state?.openAmount || 1) {
    if (opening || window.state?.isSpinning) return;
    const state = window.state;
    if (!state?.selectedCase || !state.currentCase?.length) return;
    if (!state.currentUser) return typeof window.openAuth === 'function' ? window.openAuth('login') : null;

    const price = (window.casePrices?.[state.selectedCase] || 0) * count;
    if ((state.balance || 0) < price) return alert('Недостаточно средств');

    opening = true;
    state.isSpinning = true;
    document.body.classList.add('ed-opening');
    const button = document.querySelector('.open-buttons .main-btn');
    if (button) { button.disabled = true; button.classList.add('is-opening'); }

    const wins = Array.from({ length: count }, () => weighted(state.currentCase)).filter(Boolean);
    const roulettes = [...document.querySelectorAll('.multi-roulette')];
    await Promise.all(wins.map((win, index) => spinOne(roulettes[index], win, index)));

    state.currentUser.balance = Math.max(0, money(state.currentUser.balance) - price);
    state.balance = state.currentUser.balance;
    state.currentUser.inventory ||= [];
    wins.forEach(item => state.currentUser.inventory.push({ ...item }));
    state.stats.opened = (state.stats.opened || 0) + wins.length;

    if (typeof window.saveUsers === 'function') window.saveUsers();
    if (typeof window.saveStats === 'function') window.saveStats();
    if (typeof window.updateBalanceUI === 'function') window.updateBalanceUI();
    if (typeof window.renderInventory === 'function') window.renderInventory();

    wins.forEach(item => {
      if (typeof window.addLiveDrop === 'function') window.addLiveDrop(state.currentUser.nickname || 'Player', item);
    });

    await sleep(prefersReduced() ? 0 : 220);
    state.winQueue = wins.slice();
    if (typeof window.showNextWin === 'function') window.showNextWin();

    state.isSpinning = false;
    opening = false;
    document.body.classList.remove('ed-opening');
    if (button) { button.disabled = false; button.classList.remove('is-opening'); }
    updateOpenButton();
  }

  function installLiveDrops() {
    const original = window.createLiveDrop;
    if (typeof original !== 'function' || original.__qualityWrapped) return;

    const wrapped = function qualityLiveDrop(username, item) {
      const container = document.getElementById('liveContainer');
      if (!container || !item) return original.apply(this, arguments);
      const before = new Map([...container.children].map(node => [node, node.getBoundingClientRect()]));
      const result = original.apply(this, arguments);
      const newest = container.firstElementChild;
      if (newest) {
        newest.classList.add('ed-live-enter');
        newest.addEventListener('animationend', () => newest.classList.remove('ed-live-enter'), { once: true });
      }
      [...container.children].forEach(node => {
        const oldBox = before.get(node);
        if (!oldBox || !node.animate) return;
        const now = node.getBoundingClientRect();
        const dx = oldBox.left - now.left;
        const dy = oldBox.top - now.top;
        if (!dx && !dy) return;
        node.animate([
          { transform: `translate3d(${dx}px,${dy}px,0)` },
          { transform: 'translate3d(0,0,0)' }
        ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
      return result;
    };
    wrapped.__qualityWrapped = true;
    window.createLiveDrop = wrapped;
  }

  function install() {
    installLiveDrops();
    window.openCase = openCaseQuality;

    const originalAmounts = window.renderOpenAmounts;
    if (typeof originalAmounts === 'function' && !originalAmounts.__qualityWrapped) {
      const wrapped = function () {
        const value = originalAmounts.apply(this, arguments);
        requestAnimationFrame(updateOpenButton);
        return value;
      };
      wrapped.__qualityWrapped = true;
      window.renderOpenAmounts = wrapped;
    }

    document.addEventListener('click', event => {
      const fast = event.target.closest('.fast-btn');
      if (!fast) return;
      event.preventDefault();
      openCaseQuality(window.state?.openAmount || 1);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();