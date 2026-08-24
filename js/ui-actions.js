(() => {
    "use strict";

    const byId = id => document.getElementById(id);

    window.openSettings = () => {
        const el = byId("settingsOverlay");
        if (el) el.style.display = "flex";
        const toggle = byId("themeToggle");
        if (toggle) toggle.checked = document.body.classList.contains("light-theme");
    };

    window.closeSettings = () => {
        const el = byId("settingsOverlay");
        if (el) el.style.display = "none";
    };

    window.toggleTheme = () => {
        document.body.classList.toggle("light-theme");
        localStorage.setItem("theme", document.body.classList.contains("light-theme") ? "true" : "false");
    };

    window.changeNickname = () => {
        if (typeof state === "undefined" || !state.currentUser) return alert("Сначала войдите в аккаунт");
        const input = byId("newNickname");
        const nickname = input?.value.trim();
        if (!nickname) return alert("Введите новый ник");
        if (nickname.length > 24) return alert("Ник слишком длинный");
        state.currentUser.nickname = nickname;
        if (typeof saveUsers === "function") saveUsers();
        if (typeof updateProfileUI === "function") updateProfileUI(true);
        const headerName = byId("nickname");
        if (headerName) headerName.textContent = nickname;
        input.value = "";
    };

    window.changePassword = () => {
        if (typeof state === "undefined" || !state.currentUser) return alert("Сначала войдите в аккаунт");
        const oldPassword = byId("oldPassword")?.value || "";
        const newPassword = byId("newPasswordSettings")?.value || "";
        if (oldPassword !== state.currentUser.password) return alert("Старый пароль указан неверно");
        if (newPassword.length < 8) return alert("Новый пароль должен содержать минимум 8 символов");
        state.currentUser.password = newPassword;
        if (typeof saveUsers === "function") saveUsers();
        byId("oldPassword").value = "";
        byId("newPasswordSettings").value = "";
        alert("Пароль изменён");
    };

    window.deleteAccount = () => {
        if (typeof state === "undefined" || !state.currentUser) return alert("Сначала войдите в аккаунт");
        const confirm = byId("deleteConfirm");
        if (confirm) confirm.style.display = "flex";
    };

    window.openStats = () => {
        const el = byId("statsOverlay");
        if (!el) return;
        el.style.display = "flex";
        if (typeof updateStatsUI === "function") updateStatsUI();
    };

    window.closeStats = () => {
        const el = byId("statsOverlay");
        if (el) el.style.display = "none";
    };

    window.openUpgradeMenu = () => {
        const page = byId("upgradePage");
        if (page) page.style.display = "flex";
    };

    window.closeUpgradeMenu = () => {
        const page = byId("upgradePage");
        if (page) page.style.display = "none";
        window.closeUpgradeResult?.();
    };

    window.startUpgrade = () => {
        if (typeof state === "undefined" || !state.currentUser) return alert("Сначала войдите в аккаунт");
        const inventory = Array.isArray(state.currentUser.inventory) ? state.currentUser.inventory : [];
        if (!inventory.length) return alert("В инвентаре нет предметов для апгрейда");

        const source = inventory[0];
        const order = ["common", "rare", "epic", "mythical", "legendary"];
        const sourceIndex = order.indexOf(source.rarity);
        if (sourceIndex < 0 || sourceIndex >= order.length - 1) return alert("Этот предмет уже максимальной редкости");

        const targetRarity = order[sourceIndex + 1];
        const pool = Object.values(typeof cases !== "undefined" ? cases : {}).flat().filter(item => item.rarity === targetRarity);
        if (!pool.length) return alert("Нет доступного предмета для апгрейда");

        const success = Math.random() < 0.5;
        const result = success ? pool[Math.floor(Math.random() * pool.length)] : source;
        if (success) inventory.shift();
        if (success) inventory.push({ ...result });

        state.stats.upgrades = (state.stats.upgrades || 0) + 1;
        if (typeof saveUsers === "function") saveUsers();
        if (typeof saveStats === "function") saveStats();
        if (typeof renderInventory === "function") renderInventory();
        if (typeof updateStatsUI === "function") updateStatsUI();

        const resultBox = byId("upgradeResult");
        const resultEmoji = byId("upgradeResultEmoji");
        const resultText = byId("upgradeResultText");
        if (resultBox) resultBox.style.display = "flex";
        if (resultEmoji) resultEmoji.textContent = result.emoji;
        if (resultText) resultText.textContent = success ? `Успех! ${source.rarity} → ${result.rarity}` : "Неудача — предмет сохранён";
    };

    window.closeUpgradeResult = () => {
        const box = byId("upgradeResult");
        if (box) box.style.display = "none";
    };
})();
