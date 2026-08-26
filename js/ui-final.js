(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = () => window.state;
  const logged = () => !!state()?.currentUser;
  const bind = (id, fn) => {
    const el = $(id);
    if (!el || el.dataset.finalV3Bound) return;
    el.dataset.finalV3Bound = '1';
    el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(e); });
  };

  // Keep the existing game engine, but put one reliable UI layer in front of it.
  const legacyOpenCase = window.openCase;
  const legacyOpenCasePage = window.openCasePage;

  function syncBalance() {
    const s = state();
    if (!s) return;
    if (typeof window.updateBalanceUI === 'function') window.updateBalanceUI();
    if ($('openBalance')) $('openBalance').textContent = Number(s.balance || 0).toFixed(0);
    if ($('profileBalance')) $('profileBalance').textContent = Number(s.balance || 0).toFixed(0);
  }

  function renderCasePage(type) {
    const s = state();
    if (!s || !window.cases?.[type]) return;
    s.currentCase = window.cases[type];
    s.selectedCase = type;
    s.openAmount = 1;
    const page = $('openPage');
    if (!page) return;
    page.style.display = 'flex';
    page.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ed-opening');
    syncBalance();
    if (typeof window.renderOpenAmounts === 'function') window.renderOpenAmounts();
    if (typeof window.updateBestDrop === 'function') window.updateBestDrop();
    if (typeof window.createRoulettes === 'function') window.createRoulettes();
    if (typeof window.renderCaseItems === 'function') window.renderCaseItems();
    if (typeof window.updateOpenPrice === 'function') window.updateOpenPrice();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.openCasePage = renderCasePage;

  // A single reliable opener. It delegates the economy to the existing engine.
  window.openCase = async function(count) {
    const s = state();
    if (!s || s.isSpinning) return;
    if (!s.selectedCase || !Array.isArray(s.currentCase) || !s.currentCase.length) {
      return alert('Выберите кейс');
    }
    if (!s.currentUser) {
      if (typeof window.openAuth === 'function') window.openAuth('login');
      return;
    }
    const amount = Math.max(1, Math.min(10, Number(count ?? s.openAmount) || 1));
    s.openAmount = amount;
    syncBalance();
    try {
      if (typeof legacyOpenCase === 'function') await legacyOpenCase(amount);
      else throw new Error('openCase engine unavailable');
    } catch (err) {
      console.error('[EmojiDrops] case opening failed', err);
      s.isSpinning = false;
      alert('Не удалось открыть кейс. Попробуйте ещё раз.');
      syncBalance();
    }
  };

  function closeCasePage() {
    const s = state();
    if (s?.isSpinning) return;
    const page = $('openPage');
    if (page) { page.style.display = 'none'; page.setAttribute('aria-hidden', 'true'); }
    $('multiRouletteContainer')?.replaceChildren();
    document.body.classList.remove('ed-opening');
  }
  window.closePage = closeCasePage;

  function profile() {
    if (!logged()) return window.openAuth?.('login');
    const p = $('profilePage');
    if (!p) return;
    p.style.display = 'flex'; p.setAttribute('aria-hidden', 'false');
    $('profileName') && ($('profileName').textContent = state().currentUser.nickname || 'Игрок');
    syncBalance();
    window.renderInventory?.();
    window.updateStatsUI?.();
    document.body.classList.add('ed-profile-open');
  }
  window.openProfile = profile;
  window.closeProfile = () => {
    const p = $('profilePage');
    if (p) { p.style.display = 'none'; p.setAttribute('aria-hidden', 'true'); }
    document.body.classList.remove('ed-profile-open');
  };

  window.openStats = () => { if (!logged()) return window.openAuth?.('login'); window.updateStatsUI?.(); if ($('statsOverlay')) $('statsOverlay').style.display = 'flex'; };
  window.closeStats = () => { if ($('statsOverlay')) $('statsOverlay').style.display = 'none'; };
  window.openHistory = () => { if (!logged()) return window.openAuth?.('login'); if ($('historyOverlay')) $('historyOverlay').style.display = 'flex'; };
  window.closeHistory = () => { if ($('historyOverlay')) $('historyOverlay').style.display = 'none'; };
  window.openUpgradeMenu = () => { if (!logged()) return window.openAuth?.('login'); if ($('upgradePage')) $('upgradePage').style.display = 'flex'; };
  window.closeUpgradeMenu = () => { if ($('upgradePage')) $('upgradePage').style.display = 'none'; };

  function styleRarityCards() {
    document.querySelectorAll('.live-drop').forEach(card => {
      const rarity = [...card.classList].find(x => window.rarities?.[x]);
      const data = rarity && window.rarities[rarity];
      const label = card.querySelector('.live-rarity');
      if (data && label) {
        label.style.color = data.color;
        label.style.borderColor = data.color;
        label.style.boxShadow = `0 0 8px ${data.color}30`;
      }
    });
  }

  function polish() {
    if ($('ed-final-v3')) return;
    const style = document.createElement('style');
    style.id = 'ed-final-v3';
    style.textContent = `
      *{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;-webkit-font-smoothing:antialiased}
      header{width:100%;max-width:100%;padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}
      .cases{width:min(1080px,calc(100% - 32px))!important;margin:32px auto 110px!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:30px 24px!important}
      .case{width:100%!important;min-width:0!important;align-items:center!important;text-align:center!important;cursor:pointer!important}
      .case-emoji{width:112px!important;height:112px!important;min-width:112px!important;display:grid!important;place-items:center!important;font-size:56px!important;line-height:1!important;overflow:hidden!important;border-radius:24px!important;margin:auto!important}
      .case-name{width:100%!important;max-width:180px!important;margin:12px auto 0!important;text-align:center!important;font-size:17px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;transform:none!important}
      .case-price{width:100%!important;min-height:25px!important;margin:6px auto 0!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;line-height:1.1!important}
      .case-price>*{margin:0 auto!important;text-align:center!important}
      .live-drops-bar{width:min(1160px,calc(100% - 28px))!important;margin:0 auto 28px!important;border-radius:20px!important;overflow:hidden!important}
      .live-title{padding:11px 16px!important;font-weight:900!important;letter-spacing:.4px!important}
      .live-container{padding:10px 14px!important;gap:10px!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important;mask-image:none!important;-webkit-mask-image:none!important}
      .live-container::-webkit-scrollbar{display:none!important}
      .live-drop{flex:0 0 142px!important;width:142px!important;height:76px!important;min-height:76px!important;padding:8px!important;border-radius:15px!important;display:flex!important;align-items:center!important;gap:8px!important;overflow:hidden!important}
      .live-emoji{width:42px!important;height:42px!important;min-width:42px!important;display:grid!important;place-items:center!important;font-size:25px!important;line-height:1!important}
      .live-info{min-width:0!important;max-width:78px!important;display:flex!important;flex-direction:column!important;gap:3px!important}
      .live-user{font-size:11px!important;line-height:14px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .live-rarity{width:max-content!important;max-width:78px!important;font-size:9px!important;line-height:12px!important;font-weight:900!important;padding:1px 5px!important;border:1px solid currentColor!important;border-radius:6px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .live-drop.legendary:after{display:none!important}.live-drop.legendary:before{display:none!important}
      #openPage{position:fixed!important;inset:0!important;z-index:8000!important;overflow-y:auto!important;overflow-x:hidden!important;background:#08090d!important}
      #openPage .open-header{width:min(1120px,calc(100% - 32px))!important;margin:0 auto!important;min-height:78px!important;display:flex!important;align-items:center!important;gap:12px!important}
      #openPage .open-header .logo{margin-right:auto!important}.open-balance{position:static!important;margin-left:auto!important;white-space:nowrap!important}.back-btn{position:static!important;transform:none!important;white-space:nowrap!important}
      .roulette-wrapper{width:min(1100px,calc(100% - 32px))!important;margin:22px auto!important}.roulette{width:100%!important;overflow:hidden!important;border-radius:20px!important}
      #multiRouletteContainer{width:100%!important;display:flex!important;flex-direction:column!important;gap:12px!important}.multi-roulette{width:100%!important;min-height:120px!important;overflow:hidden!important;border-radius:16px!important}
      .multi-track{display:flex!important;align-items:center!important;width:max-content!important;min-height:120px!important}.item{flex:0 0 120px!important;width:120px!important;height:100px!important;display:grid!important;place-items:center!important;font-size:48px!important;margin:0 6px!important;border-radius:18px!important}
      .case-items-list{width:min(1100px,calc(100% - 32px))!important;margin:24px auto 60px!important;display:grid!important;grid-template-columns:repeat(auto-fill,minmax(105px,1fr))!important;gap:14px!important;justify-items:center!important}
      .case-item-card{width:105px!important;min-width:0!important;text-align:center!important}.case-item-emoji{width:72px!important;height:72px!important;margin:auto!important;display:grid!important;place-items:center!important;font-size:38px!important;border-radius:16px!important}.case-item-rarity{margin-top:6px!important;font-size:9px!important;font-weight:900!important}.case-item-price{margin-top:3px!important;font-size:13px!important;font-weight:800!important}
      .profile-page,.ed-upgrade-page{position:fixed!important;inset:0!important;z-index:9000!important;display:none;overflow-y:auto!important;overflow-x:hidden!important;background:radial-gradient(900px 360px at 50% -10%,rgba(255,123,0,.18),transparent 70%),linear-gradient(180deg,#0b0c11,#07080b)!important}
      .profile-page .ed-page-head,.ed-upgrade-page .ed-page-head{width:min(1100px,calc(100% - 32px))!important;min-height:80px!important;margin:0 auto!important;display:flex!important;align-items:center!important;gap:12px!important}.profile-settings-btn{order:1!important;width:52px!important;height:52px!important;display:grid!important;place-items:center!important;margin:0!important;font-size:28px!important;border-radius:15px!important}.profile-page .back-btn,.ed-upgrade-page .back-btn{order:3!important;margin-left:auto!important}.ed-profile-wrap{width:min(960px,calc(100% - 32px))!important;margin:12px auto 70px!important}.ed-profile-user{padding:24px!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:24px!important;background:rgba(18,20,27,.78)!important;box-shadow:0 18px 70px rgba(0,0,0,.25)!important}.ed-section-title{margin:28px 0 14px!important}.ed-profile-actions{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;margin-top:24px!important}.profile-mini-btn{min-height:52px!important;border-radius:14px!important}
      .settings-overlay{position:fixed!important;inset:0!important;z-index:10000!important;display:none;place-items:center!important;padding:16px!important;background:rgba(0,0,0,.68)!important;backdrop-filter:blur(12px)!important}.settings-box{width:min(620px,100%)!important;max-height:min(760px,calc(100dvh - 32px))!important;overflow:auto!important;border-radius:24px!important}
      @media(max-width:1000px){.cases{grid-template-columns:repeat(3,minmax(0,1fr))!important}.ed-profile-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:650px){.cases{width:calc(100% - 20px)!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:20px 10px!important}.case-emoji{width:88px!important;height:88px!important;min-width:88px!important;font-size:46px!important;border-radius:19px!important}.case-name{font-size:15px!important}.case-price{font-size:13px!important}.live-drops-bar{width:calc(100% - 16px)!important}.live-drop{flex-basis:132px!important;width:132px!important;height:72px!important;min-height:72px!important}.live-emoji{width:39px!important;height:39px!important;min-width:39px!important;font-size:24px!important}.live-info{max-width:72px!important}.live-rarity{max-width:72px!important}.profile-page .ed-page-head,.ed-upgrade-page .ed-page-head,#openPage .open-header{width:calc(100% - 20px)!important;min-height:70px!important}.ed-profile-wrap{width:calc(100% - 20px)!important}.case-items-list,.roulette-wrapper{width:calc(100% - 20px)!important}.item{flex-basis:94px!important;width:94px!important;height:82px!important;font-size:40px!important}.case-items-list{grid-template-columns:repeat(3,minmax(0,1fr))!important}.case-item-card{width:90px!important}.case-item-emoji{width:62px!important;height:62px!important;font-size:34px!important}}
      @media(max-width:380px){.cases{gap:16px 6px!important}.case-emoji{width:80px!important;height:80px!important;min-width:80px!important}.live-drop{flex-basis:124px!important;width:124px!important}.case-items-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    `;
    document.head.appendChild(style);
  }

  function wire() {
    polish();
    bind('profileSettingsBtn', () => window.openSettings?.());
    bind('profileBackBtn', () => window.closeProfile());
    bind('profileUpgradeBtn', () => window.openUpgradeMenu());
    bind('profileStatsBtn', () => window.openStats());
    bind('profileHistoryBtn', () => window.openHistory());
    bind('profileLogoutBtn', () => window.logout?.());
    bind('settingsCloseBtn', () => window.closeSettings?.());
    bind('statsCloseBtn', () => window.closeStats());
    bind('historyCloseBtn', () => window.closeHistory());
    bind('upgradeBackBtn', () => window.closeUpgradeMenu());
    bind('caseBackButton', () => window.closePage());
    bind('openCaseButton', () => window.openCase());
    bind('fastOpenButton', () => window.openCase());
    document.querySelectorAll('.case').forEach(card => {
      if (card.dataset.finalV3CaseBound) return;
      card.dataset.finalV3CaseBound = '1';
      card.addEventListener('click', () => {
        const match = (card.getAttribute('onclick') || '').match(/openCasePage\(['\"]([^'\"]+)['\"]\)/);
        if (match) window.openCasePage(match[1]);
      });
    });
    styleRarityCards();
    const live = $('liveContainer');
    if (live && !live.dataset.rarityObserver) {
      live.dataset.rarityObserver = '1';
      new MutationObserver(styleRarityCards).observe(live, {childList:true});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire, {once:true}); else wire();
})();
