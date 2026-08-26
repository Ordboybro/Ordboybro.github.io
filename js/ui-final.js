(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const user = () => window.state?.currentUser || null;
  const money = v => Number(String(v ?? 0).replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;
  const bind = (id, fn) => { const el = document.getElementById(id); if (!el || el.dataset.finalBound) return; el.dataset.finalBound = '1'; el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); try { fn(e); } catch (err) { console.error('[EmojiDrops]', err); } }); };

  window.changeNickname = () => {
    const u = user(), input = $('#newNickname'); if (!u || !input) return;
    const nickname = input.value.trim();
    if (nickname.length < 2 || nickname.length > 20) return alert('Ник должен содержать от 2 до 20 символов');
    u.nickname = nickname; if ($('#nickname')) $('#nickname').textContent = nickname; if ($('#profileName')) $('#profileName').textContent = nickname;
    window.saveUsers?.(); window.closeSettings?.();
  };
  window.changePassword = () => {
    const u = user(), oldEl = $('#oldPassword'), newEl = $('#newPasswordSettings'); if (!u || !oldEl || !newEl) return;
    const oldPass = oldEl.value, next = newEl.value;
    if (!oldPass || !next || next.length < 6) return alert('Новый пароль должен содержать минимум 6 символов');
    if (u.password && u.password !== oldPass) return alert('Старый пароль указан неверно');
    u.password = next; window.saveUsers?.(); oldEl.value = ''; newEl.value = ''; window.closeSettings?.(); alert('Пароль изменён');
  };
  window.deleteAccount = () => {
    const u = user(); if (!u) return;
    if (!confirm('Удалить аккаунт? Это действие нельзя отменить.')) return;
    const users = typeof window.getUsers === 'function' ? window.getUsers() : [];
    const filtered = users.filter(x => x !== u && x.email !== u.email);
    localStorage.setItem('users', JSON.stringify(filtered)); window.state.currentUser = null; window.state.balance = 100;
    window.closeSettings?.(); window.closeProfile?.(); window.updateBalanceUI?.(); window.updateProfileUI?.(false);
  };

  function improveButtons() {
    if ($('#ed-final-polish')) return;
    const style = document.createElement('style'); style.id = 'ed-final-polish'; style.textContent = `
      :root{--ed-orange:#ff7b00;--ed-ease:cubic-bezier(.22,1,.36,1)}
      button{touch-action:manipulation}
      .main-btn,.back-btn,.profile-mini-btn,.settings-action-btn,.amount-btn,.settings-close,.profile-settings-btn{position:relative;overflow:hidden;transition:transform .18s var(--ed-ease),box-shadow .25s var(--ed-ease),border-color .25s var(--ed-ease),background .25s var(--ed-ease)}
      .main-btn::after,.profile-mini-btn::after,.settings-action-btn::after,.back-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.10) 50%,transparent 75%);transform:translateX(-120%);transition:transform .6s var(--ed-ease);pointer-events:none}
      .main-btn:hover::after,.profile-mini-btn:hover::after,.settings-action-btn:hover::after,.back-btn:hover::after{transform:translateX(120%)}
      .main-btn:hover,.profile-mini-btn:hover,.settings-action-btn:hover,.back-btn:hover,.profile-settings-btn:hover{transform:translateY(-2px)}
      .main-btn:active,.profile-mini-btn:active,.settings-action-btn:active,.back-btn:active,.profile-settings-btn:active{transform:translateY(0) scale(.98)}
      .case{contain:layout paint}.live-drop{contain:layout paint;will-change:transform}.multi-track{will-change:transform;transform:translate3d(0,0,0)}
      .live-container{scrollbar-width:none;overscroll-behavior-x:contain}.live-container::-webkit-scrollbar{display:none}
      .live-drop.legendary{overflow:hidden!important;border-color:#ffd000!important;background:linear-gradient(135deg,#17130a,#302408)!important;box-shadow:0 0 24px rgba(255,208,0,.18)!important}.live-drop.legendary::before{content:'✦';position:absolute;z-index:2;left:9px;top:5px;color:#fff0a6;text-shadow:0 0 12px #ffd000}.live-drop.legendary::after{content:'';position:absolute;inset:-80% -30%;background:linear-gradient(105deg,transparent 42%,rgba(255,245,190,.42) 50%,transparent 58%);transform:translateX(-75%) rotate(8deg);animation:edLegendarySweep 2.8s var(--ed-ease) infinite;pointer-events:none}
      .profile-page .ed-page-head{display:flex!important;justify-content:space-between!important;align-items:center!important}.profile-page .profile-settings-btn{margin-right:auto!important}.profile-page .back-btn{margin-left:auto!important}
      .case-route #openPage .open-header,#openPage .open-header{display:flex!important;align-items:center!important;justify-content:space-between!important}.case-route #openPage .open-header .logo,#openPage .open-header .logo{margin-right:auto!important}.case-route #openPage .open-balance,#openPage .open-header .open-balance{position:static!important;transform:none!important;margin-left:auto!important;margin-right:14px!important}.case-route #openPage .open-header .back-btn,#openPage .open-header .back-btn{position:static!important;transform:none!important;margin:0!important}
      .ed-section-title{position:relative}.ed-section-title::after{content:'';display:block;width:64px;height:3px;margin-top:9px;border-radius:99px;background:linear-gradient(90deg,#ff7b00,transparent)}
      @keyframes edLegendarySweep{0%,20%{transform:translateX(-75%) rotate(8deg)}65%,100%{transform:translateX(75%) rotate(8deg)}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
    `; document.head.appendChild(style);
  }

  function wire() {
    bind('saveNicknameBtn', window.changeNickname); bind('savePasswordBtn', window.changePassword);
    bind('profileSettingsBtn', () => window.openSettings?.()); bind('profileBackBtn', () => window.closeProfile?.());
    bind('profileUpgradeBtn', () => window.openUpgradeMenu?.()); bind('profileStatsBtn', () => window.openStats?.()); bind('profileHistoryBtn', () => window.openHistory?.());
    bind('settingsCloseBtn', () => window.closeSettings?.()); bind('statsCloseBtn', () => window.closeStats?.()); bind('historyCloseBtn', () => window.closeHistory?.());
    bind('upgradeBackBtn', () => window.closeUpgradeMenu?.()); bind('caseBackButton', () => window.closePage?.());
    improveButtons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire, { once: true }); else wire();
})();