(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
  const USERS_KEY = 'users';
  const SESSION_KEY = 'emojiDropsSession';

  const readUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  };

  const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const saveSession = (user) => {
    if (!user?.email) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, updatedAt: Date.now() }));
    localStorage.setItem('currentUser', user.email);
  };

  const restoreSession = () => {
    if (!window.state || window.state.currentUser) return;
    const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem('currentUser');
    if (!raw) return;

    let email = raw;
    try {
      const parsed = JSON.parse(raw);
      email = parsed.email || parsed.user?.email || raw;
    } catch {
      // Old session format stores email directly.
    }

    const user = readUsers().find((candidate) => normalizeEmail(candidate.email) === normalizeEmail(email));
    if (!user) return;

    window.loginUser?.(user);
    if (window.state?.currentUser) saveSession(window.state.currentUser);
  };

  const syncCurrentUser = () => {
    const state = window.state;
    const user = state?.currentUser;
    if (!state || !user?.email) return;

    const users = readUsers();
    const index = users.findIndex((candidate) => normalizeEmail(candidate.email) === normalizeEmail(user.email));
    const snapshot = {
      ...users[index],
      ...user,
      balance: Number(state.balance ?? user.balance ?? 0),
      inventory: Array.isArray(user.inventory) ? user.inventory : [],
      stats: { ...(user.stats || {}), ...(state.stats || {}) },
      history: Array.isArray(user.history) ? user.history : []
    };

    if (index >= 0) users[index] = snapshot;
    else users.push(snapshot);

    writeUsers(users);
    state.currentUser = snapshot;
    saveSession(snapshot);
  };

  window.submitAuth = function submitAuth() {
    const email = normalizeEmail(byId('authEmail')?.value);
    const password = String(byId('authPassword')?.value || '');
    const state = window.state;

    if (!state) return alert('Приложение ещё загружается.');
    if (!email || !password) return alert('Заполните почту и пароль');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Введите корректную почту');
    if (password.length < 8) return alert('Пароль должен содержать минимум 8 символов');

    const users = readUsers();

    if (state.authMode === 'login') {
      const user = users.find((candidate) => normalizeEmail(candidate.email) === email && candidate.password === password);
      if (!user) return alert('Неверная почта или пароль');

      window.loginUser?.(user);
      if (!window.state?.currentUser) return alert('Не удалось восстановить сессию');
      saveSession(window.state.currentUser);
      window.closeAuth?.();
      return;
    }

    if (users.some((candidate) => normalizeEmail(candidate.email) === email)) {
      return alert('Аккаунт уже существует');
    }

    const user = {
      id: `local_${crypto?.randomUUID?.() || Date.now()}`,
      twofa: false,
      email,
      password,
      nickname: `user${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 1000,
      inventory: [],
      stats: { opened: 0, upgrades: 0, deposited: 0, withdrawn: 0, withdrawnItems: 0, spent: 0, received: 0 },
      history: []
    };

    users.push(user);
    writeUsers(users);
    window.loginUser?.(user);
    if (!window.state?.currentUser) return alert('Не удалось создать сессию');
    saveSession(window.state.currentUser);
    window.closeAuth?.();
  };

  window.resetLocalAccount = function resetLocalAccount() {
    if (!confirm('Сбросить только текущую локальную сессию? Аккаунты и инвентарь останутся сохранены на этом устройстве.')) return;
    ['currentUser', SESSION_KEY, 'current_user', 'authUser'].forEach((key) => localStorage.removeItem(key));
    if (window.state) {
      window.state.currentUser = null;
      window.state.pendingUser = null;
      window.state.balance = 1000;
    }
    window.updateProfileUI?.(false);
    window.updateBalanceUI?.();
    window.closeAuth?.();
  };

  const originalSaveUsers = window.saveUsers;
  if (typeof originalSaveUsers === 'function' && !window.__emojiDropsSaveUsersWrapped) {
    window.__emojiDropsSaveUsersWrapped = true;
    window.saveUsers = function wrappedSaveUsers(...args) {
      const result = originalSaveUsers.apply(this, args);
      syncCurrentUser();
      return result;
    };
  }

  window.addEventListener('load', restoreSession, { once: true });
  window.addEventListener('beforeunload', syncCurrentUser);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') syncCurrentUser();
  });
})();
