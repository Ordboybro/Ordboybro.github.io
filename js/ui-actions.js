(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const getCurrentUser = () => typeof state !== "undefined" ? state.currentUser : null;
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
    };

    window.closeUpgradeMenu = () => {
        const page = byId("upgradePage");
        if (page) page.style.display = "none";
        if (typeof window.closeUpgradeResult === "function") window.closeUpgradeResult();
    };
})();
