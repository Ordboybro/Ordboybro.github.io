(() => {
  "use strict";
  const $=id=>document.getElementById(id), qsa=s=>Array.from(document.querySelectorAll(s));
  const rarityOrder={common:1,rare:2,epic:3,mythical:4,legendary:5};
  const rarityColor=r=>(typeof rarities!=="undefined"&&rarities[r]?.color)||({common:"#808080",rare:"#3b82f6",epic:"#a855f7",mythical:"#ef4444",legendary:"#ffd000"}[r]||"#ff7b00");

  function style(){
    if($("emojiDropsFinalPolishV4")) return;
    const s=document.createElement("style");s.id="emojiDropsFinalPolishV4";s.textContent=`
      #profilePage{overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;scrollbar-gutter:stable}
      #profilePage .profile-content,#profilePage .profile-main,#profilePage .inventory-grid{overflow:visible!important}
      #profilePage.v4-overlay-open{overflow:hidden!important}
      #settingsOverlay.v4-inside-profile,#statsOverlay.v4-inside-profile{position:absolute!important;inset:0!important;z-index:300!important;overflow:hidden!important;max-height:none!important}
      #settingsOverlay.v4-inside-profile .settings-box,#statsOverlay.v4-inside-profile .settings-box{max-height:calc(100% - 48px)!important;overflow-y:auto!important;overflow-x:hidden!important}
      #settingsOverlay::before,#settingsOverlay::after{display:none!important;content:none!important}
      #settingsOverlay .settings-back-btn,#settingsOverlay .back-btn{display:none!important}
      #settingsOverlay .settings-tabs{overflow-x:auto!important;overflow-y:hidden!important;white-space:nowrap;scrollbar-width:none}
      #settingsOverlay .settings-tabs::-webkit-scrollbar{display:none}
      #settingsOverlay .delete-account,#settingsOverlay .danger-zone{width:100%;box-sizing:border-box;overflow:visible!important}

      .live-drops-bar{position:relative!important;overflow:hidden!important}
      .live-drops-bar::before{content:none!important;display:none!important}
      .live-drops-bar::after{content:"";position:absolute;right:0;top:0;bottom:0;width:clamp(60px,9vw,130px);z-index:30;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(11,11,11,.12) 22%,rgba(11,11,11,.58) 68%,#0b0b0b 100%)}
      .live-container{padding-left:clamp(10px,1.3vw,18px)!important;padding-right:clamp(54px,7vw,90px)!important;overflow:hidden!important;display:flex!important;gap:10px;box-sizing:border-box}
      .live-drop{flex:0 0 auto;will-change:transform,opacity;backface-visibility:hidden}
      .live-drop.v4-enter{animation:v4LiveEnter .42s cubic-bezier(.2,.82,.2,1) both}
      .live-container.v4-moving .live-drop{transition:transform .42s cubic-bezier(.2,.82,.2,1)}
      .live-drop.legendary{animation:none!important;filter:none!important;color:#ffd000!important;border-color:#ffd000!important;background:linear-gradient(145deg,#191600,#111)!important;box-shadow:0 0 7px rgba(255,208,0,.75),0 0 20px rgba(255,208,0,.34),inset 0 0 12px rgba(255,208,0,.08)!important}
      .live-drop.legendary *{color:#ffd000!important}
      @keyframes v4LiveEnter{from{opacity:0;transform:translate3d(-22px,5px,0) scale(.97)}to{opacity:1;transform:none}}

      .case.price-compact-animous .case-price{width:max-content!important;min-width:0!important;padding-inline:6px!important}
      .case.price-compact-animous .new-price,.case.price-compact-animous .old-price{font-size:clamp(12px,1.22vw,17px)!important}
      .case.price-compact-transport .case-price{width:max-content!important;min-width:0!important;padding-inline:5px!important;transform:translate(-5px,3px) scale(.86)!important}
      .case.price-compact-transport .new-price,.case.price-compact-transport .old-price{font-size:clamp(12px,1.2vw,17px)!important}

      #openPage .roulette-wrapper{height:auto!important;min-height:0!important;overflow:visible!important}
      #openPage #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:center!important;gap:14px!important;height:auto!important;min-height:0!important;overflow:visible!important}
      #openPage .multi-roulette{position:relative!important;width:min(1200px,calc(100% - 24px))!important;height:160px!important;min-height:160px!important;flex:none!important;margin:0!important;overflow:hidden!important}
      #openPage .multi-roulette[hidden]{display:none!important}
      #openPage .center-indicator{height:0!important;width:0!important;background:none!important;border:0!important;box-shadow:none!important;z-index:60!important}
      #openPage .center-indicator::before,#openPage .center-indicator::after{content:"";position:absolute;width:18px;height:18px;border-color:#ff7b00;filter:drop-shadow(0 0 6px rgba(255,123,0,.55));background:transparent}
      #openPage .center-indicator::before{left:-9px;top:-67px;border-right:3px solid;border-bottom:3px solid;transform:rotate(45deg)}
      #openPage .center-indicator::after{left:-9px;top:50px;border-left:3px solid;border-top:3px solid;transform:rotate(45deg)}
      #openPage .new-pointer{display:none!important}
      #openPage>.back-btn{position:fixed!important;top:10px!important;right:16px!important;left:auto!important;z-index:5000!important}
      #winPopup{z-index:20000!important}
      #openPage #multiRouletteContainer.v4-opening .multi-track{animation:v4CaseRoll 2.55s cubic-bezier(.08,.68,.12,1) both}
      @keyframes v4CaseRoll{0%{transform:translate3d(0,0,0)}7%{transform:translate3d(-80px,0,0)}42%{transform:translate3d(-700px,0,0)}68%{transform:translate3d(-1010px,0,0)}83%{transform:translate3d(-1125px,0,0)}92%{transform:translate3d(-1180px,0,0)}97%{transform:translate3d(-1200px,0,0)}100%{transform:translate3d(-1210px,0,0)}}
      #winPopup.v4-result{animation:v4WinIn .4s cubic-bezier(.2,.8,.2,1) both}@keyframes v4WinIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}

      #upgradePage{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable}
      #inventoryGrid{min-height:150px;overflow:visible!important}
      #inventoryGrid:empty::before{content:"Инвентарь пуст";display:flex;align-items:center;justify-content:center;min-height:150px;width:100%;box-sizing:border-box;padding:28px;border:1px dashed #333;border-radius:20px;color:#888;font-weight:700}
      button,.main-btn,.settings-action-btn,.amount-btn,.case,.profile-action-btn,.nav-btn{transition:transform .18s ease,box-shadow .22s ease,border-color .22s ease,background-color .22s ease,opacity .18s ease}
      button:hover,.main-btn:hover,.settings-action-btn:hover,.amount-btn:hover,.profile-action-btn:hover,.nav-btn:hover{transform:translateY(-1px)}
      .case-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.case{min-width:0}body{overflow-x:hidden!important}
      #openPage,#upgradePage,#settingsOverlay,#statsOverlay{scrollbar-gutter:stable}
      @media(max-width:760px){#openPage .multi-roulette{width:calc(100% - 12px)!important;height:132px!important;min-height:132px!important}#openPage>.back-btn{top:7px!important;right:10px!important}.live-container{padding-left:10px!important;padding-right:54px!important}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
    `;document.head.appendChild(s);
  }

  function markPrices(){qsa(".case").forEach(card=>{const n=(card.querySelector(".case-name")?.textContent||"").trim().toLowerCase();card.classList.toggle("price-compact-animous",/^(animous|among us|amongus)$/.test(n));card.classList.toggle("price-compact-transport",n==="transport")})}
  function syncLanes(){const c=$("multiRouletteContainer");if(!c||typeof state==="undefined")return;const n=Math.max(1,Number(state.openAmount)||1);c.dataset.lanes=String(n);qsa("#multiRouletteContainer .multi-roulette").forEach((l,i)=>{l.hidden=i>=n;l.setAttribute("aria-hidden",i>=n?"true":"false")});const a=$("openAmounts");if(a)qsa(".amount-btn",a).forEach(b=>b.classList.toggle("active",Number(b.textContent)===n))}
  function patchLanes(){if(typeof window.createRoulettes==="function"&&!window.createRoulettes.__v4){const o=window.createRoulettes,w=function(){const r=o.apply(this,arguments);requestAnimationFrame(syncLanes);return r};w.__v4=true;window.createRoulettes=w}const a=$("openAmounts");if(a&&!a.__v4){a.addEventListener("click",e=>{if(e.target.closest(".amount-btn"))requestAnimationFrame(syncLanes)});a.__v4=true}}

  function patchLive(){["createLiveDrop","addLiveDrop"].forEach(name=>{const fn=window[name];if(typeof fn!=="function"||fn.__v4)return;const w=function(){const c=$("liveContainer"),before=c?.firstElementChild,old=[...(c?.children||[])].map(el=>[el,el.getBoundingClientRect()]);const r=fn.apply(this,arguments),newest=c?.firstElementChild;if(newest&&newest!==before){newest.classList.add("v4-enter");requestAnimationFrame(()=>{c?.classList.add("v4-moving");old.forEach(([el,rect])=>{if(!el.isConnected)return;const next=el.getBoundingClientRect(),dx=rect.left-next.left;if(Math.abs(dx)>1)el.animate([{transform:`translate3d(${dx}px,0,0)`},{transform:"translate3d(0,0,0)"}],{duration:420,easing:"cubic-bezier(.2,.82,.2,1)"})});setTimeout(()=>{newest.classList.remove("v4-enter");c?.classList.remove("v4-moving")},470)});}return r};w.__v4=true;window[name]=w})}
  function patchOpening(){if(typeof window.openCase!=="function"||window.openCase.__v4)return;const o=window.openCase,w=async function(count){const c=$("multiRouletteContainer");if(c){c.classList.remove("v4-opening");void c.offsetWidth;c.classList.add("v4-opening")}try{return await o.apply(this,arguments)}finally{setTimeout(()=>c?.classList.remove("v4-opening"),2750)}};w.__v4=true;window.openCase=w}

  function insideProfile(id){const p=$("profilePage"),o=$(id);if(!p||!o)return;if(o.parentElement!==p)p.appendChild(o);o.classList.add("v4-inside-profile");p.classList.add("v4-overlay-open");o.style.display="flex";o.removeAttribute("hidden")}
  function closeInsideProfile(id){const o=$(id),p=$("profilePage");if(!o)return;o.style.display="none";o.classList.remove("v4-inside-profile");p?.classList.remove("v4-overlay-open")}
  function openSettings(){if(typeof state!=="undefined"&&!state.currentUser){alert("Сначала войдите в аккаунт");return}insideProfile("settingsOverlay");cleanSettings()}
  function openStats(){if(typeof state!=="undefined"&&!state.currentUser){alert("Сначала войдите в аккаунт");return}insideProfile("statsOverlay");if(typeof window.updateStatsUI==="function")window.updateStatsUI()}
  function cleanSettings(){const s=$("settingsOverlay");if(!s)return;s.querySelector(".back-btn,.settings-back-btn,[data-action='back']")?.remove();qsa(".settings-back-btn,.back-btn",s).forEach((b)=>b.remove());}

  function patchProfile(){const p=$("profilePage");if(!p||p.__v4)return;p.__v4=true;p.addEventListener("click",e=>{const b=e.target.closest("button,[role=button]");if(!b)return;const t=(b.textContent||"").trim().toLowerCase();if(t.includes("настрой")){e.preventDefault();e.stopImmediatePropagation();openSettings();return}if(t.includes("статист")){e.preventDefault();e.stopImmediatePropagation();openStats();return}},true);}
  function removeDuplicateSettings(){const p=$("profilePage");if(!p)return;const buttons=qsa("button,[role=button]",p).filter(b=>(b.textContent||"").trim().toLowerCase().includes("настрой"));buttons.slice(1).forEach(b=>b.remove())}
  function patchBest(){if(typeof state==="undefined")return;const saved=state.currentUser?.bestDrop||state.bestDrop;if(saved)state.bestDrop=saved;if(typeof window.updateBestDrop!=="function"||window.updateBestDrop.__v4)return;const o=window.updateBestDrop,w=function(){const r=o.apply(this,arguments),b=state.bestDrop||state.currentUser?.bestDrop;if(b&&$("bestDropEmoji")&&$("bestDropRarity")){$("bestDropEmoji").innerText=b.emoji||"🏆";$("bestDropRarity").innerText=String(b.rarity||"").toUpperCase();$("bestDropRarity").style.color=rarityColor(b.rarity)}return r};w.__v4=true;window.updateBestDrop=w}

  function boot(){style();markPrices();patchLanes();patchLive();patchOpening();patchProfile();removeDuplicateSettings();cleanSettings();patchBest();syncLanes();window.openProfileSettingsV4=openSettings;window.openProfileStatsV4=openStats}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.addEventListener("load",boot,{once:true});
})();