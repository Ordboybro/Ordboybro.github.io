(() => {
  "use strict";

  const STYLE_ID = "emoji-drops-quality-polish";
  const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const appState = () => {
    if (window.state) return window.state;
    try { if (typeof state !== "undefined") return state; } catch (_) {}
    return null;
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html { scroll-behavior: smooth; }
      body { overflow-x: hidden !important; }
      button, a, input, select, textarea { -webkit-tap-highlight-color: transparent; }
      button, .top-btn, .amount-btn, .case-card, .sell-item-btn {
        transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease;
      }
      button:not(:disabled):active, .top-btn:active, .amount-btn:active { transform: translateY(1px) scale(.985); }
      .live-drops, #liveDrops, #liveContainer, #liveDropsContainer, .live-drops-container {
        position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        width: 100% !important; z-index: 1100 !important; overflow: visible !important; pointer-events: none;
      }
      .live-drops > *, #liveDrops > *, #liveContainer > *, #liveDropsContainer > *, .live-drops-container > * { pointer-events: auto; }
      .multi-roulette, #multiRouletteContainer { overflow-x: hidden !important; }
      .roulette-marker, .new-pointer { pointer-events: none !important; }
      .open-page, #openPage { overscroll-behavior: contain; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: .001ms !important; animation-iteration-count: 1 !important;
          scroll-behavior: auto !important; transition-duration: .001ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeSearchFields() {
    document.querySelectorAll('input[type="search"], input[name*="search" i], input[placeholder*="кейс" i], input[placeholder*="поиск" i]').forEach(input => {
      input.type = "search";
      input.name = "case-search";
      input.autocomplete = "off";
      input.autocapitalize = "none";
      input.autocorrect = "off";
      input.spellcheck = false;
      input.setAttribute("data-form-type", "other");
      input.setAttribute("data-lpignore", "true");
      input.setAttribute("data-1p-ignore", "true");
    });
  }

  function secureRoll() {
    if (window.crypto?.getRandomValues) {
      const b = new Uint32Array(1);
      window.crypto.getRandomValues(b);
      return b[0] / 4294967296;
    }
    return Math.random();
  }

  function casePrice(key) {
    return Number(window.casePrices?.[key] ?? window.EMOJI_DROPS_ECONOMY?.CASE_PRICES?.[key] ?? 0);
  }

  function syncBalance() {
    if (typeof window.updateBalanceUI === "function") window.updateBalanceUI();
    const state = appState();
    const balance = document.getElementById("balance");
    if (balance && state) balance.textContent = String(state.balance ?? 0);
  }

  function installUpgrade() {
    if (typeof window.startUpgrade !== "function") return;
    window.startUpgrade = function polishedUpgrade() {
      const state = appState();
      const source = Number(state?.upgradeSourceValue ?? document.getElementById("upgradeSourceValue")?.value ?? 0);
      const target = Number(state?.upgradeTargetValue ?? document.getElementById("upgradeTargetValue")?.value ?? 0);
      const chance = typeof window.getUpgradeChance === "function" ? window.getUpgradeChance(source, target) : 48;
      const success = secureRoll() * 100 < chance;
      const result = document.getElementById("upgradeResult");
      const emoji = document.getElementById("upgradeResultEmoji");
      const text = document.getElementById("upgradeResultText");
      if (result) result.style.display = "flex";
      if (emoji) emoji.textContent = success ? "👑" : "💥";
      if (text) text.textContent = `${success ? "АПГРЕЙД УСПЕШЕН" : "НЕ УДАЛОСЬ"} · ${chance.toFixed(1)}%`;
      if (success && state?.stats) state.stats.upgrades = Number(state.stats.upgrades || 0) + 1;
      if (typeof window.saveStats === "function") window.saveStats();
    };
  }

  function installCaseOpening() {
    if (typeof window.openCase !== "function") return;
    window.openCase = async function polishedOpenCase(count) {
      const state = appState();
      if (!state || state.isSpinning) return;
      if (!state.selectedCase) return alert("Выберите кейс");
      if (!state.currentUser) return typeof window.openAuth === "function" ? window.openAuth("login") : null;

      const amount = Math.max(1, Math.min(10, Number(count || state.openAmount || 1)));
      const price = casePrice(state.selectedCase) * amount;
      if (!Number.isFinite(price) || price <= 0) return alert("Кейс недоступен");
      if (Number(state.balance) < price) return alert("Недостаточно средств");

      state.isSpinning = true;
      const wins = [];
      try {
        for (let i = 0; i < amount; i += 1) {
          const item = typeof window.getRandomByChance === "function"
            ? window.getRandomByChance(state.currentCase)
            : state.currentCase[Math.floor(secureRoll() * state.currentCase.length)];
          if (item) wins.push({ ...item });
        }
        if (!wins.length) throw new Error("В кейсе нет доступных предметов");

        state.balance -= price;
        state.currentUser.balance = state.balance;
        state.currentUser.inventory ||= [];
        state.currentUser.inventory.push(...wins);
        state.stats.opened = Number(state.stats.opened || 0) + amount;

        if (typeof window.saveUsers === "function") window.saveUsers();
        if (typeof window.saveStats === "function") window.saveStats();
        if (typeof window.renderInventory === "function") window.renderInventory();

        await sleep(prefersReduced() ? 60 : 650 + amount * 110);
        state.winQueue = wins;
        if (typeof window.showNextWin === "function") window.showNextWin();
      } catch (error) {
        console.error("[EmojiDrops] case opening failed", error);
        alert("Не удалось открыть кейс. Баланс не изменён.");
      } finally {
        state.isSpinning = false;
        syncBalance();
      }
    };
  }

  function animateLiveDrop(node) {
    if (!(node instanceof HTMLElement) || node.dataset.motionReady === "1") return;
    node.dataset.motionReady = "1";
    if (prefersReduced()) return;
    node.style.willChange = "transform, opacity";
    node.animate(
      [{ transform: "translate3d(-48px,0,0)", opacity: 0 }, { transform: "translate3d(0,0,0)", opacity: 1 }],
      { duration: 560, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
    ).finished.finally(() => { node.style.willChange = "auto"; });
  }

  function observeLiveDrops() {
    const roots = document.querySelectorAll(".live-drops, #liveDrops, #liveContainer, #liveDropsContainer, .live-drops-container");
    roots.forEach(root => {
      if (root.dataset.qualityObserver === "1") return;
      root.dataset.qualityObserver = "1";
      new MutationObserver(mutations => mutations.forEach(m => m.addedNodes.forEach(animateLiveDrop))).observe(root, { childList: true, subtree: true });
      [...root.children].forEach(animateLiveDrop);
    });
  }

  function addButtonMotion() {
    document.querySelectorAll("button, .top-btn, .amount-btn").forEach(button => {
      if (!(button instanceof HTMLElement) || button.dataset.motionButton === "1") return;
      button.dataset.motionButton = "1";
      button.addEventListener("pointerdown", () => { if (!prefersReduced()) button.style.willChange = "transform"; }, { passive: true });
      const release = () => { button.style.willChange = "auto"; };
      button.addEventListener("pointerup", release, { passive: true });
      button.addEventListener("pointercancel", release, { passive: true });
      button.addEventListener("pointerleave", release, { passive: true });
    });
  }

  function init() {
    injectStyles();
    normalizeSearchFields();
    installUpgrade();
    installCaseOpening();
    observeLiveDrops();
    addButtonMotion();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
