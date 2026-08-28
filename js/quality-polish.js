(() => {
  "use strict";

  const STYLE_ID = "emoji-drops-quality-polish";
  const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const appState = () => {
    if (window.state) return window.state;
    try { if (typeof state !== "undefined") return state; } catch (_) {}
    return null;
  };

  const animateIn = (element, options = {}) => {
    if (!(element instanceof HTMLElement) || prefersReduced()) return null;
    const animation = element.animate(
      [
        { opacity: 0, transform: options.from || "translate3d(0, 10px, 0) scale(.985)" },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
      ],
      { duration: options.duration ?? 260, easing: options.easing || "cubic-bezier(.16,1,.3,1)", fill: "both" }
    );
    animation.addEventListener?.("finish", () => animation.cancel(), { once: true });
    return animation;
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
        position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important;
        z-index: 1100 !important; overflow: visible !important; pointer-events: none; isolation: isolate;
      }
      .live-drops > *, #liveDrops > *, #liveContainer > *, #liveDropsContainer > *, .live-drops-container > * { pointer-events: auto; }
      .live-drops, #liveDrops, #liveContainer, #liveDropsContainer, .live-drops-container { --live-drop-in-x: -72px; }
      .emoji-drop-live-enter { animation: emoji-drop-live-enter .62s cubic-bezier(.16,1,.3,1) both; }
      @keyframes emoji-drop-live-enter {
        from { transform: translate3d(var(--live-drop-in-x), 0, 0); opacity: 0; }
        70% { opacity: 1; }
        to { transform: translate3d(0, 0, 0); opacity: 1; }
      }
      .multi-roulette, #multiRouletteContainer { overflow-x: hidden !important; }
      .roulette-marker, .new-pointer { pointer-events: none !important; }
      .open-page, #openPage { overscroll-behavior: contain; }
      #winPopup, #upgradeResult { will-change: auto; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .001ms !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeSearchFields() {
    document.querySelectorAll('input[type="search"], input[name*="search" i], input[placeholder*="кейс" i], input[placeholder*="поиск" i]').forEach(input => {
      input.type = "search"; input.name = "case-search"; input.autocomplete = "off"; input.autocapitalize = "none";
      input.autocorrect = "off"; input.spellcheck = false; input.setAttribute("data-form-type", "other");
      input.setAttribute("data-lpignore", "true"); input.setAttribute("data-1p-ignore", "true");
    });
  }

  function syncBalance() {
    if (typeof window.updateBalanceUI === "function") window.updateBalanceUI();
    const state = appState(); const balance = document.getElementById("balance");
    if (balance && state) balance.textContent = String(state.balance ?? 0);
  }

  async function playCaseReveal() {
    if (prefersReduced()) return;
    const tracks = [...document.querySelectorAll("#multiRouletteContainer .multi-track, .multi-roulette .multi-track")];
    if (!tracks.length) return;
    const animations = tracks.map((track, index) => {
      const distance = index % 2 ? "-68%" : "-72%";
      return track.animate(
        [
          { transform: "translate3d(0,0,0)" },
          { transform: `translate3d(${distance},0,0)`, offset: .78 },
          { transform: `translate3d(calc(${distance} + 18px),0,0)`, offset: .9 },
          { transform: `translate3d(calc(${distance} + 8px),0,0)`, offset: .96 },
          { transform: `translate3d(${distance},0,0)` }
        ],
        { duration: 1850 + index * 90, delay: index * 45, easing: "cubic-bezier(.08,.72,.18,1)", fill: "forwards" }
      );
    });
    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)));
    animations.forEach(animation => animation.cancel());
  }

  function decorateHandlers() {
    if (window.__emojiDropsPolishHandlers) return;
    const decorate = (name, after, duration = 260) => {
      const original = window[name]; if (typeof original !== "function") return;
      window[name] = function polishedHandler(...args) {
        const result = original.apply(this, args);
        Promise.resolve(result).then(() => {
          after();
          if (duration) {
            const selectors = { openCasePage: "#openPage", openProfile: "#profilePage", openUpgradeMenu: "#upgradePage", showWin: "#winPopup" };
            const element = document.querySelector(selectors[name] || "");
            if (element && getComputedStyle(element).display !== "none") animateIn(element, { duration });
          }
        });
        return result;
      };
    };
    decorate("openCasePage", () => {}, 280); decorate("openProfile", () => {}, 240); decorate("openUpgradeMenu", () => {}, 220);

    const originalShowWin = window.showWin;
    if (typeof originalShowWin === "function") {
      window.showWin = function polishedShowWin(...args) {
        const result = originalShowWin.apply(this, args); const popup = document.getElementById("winPopup");
        if (popup) {
          animateIn(popup, { duration: 320, from: "translate3d(0, 14px, 0) scale(.94)" });
          const emoji = document.getElementById("winEmoji");
          if (emoji && !prefersReduced()) emoji.animate([
            { transform: "scale(.72) rotate(-5deg)", opacity: .2 },
            { transform: "scale(1.12) rotate(2deg)", opacity: 1, offset: .68 },
            { transform: "scale(1) rotate(0deg)", opacity: 1 }
          ], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" });
        }
        return result;
      };
    }

    const originalOpenCase = window.openCase;
    if (typeof originalOpenCase === "function") {
      window.openCase = async function polishedOpenCase(...args) {
        const state = appState();
        if (state?.isSpinning) return;
        if (!state || !state.selectedCase || !state.currentUser) return originalOpenCase.apply(this, args);
        state.isSpinning = true;
        try { await playCaseReveal(); } finally { state.isSpinning = false; }
        const result = await originalOpenCase.apply(this, args); syncBalance(); return result;
      };
    }

    const originalStartUpgrade = window.startUpgrade;
    if (typeof originalStartUpgrade === "function") {
      window.startUpgrade = function polishedUpgrade(...args) {
        const result = originalStartUpgrade.apply(this, args); syncBalance(); return result;
      };
    }
    window.__emojiDropsPolishHandlers = true;
  }

  function animateLiveDrop(node) {
    if (!(node instanceof HTMLElement) || node.dataset.motionReady === "1") return;
    node.dataset.motionReady = "1"; if (prefersReduced()) return;
    node.classList.add("emoji-drop-live-enter");
    node.addEventListener("animationend", () => node.classList.remove("emoji-drop-live-enter"), { once: true, passive: true });
  }

  function observeLiveDrops() {
    const roots = document.querySelectorAll(".live-drops, #liveDrops, #liveContainer, #liveDropsContainer, .live-drops-container");
    roots.forEach(root => {
      if (root.dataset.qualityObserver === "1") return;
      root.dataset.qualityObserver = "1";
      new MutationObserver(mutations => mutations.forEach(mutation => mutation.addedNodes.forEach(node => { if (node instanceof HTMLElement) animateLiveDrop(node); }))).observe(root, { childList: true });
      [...root.children].forEach(animateLiveDrop);
    });
  }

  function addButtonMotion() {
    document.querySelectorAll("button, .top-btn, .amount-btn").forEach(button => {
      if (!(button instanceof HTMLElement) || button.dataset.motionButton === "1") return;
      button.dataset.motionButton = "1";
      button.addEventListener("pointerdown", () => { if (!prefersReduced()) button.style.willChange = "transform"; }, { passive: true });
      const release = () => { button.style.willChange = "auto"; };
      button.addEventListener("pointerup", release, { passive: true }); button.addEventListener("pointercancel", release, { passive: true }); button.addEventListener("pointerleave", release, { passive: true });
    });
  }

  function init() { injectStyles(); normalizeSearchFields(); decorateHandlers(); observeLiveDrops(); addButtonMotion(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
