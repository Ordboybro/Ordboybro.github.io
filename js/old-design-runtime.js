/* Canonical runtime for the preserved old design. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const quality = () => window.emojiDropsQuality?.quality || 'high';
  const ITEM_COUNT = 42;
  const WIN_INDEX = 30;

  function syncCasePage(open) {
    const page = byId('openPage');
    if (!page) return;
    document.body.classList.toggle('case-route', open);
    page.style.display = open ? 'flex' : 'none';
    page.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function itemNode(item) {
    const node = document.createElement('div');
    node.className = 'item';
    node.textContent = item?.emoji || '❔';
    const color = window.rarities?.[item?.rarity]?.color;
    if (color) node.style.borderColor = color;
    return node;
  }

  function buildTrack(track, winner) {
    const items = Array.isArray(window.state?.currentCase) ? window.state.currentCase.filter(Boolean) : [];
    track.replaceChildren();
    if (!items.length) return;
    for (let index = 0; index < ITEM_COUNT; index += 1) {
      const item = index === WIN_INDEX ? winner : (window.getRandomByChance?.(items) || items[index % items.length]);
      track.appendChild(itemNode(item));
    }
  }

  function createRoulettes() {
    const container = byId('multiRouletteContainer');
    if (!container) return;
    const count = Math.max(1, Math.min(10, Number(window.state?.openAmount) || 1));
    container.replaceChildren();
    for (let i = 0; i < count; i += 1) {
      const roulette = document.createElement('div');
      roulette.className = 'multi-roulette';
      roulette.innerHTML = '<div class="new-pointer"></div><div class="multi-track"></div>';
      const preview = window.getRandomByChance?.(window.state?.currentCase) || window.state?.currentCase?.[0];
      buildTrack(roulette.querySelector('.multi-track'), preview);
      container.appendChild(roulette);
    }
  }

  function animateTrack(roulette, delay = 0) {
    const track = roulette.querySelector('.multi-track');
    const winner = track?.children?.[WIN_INDEX];
    if (!track || !winner) return Promise.resolve();

    const rr = roulette.getBoundingClientRect();
    const wr = winner.getBoundingClientRect();
    const target = rr.width / 2 - (wr.left - rr.left) - wr.width / 2;

    if (reducedMotion() || quality() === 'low') {
      track.style.transform = `translate3d(${target}px,0,0)`;
      winner.classList.add('winner-item');
      return Promise.resolve();
    }

    const duration = quality() === 'medium' ? 2500 : 3600;
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
    track.style.willChange = 'transform';

    return new Promise(resolve => {
      window.setTimeout(() => {
        requestAnimationFrame(() => {
          track.style.transition = `transform ${duration}ms cubic-bezier(.08,.72,.12,1)`;
          track.style.transform = `translate3d(${target - 18}px,0,0)`;
        });
        window.setTimeout(() => {
          track.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1)';
          track.style.transform = `translate3d(${target}px,0,0)`;
        }, duration);
        window.setTimeout(() => {
          winner.classList.add('winner-item');
          track.style.willChange = 'auto';
          resolve();
        }, duration + 320);
      }, delay);
    });
  }

  function persistOpen(wins, totalPrice) {
    const state = window.state;
    const user = state?.currentUser;
    if (!state || !user || Number(state.balance) < totalPrice) return false;
    state.balance -= totalPrice;
    user.balance = state.balance;
    user.inventory = Array.isArray(user.inventory) ? user.inventory : [];
    wins.forEach(item => {
      const copy = { ...item };
      user.inventory.push(copy);
      window.addLiveDrop?.(user.nickname || 'Игрок', copy);
    });
    state.stats = state.stats || {};
    state.stats.opened = (state.stats.opened || 0) + wins.length;
    state.stats.spent = (state.stats.spent || 0) + totalPrice;
    state.winQueue = wins.slice();
    window.saveUsers?.();
    window.saveStats?.();
    window.renderInventory?.();
    window.updateBalanceUI?.();
    return true;
  }

  async function openCaseAnimated({ fast = false } = {}) {
    const state = window.state;
    if (!state || state.isSpinning) return;
    if (!state.currentUser) return window.openAuth?.('login');
    if (!state.selectedCase || !state.currentCase?.length) return alert('Выберите кейс');

    const count = Math.max(1, Math.min(10, Number(state.openAmount) || 1));
    const casePrice = Number(window.casePrices?.[state.selectedCase] || 0);
    const totalPrice = casePrice * count;
    if (Number(state.balance) < totalPrice) return alert('Недостаточно средств');

    state.isSpinning = true;
    const buttons = [byId('openCaseButton'), byId('fastOpenButton')].filter(Boolean);
    buttons.forEach(button => { button.disabled = true; button.classList.add('ed-spin-lock'); });

    try {
      const wins = Array.from({ length: count }, () => window.getRandomByChance?.(state.currentCase) || state.currentCase[0]);
      const container = byId('multiRouletteContainer');
      if (!container) throw new Error('Roulette container not found');
      container.replaceChildren();

      const roulettes = wins.map(winner => {
        const roulette = document.createElement('div');
        roulette.className = 'multi-roulette';
        roulette.innerHTML = '<div class="new-pointer"></div><div class="multi-track"></div>';
        buildTrack(roulette.querySelector('.multi-track'), winner);
        container.appendChild(roulette);
        return roulette;
      });

      if (fast || reducedMotion() || quality() === 'low') {
        roulettes.forEach(roulette => {
          const track = roulette.querySelector('.multi-track');
          const winner = track?.children?.[WIN_INDEX];
          if (!track || !winner) return;
          const rr = roulette.getBoundingClientRect();
          const wr = winner.getBoundingClientRect();
          track.style.transform = `translate3d(${rr.width / 2 - (wr.left - rr.left) - wr.width / 2}px,0,0)`;
          winner.classList.add('winner-item');
        });
        await sleep(reducedMotion() ? 0 : 180);
      } else {
        await Promise.all(roulettes.map((roulette, index) => animateTrack(roulette, index * 80)));
      }

      if (!persistOpen(wins, totalPrice)) throw new Error('Opening commit failed');
      await sleep(reducedMotion() ? 0 : 420);
      window.showNextWin?.();
    } catch (error) {
      console.error('[EmojiDrops old-design runtime]', error);
      alert('Не удалось открыть кейс. Баланс не был списан. Попробуйте ещё раз.');
    } finally {
      state.isSpinning = false;
      buttons.forEach(button => { button.disabled = false; button.classList.remove('ed-spin-lock'); });
    }
  }

  function bind(id, handler) {
    const node = byId(id);
    if (!node || node.dataset.oldDesignBound === '1') return;
    const clone = node.cloneNode(true);
    clone.dataset.oldDesignBound = '1';
    node.replaceWith(clone);
    clone.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!window.state?.isSpinning || id !== 'caseBackButton') handler(event);
    });
  }

  function install() {
    const originalOpenCasePage = window.openCasePage;
    if (typeof originalOpenCasePage === 'function' && !originalOpenCasePage.__emojiDropsOldDesign) {
      const wrapped = type => {
        originalOpenCasePage(type);
        syncCasePage(true);
        requestAnimationFrame(() => byId('openPage')?.scrollTo?.({ top: 0, behavior: 'auto' }));
      };
      Object.defineProperty(wrapped, '__emojiDropsOldDesign', { value: true });
      window.openCasePage = wrapped;
    }

    window.closePage = () => {
      if (window.state?.isSpinning) return;
      syncCasePage(false);
      byId('multiRouletteContainer')?.replaceChildren();
    };
    window.createRoulettes = createRoulettes;
    bind('openCaseButton', () => openCaseAnimated());
    bind('fastOpenButton', () => openCaseAnimated({ fast: true }));
    bind('caseBackButton', () => window.closePage());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
