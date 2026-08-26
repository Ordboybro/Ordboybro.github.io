(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const readUsers = () => { try { const v = JSON.parse(localStorage.getItem('users') || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
  const writeUsers = users => localStorage.setItem('users', JSON.stringify(users));
  const normalizeEmail = v => String(v || '').trim().toLowerCase();

  window.submitAuth = function () {
    const email = normalizeEmail($('authEmail')?.value);
    const password = String($('authPassword')?.value || '');
    const state = window.state;
    if (!state) return alert('Приложение ещё загружается. Повторите попытку.');
    if (!email || !password) return alert('Заполните почту и пароль');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Введите корректную почту');
    if (password.length < 8) return alert('Пароль должен содержать минимум 8 символов');

    const users = readUsers();
    if (state.authMode === 'login') {
      const user = users.find(u => normalizeEmail(u.email) === email && u.password === password);
      if (!user) return alert('Неверная почта или пароль');
      window.loginUser?.(user); window.closeAuth?.(); return;
    }

    if (users.some(u => normalizeEmail(u.email) === email)) return alert('Аккаунт уже существует');
    const user = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), twofa: false, email, password,
      nickname: 'user' + Math.floor(1000 + Math.random() * 9000), balance: 1000, inventory: [],
      stats: { opened: 0, upgrades: 0, deposited: 0, withdrawn: 0, withdrawnItems: 0, spent: 0, received: 0 }, history: []
    };
    users.push(user); writeUsers(users); window.loginUser?.(user); window.closeAuth?.();
  };

  // Browser-local reset. It cannot delete a remote Supabase user from a static frontend.
  window.resetLocalAccount = function () {
    ['currentUser','emojiDropsSession','current_user','authUser','users'].forEach(k => localStorage.removeItem(k));
    if (window.state) { window.state.currentUser = null; window.state.pendingUser = null; window.state.balance = 1000; }
    window.updateProfileUI?.(false); window.updateBalanceUI?.(); window.closeAuth?.();
  };

  window.addEventListener('load', () => {
    const state = window.state;
    if (!state || state.currentUser) return;
    const stored = localStorage.getItem('currentUser') || localStorage.getItem('emojiDropsSession');
    if (!stored) return;
    let email = stored;
    try { const parsed = JSON.parse(stored); email = parsed.email || parsed.user?.email || stored; } catch {}
    const user = readUsers().find(u => normalizeEmail(u.email) === normalizeEmail(email));
    if (user) window.loginUser?.(user);
  }, { once: true });
})();
