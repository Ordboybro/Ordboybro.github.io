(() => {
  "use strict";

  const LEGACY_STYLE_NAMES = new Set([
    "final-layout.css", "final-polish.css", "final-stability.css", "finish.css",
    "last-polish.css", "motion-system.css", "polish.css", "premium.css",
    "quality-pass.css", "quality-v2.css", "runtime-quality.css",
    "site-fixes-20260826.css", "stable-polish.css", "ultimate-ui.css",
    "unified.css", "updates.css"
  ]);

  const CLEAN_LAYOUT = "css/layout-sanitizer.css";

  function filename(href) {
    try { return new URL(href, location.href).pathname.split("/").pop(); }
    catch { return ""; }
  }

  function disableLegacyStyles() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      if (LEGACY_STYLE_NAMES.has(filename(link.href))) {
        link.disabled = true;
        link.dataset.emojiDropsLegacyDisabled = "1";
      }
    });
  }

  function loadCleanLayout() {
    const existing = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(link => filename(link.href) === filename(CLEAN_LAYOUT));

    if (existing) {
      existing.disabled = false;
      existing.dataset.emojiDropsCleanLayout = "1";
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CLEAN_LAYOUT;
    link.dataset.emojiDropsCleanLayout = "1";
    document.head.appendChild(link);
  }

  function start() {
    disableLegacyStyles();
    loadCleanLayout();
    requestAnimationFrame(() => document.documentElement.classList.add("layout-sanitized"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
