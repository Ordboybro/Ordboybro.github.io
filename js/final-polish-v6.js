(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const all = (root, selector) => Array.from((root || document).querySelectorAll(selector));
  const rank = {common:1, rare:2, epic:3, mythical:4, legendary:5};
  const color = r => (typeof rarities !== "undefined" && rarities[r]?.color) || "#ff7b00";
  const money = v => Number(String(v ?? "0").replace(/[^0-9]/g, "")) || 0;

  function styles() {
    if ($("emojiDropsFinalPolishV6")) return;
    const s = document.createElement("style");
    s.id = "emojiDropsFinalPolishV6";
    s.textContent = `
      /* One owner per scrollable surface. */
      body{overflow-x:hidden!important}
      #profilePage{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable}
      #profilePage>.profile-content,#profilePage>.profile-main{overflow:visible!important}
      #profilePage.v6-overlay-open{overflow:hidden!important}
      #settingsOverlay.v6-inside,#statsOverlay.v6-inside{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:900!important;overflow:hidden!important;margin:0!important;box-sizing:border-box}
      #settingsOverlay.v6-inside .settings-box,#statsOverlay.v6-inside .settings-box{max-height:calc(100% - 28px)!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable;width:min(720px,calc(100% - 28px))!important;box-sizing:border-box}
      #settingsOverlay .settings-line,#settingsOverlay .settings-back-btn,#settingsOverlay .back-btn{display:none!important}
      #settingsOverlay::before,#settingsOverlay::after{display:none!important}
      #settingsOverlay .settings-list{overflow:visible!important}
      #statsOverlay{overflow:hidden!important}

      /* Live Drops: no left dark mask, clean inset, right fade and FLIP movement. */
      .live-drops-bar{position:relative!important;overflow:hidden!important}
      .live-drops-bar::before{display:none!important;content:none!important}
      .live-drops-bar::after{content:"";position:absolute;right:0;top:0;bottom:0;width:clamp(60px,8vw,120px);z-index:20;pointer-events:none;background:linear-gradient(90deg,transparent 0%,rgba(9,9,9,.12) 24%,rgba(9,9,9,.64) 72%,#0b0b0b 100%)}
      .live-container{padding-left:8px!important;padding-right:clamp(54px,7vw,92px)!important;overflow:hidden!important;display:flex!important;gap:10px!important;box-sizing:border-box}
      .live-drop{flex:0 0 auto!important;will-change:transform,opacity;backface-visibility:hidden}
      .live-drop.v6-enter{animation:v6LiveEnter .44s cubic-bezier(.2,.82,.2,1) both}
      .live-drop.legendary,.live-drop.v6-legendary{animation:none!important;filter:none!important;color:#ffd000!important;border-color:#ffd000!important;background:linear-gradient(145deg,#211c00,#111)!important;box-shadow:0 0 8px rgba(255,208,0,.85),0 0 24px rgba(255,208,0,.34),inset 0 0 10px rgba(255,208,0,.08)!important}
      .live-drop.legendary *,.live-drop.v6-legendary *{color:#ffd000!important}
      @keyframes v6LiveEnter{from{opacity:0;transform:translate3d(-16px,4px,0) scale(.975)}to{opacity:1;transform:none}}

      /* Prices: compact only where requested. */
      .case.v6-animous .case-price{width:max-content!important;min-width:0!important;padding-inline:5px!important}
      .case.v6-animous .new-price,.case.v6-animous .old-price{font-size:clamp(12px,1.18vw,16px)!important}
      .case.v6-transport .case-price{width:max-content!important;min-width:0!important;padding-inline:4px!important;transform:translate(-5px,3px) scale(.84)!important}
      .case.v6-transport .new-price,.case.v6-transport .old-price{font-size:clamp(12px,1.16vw,16px)!important}

      /* Case lanes: natural document flow, no absolute stacking. */
      #openPage #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:center!important;gap:14px!important;height:auto!important;min-height:0!important;overflow:visible!important}
      #openPage .multi-roulette{position:relative!important;flex:0 0 auto!important;width:min(1200px,calc(100% - 24px))!important;height:160px!important;min-height:160px!important;margin:0!important;overflow:hidden!important}
      #openPage .multi-roulette[hidden]{display:none!important}
      #openPage .new-pointer{display:none!important}
      #openPage .center-indicator{width:0!important;height:0!important;background:none!important;border:0!important;box-shadow:none!important;z-index:30!important}
      #openPage .center-indicator::before,#openPage .center-indicator::after{content:"";position:absolute;width:20px;height:20px;border-color:#ff7b00;border-style:solid;filter:drop-shadow(0 0 7px rgba(255,123,0,.5))}
      #openPage .center-indicator::before{left:-10px;top:-70px;border-width:0 3px 3px 0;transform:rotate(45deg)}
      #openPage .center-indicator::after{left:-10px;top:51px;border-width:3px 0 0 3px;transform:rotate(45deg)}
      #openPage>.back-btn{position:fixed!important;top:8px!important;right:16px!important;left:auto!important;z-index:5000!important}
      #openPage.v6-spinning .multi-roulette{pointer-events:none}
      #winPopup{z-index:20000!important}
      .v6-win-in{animation:v6WinIn .42s cubic-bezier(.2,.8,.2,1) both!important}
      @keyframes v6WinIn{from{opacity:0;transform:translateY(16px) scale(.965)}to{opacity:1;transform:none}}

      /* Upgrade 2.0-inspired, but original Emoji Drops visual language. */
      #upgradePage{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable}
      .v6-upgrade-shell{width:min(1040px,calc(100% - 28px));margin:auto;padding:72px 0 44px;box-sizing:border-box}
      .v6-upgrade-head{text-align:center;margin-bottom:18px}
      .v6-upgrade-head .profile-name{font-size:clamp(24px,3vw,38px)}
      .v6-upgrade-wheel{position:relative;height:118px;margin:18px 0;border:1px solid rgba(255,123,0,.22);border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#181818,#0e0e0e);box-shadow:inset 0 0 35px rgba(255,123,0,.04)}
      .v6-wheel-track{display:flex;align-items:center;height:100%;gap:10px;padding:0 18px;will-change:transform}
      .v6-wheel-item{width:82px;height:82px;flex:0 0 82px;border:2px solid #303030;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:40px;background:#111}
      .v6-wheel-pointer{position:absolute;left:50%;top:4px;bottom:4px;width:2px;background:#ff7b00;box-shadow:0 0 12px rgba(255,123,0,.8);transform:translateX(-50%);z-index:4}
      .v6-upgrade-grid{display:grid;grid-template-columns:minmax(0,1fr) 70px minmax(0,1fr);gap:16px;align-items:center}
      .v6-upgrade-slot{min-height:205px;border:1px dashed #343434;border-radius:22px;background:#101010;display:flex;align-items:center;justify-content:center;text-align:center;padding:18px;box-sizing:border-box}
      .v6-upgrade-slot.selected{border-style:solid;border-color:rgba(255,123,0,.55);box-shadow:0 0 25px rgba(255,123,0,.09)}
      .v6-upgrade-arrow{font-size:34px;color:#ff7b00;text-align:center;filter:drop-shadow(0 0 8px rgba(255,123,0,.5))}
      .v6-targets{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:10px;margin-top:16px}
      .v6-target{border:1px solid #292929;border-radius:14px;background:#111;color:#eee;padding:9px;cursor:pointer;text-align:center;transition:transform .18s ease,border-color .2s ease,box-shadow .2s ease}
      .v6-target:hover{transform:translateY(-2px);border-color:#ff7b00}
      .v6-target.selected{border-color:#ff7b00;box-shadow:0 0 18px rgba(255,123,0,.15)}
      .v6-upgrade-action{display:flex;justify-content:center;margin-top:18px}
      .v6-upgrade-empty{padding:30px;border:1px dashed #333;border-radius:18px;color:#888;text-align:center}

      /* General motion and long-name stability. */
      button,.main-btn,.settings-action-btn,.amount-btn,.case,.profile-mini-btn,.profile-settings-btn,.inventory-btn{transition:transform .18s ease,box-shadow .22s ease,border-color .22s ease,background-color .22s ease,opacity .18s ease}
      button:hover,.main-btn:hover,.settings-action-btn:hover,.amount-btn:hover,.profile-mini-btn:hover,.profile-settings-btn:hover,.inventory-btn:hover{transform:translateY(-1px)}
      .case-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      @media(max-width:760px){.v6-upgrade-grid{grid-template-columns:1fr}.v6-upgrade-arrow{transform:rotate(90deg)}.v6-upgrade-shell{width:calc(100% - 18px);padding-top:60px}#openPage .multi-roulette{width:calc(100% - 12px)!important;height:132px!important;min-height:132px!important}#openPage>.back-btn{top:6px!important;right:10px!important}.live-container{padding-left:8px!important;padding-right:55px!important}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
    `;
    document.head.appendChild(s);
  }

  function setupPrices(){
    all(document,".case").forEach(card=>{
      const n=(card.querySelector(".case-name")?.textContent||"").trim().toLowerCase();
      card.classList.toggle("v6-animous",/^(animous|among us|amongus)$/.test(n));
      card.classList.toggle("v6-transport",n==="transport");
    });
  }

  function setupLive(){
    ["createLiveDrop","addLiveDrop"].forEach(name=>{
      const original=window[name];
      if(typeof original!=="function"||original.__v6)return;
      const wrapped=function(){
        const c=$("liveContainer"), before=c?Array.from(c.children):[], rects=new Map(before.map(e=>[e,e.getBoundingClientRect()]));
        const result=original.apply(this,arguments);
        const first=c?.firstElementChild;
        if(first&&!before.includes(first)){first.classList.add("v6-enter");if(first.classList.contains("legendary"))first.classList.add("v6-legendary")}
        requestAnimationFrame(()=>before.forEach(e=>{if(!e.isConnected)return;const a=rects.get(e),b=e.getBoundingClientRect();if(a&&Math.abs(a.left-b.left)>1)e.animate([{transform:`translate3d(${a.left-b.left}px,0,0)`},{transform:"translate3d(0,0,0)"}],{duration:420,easing:"cubic-bezier(.2,.82,.2,1)"})}));
        return result;
      };
      wrapped.__v6=true;window[name]=wrapped;
    });
  }

  function setupLanes(){
    const sync=()=>{const c=$("multiRouletteContainer");if(!c||typeof state==="undefined")return;const n=Math.max(1,Number(state.openAmount)||1);all(c,".multi-roulette").forEach((lane,i)=>{lane.hidden=i>=n;lane.setAttribute("aria-hidden",lane.hidden?"true":"false")});c.dataset.lanes=String(n)};
    if(typeof window.createRoulettes==="function"&&!window.createRoulettes.__v6){const original=window.createRoulettes;const wrapped=function(){const r=original.apply(this,arguments);requestAnimationFrame(sync);return r};wrapped.__v6=true;window.createRoulettes=wrapped}
    const a=$("openAmounts");if(a&&!a.__v6){a.addEventListener("click",e=>{if(e.target.closest(".amount-btn"))requestAnimationFrame(sync)});a.__v6=true}
    sync();
  }

  function setupCaseAnimation(){
    if(typeof window.openCase!=="function"||window.openCase.__v6)return;
    const original=window.openCase;
    const wrapped=async function(count){
      if(typeof state!=="undefined"&&state.isSpinning)return;
      const page=$("openPage"),container=$("multiRouletteContainer");
      if(!page||!container)return original.apply(this,arguments);
      page.classList.add("v6-spinning");
      const animations=[];
      container.querySelectorAll(".multi-track").forEach(track=>{
        const distance=Math.max(900,track.scrollWidth-track.clientWidth-24);
        animations.push(track.animate([{transform:"translate3d(0,0,0)"},{transform:`translate3d(-${distance*.78}px,0,0)`,offset:.72},{transform:`translate3d(-${distance*.9}px,0,0)`,offset:.9},{transform:`translate3d(-${distance}px,0,0)`}],{duration:2400,easing:"cubic-bezier(.08,.72,.12,1)",fill:"both"}));
      });
      try{
        const result=await original.apply(this,arguments);
        const popup=$("winPopup");
        if(popup){popup.style.display="none";setTimeout(()=>{if(typeof state!=="undefined"&&state.currentWin&&typeof window.showWin==="function")window.showWin(state.currentWin);popup.classList.add("v6-win-in");},2400)}
        return result;
      }finally{setTimeout(()=>{page.classList.remove("v6-spinning");animations.forEach(a=>a.cancel())},2490)}
    };
    wrapped.__v6=true;window.openCase=wrapped;
  }

  function setupBestDrop(){
    window.updateBestDrop=function(){
      const current=typeof state!=="undefined"?(state.bestDrop||state.currentUser?.bestDrop):null;
      const emoji=$("bestDropEmoji"), rarity=$("bestDropRarity");
      if(!current){if(emoji)emoji.textContent="🏆";if(rarity)rarity.textContent="Нет дропа";return}
      if(emoji)emoji.textContent=current.emoji||"🏆";
      if(rarity){rarity.textContent=String(current.rarity||"").toUpperCase();rarity.style.color=color(current.rarity)}
    };
    if(typeof state!=="undefined"&&state.currentUser?.bestDrop&&!state.bestDrop)state.bestDrop=state.currentUser.bestDrop;
    if(typeof window.showWin==="function"&&!window.showWin.__v6Best){const original=window.showWin;const wrapped=function(item){if(item&&typeof state!=="undefined"){const current=state.bestDrop||state.currentUser?.bestDrop;if(!current||(rank[item.rarity]||0)>(rank[current.rarity]||0)){const best={emoji:item.emoji,rarity:item.rarity,price:item.price};state.bestDrop=best;if(state.currentUser){state.currentUser.bestDrop=best;if(typeof saveUsers==="function")saveUsers()}}}return original.apply(this,arguments)};wrapped.__v6Best=true;window.showWin=wrapped}
    window.updateBestDrop();
  }

  function moveOverlay(id){
    const p=$("profilePage"),o=$(id);if(!p||!o)return;
    if(o.parentElement!==p)p.appendChild(o);
    o.classList.add("v6-inside");p.classList.add("v6-overlay-open");o.style.display="flex";
  }
  function closeOverlay(id){const p=$("profilePage"),o=$(id);if(o){o.style.display="none";o.classList.remove("v6-inside")}p?.classList.remove("v6-overlay-open")}
  function setupProfile(){
    window.openSettings=()=>{if(typeof state!=="undefined"&&!state.currentUser)return alert("Сначала войдите в аккаунт");moveOverlay("settingsOverlay")};
    window.closeSettings=()=>closeOverlay("settingsOverlay");
    window.openStats=()=>{if(typeof state!=="undefined"&&!state.currentUser)return alert("Сначала войдите в аккаунт");moveOverlay("statsOverlay");if(typeof window.updateStatsUI==="function")window.updateStatsUI()};
    window.closeStats=()=>closeOverlay("statsOverlay");
    const p=$("profilePage");if(p){const bs=all(p,"button").filter(b=>/настрой/i.test(b.textContent||""));bs.slice(1).forEach(b=>b.remove())}
  }

  function setupUpgrade(){
    const page=$("upgradePage");if(!page||page.querySelector(".v6-upgrade-shell"))return;
    const old=page.querySelector(".profile-main");old?.remove();
    const shell=document.createElement("div");shell.className="v6-upgrade-shell";shell.innerHTML=`
      <div class="v6-upgrade-head"><div class="profile-name">Апгрейд</div><div class="settings-sub">Выбери свой предмет и цель — затем запусти колесо.</div></div>
      <div class="v6-upgrade-wheel"><div class="v6-wheel-pointer"></div><div class="v6-wheel-track" id="v6UpgradeWheel"></div></div>
      <div class="v6-upgrade-grid"><div class="v6-upgrade-slot" id="v6Source">🎒<br><span>Выбери предмет</span></div><div class="v6-upgrade-arrow">→</div><div class="v6-upgrade-slot" id="v6Target">🎯<br><span>Выбери цель</span></div></div>
      <div class="v6-targets" id="v6Targets"></div>
      <div class="v6-upgrade-action"><button class="main-btn" id="v6UpgradeButton" disabled>⬆️ АПГРЕЙД</button></div>
      <div class="v6-upgrade-empty" id="v6UpgradeEmpty" style="display:none">Инвентарь пуст. Открой кейс и получи предмет.</div>`;
    page.appendChild(shell);
    let sourceIndex=-1,target=null,busy=false;
    const sourceBox=$("v6Source"),targetBox=$("v6Target"),targets=$("v6Targets"),wheel=$("v6UpgradeWheel"),button=$("v6UpgradeButton"),empty=$("v6UpgradeEmpty");
    const render=()=>{
      targets.innerHTML="";wheel.innerHTML="";sourceIndex=-1;target=null;button.disabled=true;
      const inv=state?.currentUser?.inventory||[];empty.style.display=inv.length?"none":"block";
      inv.forEach((item,index)=>{const b=document.createElement("button");b.className="v6-target";b.type="button";b.innerHTML=`<div style="font-size:34px">${item.emoji}</div><div>${String(item.rarity||"").toUpperCase()}</div><small>${item.price||"0₽"}</small>`;b.onclick=()=>selectSource(index,b);targets.appendChild(b)});
    };
    const selectSource=(index,buttonEl)=>{sourceIndex=index;all(targets,".selected").forEach(b=>b.classList.remove("selected"));buttonEl.classList.add("selected");const item=state.currentUser.inventory[index];sourceBox.classList.add("selected");sourceBox.innerHTML=`<div style="font-size:58px">${item.emoji}</div><div>${String(item.rarity).toUpperCase()}</div><small>${item.price||"0₽"}</small>`;renderTargets(item)};
    const renderTargets=(source)=>{
      const pool=(typeof allDrops!=="undefined"?allDrops:[]).filter(x=>money(x.price)>money(source.price));
      targets.innerHTML="";pool.slice(0,30).forEach(item=>{const b=document.createElement("button");b.className="v6-target";b.type="button";b.innerHTML=`<div style="font-size:34px">${item.emoji}</div><div style="color:${color(item.rarity)}">${String(item.rarity).toUpperCase()}</div><small>${item.price||"0₽"}</small>`;b.onclick=()=>{all(targets,".selected").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");target=item;targetBox.classList.add("selected");targetBox.innerHTML=`<div style="font-size:58px">${item.emoji}</div><div style="color:${color(item.rarity)}">${String(item.rarity).toUpperCase()}</div><small>${item.price||"0₽"}</small>`;button.disabled=false;buildWheel(source,item)};targets.appendChild(b)});
      if(!pool.length)targets.innerHTML=`<div class="v6-upgrade-empty">Нет доступной цели выше выбранного предмета.</div>`;
    };
    const buildWheel=(source,targetItem)=>{wheel.innerHTML="";for(let i=0;i<17;i++){const d=document.createElement("div");d.className="v6-wheel-item";d.style.borderColor=color(i===12?targetItem.rarity:source.rarity);d.textContent=i===12?targetItem.emoji:(typeof allDrops!=="undefined"&&allDrops.length?allDrops[Math.floor(Math.random()*allDrops.length)].emoji:"✨");wheel.appendChild(d)}};
    button.onclick=async()=>{if(busy||sourceIndex<0||!target)return;busy=true;button.disabled=true;const source=state.currentUser.inventory[sourceIndex];const chance=Math.max(5,Math.min(95,(money(source.price)/Math.max(1,money(target.price)))*100*0.92));wheel.animate([{transform:"translateX(0)"},{transform:"translateX(-620px)"},{transform:"translateX(-980px)"}],{duration:2100,easing:"cubic-bezier(.08,.72,.12,1)",fill:"forwards"});await new Promise(r=>setTimeout(r,2150));const success=Math.random()*100<chance;if(success){state.currentUser.inventory.splice(sourceIndex,1);state.currentUser.inventory.push(target);state.currentUser.bestDrop=target;state.bestDrop=target;state.stats.upgrades+=1;if(typeof saveStats==="function")saveStats();if(typeof saveUsers==="function")saveUsers();if(typeof renderInventory==="function")renderInventory();alert(`Апгрейд успешен — шанс ${chance.toFixed(1)}%`)}else{state.currentUser.inventory.splice(sourceIndex,1);state.stats.upgrades+=1;if(typeof saveStats==="function")saveStats();if(typeof saveUsers==="function")saveUsers();if(typeof renderInventory==="function")renderInventory();alert(`Апгрейд не удался — шанс ${chance.toFixed(1)}%`)}busy=false;render()};
    render();
  }

  function boot(){styles();setupPrices();setupLive();setupLanes();setupCaseAnimation();setupBestDrop();setupProfile();setupUpgrade();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.addEventListener("load",boot,{once:true});
})();
