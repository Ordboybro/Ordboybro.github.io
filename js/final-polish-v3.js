(() => {
    "use strict";
    const $ = id => document.getElementById(id);
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const rarityColors = Object.freeze({ common:"#808080", rare:"#3b82f6", epic:"#a855f7", mythical:"#ef4444", legendary:"#ffd000" });

    function injectStyle(){
        if($("finalPolishV3Style")) return;
        const style=document.createElement("style");
        style.id="finalPolishV3Style";
        style.textContent=`
/* Live Drops: keep the existing edge effect, pull cards inward from the edges. */
.live-drops-bar{overflow:hidden!important}
.live-container{padding-left:clamp(10px,2vw,28px)!important;padding-right:clamp(10px,2vw,28px)!important;overflow:hidden!important;box-sizing:border-box}
.live-drop{position:relative;flex:0 0 auto;will-change:transform,opacity}
.live-drop.legendary{border-color:#ffd000!important;box-shadow:0 0 8px rgba(255,208,0,.55),0 0 18px rgba(255,208,0,.22)!important;animation:legendaryGlow 1.45s ease-in-out infinite alternate!important}
@keyframes legendaryGlow{from{box-shadow:0 0 5px rgba(255,208,0,.45),0 0 10px rgba(255,208,0,.12)}to{box-shadow:0 0 12px rgba(255,208,0,.9),0 0 24px rgba(255,208,0,.3)}}

/* Prices: Food is deliberately excluded by the JS class below. */
.case:not(.price-food) .case-price{transform:translate(-6px,3px) scale(.92);transform-origin:center center}
.case:not(.price-food) .case-price .new-price,.case:not(.price-food) .case-price .old-price{white-space:nowrap}

/* One scroll owner per overlay; nested panels stay inside it. */
#profilePage,#settingsOverlay,#upgradePage,#openPage{overscroll-behavior:contain}
#profilePage .profile-main,#profilePage .profile-content,#settingsOverlay .settings-box,#upgradePage .profile-main{overflow:visible!important}
#profilePage .profile-inventory,.profile-page .profile-inventory{overflow-y:auto;overflow-x:hidden;max-height:52vh}

/* Settings now closes with the X only. */
#settingsOverlay .settings-back-btn{display:none!important}

/* Case indicator: minimal orange arrows, no old line/blue pointer. */
#openPage .center-indicator{height:0!important;width:0!important;background:transparent!important;border:0!important;box-shadow:none!important;position:absolute!important;left:50%!important;top:50%!important;z-index:20!important}
#openPage .center-indicator::before,#openPage .center-indicator::after{content:"";position:absolute;left:-7px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;filter:drop-shadow(0 0 5px rgba(255,123,0,.45))}
#openPage .center-indicator::before{top:-58px;border-bottom:11px solid #ff7b00}
#openPage .center-indicator::after{top:47px;border-top:11px solid #ff7b00}
#openPage .new-pointer{display:none!important}

/* Smooth roulette motion. It is visual only; the original random/result logic remains untouched. */
#multiRouletteContainer.case-opening-animation .multi-track{animation:caseTrackRoll 2.05s cubic-bezier(.08,.72,.12,1) both}
#multiRouletteContainer.case-opening-animation .multi-roulette{animation:caseLaneReveal .28s ease-out both}
@keyframes caseTrackRoll{0%{transform:translate3d(0,0,0)}12%{transform:translate3d(-120px,0,0)}55%{transform:translate3d(-980px,0,0)}78%{transform:translate3d(-1190px,0,0)}91%{transform:translate3d(-1250px,0,0)}97%{transform:translate3d(-1270px,0,0)}100%{transform:translate3d(-1280px,0,0)}}
@keyframes caseLaneReveal{from{opacity:.2;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
#winPopup.v3-delayed{opacity:0!important;visibility:hidden!important;transform:translateY(12px) scale(.97)!important}
#winPopup.v3-visible{opacity:1!important;visibility:visible!important;transform:translateY(0) scale(1)!important;transition:opacity .32s ease,transform .38s cubic-bezier(.2,.8,.2,1)}

/* Do not create a second horizontal scrollbar in the profile/settings overlays. */
#profilePage,#settingsOverlay,#upgradePage{overflow-x:hidden!important}

@media(max-width:760px){
  #openPage .center-indicator::before{top:-44px}
  #openPage .center-indicator::after{top:33px}
  #profilePage .profile-inventory,.profile-page .profile-inventory{max-height:46vh}
}
`;
        document.head.appendChild(style);
    }

    function markFoodPrice(){
        document.querySelectorAll(".case").forEach(card=>{
            const name=card.querySelector(".case-name")?.textContent?.trim().toLowerCase();
            card.classList.toggle("price-food",name==="food");
        });
    }

    function removeClipboardAutoInsertion(){
        const input=$("searchInput");
        if(!input||input.dataset.v3Search)return;
        input.dataset.v3Search="1";
        /* Search accepts normal typing and browser-native Ctrl+V/context-menu paste only. */
        input.addEventListener("paste",event=>{
            if(!event.isTrusted) event.preventDefault();
        },true);
        input.addEventListener("beforeinput",event=>{
            if(event.inputType==="insertFromPaste"&&!event.isTrusted) event.preventDefault();
        },true);
    }

    function removeSettingsBack(){
        const remove=()=>document.querySelectorAll("#settingsOverlay .settings-back-btn").forEach(button=>button.remove());
        remove();
        const overlay=$("settingsOverlay");
        if(overlay&&!overlay.dataset.v3SettingsObserver){
            overlay.dataset.v3SettingsObserver="1";
            new MutationObserver(remove).observe(overlay,{childList:true,subtree:true});
        }
    }

    function syncLanes(){
        const amounts=$("openAmounts"),container=$("multiRouletteContainer");
        if(!amounts||!container)return;
        const selected=Number(window.state?.openAmount||1);
        container.dataset.lanes=String(selected);
        container.setAttribute("aria-label",`${selected} ${selected===1?"лента":"ленты"}`);
        container.querySelectorAll(".multi-roulette").forEach((lane,index)=>{
            lane.hidden=index>=selected;
            lane.setAttribute("aria-hidden",index>=selected?"true":"false");
        });
        amounts.querySelectorAll(".amount-btn").forEach(button=>button.classList.toggle("active",Number(button.textContent)===selected));
    }

    function installLaneSwitch(){
        const amounts=$("openAmounts");
        if(!amounts||amounts.dataset.v3Lane)return;
        amounts.dataset.v3Lane="1";
        amounts.addEventListener("click",()=>requestAnimationFrame(()=>{syncLanes();document.getElementById("multiRouletteContainer")?.classList.remove("case-opening-animation")}));
        new MutationObserver(()=>requestAnimationFrame(syncLanes)).observe(amounts,{childList:true,subtree:true});
        syncLanes();
    }

    function animateOpening(){
        const container=$("multiRouletteContainer"),popup=$("winPopup");
        if(!container)return;
        container.classList.remove("case-opening-animation");
        void container.offsetWidth;
        container.classList.add("case-opening-animation");
        if(popup){
            popup.classList.add("v3-delayed");
            popup.classList.remove("v3-visible");
            requestAnimationFrame(()=>setTimeout(()=>{
                popup.classList.remove("v3-delayed");
                popup.classList.add("v3-visible");
            },2050));
        }
        setTimeout(()=>container.classList.remove("case-opening-animation"),2300);
    }

    function wrapOpenCase(){
        if(typeof window.openCase!=="function"||window.openCase.__v3)return;
        const original=window.openCase;
        const wrapped=async function(...args){
            const result=await original.apply(this,args);
            syncLanes();
            animateOpening();
            return result;
        };
        wrapped.__v3=true;
        window.openCase=wrapped;
    }

    function addTestMoney(){
        window.addTestMoney=function(amount=10000){
            const value=Number(amount);
            if(!Number.isFinite(value)||value<=0)throw new Error("Сумма должна быть положительным числом");
            if(typeof state==="undefined")throw new Error("Состояние сайта ещё не загружено");
            state.balance=Number(state.balance||0)+value;
            if(state.currentUser)state.currentUser.balance=state.balance;
            if(typeof saveUsers==="function")saveUsers();
            if(typeof updateBalanceUI==="function")updateBalanceUI();
            return state.balance;
        };
    }

    function boot(){
        injectStyle();
        markFoodPrice();
        removeClipboardAutoInsertion();
        removeSettingsBack();
        installLaneSwitch();
        wrapOpenCase();
        addTestMoney();
        syncLanes();
    }

    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
