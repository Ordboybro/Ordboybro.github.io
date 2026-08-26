(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const ensure = (id, html) => {
    let element = document.getElementById(id);
    if (!element) {
      document.body.insertAdjacentHTML('beforeend', html);
      element = document.getElementById(id);
    }
    return element;
  };

  const injectUi = () => {
    ensure('profilePage', `
      <section class="profile-page" id="profilePage" style="display:none" aria-hidden="true">
        <div class="ed-page-head">
          <button class="profile-settings-btn" id="profileSettingsBtn" type="button" aria-label="Настройки">⚙️</button>
          <button class="back-btn" id="profileBackBtn" type="button">← Назад</button>
        </div>
        <div class="ed-profile-wrap">
          <div class="ed-profile-user">
            <div class="profile-avatar">👤</div>
            <div>
              <div class="profile-name" id="profileName">Гость</div>
              <div class="settings-sub">Баланс: <strong><span id="profileBalance">0</span>₽</strong></div>
            </div>
          </div>
          <div class="ed-section-title"><span>Инвентарь</span></div>
          <div class="profile-content"><div class="inventory-grid" id="inventoryGrid"></div></div>
          <div class="ed-profile-actions">
            <button type="button" class="profile-mini-btn" id="profileUpgradeBtn">⬆️ Апгрейд</button>
            <button type="button" class="profile-mini-btn" id="profileStatsBtn">📊 Статистика</button>
            <button type="button" class="profile-mini-btn" id="profileHistoryBtn">🕘 История</button>
            <button type="button" class="profile-mini-btn danger" id="profileLogoutBtn">🚪 Выйти</button>
          </div>
        </div>
      </section>
    `);

    ensure('upgradePage', `
      <section id="upgradePage" class="ed-upgrade-page" style="display:none">
        <div class="ed-page-head"><div class="ed-upgrade-title">⬆️ Апгрейд</div><button class="back-btn" id="upgradeBackBtn" type="button">← Назад</button></div>
        <div class="ed-upgrade-card"><div class="ed-upgrade-icon">⚡</div><h2>Апгрейд предмета</h2><p>Выберите предмет из инвентаря и запустите апгрейд.</p><div id="upgradeInventory" class="inventory-grid"></div></div>
      </section>
    `);
  };

  const injectStyles = () => {
    if (document.getElementById('ed-clean-recovery-style')) return;
    const style = document.createElement('style');
    style.id = 'ed-clean-recovery-style';
    style.textContent = `
      html,body{overflow-x:hidden!important} html{scrollbar-color:#ff7b00 #101114}
      .case{min-width:0!important}.case-price{display:flex!important;justify-content:center!important;text-align:center!important}
      .profile-page,.ed-upgrade-page{position:fixed!important;inset:0!important;z-index:9000!important;overflow:auto!important;background:radial-gradient(700px 300px at 50% 0,rgba(255,123,0,.15),transparent 65%),#08090d!important}
      .profile-page .ed-page-head,.ed-upgrade-page .ed-page-head{width:calc(100% - 40px)!important;max-width:1120px!important;margin:0 auto!important;min-height:82px!important;display:flex!important;align-items:center!important;justify-content:space-between!important}
      .profile-settings-btn{position:static!important;width:58px!important;height:58px!important;border-radius:16px!important;display:grid!important;place-items:center!important;background:#15171d!important;border:1px solid #ff7b0060!important;color:#fff!important;font-size:30px!important}
      .profile-page .back-btn,.ed-upgrade-page .back-btn{position:static!important;margin-left:auto!important}
      .ed-profile-wrap{width:min(980px,calc(100% - 40px))!important;margin:20px auto 80px!important}.ed-section-title{margin:28px 0 14px!important;font-size:28px!important;font-weight:900!important}
      .ed-upgrade-card{width:min(900px,calc(100% - 40px));margin:30px auto;padding:30px;border:1px solid #ffffff12;border-radius:24px;background:#111319;box-shadow:0 25px 80px #0008}
      .multi-track{will-change:transform}.multi-roulette{overflow:hidden}.multi-roulette .item{flex:0 0 auto}.ed-winning-item{filter:brightness(1.18);transform:scale(1.06);box-shadow:0 0 24px currentColor}
      .ed-spin-lock{pointer-events:none!important;opacity:.72!important}
      @media(max-width:650px){.profile-page .ed-page-head,.ed-upgrade-page .ed-page-head{width:calc(100% - 24px)!important}.ed-profile-wrap{width:calc(100% - 24px)!important}.ed-upgrade-card{width:calc(100% - 24px)!important}}
    `;
    document.head.appendChild(style);
  };

  const loggedIn = () => Boolean(window.state && window.state.currentUser);

  const animateTrack = (track, winner) => new Promise((resolve) => {
    if (!track || !winner) return resolve();

    const roulette = track.closest('.multi-roulette');
    const items = Array.from(track.children);
    if (!roulette || items.length < 12) return resolve();

    const itemWidth = items[0].getBoundingClientRect().width || 160;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = itemWidth + gap;
    const targetIndex = Math.min(items.length - 5, 24);

    const old = items[targetIndex];
    const replacement = old.cloneNode(true);
    replacement.textContent = winner.emoji;
    replacement.dataset.winner = 'true';
    if (window.rarities && window.rarities[winner.rarity]) {
      replacement.style.border = `3px solid ${window.rarities[winner.rarity].color}`;
      replacement.style.color = window.rarities[winner.rarity].color;
    }
    old.replaceWith(replacement);

    const rouletteWidth = roulette.getBoundingClientRect().width;
    const offset = Math.max(0, targetIndex * step - rouletteWidth / 2 + itemWidth / 2);
    const distance = -(offset + Math.random() * step * 0.18);

    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transition = 'transform 4.8s cubic-bezier(.08,.72,.08,1)';
        track.style.transform = `translate3d(${distance}px,0,0)`;
      });
    });

    const finish = () => {
      replacement.classList.add('ed-winning-item');
      setTimeout(resolve, 260);
    };
    track.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 5400);
  });

  const commitOpening = (wins, totalPrice) => {
    const state = window.state;
    const user = state.currentUser;
    if (!state || !user) return false;

    if (Number(state.balance) < totalPrice) return false;

    state.balance -= totalPrice;
    user.balance = state.balance;
    user.inventory = Array.isArray(user.inventory) ? user.inventory : [];
    wins.forEach((item) => {
      user.inventory.push({ ...item });
      window.addLiveDrop?.(user.nickname || 'Игрок', item);
    });

    state.stats = state.stats || {};
    state.stats.opened = (state.stats.opened || 0) + wins.length;
    state.stats.spent = (state.stats.spent || 0) + totalPrice;

    window.saveUsers?.();
    window.saveStats?.();
    window.updateBalanceUI?.();
    window.renderInventory?.();
    return true;
  };

  window.openCase = async (fast = false) => {
    const state = window.state;
    if (!state || state.isSpinning) return;
    if (!state.selectedCase || !Array.isArray(state.currentCase) || !state.currentCase.length) return alert('Выберите кейс');
    if (!loggedIn()) return window.openAuth?.('login');

    const count = clamp(Number(state.openAmount) || 1, 1, 10);
    const casePrice = Number(window.casePrices?.[state.selectedCase] || 0);
    const totalPrice = casePrice * count;
    if (Number(state.balance) < totalPrice) return alert('Недостаточно средств');

    const getWinner = window.getRandomByChance;
    if (typeof getWinner !== 'function') return alert('Не удалось определить выигрыш');

    const wins = Array.from({ length: count }, () => getWinner(state.currentCase));
    state.isSpinning = true;

    const openButton = $('#openCaseButton');
    const fastButton = $('#fastOpenButton');
    [openButton, fastButton].forEach((button) => {
      button?.classList.add('ed-spin-lock');
      if (button) button.disabled = true;
    });

    try {
      const tracks = Array.from(document.querySelectorAll('#multiRouletteContainer .multi-track'));
      if (tracks.length !== count) window.createRoulettes?.();
      const actualTracks = Array.from(document.querySelectorAll('#multiRouletteContainer .multi-track'));

      if (fast) {
        actualTracks.forEach((track, index) => {
          const items = Array.from(track.children);
          const target = items[Math.min(items.length - 2, 24)];
          if (target) {
            target.textContent = wins[index].emoji;
            target.classList.add('ed-winning-item');
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 120));
      } else {
        await Promise.all(actualTracks.map((track, index) => animateTrack(track, wins[index])));
      }

      if (!commitOpening(wins, totalPrice)) throw new Error('Opening commit failed');
      state.winQueue = wins.slice();
      state.currentWin = null;
      window.showNextWin?.();
    } catch (error) {
      console.error('[EmojiDrops] case opening failed', error);
      alert('Открытие кейса не завершилось. Баланс не был списан. Попробуйте ещё раз.');
    } finally {
      state.isSpinning = false;
      [openButton, fastButton].forEach((button) => {
        button?.classList.remove('ed-spin-lock');
        if (button) button.disabled = false;
      });
    }
  };

  window.closePage = () => {
    if (window.state?.isSpinning) return;
    $('#openPage') && ($('#openPage').style.display = 'none');
    $('#multiRouletteContainer')?.replaceChildren();
    document.body.classList.remove('case-route', 'ed-opening');
  };

  window.openProfile = () => {
    if (!loggedIn()) return window.openAuth?.('login');
    const page = $('#profilePage');
    if (!page) return;
    page.style.display = 'block';
    page.setAttribute('aria-hidden', 'false');
    $('#profileName').textContent = window.state.currentUser.nickname || 'Игрок';
    $('#profileBalance').textContent = window.state.balance ?? 0;
    window.renderInventory?.();
    window.updateStatsUI?.();
  };

  window.closeProfile = () => {
    const page = $('#profilePage');
    if (page) { page.style.display = 'none'; page.setAttribute('aria-hidden', 'true'); }
  };

  window.openUpgradeMenu = () => {
    if (!loggedIn()) return window.openAuth?.('login');
    const page = $('#upgradePage');
    if (!page) return;
    page.style.display = 'block';
    const inventory = $('#upgradeInventory');
    if (inventory) inventory.innerHTML = '<div class="ed-empty">Выберите предмет для апгрейда</div>';
  };

  window.closeUpgradeMenu = () => { const page = $('#upgradePage'); if (page) page.style.display = 'none'; };

  const bind = (id, handler) => {
    const element = document.getElementById(id);
    if (!element || element.dataset.cleanBound === '1') return;
    element.dataset.cleanBound = '1';
    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      try { handler(); } catch (error) { console.error('[EmojiDrops]', error); }
    }, true);
  };

  const wire = () => {
    injectUi();
    injectStyles();
    bind('profileBtn', () => window.openProfile());
    bind('profileBackBtn', () => window.closeProfile());
    bind('profileUpgradeBtn', () => window.openUpgradeMenu());
    bind('upgradeBackBtn', () => window.closeUpgradeMenu());
    bind('caseBackButton', () => window.closePage());
    bind('openCaseButton', () => window.openCase(false));
    bind('fastOpenButton', () => window.openCase(true));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire, { once: true });
  else wire();
})();
