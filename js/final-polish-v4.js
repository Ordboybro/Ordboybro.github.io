(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  const rarityOrder = {common:1, rare:2, epic:3, mythical:4, legendary:5};
  const rarityColor = r => (typeof rarities !== "undefined" && rarities[r]?.color) || ({common:"#808080",rare:"#3b82f6",epic:"#a855f7",mythical:"#ef4444",legendary:"#ffd000"}[r] || "#ff7b00");

  function installStyle(){
    if ($("emojiDropsFinalPolishV4")) return;
    const style = document.createElement("style");
    style.id = "emojiDropsFinalPolishV4";
    style.textContent = `
      /* ---------- profile / settings: one scroll owner ---------- */
      #profilePage{overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain}
      #profilePage .profile-content,#profilePage .profile-main{overflow:visible!important}
      #profilePage .inventory-grid{overflow:visible!important}
      #profilePage::-webkit-scrollbar,#settingsOverlay::-webkit-scrollbar,#statsOverlay::-webkit-scrollbar{width:8px}
      #profilePage{scrollbar-gutter:stable}
      #settingsOverlay.v4-inside-profile,#statsOverlay.v4-inside-profile{position:absolute!important;inset:0!important;overflow:hidden!important;max-height:none!important}
      #settingsOverlay.v4-inside-profile .settings-box,#statsOverlay.v4-inside-profile .settings-box{max-height:calc(100% - 56px)!important;overflow-y:auto!important;overflow-x:hidden!important}
      #settingsOverlay.v4-inside-profile .back-btn,#settingsOverlay .settings-back-btn{position:static!important;display:none!important}
      #settingsOverlay.v4-inside-profile::before{display:none!important}
      #settingsOverlay .settings-box{border-top:0!important}
      #settingsOverlay .settings-tabs{overflow-x:auto!important;overflow-y:hidden!important;white-space:nowrap;scrollbar-width:none}
      #settingsOverlay .settings-tabs::-webkit-scrollbar{display:none}
      #settingsOverlay .delete-account,#settingsOverlay .danger-zone{width:100%;box-sizing:border-box;overflow:visible!important}

      /* ---------- live drops ---------- */
      .live-drops-bar{position:relative!important;overflow:hidden!important}
      .live-drops-bar::before{display:none!important;content:none!important}
      .live-drops-bar::after{content:"";position:absolute;right:0;top:0;bottom:0;width:clamp(60px,9vw,130px);z-index:30;pointer-events:none;background:linear-gradient(90deg,rgba(11,11,11,0),rgba(11,11,11,.12) 22%,rgba(11,11,11,.58) 68%,#0b0b0b 100%)}
      .live-container{padding-left:clamp(10px,1.3vw,18px)!important;padding-right:clamp(54px,7vw,90px)!important;overflow:hidden!important;display:flex!important;gap:10px;box-sizing:border-box}
      .live-drop{flex:0 0 auto;will-change:transform,opacity;backface-visibility:hidden}
      .live-drop.v4-enter{animation:v4LiveEnter .42s cubic-bezier(.2,.82,.2,1) both}
      .live-container.v4-moving .live-drop{transition:transform .42s cubic-bezier(.2,.82,.2,1)}
      .live-drop.legendary{animation:none!important;filter:none!important;color:#ffd000!important;border-color:#ffd000!important;background:linear-gradient(145deg,#191600,#111)!important;box-shadow:0 0 7px rgba(255,208,0,.75),0 0 20px rgba(255,208,0,.34),inset 0 0 12px rgba(255,208,0,.08)!important}
      .live-drop.legendary *{color:#ffd000!important}
      @keyframes v4LiveEnter{from{opacity:0;transform:translate3d(-22px,5px,0) scale(.97)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}

      /* ---------- case prices ---------- */
      .case.price-compact-animous .case-price{width:max-content!important;min-width:0!important;padding-inline:6px!important}
      .case.price-compact-animous .new-price,.case.price-compact-animous .old-price{font-size:clamp(12px,1.22vw,17px)!important}
      .case.price-compact-transport .case-price{width:max-content!important;min-width:0!important;padding-inline:5px!important;transform:translate(-5px,3px) scale(.86)!important}
      .case.price-compact-transport .new-price,.case.price-compact-transport .old-price{font-size:clamp(12px,1.2vw,17px)!important}

      /* ---------- case lanes ---------- */
      #openPage .roulette-wrapper{height:auto!important;min-height:0!important;overflow:visible!important}
      #openPage #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:center!important;gap:14px!important;height:auto!important;min-height:0!important;overflow:visible!important}
      #openPage .multi-roulette{position:relative!important;width:min(1200px,calc(100% - 24px))!important;height:160px!important;min-height:160px!important;flex:none!important;margin:0!important;overflow:hidden!important}
      #openPage .multi-roulette[hidden]{display:none!important}
      #openPage .multi-track{will-change:transform}
      #openPage .center-indicator{height:0!important;width:0!important;background:none!important;border:0!important;box-shadow:none!important;z-index:60!important}
      #openPage .center-indicator::before,#openPage .center-indicator::after{content:"";position:absolute;width:18px;height:18px;border-color:#ff7b00;filter:drop-shadow(0 0 6px rgba(255,123,0,.55));background:transparent}
      #openPage .center-indicator::before{left:-9px;top:-67px;border-right:3px solid;border-bottom:3px solid;transform:rotate(45deg)}
      #openPage .center-indicator::after{left:-9px;top:50px;border-left:3px solid;border-top:3px solid;transform:rotate(45deg)}
      #openPage .new-pointer{display:none!important}
      #openPage>.back-btn{position:fixed!important;top:12px!important;right:16px!important;left:auto!important;z-index:5000!important}
      #winPopup{z-index:20000!important}

      /* ---------- smooth opening ---------- */
      #openPage #multiRouletteContainer.v4-opening .multi-track{animation:v4CaseRoll 2.55s cubic-bezier(.08,.68,.12,1) both}
      #openPage #multiRouletteContainer.v4-opening .multi-roulette{animation:v4LaneAppear .22s ease-out both}
      @keyframes v4LaneAppear{from{opacity:.45;transform:translateY(7px)}to{opacity:1;transform:none}}
      @keyframes v4CaseRoll{0%{transform:translate3d(0,0,0)}7%{transform:translate3d(-80px,0,0)}42%{transform:translate3d(-700px,0,0)}68%{transform:translate3d(-1010px,0,0)}83%{transform:translate3d(-1125px,0,0)}92%{transform:translate3d(-1180px,0,0)}97%{transform:translate3d(-1200px,0,0)}100%{transform:translate3d(-1210px,0,0)}}
      #winPopup.v4-result{animation:v4WinIn .4s cubic-bezier(.2,.8,.2,1) both}
      @keyframes v4WinIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}

      /* ---------- upgrade / inventory ---------- */
      #upgradePage{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable}
      #upgradePage .profile-main{width:min(860px,100%);box-sizing:border-box}
      #inventoryGrid{min-height:150px;overflow:visible!important}
      #inventoryGrid:empty::before{content:"Инвентарь пуст";display:flex;align-items:center;justify-content:center;min-height:150px;width:100%;box-sizing:border-box;padding:28px;border:1px dashed #333;border-radius:20px;color:#888;font-weight:700}

      /* ---------- global motion / long names ---------- */
      button,.main-btn,.settings-action-btn,.amount-btn,.case,.profile-action-btn,.nav-btn{transition:transform .18s ease,box-shadow .22s ease,border-color .22s ease,background-color .22s ease,opacity .18s ease}
      button:hover,.main-btn:hover,.settings-action-btn:hover,.amount-btn:hover,.profile-action-btn:hover,.nav-btn:hover{transform:translateY(-1px)}
      .case-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      .case{min-width:0}
      body{overflow-x:hidden!important}
      #openPage,#profilePage,#upgradePage,#settingsOverlay,#statsOverlay{scrollbar-gutter:stable}
      @media(max-width:760px){
        #openPage .multi-roulette{width:calc(100% - 12px)!important;height:132px!important;min-height:132px!important}
        #openPage>.back-btn{top:8px!important;right:10px!important}
        .live-container{padding-left:10px!important;padding-right:54px!important}
      }
      @media(prefers-reduced-motion:reduce){
        *,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}
      }
    `;
    document.head.appendChild(style);
  }

  function markPrices(){
    qsa(".case").forEach(card => {
      const name=(card.querySelector(".case-name")?.textContent||"").trim().toLowerCase();
      card.classList.toggle("price-compact-animous",/^(animous|among us|amongus)$/.test(name));
      card.classList.toggle("price-compact-transport",name==="transport");
    });
  }

  function syncLanes(){
    const c=$("multiRouletteContainer");
    if(!c||typeof state==="undefined") return;
    const count=Math.max(1,Number(state.openAmount)||1);
    c.dataset.lanes=String(count);
    qsa("#multiRouletteContainer .multi-roulette").forEach((lane,i)=>{
      lane.hidden=i>=count;
      lane.setAttribute("aria-hidden",i>=count?"true":"false");
    });
    const amounts=$("openAmounts");
    if(amounts) qsa(".amount-btn",amounts).forEach(b=>b.classList.toggle("active",Number(b.textContent)===count));
  }

  function patchLanes(){
    if(typeof window.createRoulettes==="function"&&!window.createRoulettes.__v4){
      const original=window.createRoulettes;
      const wrapped=function(){const r=original.apply(this,arguments);requestAnimationFrame(syncLanes);return r};
      wrapped.__v4=true; window.createRoulettes=wrapped;
    }
    const amounts=$("openAmounts");
    if(amounts&&!amounts.__v4){
      amounts.addEventListener("click",e=>{
        const b=e.target.closest(".amount-btn");
        if(!b) return;
        requestAnimationFrame(syncLanes);
      });
      amounts.__v4=true;
    }
  }

  function patchLive(){
    const names=["createLiveDrop","addLiveDrop"];
    names.forEach(name=>{
      const fn=window[name];
      if(typeof fn!=="function"||fn.__v4) return;
      const wrapped=function(){
        const c=$("liveContainer");
        const before=c?.firstElementChild;
        const old=[...(c?.children||[])].map(el=>[el,el.getBoundingClientRect()]);
        const result=fn.apply(this,arguments);
        const newest=c?.firstElementChild;
        if(newest&&newest!==before){
          newest.classList.add("v4-enter");
          requestAnimationFrame(()=>{
            c?.classList.add("v4-moving");
            old.forEach(([el,rect])=>{
              if(!el.isConnected) return;
              const next=el.getBoundingClientRect();
              const dx=rect.left-next.left;
              if(Math.abs(dx)>1) el.animate([{transform:`translate3d(${dx}px,0,0)`},{transform:"translate3d(0,0,0)"}],{duration:420,easing:"cubic-bezier(.2,.82,.2,1)"});
            });
            setTimeout(()=>{newest.classList.remove("v4-enter");c?.classList.remove("v4-moving")},470);
          });
        }
        return result;
      };
      wrapped.__v4=true; window[name]=wrapped;
    });
  }

  function patchOpening(){
    if(typeof window.openCase!=="function"||window.openCase.__v4) return;
    const original=window.openCase;
    const wrapped=async function(count){
      const c=$("multiRouletteContainer");
      if(c){c.classList.remove("v4-opening");void c.offsetWidth;c.classList.add("v4-opening")}
      try{return await original.apply(this,arguments)}finally{setTimeout(()=>c?.classList.remove("v4-opening"),2750)}
    };
    wrapped.__v4=true; window.openCase=wrapped;
  }

  function moveOverlayInsideProfile(id){
    const profile=$("profilePage"), overlay=$(id);
    if(!profile||!overlay) return;
    if(overlay.parentElement!==profile) profile.appendChild(overlay);
    overlay.classList.add("v4-inside-profile");
  }

  function openProfileSettings(){
    if(typeof state!=="undefined"&&!state.currentUser){alert("Сначала войдите в аккаунт");return}
    moveOverlayInsideProfile("settingsOverlay");
    const overlay=$("settingsOverlay");
    if(overlay){overlay.style.display="flex";overlay.removeAttribute("hidden")}
  }

  function openProfileStats(){
    if(typeof state!=="undefined"&&!state.currentUser){alert("Сначала войдите в аккаунт");return}
    moveOverlayInsideProfile("statsOverlay");
    const overlay=$("statsOverlay");
    if(overlay){overlay.style.display="flex";overlay.removeAttribute("hidden")}
    if(typeof window.updateStatsUI==="function") window.updateStatsUI();
  }

  function patchProfileNavigation(){
    const profile=$("profilePage");
    if(!profile||profile.__v4Nav) return;
    profile.__v4Nav=true;
    profile.addEventListener("click",e=>{
      const button=e.target.closest("button,[role=button]");
      if(!button) return;
      const text=(button.textContent||"").trim().toLowerCase();
      if(text.includes("настрой")){e.preventDefault();e.stopImmediatePropagation();openProfileSettings();return}
      if(text.includes("статист")){e.preventDefault();e.stopImmediatePropagation();openProfileStats();return}
    },true);
  }

  function patchSettings(){
    const s=$("settingsOverlay");
    if(!s) return;
    s.classList.add("v4-settings-clean");
    const back=s.querySelector(".back-btn,.settings-back-btn,[data-action='back']");
    if(back) back.remove();
    const tabs=s.querySelector(".settings-tabs");
    if(tabs) tabs.scrollLeft=0;
  }

  function patchBestDrop(){
    if(typeof state==="undefined") return;
    const saved=state.currentUser?.bestDrop||state.bestDrop;
    if(saved) state.bestDrop=saved;
    if(typeof window.updateBestDrop==="function"&&!window.updateBestDrop.__v4){
      const original=window.updateBestDrop;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        const best=state.bestDrop||state.currentUser?.bestDrop;
        if(best&&$("bestDropEmoji")&&$("bestDropRarity")){
          $("bestDropEmoji").innerText=best.emoji||"🏆";
          $("bestDropRarity").innerText=String(best.rarity||"").toUpperCase();
          $("bestDropRarity").style.color=rarityColor(best.rarity);
        }
        return result;
      };
      wrapped.__v4=true;window.updateBestDrop=wrapped;
    }
  }

  function boot(){
    installStyle();
    markPrices();
    patchLanes();
    patchLive();
    patchOpening();
    patchProfileNavigation();
    patchSettings();
    patchBestDrop();
    syncLanes();

    // Expose the two intended profile navigation actions without replacing core app logic.
    window.openProfileSettingsV4=openProfileSettings;
    window.openProfileStatsV4=openProfileStats;
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
  window.addEventListener("load",()=>{boot();syncLanes()}, {once:true});
})();