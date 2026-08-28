(() => {
    "use strict";

    if (typeof window.getUsers !== "function") {
        window.getUsers = () => {
            try {
                return JSON.parse(localStorage.getItem("users")) || [];
            } catch {
                return [];
            }
        };
    }

    const loadScript = (src, attribute) => new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-${attribute}="1"]`);
        if (existing) {
            if (existing.dataset.loaded === "1") return resolve();
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.dataset[attribute] = "1";
        script.onload = () => { script.dataset.loaded = "1"; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
    });

    async function bootRuntime() {
        try {
            // Economy must be available before the polish layer wraps the
            // application's global game functions. This prevents two different
            // chance implementations from racing during startup.
            await loadScript("js/economy.js", "economy-runtime");
            await loadScript("js/quality-polish.js", "quality-polish");
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