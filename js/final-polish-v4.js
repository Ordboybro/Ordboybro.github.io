(() => {
    "use strict";

    const $ = id => document.getElementById(id);
    const rarityOrder = Object.freeze({ common:1, rare:2, epic:3, mythical:4, legendary:5 });
    const rarityColor = rarity => (typeof rarities !== "undefined" && rarities[rarity]?.color) || ({common:"#808080",rare:"#3b82f6",epic:"#a855f7",mythical:"#ef4444",legendary:"#ffd000"}[rarity] || "#ff7b00");

    function style(){
        if ($("finalPolishV4Style")) return;
        const s = document.createElement("style");
        s.id = "finalPolishV4Style";
        s.textContent = `
/* =========================
   FINAL POLISH V4
   Visual-only layer + small compatibility fixes.
   ========================= */

/* LIVE DROPS ---------------------------------------------------------- */
.live-drops-bar{position:relative;overflow:hidden!important}
.live-drops-bar::before,.live-container::before{content:none!important;display:none!important}
.live-drops-bar::after{content:"";position:absolute;right:0;top:0;bottom:0;width:clamp(55px,8vw,120px);z-index:30;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(11,11,11,.12) 20%,rgba(11,11,11,.72) 78%,#0b0b0b 100%)}
.live-container{position:relative;display:flex!important;align-items:center;gap:10px;padding:0 72px 0 clamp(16px,2.4vw,34px)!important;margin:0!important;overflow:hidden!important;box-sizing:border-box;isolation:isolate}
.live-drop{position:relative;z-index:2;flex:0 0 auto;will-change:transform,opacity;transform:translate3d(0,0,0);backface-visibility:hidden}
.live-drop.legendary{border-color:#ffd000!important;color:#ffd000!important;animation:none!important;filter:none!important;background:linear-gradient(145deg,#191600,#111)!important;box-shadow:0 0 7px rgba(255,208,0,.62),0 0 18px rgba(255,208,0,.26),inset 0 0 12px rgba(255,208,0,.08)!important}
.live-drop.legendary .live-rarity,.live-drop.legendary .live-user{color:#ffd000!important}
.live-drop.v4-new{animation:liveDropEnterV4 .46s cubic-bezier(.2,.82,.2,1) both}
@keyframes liveDropEnterV4{from{opacity:0;transform:translate3d(-26px,7px,0) scale(.96)}65%{opacity:1;transform:translate3d(3px,-1px,0) scale(1.01)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}
.live-container.v4-motion .live-drop{transition:transform .46s cubic-bezier(.2,.82,.2,1),opacity .28s ease}

/* CASE PRICES -------------------------------------------------------- */
.case.price-compact-animous .case-price{width:max-content;min-width:0;padding-left:7px;padding-right:7px}
.case.price-compact-animous .new-price,.case.price-compact-animous .old-price{font-size:clamp(12px,1.25vw,18px)!important}
.case.price-compact-transport .case-price{width:max-content;min-width:0;padding-left:6px;padding-right:6px;transform:translate(-6px,3px) scale(.88)!important}
.case.price-compact-transport .new-price,.case.price-compact-transport .old-price{font-size:clamp(12px,1.22vw,18px)!important}

/* CASE LANES ---------------------------------------------------------- */
#openPage .roulette-wrapper{height:auto!important;min-height:0!important;overflow:visible!important;flex:0 0 auto}
#openPage #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;height:auto!important;min-height:0!important;gap:14px!important;overflow:visible!important;flex:none!important}
#openPage .multi-roulette{position:relative!important;width:min(1200px,calc(100% - 32px))!important;height:160px!important;min-height:160px!important;margin:0!important;flex:none!important;overflow:hidden!important;transform:none}
#openPage .multi-roulette[hidden]{display:none!important}
#openPage .open-amounts,#openPage .open-buttons,#openPage .case-items-list{position:relative;z-index:2;flex:0 0 auto}
#openPage .open-amounts{margin-top:18px!important;transition:margin-top .28s ease,transform .28s ease}
#openPage .open-buttons{margin-top:20px!important;transition:margin-top .28s ease,transform .28s ease}
#openPage .case-items-list{margin-top:26px!important;transition:margin-top .28s ease,transform .28s ease}
#openPage #multiRouletteContainer[data-lanes="2"] + *{scroll-margin-top:0}

/* ARROWS ------------------------------------------------------------- */
#openPage .center-indicator{height:0!important;width:0!important;left:50%!important;top:50%!important;background:none!important;border:0!important;box-shadow:none!important;z-index:60!important}
#openPage .center-indicator::before,#openPage .center-indicator::after{content:"";position:absolute;display:block;width:15px;height:15px;background:transparent;border:0 solid #ff7b00;filter:drop-shadow(0 0 5px rgba(255,123,0,.55))}
#openPage .center-indicator::before{left:-8px;top:-63px;border-right-width:3px;border-bottom-width:3px;transform:rotate(45deg)}
#openPage .center-indicator::after{left:-8px;top:48px;border-left-width:3px;border-top-width:3px;transform:rotate(45deg)}
#openPage .new-pointer{display:none!important}

/* OPENING ------------------------------------------------------------ */
#openPage #multiRouletteContainer.v4-opening .multi-track{animation:v4RouletteRoll 2.45s cubic-bezier(.09,.62,.12,1) both}
#openPage #multiRouletteContainer.v4-opening .multi-roulette{animation:v4LaneIn .22s ease-out both}
@keyframes v4LaneIn{from{opacity:.35;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes v4RouletteRoll{0%{transform:translate3d(0,0,0)}8%{transform:translate3d(-90px,0,0)}48%{transform:translate3d(-760px,0,0)}70%{transform:translate3d(-1050px,0,0)}84%{transform:translate3d(-1160px,0,0)}92%{transform:translate3d(-1210px,0,0)}97%{transform:translate3d(-1230px,0,0)}100%{transform:translate3d(-1240px,0,0)}}
#winPopup.v4-result-hidden{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translateY(10px) scale(.98)!important}
#winPopup.v4-result-visible{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:translateY(0) scale(1)!important;transition:opacity .32s ease,transform .38s cubic-bezier(.2,.8,.2,1)}

/* BACK BUTTON -------------------------------------------------------- */
#openPage>.back-btn{position:fixed!important;top:14px!important;right:18px!important;left:auto!important;z-index:5000!important}

/* PROFILE / SETTINGS ------------------------------------------------- */
#profilePage{overflow-x:hidden!important;overscroll-behavior:contain}
#profilePage .profile-content{overflow:visible!important;min-height:0}
#profilePage .inventory-grid{overflow:visible!important}
#settingsOverlay.v4-profile-settings{position:absolute!important;inset:0!important;z-index:200!important;background:rgba(0,0,0,.48)!important;backdrop-filter:blur(8px);border-radius:inherit}
#settingsOverlay.v4-profile-settings .settings-box{width:min(850px,calc(100% - 32px));max-height:calc(100% - 90px);overflow:auto}
#statsOverlay.v4-profile-settings{position:absolute!important;inset:0!important;z-index:200!important}

/* UPGRADE ------------------------------------------------------------ */
#upgradePage{overflow-y:auto!important;overflow-x:hidden!important;padding:74px 20px 40px}
#upgradePage .profile-main{width:min(860px,100%);padding:28px;border:1px solid #2b2b2b;border-radius:28px;background:linear-gradient(145deg,#151515,#0e0e0e);box-shadow:0 20px 60px rgba(0,0,0,.3)}
#upgradePage .profile-box-center{width:100%}
#upgradePage #upgradeResult{width:min(520px,100%);padding:22px;border:1px solid rgba(255,123,0,.25);border-radius:22px;background:#111;box-shadow:0 10px 35px rgba(0,0,0,.25)}
#upgradePage .main-btn,#upgradePage .settings-action-btn{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
#upgradePage .main-btn:hover,#upgradePage .settings-action-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,123,0,.15)}

/* INVENTORY ---------------------------------------------------------- */
#inventoryGrid:empty::before{content:"Инвентарь пуст";display:flex;align-items:center;justify-content:center;min-height:150px;width:100%;padding:28px;border:1px dashed #333;border-radius:20px;color:#888;font-weight:700;letter-spacing:.2px}
#inventoryGrid{min-height:150px}

/* SCROLL / RESPONSIVE ----------------------------------------------- */
#openPage,#profilePage,#upgradePage,#settingsOverlay,#statsOverlay{scrollbar-gutter:stable}
body{overflow-x:hidden!important}
@media(max-width:760px){
  #openPage .multi-roulette{width:calc(100% - 20px)!important;height:132px!important;min-height:132px!important}
  #openPage .multi-track{gap:8px;padding:0 24px}
  #openPage .center-indicator::before{top:-50px}
  #openPage .center-indicator::after{top:37px}
  #openPage>.back-btn{top:10px!important;right:10px!important}
  .live-container{padding-left:14px!important;padding-right:54px!important}
}
@media(prefers-reduced-motion:reduce){
  .live-drop,.live-container.v4-motion .live-drop,#openPage #multiRouletteContainer.v4-opening .multi-track{animation:none!important;transition:none!important}
}
`;
        document.head.appendChild(s);
    }

    function markPriceCategories(){
        document.querySelectorAll(".case").forEach(card => {
            const name = card.querySelector(".case-name")?.textContent?.trim().toLowerCase();
            card.classList.toggle("price-compact-animous", name === "animous" || name === "among us" || name === "amongus");
            card.classList.toggle("price-compact-transport", name === "transport");
        });
    }

    function setPersistentBestDrop(item){
        if (!item || typeof state === "undefined") return;
        const current = state.bestDrop || state.currentUser?.bestDrop || null;
        if (!current || (rarityOrder[item.rarity] || 0) > (rarityOrder[current.rarity] || 0)) {
            state.bestDrop = item;
            if (state.currentUser) state.currentUser.bestDrop = item;
            if (typeof saveUsers === "function") saveUsers();
        }
    }

    function restoreBestDrop(){
        if (typeof state === "undefined") return;
        const saved = state.currentUser?.bestDrop || state.bestDrop;
        if (saved) state.bestDrop = saved;
        if (!state.bestDrop && Array.isArray(state.currentUser?.inventory)) {
            const best = state.currentUser.inventory.reduce((a,b) => (rarityOrder[b.rarity] || 0) > (rarityOrder[a?.rarity] || 0) ? b : a, null);
            if (best) setPersistentBestDrop(best);
        }
        if (state.bestDrop && typeof window.updateBestDrop === "function") {
            const original = window.updateBestDrop;
            if (!original.__v4Best) {
                const wrapped = function(){
                    const result = original.apply(this, arguments);
                    const item = state.bestDrop;
                    if (item && $("bestDropEmoji") && $("bestDropRarity")) {
                        $("bestDropEmoji").innerText = item.emoji || "🏆";
                        $("bestDropRarity").innerText = String(item.rarity || "").toUpperCase();
                        $("bestDropRarity").style.color = rarityColor(item.rarity);
                    }
                    return result;
                };
                wrapped.__v4Best = true;
                window.updateBestDrop = wrapped;
            }
        }
    }

    function animateLiveInsert(container, element){
        if (!container || !element) return;
        const before = new Map(Array.from(container.children).map(el => [el, el.getBoundingClientRect()]));
        element.classList.add("v4-new");
        requestAnimationFrame(() => {
            container.classList.add("v4-motion");
            for (const [el, rect] of before) {
                if (!el.isConnected) continue;
                const next = el.getBoundingClientRect();
                const dx = rect.left - next.left;
                if (Math.abs(dx) < 1) continue;
                el.animate([{transform:`translate3d(${dx}px,0,0)`},{transform:"translate3d(0,0,0)"}],{duration:460,easing:"cubic-bezier(.2,.82,.2,1)"});
            }
            setTimeout(() => { element.classList.remove("v4-new"); container.classList.remove("v4-motion"); }, 520);
        });
    }

    function patchLiveDrops(){
        const wrap = name => {
            const original = window[name];
            if (typeof original !== "function" || original.__v4Live) return;
            const wrapped = function(username,item){
                const container = $("liveContainer");
                const before = container ? container.firstElementChild : null;
                const result = original.apply(this, arguments);
                const newest = container && container.firstElementChild;
                if (newest && newest !== before) animateLiveInsert(container,newest);
                return result;
            };
            wrapped.__v4Live = true;
            window[name] = wrapped;
        };
        wrap("createLiveDrop");
        wrap("addLiveDrop");
    }

    function syncLanes(){
        const container = $("multiRouletteContainer");
        const amounts = $("openAmounts");
        if (!container || typeof state === "undefined") return;
        const selected = Math.max(1, Number(state.openAmount) || 1);
        container.dataset.lanes = String(selected);
        container.querySelectorAll(".multi-roulette").forEach((lane,index) => {
            lane.hidden = index >= selected;
            lane.setAttribute("aria-hidden", index >= selected ? "true" : "false");
        });
        if (amounts) amounts.querySelectorAll(".amount-btn").forEach(btn => btn.classList.toggle("active", Number(btn.textContent) === selected));
    }

    function patchLaneCreation(){
        if (typeof window.createRoulettes !== "function" || window.createRoulettes.__v4) return;
        const original = window.createRoulettes;
        const wrapped = function(){
            const result = original.apply(this, arguments);
            requestAnimationFrame(syncLanes);
            return result;
        };
        wrapped.__v4 = true;
        window.createRoulettes = wrapped;
    }

    function openProfileSettings(){
        const user = typeof state !== "undefined" ? state.currentUser : null;
        if (!user) { alert("Сначала войдите в аккаунт"); return; }
        const profile = $("profilePage");
        const settings = $("settingsOverlay");
        if (!profile || !settings) return;
        if (profile.style.display !== "flex") profile.style.display = "flex";
        if (settings.parentElement !== profile) profile.appendChild(settings);
        settings.classList.add("v4-profile-settings");
        settings.style.display = "flex";
    }

    function closeProfileSettings(){
        const settings = $("settingsOverlay");
        if (settings) settings.style.display = "none";
    }

    function patchSettings(){
        window.openSettings = openProfileSettings;
        window.closeSettings = closeProfileSettings;
    }

    function animateCaseOpening(){
        const container = $("multiRouletteContainer");
        const popup = $("winPopup");
        if (!container) return;
        syncLanes();
        container.classList.remove("v4-opening");
        void container.offsetWidth;
        container.classList.add("v4-opening");
        if (popup) {
            popup.classList.add("v4-result-hidden");
            popup.classList.remove("v4-result-visible");
            setTimeout(() => {
                popup.classList.remove("v4-result-hidden");
                popup.classList.add("v4-result-visible");
            }, 2450);
        }
        setTimeout(() => container.classList.remove("v4-opening"), 2700);
    }

    function patchOpenCase(){
        if (typeof window.openCase !== "function" || window.openCase.__v4Open) return;
        const original = window.openCase;
        const wrapped = async function(...args){
            if (typeof state !== "undefined" && state.isSpinning) return;
            const result = await original.apply(this,args);
            if (typeof state !== "undefined") {
                const wins = [];
                if (state.currentWin) wins.push(state.currentWin);
                if (Array.isArray(state.winQueue)) wins.push(...state.winQueue);
                wins.forEach(setPersistentBestDrop);
            }
            syncLanes();
            animateCaseOpening();
            return result;
        };
        wrapped.__v4Open = true;
        window.openCase = wrapped;
    }

    function patchOpenCasePage(){
        if (typeof window.openCasePage !== "function" || window.openCasePage.__v4Page) return;
        const original = window.openCasePage;
        const wrapped = function(...args){
            const result = original.apply(this,args);
            requestAnimationFrame(() => syncLanes());
            return result;
        };
        wrapped.__v4Page = true;
        window.openCasePage = wrapped;
    }

    function improveInventoryState(){
        const grid = $("inventoryGrid");
        if (!grid) return;
        const hasItems = grid.children.length > 0;
        grid.classList.toggle("empty-state", !hasItems);
        if (hasItems) grid.querySelectorAll(".inventory-item").forEach((item,index) => item.style.setProperty("--inventory-index",index));
    }

    function patchInventory(){
        if (typeof window.renderInventory !== "function" || window.renderInventory.__v4) return;
        const original = window.renderInventory;
        const wrapped = function(...args){
            const result = original.apply(this,args);
            requestAnimationFrame(improveInventoryState);
            return result;
        };
        wrapped.__v4 = true;
        window.renderInventory = wrapped;
    }

    function boot(){
        style();
        markPriceCategories();
        patchLiveDrops();
        patchLaneCreation();
        patchSettings();
        patchOpenCase();
        patchOpenCasePage();
        patchInventory();
        restoreBestDrop();
        syncLanes();
        improveInventoryState();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
    else boot();
})();
