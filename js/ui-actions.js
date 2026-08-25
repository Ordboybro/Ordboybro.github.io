(() => {
    "use strict";

    const byId = id => document.getElementById(id);
    const currentUser = () => (typeof state !== "undefined" ? state.currentUser : null);
    const requireUser = () => {
        const user = currentUser();
        if (!user) alert("Сначала войдите в аккаунт");
        return user;
    };

    const installMotion = () => {
        if (byId("emojiDropsMotionStyle")) return;
        const style = document.createElement("style");
        style.id = "emojiDropsMotionStyle";
        style.textContent = `
            :root { --ui-ease: cubic-bezier(.22,1,.36,1); }
            button,.top-btn,.case-card,.case-item-card,.settings-action-btn,.settings-close,
            .main-btn,.open-btn,.fast-btn,.fast-open-btn,.profile-btn,.upgrade-btn,.amount-btn {
                -webkit-tap-highlight-color:transparent;
                transition:transform .18s var(--ui-ease),opacity .18s ease,background-color .18s ease,
                    border-color .18s ease,box-shadow .22s ease,color .18s ease;
            }
            button:not(:disabled):hover,.top-btn:hover,.case-card:hover,.case-item-card:hover { transform:translate3d(0,-1px,0); }
            button:not(:disabled):active,.top-btn:active,.case-card:active,.case-item-card:active {
                transform:translate3d(0,0,0) scale(.985); transition-duration:.07s;
            }
            button:disabled { cursor:not-allowed; }
            button:focus-visible,input:focus-visible { outline:2px solid #ff7b00; outline-offset:2px; }
            .ui-screen-enter { animation:uiScreenEnter .24s var(--ui-ease) both; }
            @keyframes uiScreenEnter { from{opacity:0;transform:translate3d(0,7px,0) scale(.995)} to{opacity:1;transform:none} }
            #liveContainer>.ui-drop-enter { animation:uiDropEnter .42s var(--ui-ease) both; }
            @keyframes uiDropEnter { from{opacity:0;transform:translate3d(-18px,0,0) scale(.97)} to{opacity:1;transform:none} }
            #liveContainer>.ui-drop-moving { will-change:transform; transition:transform .46s var(--ui-ease); }
            #liveContainer { contain:layout paint; }
            .ui-roulette-running .multi-track { will-change:transform; }
            .ui-roulette-target { box-shadow:0 0 0 2px #ff7b00,0 0 24px #ff7b0066; }
            @media (prefers-reduced-motion:reduce) {
                *,*::before,*::after { animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important; }
            }
        `;
        document.head.appendChild(style);
    };

    const animateScreen = element => {
        if (!element) return;
        element.classList.remove("ui-screen-enter");
        requestAnimationFrame(() => element.classList.add("ui-screen-enter"));
    };

    const dropKey = element => {
        if (!element || element.nodeType !== 1) return "";
        const explicit = element.dataset.liveId || element.dataset.id || element.dataset.dropId;
        if (explicit) return explicit;
        const emoji = element.querySelector(".drop-emoji,.live-emoji,img")?.getAttribute("src") ||
            element.querySelector(".drop-emoji,.live-emoji")?.textContent || "";
        const text = (element.textContent || "").replace(/\s+/g," ").trim();
        return `${emoji}|${text.slice(0,120)}`;
    };

    const setupLiveDrops = () => {
        const container = byId("liveContainer");
        if (!container || container.dataset.motionReady === "1") return;
        container.dataset.motionReady = "1";
        let previous = new Map();
        let raf = 0;
        let added = new Set();

        const snapshot = () => {
            const result = new Map();
            for (const element of container.children) {
                const key = dropKey(element);
                if (key) result.set(key, element.getBoundingClientRect());
            }
            previous = result;
        };
        snapshot();

        const animate = () => {
            raf = 0;
            const next = new Map();
            for (const element of container.children) {
                const key = dropKey(element);
                if (key) next.set(key,{element,rect:element.getBoundingClientRect()});
            }
            for (const [key,value] of next) {
                const first = previous.get(key);
                if (!first) continue;
                const dx = first.left-value.rect.left;
                const dy = first.top-value.rect.top;
                if (Math.abs(dx)<.5 && Math.abs(dy)<.5) continue;
                const element = value.element;
                element.classList.add("ui-drop-moving");
                element.style.transform = `translate3d(${dx}px,${dy}px,0)`;
                requestAnimationFrame(() => { element.style.transform="translate3d(0,0,0)"; });
                window.setTimeout(() => {
                    element.classList.remove("ui-drop-moving");
                    element.style.removeProperty("transform");
                },480);
            }
            for (const element of added) {
                if (!container.contains(element)) continue;
                element.classList.remove("ui-drop-enter");
                requestAnimationFrame(() => element.classList.add("ui-drop-enter"));
                window.setTimeout(() => element.classList.remove("ui-drop-enter"),450);
            }
            previous = new Map([...next].map(([key,value])=>[key,value.rect]));
            added.clear();
        };

        const observer = new MutationObserver(records => {
            let changed=false;
            for (const record of records) {
                if (record.type!=="childList") continue;
                if (record.addedNodes.length || record.removedNodes.length) changed=true;
                for (const node of record.addedNodes) if (node.nodeType===1) added.add(node);
            }
            if (!changed || raf) return;
            raf=requestAnimationFrame(animate);
        });
        observer.observe(container,{childList:true});
    };

    const installLiveDropLimit = () => {
        if (window.__emojiDropsLiveLimitInstalled) return;
        window.__emojiDropsLiveLimitInstalled=true;
        const patch=name=>{
            const original=window[name];
            if(typeof original!=="function" || original.__emojiDropsWrapped) return;
            const wrapped=function(...args){
                const container=byId("liveContainer");
                if(!container) return original.apply(this,args);
                const removeChild=container.removeChild;
                container.removeChild=function(child){
                    if(container.children.length<=25) return child;
                    return removeChild.call(container,child);
                };
                try{return original.apply(this,args);}finally{container.removeChild=removeChild;}
            };
            wrapped.__emojiDropsWrapped=true;
            window[name]=wrapped;
        };
        patch("addLiveDrop");
        patch("createLiveDrop");
        const fill=()=>{
            const container=byId("liveContainer");
            if(container && typeof window.randomLiveDrop==="function") {
                while(container.children.length<25) window.randomLiveDrop();
            }
        };
        requestAnimationFrame(fill);
    };

    const wait = ms => new Promise(resolve => window.setTimeout(resolve,ms));

    const animateRoulette = async (item) => {
        const container=byId("multiRouletteContainer");
        if(!container || !item) return;
        const roulettes=[...container.querySelectorAll(".multi-roulette")];
        if(!roulettes.length) return;
        const duration=1050;
        roulettes.forEach((roulette,index)=>{
            const track=roulette.querySelector(".multi-track");
            if(!track || !track.children.length) return;
            roulette.classList.add("ui-roulette-running");
            [...track.children].forEach(el=>el.classList.remove("ui-roulette-target"));
            const targetIndex=Math.min(30,track.children.length-1);
            const target=track.children[targetIndex];
            if(!target) return;
            target.textContent=item.emoji;
            target.style.border=`3px solid ${rarities[item.rarity]?.color || "#ff7b00"}`;
            target.classList.add("ui-roulette-target");
            const center=roulette.clientWidth/2;
            const targetCenter=target.offsetLeft+target.offsetWidth/2;
            const finalX=center-targetCenter;
            track.style.transition=`transform ${duration}ms cubic-bezier(.08,.72,.12,1)`;
            track.style.transform=`translate3d(${finalX}px,0,0)`;
        });
        await wait(duration+80);
        roulettes.forEach(roulette=>{
            roulette.classList.remove("ui-roulette-running");
            const track=roulette.querySelector(".multi-track");
            if(track){ track.style.transition="none"; track.style.transform=""; }
        });
    };

    const installRevealFlow = () => {
        if(window.__emojiDropsRevealInstalled) return;
        window.__emojiDropsRevealInstalled=true;
        const original=window.showNextWin;
        if(typeof original!=="function") return;
        const wrapped=async function(){
            const queue=window.state?.winQueue;
            const item=queue?.[0];
            if(!item){ return original.apply(this,arguments); }
            if(window.state) window.state.isSpinning=true;
            await animateRoulette(item);
            const result=original.apply(this,arguments);
            if(window.state) window.state.isSpinning=false;
            return result;
        };
        wrapped.__emojiDropsWrapped=true;
        window.showNextWin=wrapped;
    };

    window.openSettings=()=>{
        if(!requireUser()) return;
        const overlay=byId("settingsOverlay");
        if(!overlay) return;
        overlay.style.display="flex";
        animateScreen(overlay.querySelector(".settings-box")||overlay);
    };
    window.closeSettings=()=>{const overlay=byId("settingsOverlay");if(overlay)overlay.style.display="none";};
    window.openStats=()=>{
        if(!requireUser()) return;
        const overlay=byId("statsOverlay");
        if(!overlay)return;
        overlay.style.display="flex";
        animateScreen(overlay.querySelector(".stats-box")||overlay);
        if(typeof updateStatsUI==="function")updateStatsUI();
    };
    window.closeStats=()=>{const overlay=byId("statsOverlay");if(overlay)overlay.style.display="none";};
    window.openUpgradeMenu=()=>{
        if(!requireUser())return;
        const page=byId("upgradePage");
        if(!page)return;
        page.style.display="flex";
        animateScreen(page.querySelector(".upgrade-box,.upgrade-content")||page);
    };
    window.closeUpgradeMenu=()=>{
        const page=byId("upgradePage");
        if(page)page.style.display="none";
        if(typeof window.closeUpgradeResult==="function")window.closeUpgradeResult();
    };

    const boot=()=>{
        installMotion();
        setupLiveDrops();
        installLiveDropLimit();
        installRevealFlow();
        const retry=new MutationObserver(()=>{
            setupLiveDrops();
            installLiveDropLimit();
            installRevealFlow();
        });
        retry.observe(document.body,{childList:true,subtree:true});
        window.setTimeout(()=>retry.disconnect(),8000);
    };
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
    else boot();
})();
