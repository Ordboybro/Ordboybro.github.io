(() => {
    "use strict";

    // data.js performs an initial online-counter update before app.js is loaded.
    // Keep that dependency available without duplicating application state.
    if (typeof window.getUsers !== "function") {
        window.getUsers = () => {
            try {
                return JSON.parse(localStorage.getItem("users")) || [];
            } catch {
                return [];
            }
        };
    }

    const loadScriptOnce = (src, attribute) => {
        if (document.querySelector(`script[data-${attribute}="1"]`)) return;
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.dataset[attribute] = "1";
        document.head.appendChild(script);
    };

    // Keep the old visual baseline intact while consolidating non-destructive
    // interaction/motion fixes into one runtime layer.
    const loadQualityPolish = () => {
        loadScriptOnce("js/quality-polish.js", "quality-polish");

        // Economy is loaded after the application so its public API and
        // canonical case prices can normalize legacy values without creating
        // another competing game implementation.
        loadScriptOnce("js/economy.js", "economy-runtime");
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadQualityPolish, { once: true });
    } else {
        loadQualityPolish();
    }
})();
