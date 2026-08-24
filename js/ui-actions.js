(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const getCurrentUser = () => typeof state !== "undefined" ? state.currentUser : null;
    const persist = () => {
        if (typeof saveUsers === "function") saveUsers();
        if (typeof saveStats === "function") saveStats();
    };

    const requireUser = () => {
        const user = getCurrentUser();
        if (!user) alert("Сначала войдите в аккаунт");
        return user;
    };

    window.openSettings = () => {
        if (!requireUser()) return;
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
        const toggle = byId("themeToggle");
        if (toggle) toggle.checked = document.body.classList.contains("light-theme");
    };

    window.changeNickname = () => {
        const user = requireUser();
        if (!user) return;
        const input = byId("newNickname");
        const nickname = input?.value.trim() || "";
        if (nickname.length < 3) return alert("Ник должен содержать минимум 3 символа");
        if (nickname.length > 24) return alert("Ник слишком длинный");
        if (nickname === user.nickname) return alert("Это уже ваш текущий ник");

        user.nickname = nickname;
        persist();
        if (byId("nickname")) byId("nickname").textContent = nickname;
        if (byId("profileName")) byId("profileName").textContent = nickname;
        if (input) input.value = "";
        alert("Ник изменён");
    };

    window.changePassword = () => {
        const user = requireUser();
        if (!user) return;
        const oldInput = byId("oldPassword");
        const newInput = byId("newPasswordSettings");
        const oldPassword = oldInput?.value.trim() || "";
        const newPassword = newInput?.value.trim() || "";

        if (oldPassword !== user.password) return alert("Старый пароль указан неверно");
        if (newPassword.length < 8) return alert("Новый пароль должен содержать минимум 8 символов");
        if (newPassword === oldPassword) return alert("Новый пароль должен отличаться от старого");

        user.password = newPassword;
        persist();
        if (oldInput) oldInput.value = "";
        if (newInput) newInput.value = "";
        alert("Пароль изменён");
    };

    window.deleteAccount = () => {
        if (!requireUser()) return;
        const confirmBox = byId("deleteConfirm");
        if (confirmBox) confirmBox.style.display = "flex";
    };

    window.openStats = () => {
        if (!requireUser()) return;
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
        if (!requireUser()) return;
        const page = byId("upgradePage");
        if (page) page.style.display = "flex";
        window.closeUpgradeResult?.();
    };

    window.closeUpgradeMenu = () => {
        const page = byId("upgradePage");
        if (page) page.style.display = "none";
        window.closeUpgradeResult?.();
    };

    window.startUpgrade = () => {
        const user = requireUser();
        if (!user) return;

        const inventory = Array.isArray(user.inventory) ? user.inventory : [];
        if (!inventory.length) return alert("В инвентаре нет предметов для апгрейда");
        if (typeof state !== "undefined" && state.upgrading) return;

        if (typeof state !== "undefined") state.upgrading = true;

        try {
            const source = inventory[0];
            const order = ["common", "rare", "epic", "mythical", "legendary"];
            const sourceIndex = order.indexOf(source.rarity);

            if (sourceIndex < 0) return alert("У предмета неизвестная редкость");
            if (sourceIndex >= order.length - 1) return alert("Этот предмет уже максимальной редкости");

            const targetRarity = order[sourceIndex + 1];
            const pool = Object.values(typeof cases !== "undefined" ? cases : {})
                .flat()
                .filter(item => item && item.rarity === targetRarity);

            if (!pool.length) return alert("Нет доступного предмета для апгрейда");

            const success = Math.random() < 0.5;
            const result = success
                ? { ...pool[Math.floor(Math.random() * pool.length)] }
                : { ...source };

            if (success) {
                inventory.shift();
                inventory.push(result);
            }

            if (typeof state !== "undefined") {
                state.stats.upgrades = (state.stats.upgrades || 0) + 1;
            }

            persist();
            if (typeof renderInventory === "function") renderInventory();
            if (typeof updateStatsUI === "function") updateStatsUI();
            if (typeof updateBestDrop === "function") updateBestDrop();

            const resultBox = byId("upgradeResult");
            const resultEmoji = byId("upgradeResultEmoji");
            const resultText = byId("upgradeResultText");

            if (resultBox) resultBox.style.display = "flex";
            if (resultEmoji) resultEmoji.textContent = result.emoji || "❔";
            if (resultText) {
                resultText.textContent = success
                    ? `Успех! ${source.rarity} → ${result.rarity}`
                    : "Неудача — предмет сохранён";
            }
        } finally {
            if (typeof state !== "undefined") state.upgrading = false;
        }
    };

    window.closeUpgradeResult = () => {
        const box = byId("upgradeResult");
        if (box) box.style.display = "none";
    };
})();
