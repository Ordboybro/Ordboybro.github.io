(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const getCurrentUser = () => typeof state !== "undefined" ? state.currentUser : null;
    const requireUser = () => {
        const user = getCurrentUser();
        if (!user) alert("Сначала войдите в аккаунт");
        return user;
    };

    // UI polish lives here with the existing UI actions instead of creating
    // another versioned patch layer. The rules only animate properties that
    // are cheap for the browser to composite.
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
                will-change: transform;
            }
            button:not(:disabled):hover,
            .top-btn:hover, .case-card:hover, .case-item-card:hover {
                transform: translateY(-2px);
            }
            button:not(:disabled):active,
            .top-btn:active, .case-card:active, .case-item-card:active {
                transform: translateY(0) scale(.985);
                transition-duration: .08s;
            }
            button:focus-visible, input:focus-visible {
                outline: 2px solid #ff7b00;
                outline-offset: 2px;
            }
            .live-drop.ui-drop-enter {
                animation: uiDropEnter .42s var(--ui-ease) both;
            }
            @keyframes uiDropEnter {
                from { opacity:0; transform:translate3d(-24px,0,0) scale(.96); }
                to   { opacity:1; transform:translate3d(0,0,0) scale(1); }
            }
            .live-drop.ui-drop-moving {
                transition: transform .42s var(--ui-ease), opacity .22s ease;
            }
            .ui-screen-enter {
                animation: uiScreenEnter .24s var(--ui-ease) both;
            }
            @keyframes uiScreenEnter {
                from { opacity:0; transform:translateY(8px); }
                to { opacity:1; transform:translateY(0); }
            }
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration:.001ms !important;
                    transition-duration:.001ms !important;
                    scroll-behavior:auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

    const animateScreen = el => {
        if (!el) return;
        el.classList.remove("ui-screen-enter");
        void el.offsetWidth;
        el.classList.add("ui-screen-enter");
    };

    const setupLiveDrops = () => {
        const container = document.querySelector(".live-drops-list, .live-list, #liveDropsList");
        if (!container || container.dataset.motionReady === "1") return;
        container.dataset.motionReady = "1";

        let oldRects = new Map();
        let animating = false;

        const keyFor = (el, index) =>
            el.dataset.liveId || el.dataset.id || el.querySelector(".live-drop-emoji")?.textContent + ":" + (el.textContent || "").slice(0, 24) + ":" + index;

        const capture = () => {
            oldRects = new Map([...container.children].map((el, i) => [keyFor(el, i), el.getBoundingClientRect()]));
        };

        const animate = added => {
            const children = [...container.children];
            children.forEach((el, i) => {
                const key = keyFor(el, i);
                const first = oldRects.get(key);
                const last = el.getBoundingClientRect();
                if (first) {
                    const dx = first.left - last.left;
                    const dy = first.top - last.top;
                    if (Math.abs(dx) > .5 || Math.abs(dy) > .5) {
                        el.classList.add("ui-drop-moving");
                        el.style.transform = `translate3d(${dx}px,${dy}px,0)`;
                        requestAnimationFrame(() => {
                            el.style.transform = "translate3d(0,0,0)";
                        });
                        setTimeout(() => {
                            el.classList.remove("ui-drop-moving");
                            el.style.removeProperty("transform");
                        }, 450);
                    }
                }
            });
            added.forEach(el => {
                el.classList.remove("ui-drop-enter");
                void el.offsetWidth;
                el.classList.add("ui-drop-enter");
            });
            animating = false;
        };

        const observer = new MutationObserver(records => {
            const added = records.flatMap(r => [...r.addedNodes]).filter(n => n.nodeType === 1 && container.contains(n));
            if (!added.length || animating) return;
            animating = true;
            requestAnimationFrame(() => animate(added));
        });

        capture();
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

        // Live Drops can be rendered after the initial DOM load.
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
