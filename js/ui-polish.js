(() => {
    "use strict";

    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
    const liveContainer = document.getElementById("liveContainer");
    const LIVE_LIMIT = 25;
    const SPIN_MS = 1450;

    function setupButtonMotion() {
        document.addEventListener("pointerdown", event => {
            const button = event.target.closest("button, .top-btn, .case, .profile-box, .fast-open-btn");
            if (!button || button.disabled) return;
            button.classList.add("ui-pressed");
        });

        document.addEventListener("pointerup", () => {
            qsa(".ui-pressed").forEach(el => el.classList.remove("ui-pressed"));
        });
        document.addEventListener("pointercancel", () => {
            qsa(".ui-pressed").forEach(el => el.classList.remove("ui-pressed"));
        });
    }

    function setupCasePriceBoard() {
        qsa(".case").forEach(card => {
            const price = qs(".case-price", card);
            if (!price || price.querySelector(".case-price-board")) return;

            const board = document.createElement("div");
            board.className = "case-price-board";
            while (price.firstChild) board.appendChild(price.firstChild);
            price.appendChild(board);
        });
    }

    function setupLiveDrops() {
        if (!liveContainer) return;

        const rarityColors = {
            common: "#808080",
            rare: "#3b82f6",
            epic: "#a855f7",
            mythical: "#ef4444",
            legendary: "#ffd000"
        };

        const render = (username, item) => {
            if (!item || !liveContainer) return;

            const color = rarityColors[item.rarity] || "#ff7b00";
            const div = document.createElement("div");
            div.className = `live-drop ${item.rarity}`;
            div.style.setProperty("--rarity-color", color);
            div.innerHTML = `
                <div class="live-emoji">${item.emoji || "❔"}</div>
                <div class="live-info">
                    <div class="live-user">${username || "Гость"}</div>
                    <div class="live-rarity">${String(item.rarity || "common").toUpperCase()}</div>
                </div>
            `;

            liveContainer.appendChild(div);
            requestAnimationFrame(() => div.classList.add("live-drop-enter"));

            while (liveContainer.children.length > LIVE_LIMIT) {
                liveContainer.removeChild(liveContainer.firstElementChild);
            }
        };

        window.createLiveDrop = render;
        window.addLiveDrop = render;

        // Existing 20 entries are kept; only new entries use the polished motion/cap.
        qsa(".live-drop").forEach(drop => {
            const rarity = [...drop.classList].find(c => ["common", "rare", "epic", "mythical", "legendary"].includes(c));
            if (rarity) drop.style.setProperty("--rarity-color", rarityColors[rarity]);
        });
    }

    function animateRoulette() {
        const tracks = qsa(".multi-track");
        if (!tracks.length) return Promise.resolve();

        tracks.forEach((track, index) => {
            track.classList.remove("roulette-spin");
            track.style.removeProperty("--roulette-distance");
            // Different distances make simultaneous multi-open reels feel independent.
            track.style.setProperty("--roulette-distance", `${3100 + index * 170}px`);
            void track.offsetWidth;
            track.classList.add("roulette-spin");
        });

        return new Promise(resolve => {
            window.setTimeout(() => {
                tracks.forEach(track => {
                    track.classList.remove("roulette-spin");
                    track.style.transform = "translate3d(0,0,0)";
                });
                resolve();
            }, SPIN_MS);
        });
    }

    function setupOpening() {
        if (typeof window.showWin === "function" && !window.showWin.__emojiDropsPolish) {
            const originalShowWin = window.showWin;
            const wrappedShowWin = function (item) {
                const popup = document.getElementById("winPopup");
                if (state.fastOpening) {
                    originalShowWin(item);
                    updateWinActionLabel();
                    return;
                }

                if (popup) popup.style.display = "none";
                animateRoulette().then(() => {
                    originalShowWin(item);
                    updateWinActionLabel();
                });
            };
            wrappedShowWin.__emojiDropsPolish = true;
            window.showWin = wrappedShowWin;
        }

        const fastButton = qs(".fast-btn");
        if (fastButton && !fastButton.dataset.polishBound) {
            fastButton.dataset.polishBound = "1";
            fastButton.addEventListener("click", () => {
                if (typeof state === "undefined" || state.isSpinning) return;
                state.fastOpening = true;
                window.setTimeout(() => { state.fastOpening = false; }, 300);
                if (typeof window.openCase === "function") window.openCase();
            });
        }

        if (typeof window.takeWin === "function" && !window.takeWin.__emojiDropsPolish) {
            const originalTakeWin = window.takeWin;
            const wrappedTakeWin = function () {
                originalTakeWin();
                updateWinActionLabel();
            };
            wrappedTakeWin.__emojiDropsPolish = true;
            window.takeWin = wrappedTakeWin;
        }

        if (typeof window.sellWin === "function" && !window.sellWin.__emojiDropsPolish) {
            const originalSellWin = window.sellWin;
            const wrappedSellWin = function () {
                originalSellWin();
                updateWinActionLabel();
            };
            wrappedSellWin.__emojiDropsPolish = true;
            window.sellWin = wrappedSellWin;
        }

        updateWinActionLabel();
    }

    function updateWinActionLabel() {
        const popup = document.getElementById("winPopup");
        if (!popup || typeof state === "undefined") return;

        const buttons = popup.querySelectorAll("button");
        const takeButton = buttons[0];
        const sellButton = buttons[1];
        if (!takeButton || !sellButton) return;

        const hasMore = Array.isArray(state.winQueue) && state.winQueue.length > 0;
        takeButton.textContent = hasMore ? "ДАЛЕЕ" : "ЗАБРАТЬ";
        sellButton.style.display = hasMore ? "none" : "block";
    }

    function boot() {
        setupButtonMotion();
        setupCasePriceBoard();
        setupLiveDrops();
        setupOpening();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
