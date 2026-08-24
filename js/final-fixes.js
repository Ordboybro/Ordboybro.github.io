(() => {
    "use strict";

    // Final compatibility layer: fixes reliability without changing the existing UI/UX.
    const byId = id => document.getElementById(id);

    // EmailJS can fail asynchronously. Keep the original auth flow, but never leave
    // the verification window hanging when the provider/network rejects the request.
    if (typeof window.sendVerificationCode === "function" && !window.sendVerificationCode.__emojiDropsFinalFix) {
        const originalSendVerificationCode = window.sendVerificationCode;
        const wrappedSendVerificationCode = function (email) {
            try {
                const result = originalSendVerificationCode(email);
                if (result && typeof result.catch === "function") {
                    return result.catch(error => {
                        console.error("EmailJS verification error:", error);
                        alert("Ошибка отправки email кода");
                    });
                }
                return result;
            } catch (error) {
                console.error("EmailJS verification error:", error);
                alert("Ошибка отправки email кода");
                return Promise.reject(error);
            }
        };
        wrappedSendVerificationCode.__emojiDropsFinalFix = true;
        window.sendVerificationCode = wrappedSendVerificationCode;
    }

    // Keep the persisted best drop visible even after its item is sold.
    const rarityOrder = Object.freeze({ common: 1, rare: 2, epic: 3, mythical: 4, legendary: 5 });
    const rarityColors = Object.freeze({ common: "#808080", rare: "#3b82f6", epic: "#a855f7", mythical: "#ef4444", legendary: "#ffd000" });

    window.renderPersistedBestDrop = () => {
        if (typeof state === "undefined" || !state.currentUser) return;
        const user = state.currentUser;
        const inventory = Array.isArray(user.inventory) ? user.inventory : [];
        let best = user.bestDrop && rarityOrder[user.bestDrop.rarity] ? user.bestDrop : null;

        for (const item of inventory) {
            if (!item || !rarityOrder[item.rarity]) continue;
            if (!best || rarityOrder[item.rarity] > rarityOrder[best.rarity]) best = item;
        }

        const emoji = byId("bestDropEmoji");
        const rarity = byId("bestDropRarity");
        if (!emoji || !rarity) return;

        if (!best) {
            emoji.textContent = "🏆";
            rarity.textContent = "Нет дропа";
            rarity.style.color = "";
            return;
        }

        user.bestDrop = {
            emoji: best.emoji,
            rarity: best.rarity,
            price: best.price
        };

        emoji.textContent = best.emoji || "🏆";
        rarity.textContent = String(best.rarity).toUpperCase();
        rarity.style.color = rarityColors[best.rarity] || "";
    };

    const originalSaveUsers = window.saveUsers;
    if (typeof originalSaveUsers === "function" && !originalSaveUsers.__emojiDropsFinalFix) {
        const wrappedSaveUsers = function (...args) {
            const result = originalSaveUsers.apply(this, args);
            if (typeof window.renderPersistedBestDrop === "function") window.renderPersistedBestDrop();
            return result;
        };
        wrappedSaveUsers.__emojiDropsFinalFix = true;
        window.saveUsers = wrappedSaveUsers;
    }

    const boot = () => {
        if (typeof window.renderPersistedBestDrop === "function") window.renderPersistedBestDrop();
        const theme = localStorage.getItem("theme");
        if (theme === "true") document.body.classList.add("light-theme");
        const toggle = byId("themeToggle");
        if (toggle) toggle.checked = document.body.classList.contains("light-theme");
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
})();
