(() => {
  "use strict";

  const STYLE_ID = "emoji-drops-quality-polish";
  const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html { scroll-behavior: smooth; }
      body { overflow-x: hidden !important; }

      button, a, input, select, textarea {
        -webkit-tap-highlight-color: transparent;
      }

      button, .top-btn, .amount-btn, .case-card, .sell-item-btn {
        transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease;
      }

      button:not(:disabled):active, .top-btn:active, .amount-btn:active {
        transform: translateY(1px) scale(.985);
      }

      .live-drops, #liveDrops, #liveDropsContainer, .live-drops-container {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        z-index: 1100 !important;
        overflow: visible !important;
        pointer-events: none;
      }

      .live-drops > *, #liveDrops > *, #liveDropsContainer > *, .live-drops-container > * {
        pointer-events: auto;
      }

      .live-drops-item, .live-drop, .drop-feed-item, .live-drop-card {
        will-change: transform, opacity;
      }

      .case-card .price, .case-card .case-price, .case-card .price-tag {
        margin-top: 6px !important;
        font-size: 1.05em;
        line-height: 1.15;
      }

      .multi-roulette, #multiRouletteContainer {
        overflow-x: hidden !important;
      }

      .roulette-marker, .new-pointer {
        pointer-events: none !important;
      }

      .back-btn-profile, .back-btn, [data-action="back"] {
        z-index: 20;
      }

      .open-page, #openPage {
        overscroll-behavior: contain;
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: .001ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: .001ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeSearchFields() {
    const selectors = [
      'input[type="search"]',
      'input[name*="search" i]',
      'input[placeholder*="кейс" i]',
      'input[placeholder*="поиск" i]'
    ];

    document.querySelectorAll(selectors.join(",")).forEach((input) => {
      input.type = "search";
      input.name = input.name || "case-search";
      input.autocomplete = "off";
      input.autocapitalize = "none";
      input.autocorrect = "off";
      input.spellcheck = false;
      input.setAttribute("data-form-type", "other");
      input.setAttribute("data-lpignore", "true");
      input.setAttribute("data-1p-ignore", "true");
    });
  }

  function prepareAnimatedNode(node) {
    if (!(node instanceof HTMLElement) || prefersReduced()) return;
    if (node.dataset.qualityPolishReady === "1") return;

    node.dataset.qualityPolishReady = "1";
    node.style.willChange = "transform, opacity";

    requestAnimationFrame(() => {
      node.style.transition = "transform 520ms cubic-bezier(.16,1,.3,1), opacity 520ms ease";
      node.style.transform = "translate3d(0,0,0)";
      node.style.opacity = "1";

      window.setTimeout(() => {
        node.style.willChange = "auto";
      }, 560);
    });
  }

  function observeLiveDrops() {
    const roots = document.querySelectorAll(".live-drops, #liveDrops, #liveDropsContainer, .live-drops-container");
    roots.forEach((root) => {
      if (root.dataset.qualityObserver === "1") return;
      root.dataset.qualityObserver = "1";

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => prepareAnimatedNode(node));
        }
      });

      observer.observe(root, { childList: true, subtree: true });
    });
  }

  function addPageMotion() {
    if (prefersReduced()) return;
    document.documentElement.classList.add("quality-polish-ready");

    document.querySelectorAll("button, .top-btn, .amount-btn").forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      button.addEventListener("pointerdown", () => {
        button.style.willChange = "transform";
      }, { passive: true });
      button.addEventListener("pointerup", () => {
        button.style.willChange = "auto";
      }, { passive: true });
      button.addEventListener("pointercancel", () => {
        button.style.willChange = "auto";
      }, { passive: true });
    });
  }

  function init() {
    injectStyles();
    normalizeSearchFields();
    observeLiveDrops();
    addPageMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
