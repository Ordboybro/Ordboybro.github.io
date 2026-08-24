(() => {
  'use strict';

  /* Emoji Drops 2.0 — final runtime guard.
     This layer consolidates the last UI fixes without replacing the core game rules. */
  const $ = id => document.getElementById(id);
  const qsa = (root, selector) => Array.from((root || document).querySelectorAll(selector));
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function install() {
    if ($('emojiDropsV10')) return;
    const s = document.createElement('style');
    s.id = 'emojiDropsV10';
    s.textContent = `
      :root{--ed-orange:#ff7b00;--ed-ease:cubic-bezier(.2,.78,.2,1);--ed-fast:180ms;--ed-med:360ms}
      html,body{overflow-x:hidden!important}

      /* Profile/settings/upgrade: one vertical scroll owner per surface. */
      #profilePage,#settingsOverlay,#statsOverlay,#upgradePage,#openPage{scrollbar-gutter:stable;overflow-x:hidden!important}
      #profilePage .profile-content,#profilePage .profile-main,#settingsOverlay .settings-content,#statsOverlay .stats-content{overflow-x:hidden!important}
      #settingsOverlay{overscroll-behavior:contain}

      /* Settings are a child surface of the profile; no fake second navigation. */
      #profilePage #settingsOverlay,#profilePage #statsOverlay,#profilePage #upgradePage{max-width:100%;box-sizing:border-box}
      #settingsOverlay .settings-back,#settingsOverlay .back-btn,.settings-back-btn{display:none!important}
      #settingsOverlay .settings-header::before,#settingsOverlay::before{display:none!important}

      /* Live drops: only the right edge fades. */
      .live-drops-bar{position:relative;overflow:hidden!important;contain:layout paint}
      .live-drops-bar::before{display:none!important}
      .live-drops-bar::after{content:'';position:absolute;right:0;top:0;bottom:0;width:clamp(30px,6vw,70px);z-index:10;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(10,10,10,.94))}
      .live-container{padding-left:8px!important;padding-right:clamp(28px,5vw,60px)!important;gap:10px!important;overflow:hidden!important;display:flex!important;align-items:center}
      .live-drop{flex:0 0 auto;backface-visibility:hidden;transform:translateZ(0)}
      .ed-live-enter{animation:edLiveEnter 420ms var(--ed-ease) both}
      @keyframes edLiveEnter{from{opacity:0;transform:translate3d(-18px,5px,0) scale(.975)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}
      .live-drop.legendary{animation:none!important;filter:none!important;color:#ffd000!important;border-color:#ffd000!important;box-shadow:0 0 7px rgba(255,208,0,.6),0 0 22px rgba(255,190,0,.28)!important}

      /* Multi-open is document flow, never overlay. */
      #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:14px!important;height:auto!important;min-height:0!important;overflow:visible!important}
      #multiRouletteContainer>.multi-roulette{position:relative!important;inset:auto!important;display:block!important;width:100%!important;flex:0 0 auto!important;margin:0!important}
      .ed-lane-enter{animation:edLaneEnter 300ms var(--ed-ease) both}
      @keyframes edLaneEnter{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}

      /* Modern double chevrons. */
      #openPage .center-indicator{background:none!important;box-shadow:none!important;pointer-events:none}
      #openPage .center-indicator::before,#openPage .center-indicator::after{width:18px!important;height:18px!important;border:0!important;border-right:3px solid var(--ed-orange)!important;border-bottom:3px solid var(--ed-orange)!important;filter:drop-shadow(0 0 7px rgba(255,123,0,.45))}
      #openPage .center-indicator::before{transform:rotate(45deg)!important}
      #openPage .center-indicator::after{transform:rotate(225deg)!important}

      /* Compact price boards only where long prices actually need help. */
      .case[data-case="animous"] .case-price,.case.animous .case-price,.case[data-case="transport"] .case-price,.case.transport .case-price{min-width:54px!important;width:auto!important;padding-inline:7px!important}
      .case[data-case="animous"] .new-price,.case.animous .new-price,.case[data-case="transport"] .new-price,.case.transport .new-price{font-size:clamp(12px,1.4vw,16px)!important;white-space:nowrap}
      .case-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

      /* Consistent, cheap hover motion. */
      button:not(:disabled),.case,.inventory-item{transition:transform var(--ed-fast) var(--ed-ease),opacity var(--ed-fast) ease,box-shadow var(--ed-fast) ease,border-color var(--ed-fast) ease,background-color var(--ed-fast) ease}
      button:not(:disabled):hover,.case:hover,.inventory-item:hover{transform:translateY(-1px)}
      button:not(:disabled):active{transform:translateY(0) scale(.985)}
      .ed-reveal{animation:edReveal 420ms var(--ed-ease) both}
      @keyframes edReveal{from{opacity:0;transform:translateY(12px) scale(.95)}to{opacity:1;transform:none}}

      /* Never allow the settings theme switch to remain visible. */
      #themeToggle,#themeToggle+label,.theme-toggle,.theme-switch{display:none!important}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(s);
  }

  function mountProfileSurfaces(){
    const profile=$('profilePage');
    if(!profile)return;
    ['settingsOverlay','statsOverlay','upgradePage'].forEach(id=>{
      const node=$(id);
      if(node&&node.parentElement!==profile)profile.appendChild(node);
    });
  }

  function animateLive(){
    const c=$('liveContainer'); if(!c||c.dataset.edV10)return;
    c.dataset.edV10='1';
    let previous=[];
    const observe=()=>{
      const current=qsa(c,'.live-drop');
      const previousRects=new Map(previous.map(n=>[n,n.getBoundingClientRect()]));
      current.forEach(n=>{
        const old=previousRects.get(n), now=n.getBoundingClientRect();
        if(old&& !reduce){
          const dx=old.left-now.left, dy=old.top-now.top;
          if(Math.abs(dx)>1||Math.abs(dy)>1){
            n.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.2,.78,.2,1)'});
          }
        }
      });
      const added=current.filter(n=>!previous.includes(n));
      if(added.length&&!reduce){
        added.forEach(n=>{n.classList.remove('ed-live-enter');requestAnimationFrame(()=>n.classList.add('ed-live-enter'));n.addEventListener('animationend',()=>n.classList.remove('ed-live-enter'),{once:true})});
      }
      previous=current;
    };
    new MutationObserver(()=>requestAnimationFrame(observe)).observe(c,{childList:true});
    observe();
  }

  function animateLanes(){
    const c=$('multiRouletteContainer');if(!c||c.dataset.edV10)return;
    c.dataset.edV10='1';
    let count=c.querySelectorAll('.multi-roulette').length;
    new MutationObserver(()=>{
      const lanes=qsa(c,'.multi-roulette');
      if(lanes.length>count&&!reduce){lanes.slice(count).forEach(l=>{l.classList.add('ed-lane-enter');l.addEventListener('animationend',()=>l.classList.remove('ed-lane-enter'),{once:true})})}
      count=lanes.length;
    }).observe(c,{childList:true});
  }

  function noClipboardSearch(){
    const input=$('searchInput');if(!input||input.dataset.edNoClipboard)return;
    input.dataset.edNoClipboard='1';
    input.addEventListener('paste',()=>{}, {capture:true});
    // No read/paste-from-clipboard automation is installed. Browser Ctrl+V/context paste remains native.
  }

  function removeDuplicateSettings(){
    const profile=$('profilePage');if(!profile)return;
    const buttons=qsa(profile,'button').filter(b=>/настройки|settings/i.test((b.textContent||'').trim()));
    buttons.slice(1).forEach(b=>b.remove());
  }

  function diagnostics(){
    const ids=['openPage','multiRouletteContainer','liveContainer','profilePage','searchInput'];
    const missing=ids.filter(id=>!$(id));
    if(missing.length)console.warn('[Emoji Drops] Missing required UI:',missing);
  }

  function boot(){install();mountProfileSurfaces();animateLive();animateLanes();noClipboardSearch();removeDuplicateSettings();diagnostics();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
