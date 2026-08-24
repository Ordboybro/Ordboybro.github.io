(() => {
    "use strict";

    const $ = id => document.getElementById(id);
    const rarityOrder = Object.freeze({ common:1, rare:2, epic:3, mythical:4, legendary:5 });
    const rarityColors = Object.freeze({ common:"#808080", rare:"#3b82f6", epic:"#a855f7", mythical:"#ef4444", legendary:"#ffd000" });

    function addStyle() {
        if ($("finalPolishV2Style")) return;
        const style = document.createElement("style");
        style.id = "finalPolishV2Style";
        style.textContent = `
            .profile-mini-btn,.profile-settings-btn{min-height:46px!important;padding:11px 18px!important;border:1px solid rgba(255,123,0,.42)!important;border-radius:12px!important;box-shadow:0 0 0 1px rgba(255,123,0,.05)!important}
            .profile-mini-btn:hover,.profile-settings-btn:hover{border-color:#ff7b00!important;box-shadow:0 0 18px rgba(255,123,0,.18)!important}
            .settings-back-btn{position:absolute;top:-4px;left:16px;z-index:5;border:1px solid rgba(255,123,0,.5);background:#151515;color:#fff;border-radius:10px;padding:8px 14px;cursor:pointer}
            .settings-header{position:relative!important;padding-top:28px!important}
            .settings-box{position:relative}
            .upgrade-workspace{width:min(980px,94vw);margin:20px auto 40px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
            .upgrade-panel{padding:20px;border:1px solid rgba(255,123,0,.24);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,123,0,.025));box-shadow:0 12px 34px rgba(0,0,0,.2)}
            .upgrade-panel h3{margin:0 0 14px;color:#ff7b00}.upgrade-select{width:100%;box-sizing:border-box;margin:7px 0;padding:12px;border:1px solid rgba(255,123,0,.28);border-radius:10px;background:#151515;color:#fff}.upgrade-preview{display:flex;align-items:center;justify-content:center;gap:18px;min-height:130px;font-size:64px}.upgrade-arrow{font-size:32px;color:#ff7b00}.upgrade-chance{font-size:24px;font-weight:800;text-align:center;margin:12px 0;color:#ff7b00}.upgrade-target-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;max-height:240px;overflow:auto}.upgrade-target{border:1px solid rgba(255,123,0,.2);border-radius:10px;padding:9px;background:#121212;color:#fff;cursor:pointer}.upgrade-target.active{border-color:#ff7b00;box-shadow:0 0 16px rgba(255,123,0,.18)}
            .lane-status{margin:10px auto 0;text-align:center;color:#aaa;font-size:13px}.lane-status b{color:#ff7b00}
            @media(max-width:760px){.upgrade-workspace{grid-template-columns:1fr}.upgrade-target-list{grid-template-columns:repeat(3,minmax(0,1fr))}.profile-mini-btn,.profile-settings-btn{min-height:44px!important;padding:10px 13px!important}}
        `;
        document.head.appendChild(style);
    }

    function removeDarkThemeSetting() {
        const overlay = $("settingsOverlay");
        if (!overlay) return;
        const items = overlay.querySelectorAll(".settings-item");
        items.forEach(item => {
            if ((item.textContent || "").toLowerCase().includes("тёмная тема")) item.remove();
        });
        const header = overlay.querySelector(".settings-header");
        if (header && !header.querySelector(".settings-back-btn")) {
            const back = document.createElement("button");
            back.className = "settings-back-btn";
            back.textContent = "← Назад";
            back.type = "button";
            back.onclick = () => window.closeSettings?.();
            header.appendChild(back);
        }
    }

    function installSearchGuard() {
        const input = $("searchInput");
        if (!input || input.dataset.clipboardGuard) return;
        input.dataset.clipboardGuard = "1";
        // The site never reads navigator.clipboard. Only browser-native trusted paste
        // events (Ctrl+V/context menu) are allowed to change this field.
        input.addEventListener("paste", event => {
            if (!event.isTrusted) event.preventDefault();
        });
    }

    function bestDrop(user) {
        if (!user) return null;
        const stored = user.bestDrop && rarityOrder[user.bestDrop.rarity] ? user.bestDrop : null;
        const inventory = Array.isArray(user.inventory) ? user.inventory : [];
        return inventory.reduce((best,item) => {
            if (!item || !rarityOrder[item.rarity]) return best;
            if (!best || rarityOrder[item.rarity] > rarityOrder[best.rarity] ||
                (rarityOrder[item.rarity] === rarityOrder[best.rarity] && Number.parseFloat(item.price) > Number.parseFloat(best.price))) return item;
            return best;
        }, stored);
    }

    function persistBestDrop() {
        if (typeof state === "undefined" || !state.currentUser) return;
        const best = bestDrop(state.currentUser);
        if (!best) return;
        state.currentUser.bestDrop = {emoji:best.emoji,rarity:best.rarity,price:best.price};
        const emoji = $("bestDropEmoji"), rarity = $("bestDropRarity");
        if (emoji) { emoji.textContent = best.emoji || "🏆"; emoji.style.borderColor = rarityColors[best.rarity] || ""; }
        if (rarity) { rarity.textContent = String(best.rarity).toUpperCase(); rarity.style.color = rarityColors[best.rarity] || ""; }
        if (typeof saveUsers === "function") saveUsers();
    }

    function statsObject() {
        if (typeof state === "undefined") return null;
        if (!state.stats) state.stats = {opened:0,upgrades:0,deposited:0,withdrawn:0,withdrawnItems:0};
        return state.stats;
    }

    function refreshStats() {
        if (typeof state === "undefined") return;
        const s = statsObject();
        const u = state.currentUser;
        const saved = u?.stats || {};
        s.opened = Number(s.opened ?? saved.opened ?? 0);
        s.upgrades = Number(s.upgrades ?? saved.upgrades ?? 0);
        s.deposited = Number(s.deposited ?? saved.deposited ?? 0);
        s.withdrawn = Number(s.withdrawn ?? saved.withdrawn ?? 0);
        s.withdrawnItems = Number(s.withdrawnItems ?? saved.withdrawnItems ?? 0);
        $("openedCases") && ($("openedCases").textContent = s.opened);
        $("upgradeCount") && ($("upgradeCount").textContent = s.upgrades);
        $("depositAmount") && ($("depositAmount").textContent = `${s.deposited}₽`);
        $("withdrawAmount") && ($("withdrawAmount").textContent = `${s.withdrawn}₽`);
        $("withdrawItems") && ($("withdrawItems").textContent = s.withdrawnItems);
    }

    function wrapOnce(name, factory) {
        if (typeof window[name] !== "function" || window[name].__finalV2) return;
        const original = window[name];
        const wrapped = factory(original);
        if (typeof wrapped !== "function") return;
        wrapped.__finalV2 = true;
        window[name] = wrapped;
    }

    function installStatsAndBestDrop() {
        wrapOnce("openCase", original => async function(...args) {
            const before = Array.isArray(state?.currentUser?.inventory) ? state.currentUser.inventory.length : 0;
            const result = await original.apply(this,args);
            const after = Array.isArray(state?.currentUser?.inventory) ? state.currentUser.inventory.length : before;
            if (state?.currentUser && after > before) {
                const s = statsObject(); s.opened += after - before;
                state.currentUser.stats = s;
                saveUsers();
                refreshStats();
                persistBestDrop();
            }
            return result;
        });

        wrapOnce("sellInventoryItem", original => function(...args) {
            const beforeBalance = Number(state?.balance || 0);
            const beforeLength = Array.isArray(state?.currentUser?.inventory) ? state.currentUser.inventory.length : 0;
            const result = original.apply(this,args);
            const afterBalance = Number(state?.balance || 0);
            if (state?.currentUser && afterBalance > beforeBalance) {
                const s = statsObject();
                s.withdrawn += afterBalance - beforeBalance;
                if (Array.isArray(state.currentUser.inventory) && state.currentUser.inventory.length >= beforeLength) s.withdrawnItems = Math.max(s.withdrawnItems, beforeLength - state.currentUser.inventory.length + s.withdrawnItems);
                state.currentUser.stats = s;
                saveStats?.();
                refreshStats();
                persistBestDrop();
            }
            return result;
        });

        wrapOnce("sellWin", original => function(...args) {
            const beforeBalance = Number(state?.balance || 0);
            const result = original.apply(this,args);
            const delta = Number(state?.balance || 0) - beforeBalance;
            if (delta > 0 && state?.currentUser) {
                const s = statsObject(); s.withdrawn += delta; s.withdrawnItems += 1;
                state.currentUser.stats = s;
                saveUsers(); refreshStats(); persistBestDrop();
            }
            return result;
        });

        wrapOnce("loginUser", original => function(...args) {
            const result = original.apply(this,args);
            persistBestDrop(); refreshStats();
            return result;
        });
    }

    function renderLaneStatus() {
        const page = $("openPage"), amounts = $("openAmounts");
        if (!page || !amounts) return;
        let status = page.querySelector(".lane-status");
        if (!status) { status = document.createElement("div"); status.className = "lane-status"; amounts.insertAdjacentElement("afterend",status); }
        const count = Number(state?.openAmount || 1);
        status.innerHTML = `Выбрано лент: <b>${count}</b>`;
        const container = $("multiRouletteContainer");
        if (container) container.dataset.lanes = String(count);
    }

    function installLaneSync() {
        const amounts = $("openAmounts");
        if (!amounts || amounts.dataset.finalV2) return;
        amounts.dataset.finalV2 = "1";
        amounts.addEventListener("click", () => setTimeout(renderLaneStatus,0));
        const observer = new MutationObserver(() => renderLaneStatus());
        observer.observe(amounts,{childList:true});
        renderLaneStatus();
    }

    function buildUpgradeUI() {
        const page = $("upgradePage");
        if (!page || page.dataset.finalV2) return;
        page.dataset.finalV2 = "1";
        const content = page.querySelector(".profile-main") || page;
        const oldCenter = content.querySelector(".profile-box-center");
        if (oldCenter) oldCenter.remove();
        const workspace = document.createElement("div");
        workspace.className = "upgrade-workspace";
        workspace.innerHTML = `
            <div class="upgrade-panel"><h3>Ваш предмет</h3><select class="upgrade-select" id="upgradeSource"></select><div class="upgrade-preview"><span id="upgradeSourceEmoji">📦</span><span class="upgrade-arrow">→</span><span id="upgradeTargetEmoji">❔</span></div></div>
            <div class="upgrade-panel"><h3>Цель</h3><select class="upgrade-select" id="upgradeTarget"></select><div class="upgrade-chance" id="upgradeChance">Выберите предмет</div><button class="main-btn" id="upgradeRunBtn" type="button">⬆️ АПГРЕЙД</button></div>`;
        page.appendChild(workspace);
        const source = $("upgradeSource"), target = $("upgradeTarget");
        const refresh = () => {
            const inventory = Array.isArray(state?.currentUser?.inventory) ? state.currentUser.inventory : [];
            source.innerHTML = inventory.length ? inventory.map((item,i)=>`<option value="${i}">${item.emoji} ${String(item.rarity).toUpperCase()} — ${item.price}</option>`).join("") : `<option value="">Инвентарь пуст</option>`;
            refreshTargets();
        };
        const refreshTargets = () => {
            const item = state?.currentUser?.inventory?.[Number(source.value)];
            target.innerHTML = "";
            const all = Array.isArray(window.allDrops) ? window.allDrops : (typeof allDrops !== "undefined" ? allDrops : []);
            const choices = all.filter(x => item && Number.parseFloat(x.price) > Number.parseFloat(item.price || 0));
            choices.sort((a,b)=>Number.parseFloat(a.price)-Number.parseFloat(b.price));
            choices.slice(0,40).forEach((x,i)=>{ const o=document.createElement("option"); o.value=String(all.indexOf(x)); o.textContent=`${x.emoji} ${String(x.rarity).toUpperCase()} — ${x.price}`; target.appendChild(o); });
            updateUpgradePreview();
        };
        const updateUpgradePreview = () => {
            const item = state?.currentUser?.inventory?.[Number(source.value)];
            const all = Array.isArray(window.allDrops) ? window.allDrops : (typeof allDrops !== "undefined" ? allDrops : []);
            const goal = all[Number(target.value)];
            $("upgradeSourceEmoji").textContent = item?.emoji || "📦";
            $("upgradeTargetEmoji").textContent = goal?.emoji || "❔";
            const chance = item && goal ? Math.min(95, Math.max(1, Number.parseFloat(item.price)/Number.parseFloat(goal.price)*100*0.95)) : 0;
            $("upgradeChance").textContent = chance ? `Шанс успеха: ${chance.toFixed(1)}%` : "Выберите предмет";
            target.disabled = !item || !goal;
        };
        source.addEventListener("change",refreshTargets); target.addEventListener("change",updateUpgradePreview);
        $("upgradeRunBtn").onclick = () => {
            if (!state?.currentUser) return openAuth("login");
            const inventory = state.currentUser.inventory || [];
            const index = Number(source.value), item = inventory[index];
            const all = Array.isArray(window.allDrops) ? window.allDrops : (typeof allDrops !== "undefined" ? allDrops : []);
            const goal = all[Number(target.value)];
            if (!item || !goal) return alert("Выберите предмет и цель");
            const chance = Math.min(95, Math.max(1, Number.parseFloat(item.price)/Number.parseFloat(goal.price)*100*0.95));
            const success = Math.random()*100 < chance;
            inventory.splice(index,1);
            if(success) inventory.push({...goal});
            const s = statsObject(); s.upgrades += 1; state.currentUser.stats = s;
            saveUsers(); saveStats?.(); renderInventory?.(); refresh(); refreshStats(); persistBestDrop();
            const result = $("upgradeResult");
            if(result){ result.style.display="flex"; $("upgradeResultEmoji").textContent=success?goal.emoji:"💥"; $("upgradeResultText").textContent=success?`УСПЕШНО: ${String(goal.rarity).toUpperCase()}`:"НЕ УДАЛОСЬ"; }
        };
        refresh();
    }

    function boot() {
        addStyle();
        installSearchGuard();
        removeDarkThemeSetting();
        installStatsAndBestDrop();
        installLaneSync();
        buildUpgradeUI();
        refreshStats();
        persistBestDrop();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
})();
