(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const qs = (root, selector) => Array.from((root || document).querySelectorAll(selector));

  const rarityRank = { common: 1, rare: 2, epic: 3, mythical: 4, legendary: 5 };
  const rarityColor = rarity => (typeof rarities !== "undefined" && rarities[rarity]?.color) || "#ff7b00";

  function injectStyle() {
    if ($("emojiDropsFinalPolishV5")) return;
    const style = document.createElement("style");
    style.id = "emojiDropsFinalPolishV5";
    style.textContent = `
      /* ---------- profile / overlays ---------- */
      #profilePage{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable both-edges}
      #profilePage>.profile-content,#profilePage>.profile-main{overflow:visible!important}
      #profilePage.v5-overlay-open{overflow:hidden!important}
      #settingsOverlay.v5-profile-overlay,#statsOverlay.v5-profile-overlay{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-height:none!important;margin:0!important;z-index:1000!important;overflow:hidden!important;box-sizing:border-box}
      #settingsOverlay.v5-profile-overlay .settings-box,#statsOverlay.v5-profile-overlay .settings-box{width:min(720px,calc(100% - 28px))!important;max-height:calc(100% - 32px)!important;overflow-y:auto!important;overflow-x:hidden!important;box-sizing:border-box}
      #settingsOverlay .settings-line,#statsOverlay .settings-line{display:none!important}
      #settingsOverlay .settings-back-btn,#settingsOverlay .back-btn{display:none!important}
      #settingsOverlay .settings-tabs{overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none}
      #settingsOverlay .settings-tabs::-webkit-scrollbar{display:none}
      #settingsOverlay .delete-account,#settingsOverlay .danger-zone{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
      #statsOverlay{overflow:hidden!important}

      /* ---------- live drops ---------- */
      .live-drops-bar{overflow:hidden!important;position:relative!important}
      .live-drops-bar::before{display:none!important;content:none!important}
      .live-drops-bar::after{content:"";position:absolute;right:0;top:0;bottom:0;width:clamp(55px,8vw,110px);pointer-events:none;z-index:20;background:linear-gradient(90deg,transparent 0%,rgba(10,10,10,.16) 28%,rgba(10,10,10,.68) 72%,#0b0b0b 100%)}
      .live-container{padding-left:10px!important;padding-right:clamp(48px,6vw,78px)!important;overflow:hidden!important;gap:10px!important;box-sizing:border-box}
      .live-drop{flex:0 0 auto!important;will-change:transform,opacity;backface-visibility:hidden}
      .live-drop.v5-enter{animation:v5LiveEnter .44s cubic-bezier(.2,.82,.2,1) both}
      .live-drop.v5-legendary{animation:none!important;filter:none!important;color:#ffd000!important;border-color:#ffd000!important;background:linear-gradient(145deg,#201b00,#111)!important;box-shadow:0 0 8px rgba(255,208,0,.8),0 0 24px rgba(255,208,0,.35),inset 0 0 10px rgba(255,208,0,.08)!important}
      .live-drop.v5-legendary *{color:#ffd000!important}
      @keyframes v5LiveEnter{from{opacity:0;transform:translate3d(-18px,4px,0) scale(.975)}to{opacity:1;transform:none}}

      /* ---------- case prices ---------- */
      .case.price-v5-compact-animous .case-price{width:max-content!important;min-width:0!important;padding-inline:5px!important}
      .case.price-v5-compact-animous .new-price,.case.price-v5-compact-animous .old-price{font-size:clamp(12px,1.18vw,16px)!important}
      .case.price-v5-compact-transport .case-price{width:max-content!important;min-width:0!important;padding-inline:4px!important;transform:translate(-5px,3px) scale(.84)!important}
      .case.price-v5-compact-transport .new-price,.case.price-v5-compact-transport .old-price{font-size:clamp(12px,1.16vw,16px)!important}

      /* ---------- case lanes / arrows ---------- */
      #openPage #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:center!important;gap:14px!important;height:auto!important;overflow:visible!important}
      #openPage .multi-roulette{position:relative!important;flex:0 0 auto!important;width:min(1200px,calc(100% - 24px))!important;height:160px!important;min-height:160px!important;margin:0!important;overflow:hidden!important}
      #openPage .multi-roulette[hidden]{display:none!important}
      #openPage .center-indicator{width:0!important;height:0!important;background:none!important;border:0!important;box-shadow:none!important}
      #openPage .center-indicator::before,#openPage .center-indicator::after{content:"";position:absolute;width:19px;height:19px;border-color:#ff7b00;border-style:solid;filter:drop-shadow(0 0 6px rgba(255,123,0,.55));background:transparent}
      #openPage .center-indicator::before{left:-10px;top:-70px;border-width:0 3px 3px 0;transform:rotate(45deg)}
      #openPage .center-indicator::after{left:-10px;top:51px;border-width:3px 0 0 3px;transform:rotate(45deg)}
      #openPage .new-pointer{display:none!important}
      #openPage>.back-btn{position:fixed!important;top:9px!important;right:16px!important;left:auto!important;z-index:5000!important}
      #winPopup{z-index:20000!important}
      #openPage.v5-spinning .multi-roulette{pointer-events:none}
      #openPage.v5-spinning .multi-track{will-change:transform}
      .v5-win-enter{animation:v5WinEnter .42s cubic-bezier(.2,.8,.2,1) both!important}
      @keyframes v5WinEnter{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}

      /* ---------- upgrade ---------- */
      #upgradePage{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable}
      #upgradePage .upgrade-shell-v5{width:min(980px,calc(100% - 28px));margin:auto;padding:76px 0 40px;box-sizing:border-box}
      .upgrade-battle-card-v5{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:22px;padding:26px;border:1px solid rgba(255,123,0,.25);border-radius:24px;background:linear-gradient(145deg,rgba(26,26,26,.98),rgba(13,13,13,.98));box-shadow:0 18px 50px rgba(0,0,0,.3)}
      .upgrade-slot-v5{min-height:220px;border:1px dashed #353535;border-radius:20px;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;text-align:center}
      .upgrade-slot-v5.has-item{border-style:solid;border-color:rgba(255,123,0,.5);box-shadow:0 0 24px rgba(255,123,0,.08)}
      .upgrade-arrow-v5{font-size:34px;color:#ff7b00;filter:drop-shadow(0 0 8px rgba(255,123,0,.45));animation:v5ArrowPulse 1.5s ease-in-out infinite}
      @keyframes v5ArrowPulse{50%{transform:scale(1.08);filter:drop-shadow(0 0 14px rgba(255,123,0,.7))}}
      .upgrade-items-v5{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-top:18px}
      .upgrade-item-v5{cursor:pointer;border:1px solid #292929;border-radius:14px;padding:10px;background:#111;text-align:center;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
      .upgrade-item-v5:hover{transform:translateY(-2px);border-color:#ff7b00;box-shadow:0 8px 24px rgba(0,0,0,.25)}
      .upgrade-item-v5.selected{border-color:#ff7b00;box-shadow:0 0 18px rgba(255,123,0,.16)}
      .upgrade-empty-v5{padding:32px;border:1px dashed #333;border-radius:18px;color:#888;text-align:center}

      /* ---------- global motion / overflow ---------- */
      body{overflow-x:hidden!important}
      button,.main-btn,.settings-action-btn,.amount-btn,.case,.profile-mini-btn,.profile-settings-btn,.inventory-btn{transition:transform .18s ease,box-shadow .22s ease,border-color .22s ease,background-color .22s ease,opacity .18s ease}
      button:hover,.main-btn:hover,.settings-action-btn:hover,.amount-btn:hover,.profile-mini-btn:hover,.profile-settings-btn:hover,.inventory-btn:hover{transform:translateY(-1px)}
      .case-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #profilePage,#openPage,#upgradePage,#settingsOverlay,#statsOverlay{scrollbar-gutter:stable}
      @media(max-width:760px){.upgrade-battle-card-v5{grid-template-columns:1fr;gap:12px}.upgrade-arrow-v5{transform:rotate(90deg)}#openPage .multi-roulette{width:calc(100% - 12px)!important;height:132px!important;min-height:132px!important}#openPage>.back-btn{top:7px!important;right:10px!important}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
    `;
    document.head.appendChild(style);
  }

  function setupPrices(){
    qs(document, ".case").forEach(card => {
      const name = (card.querySelector(".case-name")?.textContent || "").trim().toLowerCase();
      card.classList.toggle("price-v5-compact-animous", /^(animous|among us|amongus)$/.test(name));
      card.classList.toggle("price-v5-compact-transport", name === "transport");
    });
  }

  function syncLanes(){
    const container = $("multiRouletteContainer");
    if (!container || typeof state === "undefined") return;
    const count = Math.max(1, Number(state.openAmount) || 1);
    qs(container, ".multi-roulette").forEach((lane, index) => {
      lane.hidden = index >= count;
      lane.setAttribute("aria-hidden", lane.hidden ? "true" : "false");
    });
    container.dataset.lanes = String(count);
  }

  function patchLaneCreation(){
    if (typeof window.createRoulettes === "function" && !window.createRoulettes.__v5) {
      const original = window.createRoulettes;
      const wrapped = function(){
        const result = original.apply(this, arguments);
        requestAnimationFrame(syncLanes);
        return result;
      };
      wrapped.__v5 = true;
      window.createRoulettes = wrapped;
    }
    const amountBox = $("openAmounts");
    if (amountBox && !amountBox.__v5) {
      amountBox.addEventListener("click", event => {
        if (event.target.closest(".amount-btn")) requestAnimationFrame(syncLanes);
      });
      amountBox.__v5 = true;
    }
  }

  function patchLiveDrops(){
    const names = ["createLiveDrop", "addLiveDrop"];
    names.forEach(name => {
      const original = window[name];
      if (typeof original !== "function" || original.__v5) return;
      const wrapped = function(){
        const container = $("liveContainer");
        const before = container ? Array.from(container.children) : [];
        const oldRects = new Map(before.map(el => [el, el.getBoundingClientRect()]));
        const result = original.apply(this, arguments);
        const first = container?.firstElementChild;
        if (first && !before.includes(first)) {
          first.classList.add("v5-enter");
          if (first.classList.contains("legendary")) first.classList.add("v5-legendary");
        }
        if (container) {
          requestAnimationFrame(() => {
            before.forEach(el => {
              if (!el.isConnected) return;
              const from = oldRects.get(el);
              const to = el.getBoundingClientRect();
              if (!from) return;
              const dx = from.left - to.left;
              if (Math.abs(dx) > 1) el.animate([{transform:`translate3d(${dx}px,0,0)`},{transform:"translate3d(0,0,0)"}], {duration:420,easing:"cubic-bezier(.2,.82,.2,1)"});
            });
          });
        }
        return result;
      };
      wrapped.__v5 = true;
      window[name] = wrapped;
    });
  }

  function patchCaseOpening(){
    if (typeof window.openCase !== "function" || window.openCase.__v5) return;
    const original = window.openCase;
    const wrapped = async function(count){
      if (typeof state !== "undefined" && state.isSpinning) return;
      const page = $("openPage");
      const container = $("multiRouletteContainer");
      if (!page || !container) return original.apply(this, arguments);
      page.classList.add("v5-spinning");
      container.querySelectorAll(".multi-track").forEach(track => {
        track.getAnimations().forEach(a => a.cancel());
        const distance = Math.max(900, track.scrollWidth - track.clientWidth - 40);
        track.animate([{transform:"translate3d(0,0,0)"},{transform:`translate3d(-${distance}px,0,0)`}], {duration:2350,easing:"cubic-bezier(.08,.72,.12,1)",fill:"both"});
      });
      try {
        const result = await original.apply(this, arguments);
        const popup = $("winPopup");
        if (popup) {
          popup.style.display = "none";
          setTimeout(() => {
            if (typeof state !== "undefined" && state.currentWin && typeof window.showWin === "function") window.showWin(state.currentWin);
            if (popup) popup.classList.add("v5-win-enter");
          }, 2350);
        }
        return result;
      } finally {
        setTimeout(() => page.classList.remove("v5-spinning"), 2420);
      }
    };
    wrapped.__v5 = true;
    window.openCase = wrapped;
  }

  function persistBestDrop(item){
    if (!item || typeof state === "undefined") return;
    const current = state.bestDrop || state.currentUser?.bestDrop;
    if (current && (rarityRank[current.rarity] || 0) >= (rarityRank[item.rarity] || 0)) return;
    const best = {emoji:item.emoji, rarity:item.rarity, price:item.price};
    state.bestDrop = best;
    if (state.currentUser) {
      state.currentUser.bestDrop = best;
      if (typeof saveUsers === "function") saveUsers();
    }
    const emoji = $("bestDropEmoji"), rarity = $("bestDropRarity");
    if (emoji) emoji.textContent = best.emoji;
    if (rarity) { rarity.textContent = String(best.rarity).toUpperCase(); rarity.style.color = rarityColor(best.rarity); }
  }

  function patchBestDrop(){
    if (typeof window.showWin === "function" && !window.showWin.__v5) {
      const original = window.showWin;
      const wrapped = function(item){ persistBestDrop(item); return original.apply(this, arguments); };
      wrapped.__v5 = true;
      window.showWin = wrapped;
    }
    if (typeof state !== "undefined" && state.currentUser?.bestDrop && !state.bestDrop) state.bestDrop = state.currentUser.bestDrop;
  }

  function mountOverlay(id){
    const profile = $("profilePage"), overlay = $(id);
    if (!profile || !overlay) return;
    if (overlay.parentElement !== profile) profile.appendChild(overlay);
    overlay.classList.add("v5-profile-overlay");
    profile.classList.add("v5-overlay-open");
    overlay.style.display = "flex";
  }

  function patchProfile(){
    window.openSettings = function(){
      if (typeof state !== "undefined" && !state.currentUser) return alert("Сначала войдите в аккаунт");
      mountOverlay("settingsOverlay");
    };
    window.closeSettings = function(){
      const overlay = $("settingsOverlay"), profile = $("profilePage");
      if (overlay) { overlay.style.display = "none"; overlay.classList.remove("v5-profile-overlay"); }
      profile?.classList.remove("v5-overlay-open");
    };
    window.openStats = function(){
      if (typeof state !== "undefined" && !state.currentUser) return alert("Сначала войдите в аккаунт");
      mountOverlay("statsOverlay");
      if (typeof window.updateStatsUI === "function") window.updateStatsUI();
    };
    window.closeStats = function(){
      const overlay = $("statsOverlay"), profile = $("profilePage");
      if (overlay) { overlay.style.display = "none"; overlay.classList.remove("v5-profile-overlay"); }
      profile?.classList.remove("v5-overlay-open");
    };
    const profile = $("profilePage");
    if (profile) {
      const settingsButtons = qs(profile, "button").filter(b => /настрой/i.test(b.textContent || ""));
      settingsButtons.slice(1).forEach(b => b.remove());
    }
  }

  function patchUpgrade(){
    const page = $("upgradePage");
    if (!page || page.querySelector(".upgrade-shell-v5")) return;
    const old = page.querySelector(".profile-main");
    const shell = document.createElement("div");
    shell.className = "upgrade-shell-v5";
    shell.innerHTML = `
      <div class="profile-name" style="text-align:center">Апгрейд</div>
      <div class="settings-sub" style="text-align:center;margin:8px 0 18px">Выбери предмет и цель. Интерфейс работает внутри текущей системы Upgrade.</div>
      <div class="upgrade-battle-card-v5">
        <div class="upgrade-slot-v5" data-upgrade-source><div><div style="font-size:48px">🎒</div><div class="settings-name">Выбери предмет</div></div></div>
        <div class="upgrade-arrow-v5">→</div>
        <div class="upgrade-slot-v5" data-upgrade-target><div><div style="font-size:48px">🎯</div><div class="settings-name">Выбери цель</div></div></div>
      </div>
      <div class="upgrade-items-v5" id="upgradeItemsV5"></div>
      <div class="upgrade-empty-v5" id="upgradeEmptyV5" style="display:none">Инвентарь пуст. Сначала получи предмет из кейса.</div>
    `;
    old?.remove();
    page.appendChild(shell);
    const grid = shell.querySelector("#upgradeItemsV5");
    const empty = shell.querySelector("#upgradeEmptyV5");
    const source = shell.querySelector("[data-upgrade-source]");
    const target = shell.querySelector("[data-upgrade-target]");
    const render = () => {
      grid.innerHTML = "";
      const inv = state?.currentUser?.inventory || [];
      empty.style.display = inv.length ? "none" : "block";
      inv.forEach((item, index) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "upgrade-item-v5";
        b.innerHTML = `<div style="font-size:38px">${item.emoji}</div><div>${String(item.rarity || "").toUpperCase()}</div><small>${item.price || "0₽"}</small>`;
        b.onclick = () => {
          qs(grid, ".selected").forEach(x => x.classList.remove("selected"));
          b.classList.add("selected");
          source.classList.add("has-item");
          source.innerHTML = `<div><div style="font-size:56px">${item.emoji}</div><div class="settings-name">${String(item.rarity || "").toUpperCase()}</div><small>${item.price || "0₽"}</small></div>`;
          target.classList.add("has-item");
          target.innerHTML = `<div><div style="font-size:56px">🎯</div><div class="settings-name">Цель выбрана</div><small>Готово к апгрейду</small></div>`;
        };
        grid.appendChild(b);
      });
    };
    render();
    page.addEventListener("click", e => { if (e.target.closest(".upgrade-item-v5")) return; }, {passive:true});
    const observer = new MutationObserver(render);
    const inv = $("inventoryGrid");
    if (inv) observer.observe(inv, {childList:true,subtree:true});
  }

  function boot(){
    injectStyle();
    setupPrices();
    patchLaneCreation();
    patchLiveDrops();
    patchCaseOpening();
    patchBestDrop();
    patchProfile();
    patchUpgrade();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true}); else boot();
  window.addEventListener("load", boot, {once:true});
})();
