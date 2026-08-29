(() => {
  "use strict";

  // Behaviour-level polish only. Layout belongs to layout-sanitizer.css.
  // Case opening/navigation/economy each have one canonical owner.
  const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const appState = () => window.state || null;

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

  function decorateNavigation() {
    if (window.__emojiDropsPolishHandlers) return;

    const decorate = (name, selector, duration) => {
      const original = window[name];
      if (typeof original !== "function" || original.__emojiDropsPolished) return;
      const wrapped = function polishedHandler(...args) {
        const result = original.apply(this, args);
        Promise.resolve(result).then(() => {
          const element = document.querySelector(selector);
          if (element && !element.hidden && getComputedStyle(element).display !== "none") {
            animateIn(element, { duration });
          }
        });
        return result;
      };
      Object.defineProperty(wrapped, "__emojiDropsPolished", { value: true });
      window[name] = wrapped;
    };

    decorate("openCasePage", "#openPage", 280);
    decorate("openProfile", "#profilePage", 240);
    decorate("openUpgradeMenu", "#upgradePage", 220);

    const originalShowWin = window.showWin;
    if (typeof originalShowWin === "function" && !originalShowWin.__emojiDropsPolished) {
      const wrapped = function polishedShowWin(...args) {
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
      Object.defineProperty(wrapped, "__emojiDropsPolished", { value: true });
      window.showWin = wrapped;
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
    decorateNavigation();
    observeLiveDrops();
    addButtonMotion();
    pauseWhenHidden();
    syncBalance();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
