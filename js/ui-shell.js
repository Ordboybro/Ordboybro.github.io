(() => {
  'use strict';
  const ensure = (id, html) => {
    let el = document.getElementById(id);
    if (el) return el;
    document.body.insertAdjacentHTML('beforeend', html);
    return document.getElementById(id);
  };

  ensure('profilePage', `
    <section class="profile-page" id="profilePage" style="display:none" aria-hidden="true">
      <div class="ed-page-head"><button class="back-btn" onclick="closeProfile()">← Назад</button><button class="profile-settings-btn" onclick="openSettings()" aria-label="Настройки">⚙️</button></div>
      <div class="ed-profile-wrap">
        <div class="ed-profile-user"><div class="profile-avatar">👤</div><div><div class="profile-name" id="profileName">Гость</div><div class="settings-sub">Баланс: <strong><span id="profileBalance">0</span>₽</strong></div></div></div>
        <div class="best-drop-box"><div class="best-drop-title">Лучший дроп</div><div class="best-drop-card"><div class="best-drop-emoji" id="bestDropEmoji">🏆</div><div class="best-drop-rarity" id="bestDropRarity">Нет дропа</div><div id="bestDropPrice" class="settings-sub"></div></div></div>
        <div class="ed-profile-actions">
          <button class="profile-mini-btn" onclick="openStats()">📊 Статистика</button>
          <button class="profile-mini-btn" onclick="openUpgradeMenu()">⬆️ Апгрейд</button>
          <button class="profile-mini-btn" onclick="openHistory()">🕘 История</button>
          <button class="profile-mini-btn danger" onclick="logout()">🚪 Выйти</button>
        </div>
        <div class="ed-section-title">Инвентарь</div><div class="profile-content"><div class="inventory-grid" id="inventoryGrid"></div></div>
      </div>
    </section>`);

  ensure('settingsOverlay', `<div class="settings-overlay" id="settingsOverlay" style="display:none"><div class="settings-box"><div class="settings-header"><div class="settings-title">Настройки</div><button class="settings-close" onclick="closeSettings()">✕</button></div><div class="settings-list"><div class="settings-item-column"><div class="settings-name">Новый ник</div><input class="settings-input" id="newNickname" autocomplete="nickname" placeholder="Ник"><button class="settings-action-btn" onclick="changeNickname()">Сохранить</button></div><div class="settings-item-column"><div class="settings-name">Смена пароля</div><input class="settings-input" id="oldPassword" type="password" autocomplete="current-password" placeholder="Старый пароль"><input class="settings-input" id="newPasswordSettings" type="password" autocomplete="new-password" placeholder="Новый пароль"><button class="settings-action-btn" onclick="changePassword()">Изменить пароль</button></div><div class="settings-item ed-delete-row"><div><div class="settings-name red">Удалить аккаунт</div><div class="settings-sub">Действие нельзя отменить</div></div><button class="settings-action-btn delete-btn" onclick="deleteAccount()">Удалить</button></div></div></div></div>`);

  ensure('statsOverlay', `<div class="stats-overlay settings-overlay" id="statsOverlay" style="display:none"><div class="settings-box"><div class="settings-header"><div class="settings-title">Статистика</div><button class="settings-close" onclick="closeStats()">✕</button></div><div class="settings-list"><div class="settings-item"><span>Открыто кейсов</span><strong id="openedCases">0</strong></div><div class="settings-item"><span>Апгрейдов</span><strong id="upgradeCount">0</strong></div><div class="settings-item"><span>Потрачено</span><strong id="spentAmount">0₽</strong></div><div class="settings-item"><span>Получено</span><strong id="receivedAmount">0₽</strong></div><div class="settings-item"><span>Продано предметов</span><strong id="withdrawItems">0</strong></div></div></div></div>`);

  ensure('historyOverlay', `<div class="settings-overlay" id="historyOverlay" style="display:none"><div class="settings-box"><div class="settings-header"><div class="settings-title">История</div><button class="settings-close" onclick="closeHistory()">✕</button></div><div class="settings-list" id="historyList"></div></div></div>`);
})();