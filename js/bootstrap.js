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

    // Keep the old visual baseline intact while consolidating non-destructive
    // interaction/motion fixes into one runtime layer.
    const loadQualityPolish = () => {
        if (document.querySelector('script[data-quality-polish="1"]')) return;
        const script = document.createElement("script");
        script.src = "js/quality-polish.js";
        script.defer = true;
        script.dataset.qualityPolish = "1";
        document.head.appendChild(script);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadQualityPolish, { once: true });
    } else {
        loadQualityPolish();
    }
})();
