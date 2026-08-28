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

    // Load the single consolidated quality/motion runtime after the application
    // has initialized. This keeps the old visual baseline intact while avoiding
    // another stack of independent polish layers.
    window.addEventListener("load", () => {
        const script = document.createElement("script");
        script.src = "js/quality-runtime.js";
        script.defer = true;
        document.head.appendChild(script);
    }, { once: true });
})();
