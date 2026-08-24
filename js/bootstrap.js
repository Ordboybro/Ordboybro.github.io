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
})();
