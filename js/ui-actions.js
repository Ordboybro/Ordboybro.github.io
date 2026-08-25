(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const getCurrentUser = () => typeof state !== "undefined" ? state.currentUser : null;
    const requireUser = () => {
        const user = getCurrentUser();
        if (!user) alert("Сначала войдите в аккаунт");
        return user;
    };

    const installMotion = () => {
        if (document.getElementById("emojiDropsMotionStyle")) return;
        const style = document.createElement("style");
        style.id = "emojiDropsMotionStyle";
        style.textContent = `
            :root { --ui-ease: cubic-bezier(.22,1,.36,1); }
            button, .top-btn, .case-card, .case-item-card, .live-drop,
            .settings-action-btn, .settings-close, .main-btn, .open-btn,
            .fast-btn, .fast-open-btn, .profile-btn, .upgrade-btn {
                -webkit-tap-highlight-color: transparent;
                transition:
                    transform .18s var(--ui-ease),
                    opacity .18s ease,
                    background-color .18s ease,
                    border-color .18s ease,
                    box-shadow .22s ease,
                    color .18s ease;
            }
            button:not(:disabled):hover,
            .top-btn:hover, .case-card:hover, .case-item-card:hover {
                transform: translateY(-1px);
            }
            button:not(:disabled):active,
            .top-btn:active, .case-card:active, .case-item-card:active {
                transform: translateY(0) scale(.985);
                transition-duration: .07s;
            }
            button:focus-visible, input:focus-visible {
                outline: 2px solid #ff7b00;
                outline-offset: 2px;
            }
            .live-drop.ui-drop-enter { animation: uiDropEnter .38s var(--ui-ease) both; }
            @keyframes uiDropEnter {
                from { opacity: 0; transform: translate3d(-18px,0,0) scale(.975); }
                to { opacity: 1; transform: translate3d(0,0,0) scale(1); }
            }
            .live-drop.ui-drop-moving {
                transition: transform .42s var(--ui-ease);
                will-change: transform;
            }
            .ui-screen-enter { animation: uiScreenEnter .22s var(--ui-ease) both; }
            @keyframes uiScreenEnter {
                from { opacity: 0; transform: translate3d(0,7px,0); }
                to { opacity: 1; transform: translate3d(0,0,0); }
            }
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: .001ms !important;
                    transition-duration: .001ms !important;
                    scroll-behavior: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

    const animateScreen = el => {
        if (!el) return;
        el.classList.remove("ui-screen-enter");
        requestAnimationFrame(() => el.classList.add("ui-screen-enter"));
    };

    const stableDropKey = el => {
        if (!el || el.nodeType !== 1) return "";
        const explicit = el.dataset.liveId || el.dataset.id || el.dataset.dropId;
        if (explicit) return explicit;
        const emoji = el.querySelector(".live-drop-emoji, img")?.getAttribute("src") || el.querySelector(".live-drop-emoji")?.textContent || "";
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        return `${emoji}|${text.slice(0, 100)}`;
    };

    const setupLiveDrops = () => {
        const container = document.querySelector(".live-drops-list, .live-list, #liveDropsList");
        if (!container || container.dataset.motionReady === "1") return;
        container.dataset.motionReady = "1";

        let previousRects = new Map();
        let previousElements = new Map();
        let raf = 0;
        let pendingAdded = new Set();

        const snapshot = () => {
            const rects = new Map();
            const elements = new Map();
            for (const el of container.children) {
                const key = stableDropKey(el);
                if (!key) continue;
                rects.set(key, el.getBoundingClientRect());
                elements.set(key, el);
            }
            previousRects = rects;
            previousElements = elements;
        };

        const runFlip = added => {
            raf = 0;
            const nextRects = new Map();
            const nextElements = new Map();

            for (const el of container.children) {
                const key = stableDropKey(el);
                if (!key) continue;
                const last = el.getBoundingClientRect();
                nextRects.set(key, last);
                nextElements.set(key, el);
            }

            for (const [key, last] of nextRects) {
                const first = previousRects.get(key);
                const el = nextElements.get(key);
                if (!el || !first) continue;
                const dx = first.left - last.left;
                const dy = first.top - last.top;
                if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

                el.classList.add("ui-drop-moving");
                el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
                requestAnimationFrame(() => {
                    el.style.transform = "translate3d(0, 0, 0)";
                });
                window.setTimeout(() => {
                    el.classList.remove("ui-drop-moving");
                    el.style.removeProperty("transform");
                }, 450);
            }

            for (const el of added) {
                if (!container.contains(el)) continue;
                el.classList.remove("ui-drop-enter");
                void el.offsetWidth;
                el.classList.add("ui-drop-enter");
                window.setTimeout(() => el.classList.remove("ui-drop-enter"), 430);
            }

            previousRects = nextRects;
            previousElements = nextElements;
            pendingAdded.clear();
        };

        snapshot();

        const observer = new MutationObserver(records => {
            let changed = false;
            for (const record of records) {
                if (record.type !== "childList") continue;
                changed = changed || record.addedNodes.length > 0 || record.removedNodes.length > 0;
                for (const node of record.addedNodes) {
                    if (node.nodeType === 1 && container.contains(node)) pendingAdded.add(node);
                }
            }
            if (!changed || raf) return;
            raf = requestAnimationFrame(() => runFlip([...pendingAdded]));
        });

        observer.observe(container, { childList: true });
    };

    window.openSettings = () => {
        if (!requireUser()) return;
        const el = byId("settingsOverlay");
        if (!el) return;
        el.style.display = "flex";
        animateScreen(el.querySelector(".settings-box") || el);
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
        animateScreen(el.querySelector(".stats-box") || el);
        if (typeof updateStatsUI === "function") updateStatsUI();
    };

    window.closeStats = () => {
        const el = byId("statsOverlay");
        if (el) el.style.display = "none";
    };

    window.openUpgradeMenu = () => {
        if (!requireUser()) return;
        const page = byId("upgradePage");
        if (!page) return;
        page.style.display = "flex";
        animateScreen(page.querySelector(".upgrade-box, .upgrade-content") || page);
    };

    window.closeUpgradeMenu = () => {
        const page = byId("upgradePage");
        if (page) page.style.display = "none";
        if (typeof window.closeUpgradeResult === "function") window.closeUpgradeResult();
    };

    const boot = () => {
        installMotion();
        setupLiveDrops();
        const retry = new MutationObserver(() => setupLiveDrops());
        retry.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => retry.disconnect(), 10000);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
