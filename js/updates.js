(() => {
    "use strict";

    const RARITY_ORDER = Object.freeze({ common: 1, rare: 2, epic: 3, mythical: 4, legendary: 5 });
    const RARITY_COLORS = Object.freeze({ common: "#808080", rare: "#3b82f6", epic: "#a855f7", mythical: "#ef4444", legendary: "#ffd000" });
    const MAX_LIVE_DROPS = 25;

    const priceValue = value => {
        const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const betterDrop = (current, candidate) => {
        if (!current) return candidate;
        if (!candidate) return current;
        const currentRarity = RARITY_ORDER[current.rarity] || 0;
        const candidateRarity = RARITY_ORDER[candidate.rarity] || 0;
        if (candidateRarity !== currentRarity) return candidateRarity > currentRarity ? candidate : current;
        return priceValue(candidate.price) > priceValue(current.price) ? candidate : current;
    };

    function renderSavedBestDrop() {
        if (typeof state === "undefined" || !state.currentUser) return;
        const emoji = document.getElementById("bestDropEmoji");
        const rarity = document.getElementById("bestDropRarity");
        if (!emoji || !rarity) return;
        const best = state.currentUser.bestDrop;
        if (!best) {
            emoji.textContent = "🏆";
            rarity.textContent = "Нет дропа";
            return;
        }
        const color = RARITY_COLORS[best.rarity] || "#ff7b00";
        emoji.textContent = best.emoji || "🏆";
        rarity.textContent = String(best.rarity || "").toUpperCase();
        emoji.style.borderColor = color;
        rarity.style.color = color;
    }

    function considerBestDrop(item) {
        if (typeof state === "undefined" || !state.currentUser || !item) return;
        const best = betterDrop(state.currentUser.bestDrop, item);
        if (best !== state.currentUser.bestDrop) {
            state.currentUser.bestDrop = { emoji: best.emoji, rarity: best.rarity, price: best.price };
            if (typeof saveUsers === "function") saveUsers();
        }
        renderSavedBestDrop();
    }

    function removeCurrentWinFromInventory() {
        if (typeof state === "undefined" || !state.currentUser || !state.currentWin) return;
        const inventory = state.currentUser.inventory;
        if (!Array.isArray(inventory)) return;
        let index = inventory.indexOf(state.currentWin);
        if (index === -1) {
            index = inventory.findIndex(item => item?.emoji === state.currentWin?.emoji && item?.rarity === state.currentWin?.rarity && item?.price === state.currentWin?.price);
        }
        if (index !== -1) inventory.splice(index, 1);
    }

    function rarityFromClasses(element) {
        return Object.keys(RARITY_ORDER).find(rarity => element.classList.contains(rarity) || element.classList.contains(`${rarity}-drop`)) || null;
    }

    function normalizeLiveDrop(element) {
        if (!element || element.nodeType !== 1) return;
        const rarity = rarityFromClasses(element);
        if (!rarity) return;
        element.classList.add("live-drop", rarity);
        [...element.classList].filter(name => name.endsWith("-drop") && name !== "live-drop").forEach(name => element.classList.remove(name));
    }

    function enforceLiveLimit() {
        const container = document.getElementById("liveContainer");
        if (!container) return;
        while (container.children.length > MAX_LIVE_DROPS) container.lastElementChild?.remove();
    }

    function normalizeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container) return;
        [...container.children].forEach(normalizeLiveDrop);
        enforceLiveLimit();
    }

    function hookFunction(name, wrapperFactory) {
        if (typeof window[name] !== "function" || window[name].__emojiDropsWrapped) return false;
        const original = window[name];
        const wrapped = wrapperFactory(original);
        wrapped.__emojiDropsWrapped = true;
        window[name] = wrapped;
        return true;
    }

    function hookApplicationFunctions() {
        hookFunction("openCase", original => async function (...args) {
            const result = await original.apply(this, args);
            if (typeof state !== "undefined") {
                if (state.currentWin) considerBestDrop(state.currentWin);
                if (Array.isArray(state.winQueue)) state.winQueue.forEach(considerBestDrop);
            }
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
    }

    function boot() {
        hookApplicationFunctions();
        renderSavedBestDrop();
        normalizeLiveDrops();
        const container = document.getElementById("liveContainer");
        if (container && !container.__emojiDropsObserver) {
            const observer = new MutationObserver(normalizeLiveDrops);
            observer.observe(container, { childList: true });
            container.__emojiDropsObserver = observer;
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
})();
