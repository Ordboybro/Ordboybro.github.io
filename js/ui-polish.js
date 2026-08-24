(() => {
    "use strict";
    const qs = (s, r = document) => r.querySelector(s);
    const qsa = (s, r = document) => [...r.querySelectorAll(s)];
    const live = document.getElementById("liveContainer");
    const LIMIT = 25;
    const SPIN_MS = 1450;
    const COLORS = {common:"#808080",rare:"#3b82f6",epic:"#a855f7",mythical:"#ef4444",legendary:"#ffd000"};

    function buttonMotion() {
        document.addEventListener("pointerdown", e => {
            const el = e.target.closest("button,a,.top-btn,.case,.profile-box");
            if (el && !el.disabled) el.classList.add("ui-pressed");
        });
        const clear = () => qsa(".ui-pressed").forEach(el => el.classList.remove("ui-pressed"));
        ["pointerup","pointercancel","pointerleave"].forEach(e => document.addEventListener(e, clear));
    }

    function priceBoards() {
        qsa(".case").forEach(card => {
            const price = qs(".case-price", card);
            if (!price || price.querySelector(".case-price-board")) return;
            const board = document.createElement("div");
            board.className = "case-price-board";
            while (price.firstChild) board.appendChild(price.firstChild);
            price.appendChild(board);
        });
    }

    function colorLive(el) {
        const rarity = [...el.classList].find(c => COLORS[c]);
        if (!rarity) return;
        el.style.setProperty("--rarity-color", COLORS[rarity]);
        if (rarity === "legendary") el.classList.add("legendary");
    }

    function trimLive() {
        if (!live) return;
        while (live.children.length > LIMIT) live.removeChild(live.lastElementChild);
    }

    function addLive(username, item) {
        if (!live || !item) return;
        const rarity = String(item.rarity || "common").toLowerCase();
        const div = document.createElement("div");
        div.className = `live-drop ${rarity}`;
        div.style.setProperty("--rarity-color", COLORS[rarity] || COLORS.common);
        const emoji = document.createElement("div");
        emoji.className = "live-emoji";
        emoji.textContent = item.emoji || "❔";
        const info = document.createElement("div");
        info.className = "live-info";
        const user = document.createElement("div");
        user.className = "live-user";
        user.textContent = username || "Гость";
        const r = document.createElement("div");
        r.className = "live-rarity";
        r.textContent = rarity.toUpperCase();
        r.style.color = COLORS[rarity] || COLORS.common;
        info.append(user, r);
        div.append(emoji, info);
        live.prepend(div);
        requestAnimationFrame(() => div.classList.add("live-drop-enter"));
        trimLive();
    }

    function liveDrops() {
        if (!live) return;
        window.createLiveDrop = addLive;
        window.addLiveDrop = addLive;
        qsa(".live-drop,.drop-item", live).forEach(colorLive);
        trimLive();
        new MutationObserver(records => {
            let changed = false;
            records.forEach(record => record.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (node.classList.contains("live-drop") || node.classList.contains("drop-item")) {
                    colorLive(node);
                    changed = true;
                }
            }));
            if (changed) trimLive();
        }).observe(live, {childList:true});
    }

    function spin() {
        const tracks = qsa("#multiRouletteContainer .multi-track");
        if (!tracks.length) return Promise.resolve();
        tracks.forEach((track, i) => {
            track.classList.remove("roulette-spin");
            track.style.setProperty("--roulette-distance", `${Math.max(2200,3100+i*170)}px`);
            void track.offsetWidth;
            track.classList.add("roulette-spin");
        });
        return new Promise(resolve => setTimeout(() => {
            tracks.forEach(t => t.classList.remove("roulette-spin"));
            resolve();
        }, SPIN_MS));
    }

    function winLabel() {
        const popup = qs("#winPopup");
        if (!popup || typeof state === "undefined") return;
        const buttons = popup.querySelectorAll("button");
        if (!buttons[0] || !buttons[1]) return;
        const more = Array.isArray(state.winQueue) && state.winQueue.length > 0;
        buttons[0].textContent = more ? "ДАЛЕЕ" : "ЗАБРАТЬ";
        buttons[1].style.display = more ? "none" : "block";
    }

    function opening() {
        if (typeof window.showWin === "function" && !window.showWin.__polished) {
            const original = window.showWin;
            const wrapped = function(item) {
                const popup = qs("#winPopup");
                if (typeof state !== "undefined" && state.fastOpening) {
                    original(item); winLabel(); return;
                }
                if (popup) popup.style.display = "none";
                if (typeof state !== "undefined") state.isSpinning = true;
                spin().then(() => {
                    if (typeof state !== "undefined") state.isSpinning = false;
                    original(item); winLabel();
                });
            };
            wrapped.__polished = true;
            window.showWin = wrapped;
        }
        const fast = qs(".fast-btn");
        if (fast && !fast.dataset.polishBound) {
            fast.dataset.polishBound = "1";
            fast.addEventListener("click", e => {
                e.preventDefault();
                if (typeof state === "undefined" || state.isSpinning) return;
                state.fastOpening = true;
                if (typeof window.openCase === "function") window.openCase();
                setTimeout(() => { state.fastOpening = false; }, 350);
            });
        }
        if (typeof window.takeWin === "function" && !window.takeWin.__polished) {
            const original = window.takeWin;
            const wrapped = function(){ original(); winLabel(); };
            wrapped.__polished = true;
            window.takeWin = wrapped;
        }
        if (typeof window.sellWin === "function" && !window.sellWin.__polished) {
            const original = window.sellWin;
            const wrapped = function(){ original(); winLabel(); };
            wrapped.__polished = true;
            window.sellWin = wrapped;
        }
        const popup = qs("#winPopup");
        if (popup) new MutationObserver(winLabel).observe(popup,{attributes:true,attributeFilter:["style"]});
        winLabel();
    }

    function boot(){ buttonMotion(); priceBoards(); liveDrops(); opening(); }
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
})();
