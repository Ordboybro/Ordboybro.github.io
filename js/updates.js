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
        if (user.bestDrop && RARITY_ORDER[user.bestDrop.rarity]) return cloneDrop(user.bestDrop);
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
        rarity.style.color = color;
        emoji.style.borderColor = color;
    }

    function considerBestDrop(item) {
        if (typeof state === "undefined" || !state.currentUser || !item) return;
        const current = getStoredBestDrop(state.currentUser);
        const best = betterDrop(current, item);
        if (compareDrops(best, current) <= 0) {
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

    function normalizeLiveDrop(element) {
        if (!element || element.nodeType !== 1) return;
        const rarity = Object.keys(RARITY_ORDER).find(value =>
            element.classList.contains(value) || element.classList.contains(`${value}-drop`)
        );
        if (!rarity) return;

        const color = RARITY_COLORS[rarity];
        element.classList.add("live-drop", rarity);
        element.dataset.rarity = rarity;
        element.style.setProperty("--live-rarity-color", color);
        element.style.borderColor = color;

        const rarityLabel = element.querySelector(".live-rarity");
        if (rarityLabel) {
            rarityLabel.style.color = color;
            rarityLabel.textContent = rarity.toUpperCase();
        }

        const emoji = element.querySelector(".live-emoji");
        if (emoji) emoji.style.borderColor = color;

        if (rarity === "legendary") {
            element.classList.add("legendary-sparkle");
            element.style.setProperty("--live-sparkle-color", color);
        } else {
            element.classList.remove("legendary-sparkle");
        }
    }

    function normalizeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container) return;
        for (const child of container.children) normalizeLiveDrop(child);
        while (container.children.length > MAX_LIVE_DROPS) container.lastElementChild?.remove();
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
                renderSavedBestDrop();
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

        hookFunction("logout", original => function (...args) {
            const result = original.apply(this, args);
            const emoji = document.getElementById("bestDropEmoji");
            const rarity = document.getElementById("bestDropRarity");
            if (emoji) {
                emoji.textContent = "🏆";
                emoji.style.borderColor = "";
            }
            if (rarity) {
                rarity.textContent = "Нет дропа";
                rarity.style.color = "";
            }
            return result;
        });

        hookFunction("renderInventory", original => function (...args) {
            const result = original.apply(this, args);
            renderSavedBestDrop();
            return result;
        });

        hookFunction("selectAmount", () => function (amount, event) {
            const numericAmount = Number(amount);
            if (!Number.isInteger(numericAmount) || numericAmount < 1 || numericAmount > 10) return;
            if (typeof state !== "undefined") state.openAmount = numericAmount;
            document.querySelectorAll(".amount-btn").forEach(button => button.classList.remove("active"));
            if (event?.target) event.target.classList.add("active");
            if (typeof updateOpenPrice === "function") updateOpenPrice();
        });

        hookFunction("sellWin", original => function (...args) {
            const win = typeof state !== "undefined" ? state.currentWin : null;
            const result = original.apply(this, args);
            if (win && typeof state !== "undefined" && state.currentUser) {
                const inventory = state.currentUser.inventory;
                if (Array.isArray(inventory)) {
                    const index = inventory.findIndex(item => item === win ||
                        (item?.emoji === win?.emoji && item?.rarity === win?.rarity && item?.price === win?.price));
                    if (index !== -1) inventory.splice(index, 1);
                }
            }
            if (typeof saveUsers === "function") saveUsers();
            if (typeof renderInventory === "function") renderInventory();
            renderSavedBestDrop();
            return result;
        });

        hookFunction("startUpgrade", original => function (...args) {
            const result = original.apply(this, args);
            if (typeof state !== "undefined" && state.currentUser) {
                const inventory = Array.isArray(state.currentUser.inventory) ? state.currentUser.inventory : [];
                rememberItems(inventory);
                if (typeof saveUsers === "function") saveUsers();
                renderSavedBestDrop();
            }
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
        const observer = new MutationObserver(normalizeLiveDrops);
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