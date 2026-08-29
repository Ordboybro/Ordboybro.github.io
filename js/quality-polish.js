(() => {
  "use strict";

  // This module owns behaviour-level polish only. Layout belongs to CSS so we
  // don't have a runtime stylesheet fighting index.html/motion-system.css.
  const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const appState = () => {
    if (window.state) return window.state;
    try { if (typeof state !== "undefined") return state; } catch (_) {}
    return null;
  };

  const animateIn = (element, options = {}) => {
    if (!(element instanceof HTMLElement) || prefersReduced()) return null;
    const animation = element.animate([
      { opacity: 0, transform: options.from || "translate3d(0, 10px, 0) scale(.985)" },
      { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
    ], {
      duration: options.duration ?? 260,
      easing: options.easing || "cubic-bezier(.16,1,.3,1)",
      fill: "both"
    });
    animation.addEventListener?.("finish", () => animation.cancel(), { once: true });
    return animation;
  };

  function normalizeSearchFields() {
    document.querySelectorAll(
      'input[type="search"], input[name*="search" i], input[placeholder*="кейс" i], input[placeholder*="поиск" i]'
    ).forEach(input => {
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

  function syncBalance() {
    if (typeof window.updateBalanceUI === "function") window.updateBalanceUI();
    const state = appState();
    const balance = document.getElementById("balance");
    if (balance && state) balance.textContent = String(state.balance ?? 0);
  }

  async function playCaseReveal() {
    if (prefersReduced()) return;
    const tracks = [...document.querySelectorAll("#multiRouletteContainer .multi-track, .multi-roulette .multi-track")];
    if (!tracks.length) return;

    const animations = tracks.map((track, index) => {
      const distance = index % 2 ? "-68%" : "-72%";
      return track.animate([
        { transform: "translate3d(0,0,0)" },
        { transform: `translate3d(${distance},0,0)`, offset: .78 },
        { transform: `translate3d(calc(${distance} + 18px),0,0)`, offset: .9 },
        { transform: `translate3d(calc(${distance} + 8px),0,0)`, offset: .96 },
        { transform: `translate3d(${distance},0,0)` }
      ], {
        duration: 1850 + index * 90,
        delay: index * 45,
        easing: "cubic-bezier(.08,.72,.18,1)",
        fill: "forwards"
      });
    });

    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)));
    animations.forEach(animation => animation.cancel());
  }

  function decorateHandlers() {
    if (window.__emojiDropsPolishHandlers) return;

    const decorate = (name, selector, duration) => {
      const original = window[name];
      if (typeof original !== "function") return;
      window[name] = function polishedHandler(...args) {
        const result = original.apply(this, args);
        Promise.resolve(result).then(() => {
          const element = document.querySelector(selector);
          if (element && getComputedStyle(element).display !== "none") animateIn(element, { duration });
        });
        return result;
      };
    };

    decorate("openCasePage", "#openPage", 280);
    decorate("openProfile", "#profilePage", 240);
    decorate("openUpgradeMenu", "#upgradePage", 220);

    const originalShowWin = window.showWin;
    if (typeof originalShowWin === "function") {
      window.showWin = function polishedShowWin(...args) {
        const result = originalShowWin.apply(this, args);
        const popup = document.getElementById("winPopup");
        if (popup && !prefersReduced()) {
          animateIn(popup, { duration: 320, from: "translate3d(0,14px,0) scale(.94)" });
          const emoji = document.getElementById("winEmoji");
          if (emoji) emoji.animate([
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
        if (!state || state.__emojiDropsRevealRunning || state.isSpinning) return;
        if (!state.selectedCase || !state.currentUser) return originalOpenCase.apply(this, args);

        state.__emojiDropsRevealRunning = true;
        try {
          await playCaseReveal();
          return await originalOpenCase.apply(this, args);
        } finally {
          state.__emojiDropsRevealRunning = false;
          syncBalance();
        }
      };
    }

    const originalStartUpgrade = window.startUpgrade;
    if (typeof originalStartUpgrade === "function") {
      window.startUpgrade = function polishedUpgrade(...args) {
        const result = originalStartUpgrade.apply(this, args);
        syncBalance();
        return result;
      };
    }

    window.__emojiDropsPolishHandlers = true;
  }

  function animateLiveDrop(node) {
    if (!(node instanceof HTMLElement) || node.dataset.motionReady === "1") return;
    node.dataset.motionReady = "1";
    if (prefersReduced()) return;
    node.classList.add("ed-live-enter");
    node.addEventListener("animationend", () => node.classList.remove("ed-live-enter"), { once: true, passive: true });
  }

  function observeLiveDrops() {
    document.querySelectorAll(
      ".live-drops, #liveDrops, #liveContainer, #liveDropsContainer, .live-drops-container"
    ).forEach(root => {
      if (root.dataset.qualityObserver === "1") return;
      root.dataset.qualityObserver = "1";

      const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) animateLiveDrop(node);
          }
        }
      });
      observer.observe(root, { childList: true });
      [...root.children].forEach(animateLiveDrop);
    });
  }

  // Delegation keeps the number of permanent event listeners small even when
  // the page has many dynamically-created buttons.
  function addButtonMotion() {
    if (document.documentElement.dataset.buttonMotionReady === "1") return;
    document.documentElement.dataset.buttonMotionReady = "1";

    document.addEventListener("pointerdown", event => {
      if (prefersReduced()) return;
      const button = event.target instanceof Element ? event.target.closest("button, .top-btn, .amount-btn") : null;
      if (button instanceof HTMLElement) button.style.willChange = "transform";
    }, { passive: true });

    const release = event => {
      const button = event.target instanceof Element ? event.target.closest("button, .top-btn, .amount-btn") : null;
      if (button instanceof HTMLElement) button.style.willChange = "auto";
    };

    document.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointercancel", release, { passive: true });
  }

  function pauseWhenHidden() {
    document.addEventListener("visibilitychange", () => {
      document.documentElement.classList.toggle("ed-page-hidden", document.hidden);
    }, { passive: true });
  }

  function init() {
    normalizeSearchFields();
    decorateHandlers();
    observeLiveDrops();
    addButtonMotion();
    pauseWhenHidden();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
