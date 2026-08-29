(() => {
  "use strict";

  if (typeof window.getUsers !== "function") {
    window.getUsers = () => {
      try { return JSON.parse(localStorage.getItem("users")) || []; }
      catch { return []; }
    };
  }

  const loadScript = (src, attribute) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-${attribute}="1"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", resolve, { once:true });
      existing.addEventListener("error", reject, { once:true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.dataset[attribute] = "1";
    script.onload = () => { script.dataset.loaded = "1"; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const loadStylesheet = (href, attribute) => new Promise((resolve, reject) => {
    if (document.querySelector(`link[data-${attribute}="1"]`)) return resolve();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset[attribute] = "1";
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });

  async function bootRuntime() {
    try {
      // Establish the layout authority before behaviour-level polish.
      await loadStylesheet("css/layout-sanitizer.css", "clean-layout");
      await loadScript("js/economy.js", "economy-runtime");
      await loadScript("js/quality-polish.js", "quality-polish");
      await loadScript("js/layout-sanitizer.js", "layout-sanitizer");
    } catch (error) {
      console.error("[EmojiDrops] runtime bootstrap failed", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootRuntime, { once:true });
  } else {
    bootRuntime();
  }
})();
