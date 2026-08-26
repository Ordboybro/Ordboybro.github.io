(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function replaceButton(id, handler) {
    const oldButton = byId(id);
    if (!oldButton) return null;
    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      handler(event);
    });
    return button;
  }

  function syncCaseRoute(open) {
    document.body.classList.toggle('case-route', open);
    document.body.classList.toggle('ed-opening', open);
    const page = byId('openPage');
    if (!page) return;
    page.setAttribute('aria-hidden', open ? 'false' : 'true');
    page.style.display = open ? 'flex' : 'none';
  }

  function itemNode(item) {
    const node = document.createElement('div');
    node.className = 'item';
    node.textContent = item?.emoji || '❔';
    const color = window.rarities?.[item?.rarity]?.color;
    if (color) node.style.border = `3px solid ${color}`;
    return node;
  }

  function buildTrack(track, items, winner, winnerIndex = 30) {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    track.replaceChildren();
    if (!safeItems.length) return;

    for (let index = 0; index < 42; index += 1) {
      const item = index === winnerIndex
        ? winner
        : (window.getRandomByChance?.(safeItems) || safeItems[index % safeItems.length]);
      track.appendChild(itemNode(item));
    }
  }

  function animateTrack(roulette, delay = 0) {
    const track = roulette.querySelector('.multi-track');
    const winner = track?.children?.[30];
    if (!track || !winner) return Promise.resolve();

    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';

    return new Promise(resolve => {
      setTimeout(() => {
        const rouletteRect = roulette.getBoundingClientRect();
        const winnerRect = winner.getBoundingClientRect();
        const targetX = (rouletteRect.width / 2) - (winnerRect.left - rouletteRect.left) - (winnerRect.width / 2);
        const overshoot = targetX - 18;
        const settle = targetX;

        track.style.willChange = 'transform';
        track.style.transition = 'transform 3.7s cubic-bezier(.08,.72,.12,1)';
        track.style.transform = `translate3d(${overshoot}px,0,0)`;

        setTimeout(() => {
          track.style.transition = 'transform .28s cubic-bezier(.22,1,.36,1)';
          track.style.transform = `translate3d(${settle}px,0,0)`;
        }, 3700);

        setTimeout(() => {
          track.style.willChange = 'auto';
          winner.classList.add('winner-item');
          resolve();
        }, 4020);
      }, delay);
    });
  }

  function persistAfterOpen(wins, price) {
    const state = window.state;
    const user = state?.currentUser;
    if (!state || !user) return;

    user.inventory = Array.isArray(user.inventory) ? user.inventory : [];
    wins.forEach(item => {
      const copy = { ...item };
      user.inventory.push(copy);
      window.addLiveDrop?.(user.nickname || 'Игрок', copy);
    });

    state.stats = state.stats || {};
    state.stats.opened = (state.stats.opened || 0) + wins.length;
    state.stats.spent = (state.stats.spent || 0) + price;
    state.winQueue = wins.slice();

    window.saveUsers?.();
    window.saveStats?.();
    window.renderInventory?.();
    window.updateBalanceUI?.();
  }

  async function openCaseAnimated({ fast = false } = {}) {
    const state = window.state;
    if (!state || state.isSpinning) return;
    if (!state.selectedCase || !Array.isArray(state.currentCase) || !state.currentCase.length) {
      alert('Выберите кейс');
      return;
    }
    if (!state.currentUser) {
      window.openAuth?.('login');
      return;
    }

    const count = Math.max(1, Math.min(10, Number(state.openAmount) || 1));
    const casePrice = Number(window.casePrices?.[state.selectedCase] || 0);
    const totalPrice = casePrice * count;
    if (Number(state.balance) < totalPrice) {
      alert('Недостаточно средств');
      return;
    }

    const container = byId('multiRouletteContainer');
    if (!container) return;

    state.isSpinning = true;
    state.balance -= totalPrice;
    state.currentUser.balance = state.balance;
    window.updateBalanceUI?.();

    const normalButton = byId('openCaseButton');
    const fastButton = byId('fastOpenButton');
    [normalButton, fastButton].forEach(button => {
      if (button) {
        button.disabled = true;
        button.dataset.recoveryLabel = button.textContent;
      }
    });

    try {
      const wins = Array.from({ length: count }, () =>
        window.getRandomByChance?.(state.currentCase) || state.currentCase[0]
      );

      container.replaceChildren();
      const roulettes = wins.map((winner, index) => {
        const roulette = document.createElement('div');
        roulette.className = 'multi-roulette';
        roulette.innerHTML = '<div class="new-pointer"></div><div class="multi-track"></div>';
        buildTrack(roulette.querySelector('.multi-track'), state.currentCase, winner);
        container.appendChild(roulette);
        return roulette;
      });

      if (fast) {
        roulettes.forEach((roulette, index) => {
          const track = roulette.querySelector('.multi-track');
          const winner = track?.children?.[30];
          if (!track || !winner) return;
          const rouletteRect = roulette.getBoundingClientRect();
          const winnerRect = winner.getBoundingClientRect();
          const targetX = (rouletteRect.width / 2) - (winnerRect.left - rouletteRect.left) - (winnerRect.width / 2);
          track.style.transform = `translate3d(${targetX}px,0,0)`;
          winner.classList.add('winner-item');
        });
        await sleep(180);
      } else {
        await Promise.all(roulettes.map((roulette, index) => animateTrack(roulette, index * 90)));
      }

      persistAfterOpen(wins, totalPrice);
      await sleep(fast ? 120 : 420);
      window.showNextWin?.();
    } catch (error) {
      console.error('[EmojiDrops recovery]', error);
      alert('Не удалось открыть кейс. Попробуйте ещё раз.');
    } finally {
      state.isSpinning = false;
      [normalButton, fastButton].forEach(button => {
        if (button) button.disabled = false;
      });
    }
  }

  function installCaseControls() {
    replaceButton('openCaseButton', () => openCaseAnimated());
    replaceButton('fastOpenButton', () => openCaseAnimated({ fast: true }));
    replaceButton('caseBackButton', () => {
      if (window.state?.isSpinning) return;
      syncCaseRoute(false);
      byId('multiRouletteContainer')?.replaceChildren();
    });
  }

  function installNavigation() {
    const originalOpenCasePage = window.openCasePage;
    window.openCasePage = function openCasePage(type) {
      originalOpenCasePage?.(type);
      syncCaseRoute(true);
      requestAnimationFrame(() => byId('openPage')?.scrollTo?.({ top: 0, behavior: 'instant' }));
    };

    window.closePage = function closePage() {
      if (window.state?.isSpinning) return;
      syncCaseRoute(false);
      byId('multiRouletteContainer')?.replaceChildren();
    };
  }

  function installProfileSafety() {
    replaceButton('profileBackBtn', () => window.closeProfile?.());
    replaceButton('profileUpgradeBtn', () => window.openUpgradeMenu?.());
    replaceButton('profileStatsBtn', () => window.openStats?.());
    replaceButton('profileHistoryBtn', () => window.openHistory?.());
    replaceButton('profileLogoutBtn', () => window.logout?.());
  }

  function install() {
    installNavigation();
    installCaseControls();
    installProfileSafety();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
