(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const users = () => {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); }
    catch { return []; }
  };

  // The old login flow incorrectly sent an email code even when 2FA was disabled,
  // then tried to open a verification popup that was not present in the page.
  // Keep email verification only for accounts that explicitly enabled 2FA.
  window.submitAuth = function () {
    const email = ($('authEmail')?.value || '').trim().toLowerCase();
    const password = ($('authPassword')?.value || '').trim();
    const state = window.state;
    if (!state) return alert('Приложение ещё загружается. Повторите попытку.');
    if (!email || !password) return alert('Заполните поля');
    if (password.length < 8) return alert('Минимум 8 символов');

    const list = users();

    if (state.authMode === 'login') {
      const user = list.find(u => String(u.email || '').toLowerCase() === email && u.password === password);
      if (!user) return alert('Неверная почта или пароль');

      state.pendingUser = user;
      if (user.twofa) return window.sendVerificationCode?.(email);

      window.loginUser?.(user);
      state.pendingUser = null;
      window.closeAuth?.();
      return;
    }

    if (list.some(u => String(u.email || '').toLowerCase() === email)) {
      return alert('Аккаунт уже существует');
    }

    state.pendingUser = {
      twofa: false,
      email,
      password,
      nickname: 'user' + Math.floor(Math.random() * 1000),
      balance: 1000,
      inventory: [],
      stats: { opened: 0, upgrades: 0, deposited: 0, withdrawn: 0, withdrawnItems: 0 },
      history: []
    };

    // Registration still uses email verification, but the popup is guaranteed below.
    if (typeof window.sendVerificationCode === 'function') {
      window.sendVerificationCode(email);
    } else {
      alert('Сервис подтверждения почты недоступен');
    }
  };

  window.confirmCode = function () {
    const state = window.state;
    const code = ($('verifyCode')?.value || '').trim();
    if (!state?.pendingUser) return alert('Сессия регистрации истекла');
    if (!code || Number(code) !== Number(state.generatedCode)) return alert('Неверный код');

    const list = users();
    const user = state.pendingUser;
    if (state.authMode === 'register') {
      list.push(user);
      localStorage.setItem('users', JSON.stringify(list));
    }
    window.loginUser?.(user);
    state.pendingUser = null;
    window.saveUsers?.();
    window.closeAuth?.();
    if ($('verifyPopup')) $('verifyPopup').style.display = 'none';
    if ($('verifyCode')) $('verifyCode').value = '';
  };

  // Recover a previously saved local session without overwriting its data.
  window.addEventListener('load', () => {
    const state = window.state;
    if (!state || state.currentUser) return;
    const email = localStorage.getItem('currentUser');
    if (!email) return;
    const user = users().find(u => String(u.email || '').toLowerCase() === String(email).toLowerCase());
    if (user) window.loginUser?.(user);
  }, { once: true });
})();
