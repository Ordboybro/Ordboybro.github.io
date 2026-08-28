/* Legacy compatibility layer.
 * Game logic is owned by the current runtime modules; this file intentionally
 * keeps only compatibility helpers used by the old page markup.
 */
(function () {
  "use strict";

  window.updateBalanceUI = window.updateBalanceUI || function () {
    const balance = window.state?.balance ?? 0;
    const main = document.getElementById("balance");
    const profile = document.getElementById("profileBalance");
    if (main) main.textContent = balance;
    if (profile) profile.textContent = balance;
  };

  window.updateProfileUI = window.updateProfileUI || function (isLogged) {
    ["loginBtn", "registerBtn", "profileBtn", "logoutBtn"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const logged = id === "profileBtn" || id === "logoutBtn";
      el.style.display = logged === !!isLogged ? "block" : "none";
    });
  };

  window.toggleTheme = window.toggleTheme || function () {
    document.body.classList.toggle("light-theme");
    localStorage.setItem("theme", document.body.classList.contains("light-theme") ? "true" : "false");
  };
})();
