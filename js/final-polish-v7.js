(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  function mountUpgradeInsideProfile() {
    const profile = $("profilePage");
    const upgrade = $("upgradePage");
    if (!profile || !upgrade) return;

    if (upgrade.parentElement !== profile) profile.appendChild(upgrade);
    upgrade.style.position = "absolute";
    upgrade.style.inset = "0";
    upgrade.style.zIndex = "1000";
    upgrade.style.boxSizing = "border-box";
  }

  window.openUpgradeMenu = () => {
    if (typeof state !== "undefined" && !state.currentUser) {
      alert("Сначала войдите в аккаунт");
      return;
    }
    mountUpgradeInsideProfile();
    const profile = $("profilePage");
    const upgrade = $("upgradePage");
    if (!profile || !upgrade) return;
    profile.style.overflow = "hidden";
    upgrade.style.display = "flex";
    upgrade.setAttribute("aria-hidden", "false");
  };

  window.closeUpgradeMenu = () => {
    const upgrade = $("upgradePage");
    const profile = $("profilePage");
    if (upgrade) {
      upgrade.style.display = "none";
      upgrade.setAttribute("aria-hidden", "true");
    }
    if (profile) profile.style.overflow = "";
    if (typeof window.closeUpgradeResult === "function") window.closeUpgradeResult();
  };

  // The case animation owns the visual lock until its easing phase is finished.
  if (typeof window.closePage === "function" && !window.closePage.__v7) {
    const original = window.closePage;
    const wrapped = function () {
      const page = $("openPage");
      if (page?.classList.contains("v6-spinning")) return;
      return original.apply(this, arguments);
    };
    wrapped.__v7 = true;
    window.closePage = wrapped;
  }

  // Safe developer test command; it never runs automatically.
  window.addTestMoney = function (amount = 10000) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return false;
    if (typeof state === "undefined") return false;
    state.balance += Math.floor(value);
    if (state.currentUser) {
      state.currentUser.balance = state.balance;
      if (typeof saveUsers === "function") saveUsers();
    }
    if (typeof updateBalanceUI === "function") updateBalanceUI();
    return state.balance;
  };
})();
