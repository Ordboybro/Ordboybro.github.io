(() => {
    "use strict";

    const RARITY_ORDER = Object.freeze({
        common: 1,
        rare: 2,
        epic: 3,
        mythical: 4,
        legendary: 5
    });

    const RARITY_COLORS = Object.freeze({
        common: "#808080",
        rare: "#3b82f6",
        epic: "#a855f7",
        mythical: "#ef4444",
        legendary: "#ffd000"
    });

    const MAX_LIVE_DROPS = 25;

    const priceValue = (value) => {
        const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    };

    function betterDrop(current, candidate) {
        if (!current) return candidate;
        if (!candidate) return current;

        const currentRarity = RARITY_ORDER[current.rarity] || 0;
        const candidateRarity = RARITY_ORDER[candidate.rarity] || 0;

        if (candidateRarity !== currentRarity) {
            return candidateRarity > currentRarity ? candidate : current;
        }

        return priceValue(candidate.price) > priceValue(current.price)
            ? candidate
            : current;
    }

    function renderSavedBestDrop() {
        if (typeof state === "undefined" || !state.currentUser) return;

        const emoji = document.getElementById("bestDropEmoji");
        const rarity = document.getElementById("bestDropRarity");
        if (!emoji || !rarity) return;

        const best = state.currentUser.bestDrop;

        if (!best) {
            emoji.textContent = "🏆";
            rarity.textContent = "Нет дропа";
            emoji.style.borderColor = "#ff7b00";
            rarity.style.color = "#ff7b00";
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
            state.currentUser.bestDrop = {
                emoji: best.emoji,
                rarity: best.rarity,
                price: best.price
            };

            if (typeof saveUsers === "function") saveUsers();
        }

        renderSavedBestDrop();
    }

    function styleBestDrop() {
        const emoji = document.getElementById("bestDropEmoji");
        const rarity = document.getElementById("bestDropRarity");
        if (!emoji || !rarity) return;

        emoji.classList.add("best-drop-emoji");
        rarity.classList.add("best-drop-rarity");

        let container = emoji.parentElement;
        while (container && container !== document.body) {
            if (container.contains(rarity) && container.textContent.includes("Лучший дроп")) {
                container.classList.add("best-drop-box");
                break;
            }
            container = container.parentElement;
        }

        for (const element of document.querySelectorAll("div,span,h1,h2,h3,h4,p")) {
            if (element.textContent.trim() === "Лучший дроп") {
                element.classList.add("best-drop-title");
                break;
            }
        }
    }

    function openPage(id) {
        const page = document.getElementById(id);
        if (page) page.style.display = "flex";
    }

    function closePage(id) {
        const page = document.getElementById(id);
        if (page) page.style.display = "none";
    }

    window.openSettings = () => openPage("settingsPage");
    window.closeSettings = () => closePage("settingsPage");

    window.openStats = () => {
        if (typeof updateStatsUI === "function") updateStatsUI();
        openPage("statsPage");
    };

    window.closeStats = () => closePage("statsPage");
    window.considerBestDrop = considerBestDrop;
    window.updateBestDrop = renderSavedBestDrop;

    function rarityFromClasses(element) {
        for (const rarity of Object.keys(RARITY_ORDER)) {
            if (element.classList.contains(rarity) || element.classList.contains(`${rarity}-drop`)) {
                return rarity;
            }
        }
        return null;
    }

    function normalizeLiveDrop(element) {
        if (!element || element.nodeType !== 1) return;

        const rarity = rarityFromClasses(element);
        if (!rarity) return;

        element.classList.add("live-drop", rarity);

        for (const className of [...element.classList]) {
            if (className.endsWith("-drop") && className !== "live-drop") {
                element.classList.remove(className);
            }
        }
    }

    function enforceLiveLimit() {
        const container = document.getElementById("liveContainer");
        if (!container) return;

        while (container.children.length > MAX_LIVE_DROPS) {
            container.lastElementChild?.remove();
        }
    }

    function normalizeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container) return;

        [...container.children].forEach(normalizeLiveDrop);
        enforceLiveLimit();
    }

    function seedLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container || typeof allDrops === "undefined" || typeof usernames === "undefined") return;

        while (container.children.length < MAX_LIVE_DROPS) {
            const username = usernames[Math.floor(Math.random() * usernames.length)];
            const item = allDrops[Math.floor(Math.random() * allDrops.length)];
            if (!item) break;

            const div = document.createElement("div");
            div.className = `live-drop ${item.rarity}`;
            div.innerHTML = `
                <div class="live-emoji">${item.emoji}</div>
                <div class="live-info">
                    <div class="live-user">${username}</div>
                    <div class="live-rarity">${String(item.rarity).toUpperCase()}</div>
                </div>
            `;
            container.prepend(div);
        }

        enforceLiveLimit();
    }

    function removeCurrentWinFromInventory() {
        if (typeof state === "undefined" || !state.currentUser || !state.currentWin) return;

        const inventory = state.currentUser.inventory;
        if (!Array.isArray(inventory)) return;

        let index = inventory.indexOf(state.currentWin);

        if (index === -1) {
            index = inventory.findIndex(item =>
                item?.emoji === state.currentWin?.emoji &&
                item?.rarity === state.currentWin?.rarity &&
                item?.price === state.currentWin?.price
            );
        }

        if (index !== -1) inventory.splice(index, 1);
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
                if (Array.isArray(state.winQueue)) {
                    state.winQueue.forEach(considerBestDrop);
                }
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

    function initUpdates() {
        hookApplicationFunctions();
        styleBestDrop();
        renderSavedBestDrop();
        normalizeLiveDrops();
        seedLiveDrops();
    }

    function observeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container || container.__emojiDropsObserver) return;

        const observer = new MutationObserver(() => {
            normalizeLiveDrops();
        });

        observer.observe(container, { childList: true });
        container.__emojiDropsObserver = observer;
    }

    function boot() {
        initUpdates();
        observeLiveDrops();

        let attempts = 0;
        const timer = setInterval(() => {
            initUpdates();
            observeLiveDrops();
            attempts += 1;

            if (attempts >= 50) clearInterval(timer);
        }, 100);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
