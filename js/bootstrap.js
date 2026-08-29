(() => {
  "use strict";

  if (typeof window.getUsers !== "function") {
    window.getUsers = () => {
      try { return JSON.parse(localStorage.getItem("users")) || []; }
      catch { return []; }
    };
  }

  const normalizedPath = src => {
    try { return new URL(src, location.href).pathname; }
    catch { return src; }
  };

  const loadScript = (src, attribute) => new Promise((resolve, reject) => {
    const wanted = normalizedPath(src);
    const existing = [...document.scripts].find(script => {
      try { return new URL(script.src, location.href).pathname === wanted; }
      catch { return false; }
    });

    if (existing) {
      if (existing.dataset.loaded === "1" || existing.readyState === "complete") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset[attribute] = "1";
    script.onload = () => { script.dataset.loaded = "1"; resolve(); };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  const loadStylesheet = (href, attribute) => new Promise((resolve, reject) => {
    const wanted = normalizedPath(href);
    const existing = [...document.querySelectorAll('link[rel="stylesheet"]')].find(link => {
      try { return new URL(link.href, location.href).pathname === wanted; }
      catch { return false; }
    });

    if (existing) {
      existing.disabled = false;
      return resolve();
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset[attribute] = "1";
    link.onload = resolve;
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });

  async function bootRuntime() {
    try {
      // The preserved design is the base. Disable obsolete patch generations
      // before installing the single consolidated visual/runtime authorities.
      await loadScript("js/legacy-style-isolation.js", "legacy-style-isolation");
      await loadStylesheet("css/layout-sanitizer.css", "clean-layout");
      await loadScript("js/economy.js", "economy-runtime");
      await loadScript("js/core-consistency.js", "core-consistency");
      await loadScript("js/old-design-runtime.js", "old-design-runtime");
      await loadScript("js/router.js", "router-runtime");
      await loadScript("js/device-quality.js", "device-quality-runtime");
      await loadScript("js/upgrade.js", "upgrade-runtime");
      await loadScript("js/quality-polish.js", "quality-polish");
      await loadScript("js/layout-sanitizer.js", "layout-sanitizer");
      await loadStylesheet("css/final-component-polish.css", "final-component-polish");
      await loadScript("js/functional-recovery.js", "functional-recovery");
    } catch (error) {
      console.error("[EmojiDrops] runtime bootstrap failed", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootRuntime, { once: true });
  } else {
    bootRuntime();
  }
})();
