(() => {
    "use strict";

    const ensure = (id, html) => {
        if (document.getElementById(id)) return document.getElementById(id);
        document.body.insertAdjacentHTML("beforeend", html);
        return document.getElementById(id);
    };

    ensure("profilePage", `<section class="profile-page" id="profilePage" aria-hidden="true">
        <div class="profile-top-line"></div>
        <button class="back-btn back-btn-profile" onclick="closeProfile()">← Назад</button>
        <button class="profile-settings-btn profile-icon-btn" onclick="openSettings()" aria-label="Настройки">⚙️</button>
        <div class="profile-main">
            <div class="profile-side"><button class="profile-mini-btn" onclick="openStats()">📊 Статистика</button><button class="profile-mini-btn" onclick="openUpgradeMenu()">⬆️ Апгрейд</button></div>
            <div class="profile-box-center"><div class="profile-avatar">👤</div><div class="profile-name" id="profileName">Гость</div><div class="settings-sub">Баланс: <span id="profileBalance">1000</span>₽</div></div>
            <div class="profile-side"><button class="profile-mini-btn" onclick="openSettings()">⚙️ Настройки</button><button class="profile-mini-btn" onclick="logout()">🚪 Выйти</button></div>
        </div>
        <div class="best-drop-box"><div class="best-drop-title">Лучший дроп</div><div class="best-drop-card"><div class="best-drop-emoji" id="bestDropEmoji">🏆</div><div class="best-drop-rarity" id="bestDropRarity">Нет дропа</div></div></div>
        <div class="profile-content"><div class="inventory-grid" id="inventoryGrid"></div></div>
    </section>`);

    ensure("verifyPopup", `<div class="auth-popup" id="verifyPopup" style="display:none"><div class="auth-box"><div class="auth-title">Подтверждение</div><input class="auth-input" id="verifyCode" inputmode="numeric" maxlength="6" placeholder="Код из письма"><label class="settings-item" style="margin:12px 0;"><span class="settings-name">2FA</span><span class="switch"><input type="checkbox" id="twofaToggle"><span class="slider"></span></span></label><button class="auth-btn" onclick="confirmCode()">Подтвердить</button></div></div>`);

    ensure("settingsOverlay", `<div class="settings-overlay" id="settingsOverlay" style="display:none"><div class="settings-box"><div class="settings-line"></div><div class="settings-header"><div class="settings-title">Настройки</div><button class="settings-close" onclick="closeSettings()">✕</button></div><div class="settings-list"><div class="settings-item"><div><div class="settings-name">Тёмная тема</div><div class="settings-sub">Переключить оформление</div></div><label class="switch"><input type="checkbox" id="themeToggle" onchange="toggleTheme()"><span class="slider"></span></label></div><div class="settings-item-column"><div class="settings-name">Новый ник</div><input class="settings-input" id="newNickname" placeholder="Ник"><button class="settings-action-btn" onclick="changeNickname()">Сохранить</button></div><div class="settings-item-column"><div class="settings-name">Смена пароля</div><input class="settings-input" id="oldPassword" type="password" placeholder="Старый пароль"><input class="settings-input" id="newPasswordSettings" type="password" placeholder="Новый пароль"><button class="settings-action-btn" onclick="changePassword()">Изменить пароль</button></div><div class="settings-item"><div><div class="settings-name red">Удалить аккаунт</div><div class="settings-sub">Действие нельзя отменить</div></div><button class="settings-action-btn delete-btn" onclick="deleteAccount()">Удалить</button></div></div></div></div>`);

    ensure("statsOverlay", `<div class="stats-overlay settings-overlay" id="statsOverlay" style="display:none"><div class="settings-box"><div class="settings-line"></div><div class="settings-header"><div class="settings-title">Статистика</div><button class="settings-close" onclick="closeStats()">✕</button></div><div class="settings-list"><div class="settings-item"><span class="settings-name">Открыто кейсов</span><strong id="openedCases">0</strong></div><div class="settings-item"><span class="settings-name">Апгрейдов</span><strong id="upgradeCount">0</strong></div><div class="settings-item"><span class="settings-name">Пополнено</span><strong id="depositAmount">0₽</strong></div><div class="settings-item"><span class="settings-name">Выведено</span><strong id="withdrawAmount">0₽</strong></div><div class="settings-item"><span class="settings-name">Предметов продано</span><strong id="withdrawItems">0</strong></div></div></div></div>`);

    ensure("upgradePage", `<section class="upgrade-page" id="upgradePage" style="display:none"><button class="back-btn back-btn-profile" onclick="closeUpgradeMenu()">← Назад</button><div class="profile-top-line"></div><div class="profile-main"><div class="profile-box-center"><div class="profile-name">Апгрейд</div><div class="settings-sub">Попробуйте улучшить свой предмет</div><button class="main-btn" style="margin-top:25px" onclick="startUpgrade()">⬆️ АПГРЕЙД</button><div id="upgradeResult" style="display:none;align-items:center;flex-direction:column;gap:12px;margin-top:25px"><div id="upgradeResultEmoji" style="font-size:60px"></div><div id="upgradeResultText" class="settings-name"></div><button class="settings-action-btn" onclick="closeUpgradeResult()">Закрыть</button></div></div></div></section>`);

    ensure("deleteConfirm", `<div class="auth-popup" id="deleteConfirm" style="display:none"><div class="auth-box"><div class="auth-title">Удалить аккаунт?</div><button class="auth-btn" onclick="confirmDelete()">Удалить</button><button class="auth-btn close-auth" onclick="document.getElementById('deleteConfirm').style.display='none'">Отмена</button></div></div>`);

    window.openSettings = () => { const el = document.getElementById("settingsOverlay"); if (el) el.style.display = "flex"; };
    window.closeSettings = () => { const el = document.getElementById("settingsOverlay"); if (el) el.style.display = "none"; };
    window.openStats = () => { const el = document.getElementById("statsOverlay"); if (el) { el.style.display = "flex"; if (typeof updateStatsUI === "function") updateStatsUI(); } };
    window.closeStats = () => { const el = document.getElementById("statsOverlay"); if (el) el.style.display = "none"; };

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) themeToggle.checked = document.body.classList.contains("light-theme");

    const twofaToggle = document.getElementById("twofaToggle");
    if (twofaToggle) twofaToggle.addEventListener("change", () => {
        if (typeof state === "undefined" || !state.currentUser) return;
        state.currentUser.twofa = twofaToggle.checked;
        if (typeof saveUsers === "function") saveUsers();
    });
})();
