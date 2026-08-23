(() => {
    const rarityOrder = {
        common: 1,
        rare: 2,
        epic: 3,
        mythical: 4,
        legendary: 5
    };

    const rarityColors = {
        common: "#808080",
        rare: "#3b82f6",
        epic: "#a855f7",
        mythical: "#ef4444",
        legendary: "#ffd000"
    };

    const priceValue = (value) =>
        Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;

    const getBest = (a, b) => {
        if (!a) return b;
        if (!b) return a;

        const rarityDifference =
            (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);

        if (rarityDifference !== 0) {
            return rarityDifference > 0 ? b : a;
        }

        return priceValue(b.price) > priceValue(a.price) ? b : a;
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
            emoji.style.borderColor = "#ff7b00";
            rarity.style.color = "#ff7b00";
            return;
        }

        const color = rarityColors[best.rarity] || "#ff7b00";

        emoji.textContent = best.emoji;
        rarity.textContent = String(best.rarity).toUpperCase();
        emoji.style.borderColor = color;
        rarity.style.color = color;
    }

    function considerBestDrop(item) {
        if (typeof state === "undefined" || !state.currentUser || !item) {
            return;
        }

        const best = getBest(state.currentUser.bestDrop, item);

        if (best !== state.currentUser.bestDrop) {
            state.currentUser.bestDrop = {
                emoji: best.emoji,
                rarity: best.rarity,
                price: best.price
            };

            if (typeof saveUsers === "function") {
                saveUsers();
            }
        }

        renderSavedBestDrop();
    }

    window.considerBestDrop = considerBestDrop;

    window.updateBestDrop = function () {
        renderSavedBestDrop();
    };

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

        if (typeof updateStatsUI === "function") {
            updateStatsUI();
        }

        page.style.display = "flex";
    };

    window.closeStats = function () {
        const page = document.getElementById("statsPage");
        if (page) page.style.display = "none";
    };

    function rebuildLiveDrop(username, item) {
        const container = document.getElementById("liveContainer");
        if (!container || !item) return;

        const div = document.createElement("div");
        div.className = `live-drop ${item.rarity}`;

        const rarityColor = rarityColors[item.rarity] || "#808080";

        div.innerHTML = `
            <div class="live-emoji">${item.emoji}</div>
            <div class="live-info">
                <div class="live-user">${username}</div>
                <div class="live-rarity" style="color:${rarityColor}">
                    ${String(item.rarity).toUpperCase()}
                </div>
            </div>
        `;

        container.prepend(div);

        while (container.children.length > 25) {
            container.removeChild(container.lastElementChild);
        }
    }

    window.addLiveDrop = rebuildLiveDrop;
    window.createLiveDrop = rebuildLiveDrop;

    function fillLiveDropsTo25() {
        const container = document.getElementById("liveContainer");

        if (!container || typeof allDrops === "undefined" || !allDrops.length) {
            return;
        }

        while (container.children.length < 25) {
            const username = usernames[
                Math.floor(Math.random() * usernames.length)
            ];
            const item = allDrops[
                Math.floor(Math.random() * allDrops.length)
            ];

            rebuildLiveDrop(username, item);
        }
    }

    function hookOpenCase() {
        if (typeof window.openCase !== "function" || window.openCase.__emojiDropsWrapped) {
            return;
        }

        const originalOpenCase = window.openCase;

        const wrappedOpenCase = async function (...args) {
            const result = await originalOpenCase.apply(this, args);

            if (typeof state !== "undefined" && state.currentUser) {
                const current = state.currentWin;
                if (current) considerBestDrop(current);

                if (Array.isArray(state.winQueue)) {
                    state.winQueue.forEach(considerBestDrop);
                }
            }

            return result;
        };

        wrappedOpenCase.__emojiDropsWrapped = true;
        window.openCase = wrappedOpenCase;
    }

    function hookSellWin() {
        if (typeof window.sellWin !== "function" || window.sellWin.__emojiDropsWrapped) {
            return;
        }

        const originalSellWin = window.sellWin;

        const wrappedSellWin = function (...args) {
            if (
                typeof state !== "undefined" &&
                state.currentUser &&
                state.currentWin &&
                Array.isArray(state.currentUser.inventory)
            ) {
                const index = state.currentUser.inventory.indexOf(state.currentWin);

                if (index !== -1) {
                    state.currentUser.inventory.splice(index, 1);
                }
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
        fillLiveDropsTo25();
        renderSavedBestDrop();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initUpdates, { once: true });
    } else {
        initUpdates();
    }

    window.addEventListener("load", initUpdates, { once: true });
})();
