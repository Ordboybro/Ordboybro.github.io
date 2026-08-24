(() => {
  "use strict";

  // Emoji Drops V8: architecture-safe stabilization layer.
  // This file intentionally avoids replacing core game logic. It fixes UI ownership,
  // motion, accessibility and expensive DOM patterns around the existing app.

  const $ = id => document.getElementById(id);
  const qsa = (root, selector) => Array.from((root || document).querySelectorAll(selector));

  const STYLE_ID = "emojiDropsFinalPolishV8";

  function installStyles() {
    if ($(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root {
        --ed-orange: #ff7b00;
        --ed-motion: cubic-bezier(.2,.78,.2,1);
        --ed-duration: 220ms;
      }

      html { overflow-x: hidden; }
      body { overflow-x: hidden !important; }

      /* One scroll owner for each full-screen surface. */
      #profilePage,
      #openPage,
      #upgradePage { scrollbar-gutter: stable; overscroll-behavior: contain; }
      #profilePage { overflow-x: hidden !important; }
      #profilePage .profile-content,
      #profilePage .profile-main { overflow-x: visible !important; }
      #settingsOverlay,
      #statsOverlay { overscroll-behavior: contain; }

      /* Prevent accidental layout shifts from long case names. */
      .case { min-width: 0; }
      .case-name,
      .case-item-rarity,
      .live-rarity,
      .live-user { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* Live Drops: stable viewport + composited movement. */
      .live-drops-bar { overflow: hidden !important; contain: layout paint; }
      .live-container { contain: layout paint; will-change: contents; }
      .live-drop {
        flex: 0 0 auto;
        backface-visibility: hidden;
        transform: translateZ(0);
      }
      .live-drop.ed-v8-enter {
        animation: edV8LiveEnter 420ms var(--ed-motion) both;
      }
      @keyframes edV8LiveEnter {
        from { opacity: 0; transform: translate3d(-18px, 0, 0) scale(.975); }
        to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }

      /* Case lanes: explicit vertical flow. */
      #multiRouletteContainer {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 14px !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }
      #multiRouletteContainer .multi-roulette {
        position: relative !important;
        flex: 0 0 auto !important;
        margin: 0 !important;
      }

      /* Modern case markers: CSS chevrons, not triangles. */
      #openPage .center-indicator { pointer-events: none; }
      #openPage .center-indicator::before,
      #openPage .center-indicator::after {
        width: 16px !important;
        height: 16px !important;
        border-color: var(--ed-orange) !important;
        filter: drop-shadow(0 0 7px rgba(255,123,0,.42));
      }

      /* Unified motion: transform/opacity only to keep animation on the compositor. */
      button,
      .case,
      .inventory-item,
      .profile-mini-btn,
      .profile-settings-btn,
      .settings-action-btn,
      .amount-btn,
      .main-btn {
        transition:
          transform var(--ed-duration) var(--ed-motion),
          opacity var(--ed-duration) ease,
          box-shadow var(--ed-duration) ease,
          border-color var(--ed-duration) ease,
          background-color var(--ed-duration) ease;
      }

      /* Do not animate while the browser is under reduced-motion preference. */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 1ms !important;
          transition-duration: 1ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* Mobile: prevent overlays from creating a second horizontal scroll context. */
      @media (max-width: 760px) {
        #profilePage, #openPage, #upgradePage { max-width: 100vw; }
        #multiRouletteContainer .multi-roulette { width: 100% !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function animateNewLiveDrop() {
    const container = $("liveContainer");
    if (!container || container.dataset.edV8Live) return;
    container.dataset.edV8Live = "1";

    const observer = new MutationObserver(records => {
      let firstAdded = null;
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1 && node.classList.contains("live-drop")) {
            firstAdded ||= node;
          }
        }
      }
      if (!firstAdded) return;
      firstAdded.classList.add("ed-v8-enter");
      firstAdded.addEventListener("animationend", () => firstAdded.classList.remove("ed-v8-enter"), { once: true });
    });
    observer.observe(container, { childList: true });
  }

  function stabilizeCaseLanes() {
    const container = $("multiRouletteContainer");
    if (!container || container.dataset.edV8Lanes) return;
    container.dataset.edV8Lanes = "1";

    const sync = () => {
      const amount = Math.max(1, Number(window.state?.openAmount || 1));
      qsa(container, ".multi-roulette").forEach((lane, index) => {
        const hidden = index >= amount;
        lane.hidden = hidden;
        lane.setAttribute("aria-hidden", String(hidden));
      });
    };

    new MutationObserver(sync).observe(container, { childList: true });
    $("openAmounts")?.addEventListener("click", event => {
      if (event.target.closest(".amount-btn")) requestAnimationFrame(sync);
    });
    sync();
  }

  function stabilizeOverlayNavigation() {
    const profile = $("profilePage");
    if (!profile) return;

    const mount = id => {
      const overlay = $(id);
      if (!overlay || overlay.parentElement === profile) return;
      profile.appendChild(overlay);
      overlay.dataset.edV8Mounted = "1";
    };

    // Existing functions remain the source of truth; we only guarantee their DOM owner.
    ["settingsOverlay", "statsOverlay", "upgradePage"].forEach(mount);
  }

  function guardButtons() {
    document.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      button.classList.add("ed-v8-pressed");
      setTimeout(() => button.classList.remove("ed-v8-pressed"), 120);
    }, { passive: true });
  }

  function diagnostics() {
    const required = ["openPage", "multiRouletteContainer", "liveContainer", "profilePage", "settingsOverlay", "statsOverlay", "upgradePage"];
    const missing = required.filter(id => !$(id));
    if (missing.length) console.warn("[Emoji Drops] Missing UI nodes:", missing);
  }

  function boot() {
    installStyles();
    animateNewLiveDrop();
    stabilizeCaseLanes();
    stabilizeOverlayNavigation();
    guardButtons();
    diagnostics();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
