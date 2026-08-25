(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const getState = () => (typeof state !== "undefined" ? state : null);
    const currentUser = () => getState()?.currentUser || null;
    const requireUser = () => {
        const user = currentUser();
        if (!user && typeof openAuth === "function") openAuth("login");
        return user;
    };

    const installMotion = () => {
        if (byId("emojiDropsMotionStyle")) return;
        const style = document.createElement("style");
        style.id = "emojiDropsMotionStyle";
        style.textContent = `
            :root { --ui-ease:cubic-bezier(.22,1,.36,1); --ui-fast:cubic-bezier(.4,0,.2,1); }
            button,.top-btn,.case-card,.case-item-card,.settings-action-btn,.settings-close,
            .main-btn,.open-btn,.fast-btn,.fast-open-btn,.profile-btn,.upgrade-btn,.amount-btn,
            .multi-open-btn,.live-drop {
                -webkit-tap-highlight-color:transparent;
                transition:transform .18s var(--ui-ease),opacity .18s ease,background-color .18s ease,
                    border-color .18s ease,box-shadow .22s ease,color .18s ease;
            }
            button:not(:disabled):hover,.top-btn:hover,.case-card:hover,.case-item-card:hover { transform:translate3d(0,-1px,0); }
            button:not(:disabled):active,.top-btn:active,.case-card:active,.case-item-card:active { transform:translate3d(0,0,0) scale(.985);transition-duration:.07s; }
            button:disabled { cursor:not-allowed; }
            button:focus-visible,input:focus-visible { outline:2px solid #ff7b00;outline-offset:2px; }
            .ui-action-pending { pointer-events:none!important;opacity:.72; }
            .ui-screen-enter { animation:uiScreenEnter .24s var(--ui-ease) both; }
            @keyframes uiScreenEnter { from{opacity:0;transform:translate3d(0,7px,0) scale(.995)} to{opacity:1;transform:none} }
            #liveContainer { contain:layout paint; }
            #liveContainer>.ui-drop-enter { animation:uiDropEnter .42s var(--ui-ease) both; }
            @keyframes uiDropEnter { from{opacity:0;transform:translate3d(-14px,0,0) scale(.98)} to{opacity:1;transform:none} }
            #liveContainer>.ui-drop-moving { will-change:transform;transition:transform .46s var(--ui-ease); }
            .ui-roulette-running .multi-track { will-change:transform; }
            .ui-roulette-target { box-shadow:0 0 0 2px #ff7b00,0 0 20px #ff7b0050; }
            .ui-lane-enter { animation:uiLaneEnter .32s var(--ui-ease) both; }
            @keyframes uiLaneEnter { from{opacity:0;transform:translate3d(0,10px,0)} to{opacity:1;transform:none} }
            .ui-result-pop { animation:uiResultPop .42s var(--ui-ease) both; }
            @keyframes uiResultPop { 0%{opacity:0;transform:translate3d(0,8px,0) scale(.96)} 65%{opacity:1;transform:translate3d(0,-1px,0) scale(1.01)} 100%{opacity:1;transform:none} }
            .ui-empty-state { padding:28px 20px;text-align:center;opacity:.82;border:1px solid rgba(255,123,0,.18);border-radius:14px; }
            @media (max-width:900px){#liveContainer{max-width:100%;overflow:hidden}.multi-roulette{max-width:100%;}}
            @media (max-width:600px){button,.top-btn,.open-btn,.fast-open-btn,.profile-btn,.upgrade-btn,.multi-open-btn{min-height:42px}.case-card,.case-item-card{touch-action:manipulation;}}
            @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important;}}
        `;
        document.head.appendChild(style);
    };

    const animateScreen = element => {
        if (!element) return;
        element.classList.remove("ui-screen-enter");
        requestAnimationFrame(() => element.classList.add("ui-screen-enter"));
    };

    const dropKey = element => {
        if (!element || element.nodeType !== 1) return "";
        const explicit = element.dataset.liveId || element.dataset.id || element.dataset.dropId;
        if (explicit) return explicit;
        const emoji = element.querySelector(".drop-emoji,.live-emoji,img")?.getAttribute("src") ||
            element.querySelector(".drop-emoji,.live-emoji")?.textContent || "";
        const text = (element.textContent || "").replace(/\s+/g," ").trim();
        return `${emoji}|${text.slice(0,100)}`;
    };

    const setupLiveDrops = () => {
        const container = byId("liveContainer");
        if (!container || container.dataset.motionReady === "1") return;
        container.dataset.motionReady = "1";
        let previous = new Map();
        let raf = 0;
        const added = new Set();

        const snapshot = () => {
            const map = new Map();
            [...container.children].forEach(el => {
                const key = dropKey(el);
                if (key) map.set(key, el.getBoundingClientRect());
            });
            previous = map;
        };
        snapshot();

        const animate = () => {
            raf = 0;
            const next = new Map();
            [...container.children].forEach(el => {
                const key = dropKey(el);
                if (key) next.set(key,{element:el,rect:el.getBoundingClientRect()});
            });

            for (const [key,value] of next) {
                const first = previous.get(key);
                if (!first) continue;
                const dx = first.left - value.rect.left;
                const dy = first.top - value.rect.top;
                if (Math.abs(dx) < .5 && Math.abs(dy) < .5) continue;
                value.element.classList.add("ui-drop-moving");
                value.element.style.transform = `translate3d(${dx}px,${dy}px,0)`;
                requestAnimationFrame(() => value.element.style.transform = "translate3d(0,0,0)");
                setTimeout(() => {
                    value.element.classList.remove("ui-drop-moving");
                    value.element.style.removeProperty("transform");
                },480);
            }

            for (const element of added) {
                if (!container.contains(element)) continue;
                element.classList.remove("ui-drop-enter");
                requestAnimationFrame(() => element.classList.add("ui-drop-enter"));
                setTimeout(() => element.classList.remove("ui-drop-enter"),450);
            }
            added.clear();
            previous = new Map([...next].map(([key,value]) => [key,value.rect]));
        };

        const observer = new MutationObserver(records => {
            let changed = false;
            for (const record of records) {
                if (record.type !== "childList") continue;
                if (record.addedNodes.length || record.removedNodes.length) changed = true;
                record.addedNodes.forEach(node => { if (node.nodeType === 1) added.add(node); });
            }
            if (!changed || raf) return;
            raf = requestAnimationFrame(animate);
        });
        observer.observe(container,{childList:true});
    };

    const enforceLiveDropLimit = () => {
        const container = byId("liveContainer");
        if (!container) return;
        while (container.children.length > 25) container.removeChild(container.lastElementChild);
    };

    const installLiveDropLimit = () => {
        if (window.__emojiDropsLiveLimitInstalled) return;
        window.__emojiDropsLiveLimitInstalled = true;
        const patch = name => {
            const original = window[name];
            if (typeof original !== "function" || original.__emojiDropsWrapped) return;
            const wrapped = function(...args) {
                const result = original.apply(this,args);
                requestAnimationFrame(enforceLiveDropLimit);
                return result;
            };
            wrapped.__emojiDropsWrapped = true;
            window[name] = wrapped;
        };
        patch("addLiveDrop");
        patch("createLiveDrop");
        requestAnimationFrame(enforceLiveDropLimit);
    };

    const ensureLaneTarget = (track,item) => {
        if (!track || !item) return null;
        let target = [...track.children].find(el => {
            const id = el.dataset.itemId || el.dataset.id;
            return (id && item.id != null && String(id) === String(item.id)) ||
                (item.emoji && (el.textContent || "").trim().includes(item.emoji));
        });
        if (target) return target;
        target = document.createElement("div");
        target.className = "item";
        target.textContent = item.emoji || "?";
        target.dataset.itemId = item.id != null ? String(item.id) : "";
        const rarity = typeof rarities !== "undefined" ? rarities[item.rarity] : null;
        target.style.border = `3px solid ${rarity?.color || "#ff7b00"}`;
        track.appendChild(target);
        return target;
    };

    const wait = ms => new Promise(resolve => setTimeout(resolve,ms));

    const animateRoulette = async items => {
        const container = byId("multiRouletteContainer");
        if (!container) return;
        const roulettes = [...container.querySelectorAll(".multi-roulette")];
        if (!roulettes.length) return;
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        const duration = reduced ? 1 : 1450;
        const laneItems = Array.isArray(items) ? items : [items];

        await Promise.all(roulettes.map((roulette,index) => new Promise(resolve => {
            const track = roulette.querySelector(".multi-track");
            if (!track) return resolve();
            const wanted = laneItems[index] || laneItems[0];
            const target = ensureLaneTarget(track,wanted);
            roulette.classList.add("ui-roulette-running","ui-lane-enter");
            [...track.children].forEach(el => el.classList.remove("ui-roulette-target"));
            const center = roulette.clientWidth / 2;
            const targetCenter = target.offsetLeft + target.offsetWidth / 2;
            const finalX = center - targetCenter;
            track.style.transition = `transform ${duration}ms cubic-bezier(.08,.72,.12,1)`;
            track.style.transform = `translate3d(${finalX}px,0,0)`;
            setTimeout(() => {
                target.classList.add("ui-roulette-target");
                roulette.classList.remove("ui-roulette-running");
                resolve();
            },duration);
        })));
        await wait(reduced ? 0 : 90);
    };

    const resetRoulette = () => {
        const container = byId("multiRouletteContainer");
        if (!container) return;
        container.querySelectorAll(".multi-roulette").forEach(roulette => {
            roulette.classList.remove("ui-roulette-running","ui-lane-enter");
            const track = roulette.querySelector(".multi-track");
            if (!track) return;
            track.style.transition = "none";
            track.style.transform = "";
            requestAnimationFrame(() => track.style.removeProperty("transition"));
        });
    };

    const syncAmountButtons = () => {
        const buttons = [...document.querySelectorAll(".multi-open-btn,.amount-btn")];
        buttons.forEach(button => {
            if (button.dataset.uiAmountBound === "1") return;
            button.dataset.uiAmountBound = "1";
            button.addEventListener("click",() => {
                const amount = Number(button.dataset.count || button.textContent.trim());
                if (!Number.isFinite(amount) || amount < 1 || amount > 10) return;
                if (typeof state === "undefined") return;
                state.openAmount = amount;
                if (typeof renderOpenAmounts === "function") renderOpenAmounts();
                if (typeof createRoulettes === "function") {
                    requestAnimationFrame(() => createRoulettes());
                }
                if (typeof updateOpenPrice === "function") updateOpenPrice();
            });
        });
    };

    const installRevealFlow = () => {
        if (window.__emojiDropsRevealInstalled || typeof window.showNextWin !== "function") return;
        window.__emojiDropsRevealInstalled = true;
        const original = window.showNextWin;
        const wrapped = async function(...args) {
            const current = getState();
            const items = Array.isArray(current?.winQueue) ? current.winQueue.slice(0,10) : [];
            if (!items.length) return original.apply(this,args);
            if (current) current.isSpinning = true;
            try {
                await animateRoulette(items);
                const result = original.apply(this,args);
                const node = byId("winPopup") || document.querySelector(".win-popup,.win-overlay,.win-result");
                if (node) {
                    node.classList.remove("ui-result-pop");
                    requestAnimationFrame(() => node.classList.add("ui-result-pop"));
                }
                return result;
            } finally {
                if (current) current.isSpinning = false;
                setTimeout(resetRoulette,450);
            }
        };
        wrapped.__emojiDropsWrapped = true;
        window.showNextWin = wrapped;
    };

    const installActionGuard = () => {
        if (window.__emojiDropsActionGuardInstalled) return;
        window.__emojiDropsActionGuardInstalled = true;
        document.addEventListener("click",event => {
            const button = event.target.closest("button,[role=button]");
            if (!button || button.disabled || button.dataset.noGuard !== undefined) return;
            if (button.dataset.guardBusy === "1") {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            const label = (button.textContent || "").toLowerCase();
            if (!/открыть|upgrade|улучш|купить|продать/.test(label)) return;
            button.dataset.guardBusy = "1";
            button.classList.add("ui-action-pending");
            setTimeout(() => {
                button.dataset.guardBusy = "0";
                button.classList.remove("ui-action-pending");
            },600);
        },true);
    };

    window.openSettings = () => {
        if (!requireUser()) return;
        const overlay = byId("settingsOverlay");
        if (!overlay) return;
        overlay.style.display = "flex";
        animateScreen(overlay.querySelector(".settings-box") || overlay);
    };
    window.closeSettings = () => { const overlay = byId("settingsOverlay"); if (overlay) overlay.style.display = "none"; };
    window.openStats = () => {
        if (!requireUser()) return;
        const overlay = byId("statsOverlay");
        if (!overlay) return;
        overlay.style.display = "flex";
        animateScreen(overlay.querySelector(".stats-box") || overlay);
        if (typeof updateStatsUI === "function") updateStatsUI();
    };
    window.closeStats = () => { const overlay = byId("statsOverlay"); if (overlay) overlay.style.display = "none"; };
    window.openUpgradeMenu = () => {
        if (!requireUser()) return;
        const page = byId("upgradePage");
        if (!page) return;
        page.style.display = "flex";
        animateScreen(page.querySelector(".upgrade-box,.upgrade-content") || page);
    };
    window.closeUpgradeMenu = () => {
        const page = byId("upgradePage");
        if (page) page.style.display = "none";
        if (typeof window.closeUpgradeResult === "function") window.closeUpgradeResult();
    };

    const boot = () => {
        installMotion();
        setupLiveDrops();
        installLiveDropLimit();
        installRevealFlow();
        installActionGuard();
        syncAmountButtons();
        const retry = new MutationObserver(() => {
            syncAmountButtons();
            setupLiveDrops();
            installLiveDropLimit();
            installRevealFlow();
        });
        retry.observe(document.body,{childList:true,subtree:true});
        setTimeout(() => retry.disconnect(),10000);
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
    else boot();
})();