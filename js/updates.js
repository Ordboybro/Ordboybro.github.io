(() => {
    "use strict";

    const RARITY_ORDER = Object.freeze({ common: 1, rare: 2, epic: 3, mythical: 4, legendary: 5 });
    const RARITY_COLORS = Object.freeze({ common: "#808080", rare: "#3b82f6", epic: "#a855f7", mythical: "#ef4444", legendary: "#ffd000" });
    const MAX_LIVE_DROPS = 25;

    const priceValue = value => {
        const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const cloneDrop = item => item ? ({ emoji: item.emoji, rarity: item.rarity, price: item.price }) : null;

    const compareDrops = (a, b) => {
        if (!a) return -1;
        if (!b) return 1;
        const rarityDiff = (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);
        return rarityDiff || priceValue(a.price) - priceValue(b.price);
    };

    const betterDrop = (current, candidate) => compareDrops(candidate, current) > 0 ? candidate : current;

    function getStoredBestDrop(user) {
        if (!user) return null;
        const stored = user.bestDrop;
        if (stored && RARITY_ORDER[stored.rarity]) return cloneDrop(stored);

        const inventory = Array.isArray(user.inventory) ? user.inventory : [];
        return inventory.reduce((best, item) => betterDrop(best, item), null);
    }

    function renderSavedBestDrop() {
        if (typeof state === "undefined" || !state.currentUser) return;
        const emoji = document.getElementById("bestDropEmoji");
        const rarity = document.getElementById("bestDropRarity");
        if (!emoji || !rarity) return;

        const best = getStoredBestDrop(state.currentUser);
        if (!best) {
            emoji.textContent = "🏆";
            rarity.textContent = "Нет дропа";
            rarity.style.color = "";
            emoji.style.borderColor = "";
            return;
        }

        const color = RARITY_COLORS[best.rarity] || "#ff7b00";
        emoji.textContent = best.emoji || "🏆";
        rarity.textContent = String(best.rarity).toUpperCase();
        emoji.style.borderColor = color;
        rarity.style.color = color;
    }

    function considerBestDrop(item) {
        if (typeof state === "undefined" || !state.currentUser || !item) return;
        const current = getStoredBestDrop(state.currentUser);
        const best = betterDrop(current, item);
        if (best === current) {
            renderSavedBestDrop();
            return;
        }

        state.currentUser.bestDrop = cloneDrop(best);
        if (typeof saveUsers === "function") saveUsers();
        renderSavedBestDrop();
    }

    function rememberItems(items) {
        if (!Array.isArray(items)) return;
        for (const item of items) considerBestDrop(item);
    }

    function removeCurrentWinFromInventory() {
        if (typeof state === "undefined" || !state.currentUser || !state.currentWin) return;
        const inventory = state.currentUser.inventory;
        if (!Array.isArray(inventory)) return;

        const current = state.currentWin;
        const index = inventory.findIndex(item =>
            item === current ||
            (item?.emoji === current?.emoji && item?.rarity === current?.rarity && item?.price === current?.price)
        );

        if (index !== -1) inventory.splice(index, 1);
    }

    function normalizeLiveDrop(element) {
        if (!element || element.nodeType !== 1) return;
        const rarity = Object.keys(RARITY_ORDER).find(value =>
            element.classList.contains(value) || element.classList.contains(`${value}-drop`)
        );
        if (!rarity) return;
        element.classList.add("live-drop", rarity);
        element.dataset.rarity = rarity;
    }

    function normalizeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container) return;

        for (const child of container.children) normalizeLiveDrop(child);
        while (container.children.length > MAX_LIVE_DROPS) {
            container.lastElementChild?.remove();
        }
    }

    function hookFunction(name, wrapperFactory) {
        if (typeof window[name] !== "function" || window[name].__emojiDropsWrapped) return false;
        const original = window[name];
        const wrapped = wrapperFactory(original);
        if (typeof wrapped !== "function") return false;
        wrapped.__emojiDropsWrapped = true;
        window[name] = wrapped;
        return true;
    }

    function hookApplicationFunctions() {
        hookFunction("openCase", original => async function (...args) {
            const result = await original.apply(this, args);
            if (typeof state !== "undefined") {
                rememberItems(state.winQueue);
                if (state.currentWin) considerBestDrop(state.currentWin);
                if (state.currentUser) renderSavedBestDrop();
            }
            return result;
        });

        hookFunction("loginUser", original => function (...args) {
            const result = original.apply(this, args);
            if (typeof state !== "undefined" && state.currentUser) {
                const best = getStoredBestDrop(state.currentUser);
                if (best) {
                    state.currentUser.bestDrop = best;
                    if (typeof saveUsers === "function") saveUsers();
                }
                renderSavedBestDrop();
            }
            return result;
        });

        hookFunction("renderInventory", original => function (...args) {
            const result = original.apply(this, args);
            renderSavedBestDrop();
            return result;
        });

        hookFunction("sellWin", original => function (...args) {
            removeCurrentWinFromInventory();
            const result = original.apply(this, args);
            if (typeof saveUsers === "function") saveUsers();
            if (typeof renderInventory === "function") renderInventory();
            renderSavedBestDrop();
            return result;
        });

        hookFunction("addLiveDrop", original => function (...args) {
            const result = original.apply(this, args);
            normalizeLiveDrops();
            return result;
        });

        hookFunction("createLiveDrop", original => function (...args) {
            const result = original.apply(this, args);
            normalizeLiveDrops();
            return result;
        });
    }

    function observeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container || container.__emojiDropsObserver) return;

        const observer = new MutationObserver(() => normalizeLiveDrops());
        observer.observe(container, { childList: true });
        container.__emojiDropsObserver = observer;
    }

    function boot() {
        hookApplicationFunctions();
        renderSavedBestDrop();
        normalizeLiveDrops();
        observeLiveDrops();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
