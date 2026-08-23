(() => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, mythical: 4, legendary: 5 };
    const rarityColors = { common: "#808080", rare: "#3b82f6", epic: "#a855f7", mythical: "#ef4444", legendary: "#ffd000" };

    const priceValue = (value) => Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;

    function getBetterDrop(a, b) {
        if (!a) return b;
        if (!b) return a;
        const rarityDifference = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        if (rarityDifference !== 0) return rarityDifference > 0 ? b : a;
        return priceValue(b.price) > priceValue(a.price) ? b : a;
    }

    function styleBestDropLayout() {
        const emoji = document.getElementById("bestDropEmoji");
        const rarity = document.getElementById("bestDropRarity");
        if (!emoji || !rarity) return;

        emoji.classList.add("best-drop-emoji");
        rarity.classList.add("best-drop-rarity");

        let root = emoji.parentElement;
        while (root && root !== document.body) {
            if ((root.textContent || "").includes("Лучший дроп") && root.contains(rarity)) {
                root.classList.add("best-drop-box");
                break;
            }
            root = root.parentElement;
        }

        for (const element of document.querySelectorAll("div,span,h1,h2,h3,h4,p")) {
            if (element.textContent?.trim() === "Лучший дроп") {
                element.classList.add("best-drop-title");
                break;
            }
        }
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
        } else {
            const color = rarityColors[best.rarity] || "#ff7b00";
            emoji.textContent = best.emoji;
            rarity.textContent = String(best.rarity).toUpperCase();
            emoji.style.borderColor = color;
            rarity.style.color = color;
        }
        styleBestDropLayout();
    }

    function considerBestDrop(item) {
        if (typeof state === "undefined" || !state.currentUser || !item) return;
        const best = getBetterDrop(state.currentUser.bestDrop, item);
        if (best !== state.currentUser.bestDrop) {
            state.currentUser.bestDrop = { emoji: best.emoji, rarity: best.rarity, price: best.price };
            if (typeof saveUsers === "function") saveUsers();
        }
        renderSavedBestDrop();
    }

    window.considerBestDrop = considerBestDrop;
    window.updateBestDrop = renderSavedBestDrop;

    window.openSettings = function () {
        const page = document.getElementById("settingsPage");
        if (page) page.style.display = "flex";
    };

    window.closeSettings = function () {
        const page = document.getElementById("settingsPage");
        if (page) page.style.display = "none";
    };

    window.openStats = function () {
        const page = document.getElementById("statsPage");
        if (!page) return;
        if (typeof updateStatsUI === "function") updateStatsUI();
        page.style.display = "flex";
    };

    window.closeStats = function () {
        const page = document.getElementById("statsPage");
        if (page) page.style.display = "none";
    };

    function protectLiveDropLimit() {
        const container = document.getElementById("liveContainer");
        if (!container || container.__emojiDropsLimitProtected) return;
        const nativeRemoveChild = container.removeChild.bind(container);
        container.removeChild = function (node) {
            if (container.children.length <= 25) return node;
            return nativeRemoveChild(node);
        };
        container.__emojiDropsLimitProtected = true;
    }

    function normalizeLiveDrops() {
        const container = document.getElementById("liveContainer");
        if (!container || typeof allDrops === "undefined" || !allDrops.length) return;
        protectLiveDropLimit();

        while (container.children.length < 25) {
            const username = usernames[Math.floor(Math.random() * usernames.length)];
            const item = allDrops[Math.floor(Math.random() * allDrops.length)];
            const div = document.createElement("div");
            div.className = `live-drop ${item.rarity}`;
            div.innerHTML = `<div class="live-emoji">${item.emoji}</div><div class="live-info"><div class="live-user">${username}</div><div class="live-rarity">${String(item.rarity).toUpperCase()}</div></div>`;
            container.prepend(div);
        }
    }

    function hookOpenCase() {
        if (typeof window.openCase !== "function" || window.openCase.__emojiDropsWrapped) return;
        const originalOpenCase = window.openCase;
        const wrappedOpenCase = async function (...args) {
            const result = await originalOpenCase.apply(this, args);
            if (typeof state !== "undefined" && state.currentUser) {
                if (state.currentWin) considerBestDrop(state.currentWin);
                if (Array.isArray(state.winQueue)) state.winQueue.forEach(considerBestDrop);
            }
            return result;
        };
        wrappedOpenCase.__emojiDropsWrapped = true;
        window.openCase = wrappedOpenCase;
    }

    function hookSellWin() {
        if (typeof window.sellWin !== "function" || window.sellWin.__emojiDropsWrapped) return;
        const originalSellWin = window.sellWin;
        const wrappedSellWin = function (...args) {
            if (typeof state !== "undefined" && state.currentUser && state.currentWin && Array.isArray(state.currentUser.inventory)) {
                const index = state.currentUser.inventory.indexOf(state.currentWin);
                if (index !== -1) state.currentUser.inventory.splice(index, 1);
            }
            const result = originalSellWin.apply(this, args);
            if (typeof saveUsers === "function") saveUsers();
            if (typeof renderInventory === "function") renderInventory();
            renderSavedBestDrop();
            return result;
        };
        wrappedSellWin.__emojiDropsWrapped = true;
        window.sellWin = wrappedSellWin;
    }

    function initUpdates() {
        hookOpenCase();
        hookSellWin();
        protectLiveDropLimit();
        normalizeLiveDrops();
        renderSavedBestDrop();
        styleBestDropLayout();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initUpdates, { once: true });
    } else {
        initUpdates();
    }
    window.addEventListener("load", initUpdates, { once: true });
})();
