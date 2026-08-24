(() => {
  'use strict';

  /* Emoji Drops 2.0 — consolidated runtime polish.
     This layer deliberately owns presentation/runtime orchestration only.
     Game data and the existing reward logic remain in app.js. */

  const $ = id => document.getElementById(id);
  const qsa = (root, selector) => Array.from((root || document).querySelectorAll(selector));
  const root = document.documentElement;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const ORANGE = '#ff7b00';

  function css() {
    if ($('emojiDropsV9')) return;
    const s = document.createElement('style');
    s.id = 'emojiDropsV9';
    s.textContent = `
      :root{--ed-orange:${ORANGE};--ed-ease:cubic-bezier(.2,.75,.2,1);--ed-fast:180ms;--ed-med:360ms}
      html,body{overflow-x:hidden}
      button,.case,.inventory-item,.profile-mini-btn,.profile-settings-btn,.settings-action-btn,.amount-btn,.main-btn{transition:transform var(--ed-fast) var(--ed-ease),opacity var(--ed-fast) ease,box-shadow var(--ed-fast) ease,border-color var(--ed-fast) ease,background-color var(--ed-fast) ease}
      button:not(:disabled):hover,.case:hover,.profile-mini-btn:hover,.profile-settings-btn:hover,.settings-action-btn:hover,.amount-btn:hover,.main-btn:hover{transform:translateY(-1px)}
      button:not(:disabled):active{transform:translateY(0) scale(.985)}

      /* Live drops: keep the left edge clean and fade only the right boundary. */
      .live-drops-bar{overflow:hidden!important;position:relative;contain:layout paint}
      .live-drops-bar::before{display:none!important}
      .live-drops-bar::after{content:'';position:absolute;z-index:5;pointer-events:none;right:0;top:0;bottom:0;width:clamp(28px,6vw,72px);background:linear-gradient(90deg,transparent,rgba(10,10,10,.92));}
      .live-container{padding-left:10px!important;padding-right:clamp(28px,5vw,56px)!important;display:flex!important;align-items:center;gap:10px;overflow:hidden!important;contain:layout paint}
      .live-drop{flex:0 0 auto;backface-visibility:hidden;transform:translateZ(0);will-change:transform,opacity}
      .live-drop.ed-v9-enter{animation:edV9LiveIn 420ms var(--ed-ease) both}
      @keyframes edV9LiveIn{from{opacity:0;transform:translate3d(-18px,6px,0) scale(.97)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}
      .live-drop.legendary{animation:none!important;filter:none!important;color:#ffd400!important;border-color:#ffd400!important;box-shadow:0 0 7px rgba(255,212,0,.55),0 0 18px rgba(255,190,0,.25)!important}

      /* Case lanes are a normal document flow. */
      #multiRouletteContainer{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:14px!important;height:auto!important;min-height:0!important;overflow:visible!important}
      #multiRouletteContainer .multi-roulette{position:relative!important;inset:auto!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;flex:0 0 auto!important;width:100%!important;margin:0!important;transform:none}
      #multiRouletteContainer .multi-track{will-change:transform}
      .ed-v9-lane-enter{animation:edV9LaneIn 300ms var(--ed-ease) both}
      @keyframes edV9LaneIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

      /* Minimal modern case markers. */
      #openPage .center-indicator{pointer-events:none;background:none!important;box-shadow:none!important}
      #openPage .center-indicator::before,#openPage .center-indicator::after{width:20px!important;height:20px!important;border:0!important;border-right:3px solid var(--ed-orange)!important;border-bottom:3px solid var(--ed-orange)!important;filter:drop-shadow(0 0 7px rgba(255,123,0,.42))}
      #openPage .center-indicator::before{transform:rotate(45deg)!important}
      #openPage .center-indicator::after{transform:rotate(225deg)!important}

      /* One visible scrollbar per full-screen surface. */
      #profilePage,#openPage,#upgradePage{scrollbar-gutter:stable;overflow-x:hidden!important}
      #profilePage .profile-content,#profilePage .profile-main{overflow-x:hidden!important}
      #profilePage .profile-content::-webkit-scrollbar-x,#profilePage .profile-main::-webkit-scrollbar-x{display:none}
      #settingsOverlay,#statsOverlay{overflow-x:hidden!important}
      #settingsOverlay .settings-content,#statsOverlay .stats-content{overflow-x:hidden!important}

      /* Long case titles stay inside their cards. */
      .case-name{min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .case-price{min-width:0;flex:0 0 auto}

      /* Result reveal. */
      #winPopup.ed-v9-reveal{animation:edV9Reveal 420ms var(--ed-ease) both}
      @keyframes edV9Reveal{from{opacity:0;transform:scale(.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
      #winPopup.ed-v9-hidden{display:none!important}

      @media(max-width:760px){.live-container{padding-left:7px!important}.live-drops-bar::after{width:36px}.case-name{font-size:clamp(12px,3vw,15px)}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:1ms!important;transition-duration:1ms!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(s);
  }

  function mountProfileSurfaces(){
    const profile = $('profilePage');
    if (!profile) return;
    for (const id of ['settingsOverlay','statsOverlay','upgradePage']) {
      const node = $(id);
      if (node && node.parentElement !== profile) profile.appendChild(node);
    }
  }

  function liveAnimation(){
    const c = $('liveContainer');
    if (!c || c.dataset.edV9) return;
    c.dataset.edV9 = '1';
    const observer = new MutationObserver(records => {
      const added = [];
      for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1 && n.classList.contains('live-drop')) added.push(n);
      if (!added.length) return;
      const first = added[0];
      first.classList.remove('ed-v9-enter');
      requestAnimationFrame(() => first.classList.add('ed-v9-enter'));
      first.addEventListener('animationend', () => first.classList.remove('ed-v9-enter'), {once:true});
    });
    observer.observe(c,{childList:true});
  }

  function laneAnimation(){
    const c = $('multiRouletteContainer');
    if (!c || c.dataset.edV9) return;
    c.dataset.edV9 = '1';
    let oldCount = c.children.length;
    const observer = new MutationObserver(() => {
      const lanes = qsa(c,'.multi-roulette');
      lanes.forEach((lane,i) => {
        if (i >= oldCount) {
          lane.classList.remove('ed-v9-lane-enter');
          requestAnimationFrame(() => lane.classList.add('ed-v9-lane-enter'));
          lane.addEventListener('animationend',()=>lane.classList.remove('ed-v9-lane-enter'),{once:true});
        }
      });
      oldCount = lanes.length;
    });
    observer.observe(c,{childList:true});
  }

  function openingAnimation(){
    if (typeof window.openCase !== 'function' || window.openCase.__edV9) return;
    const original = window.openCase;
    let locked = false;
    async function polishedOpenCase(count) {
      if (locked) return;
      locked = true;
      const page = $('openPage');
      const popup = $('winPopup');
      const tracks = qsa($('multiRouletteContainer'),'.multi-track');
      if (popup) popup.classList.add('ed-v9-hidden');
      if (page) page.classList.add('ed-opening');
      try {
        await original(count);
        if (tracks.length && !reduced) {
          tracks.forEach((track,i) => {
            track.style.transition = `transform ${1900 + i*90}ms cubic-bezier(.08,.72,.12,1)`;
            track.style.transform = 'translate3d(-55%,0,0)';
          });
          await new Promise(r => setTimeout(r, 1200));
          tracks.forEach(track => track.style.transform = 'translate3d(-82%,0,0)');
          await new Promise(r => setTimeout(r, 520));
          tracks.forEach(track => track.style.transform = 'translate3d(-86%,0,0)');
          await new Promise(r => setTimeout(r, 260));
        }
        if (popup) {
          popup.classList.remove('ed-v9-hidden');
          popup.classList.remove('ed-v9-reveal');
          requestAnimationFrame(() => popup.classList.add('ed-v9-reveal'));
        }
      } finally {
        if (page) page.classList.remove('ed-opening');
        locked = false;
      }
    }
    polishedOpenCase.__edV9 = true;
    window.openCase = polishedOpenCase;
  }

  function bestDropPersistence(){
    // Keep the best-drop UI stable when inventory is emptied. We do not mutate game state here;
    // this is intentionally a presentation fallback until core state is migrated.
    const key = 'emojiDrops.bestDrop.v1';
    const original = window.updateBestDrop;
    if (typeof original !== 'function' || original.__edV9) return;
    function wrapped(){
      try { original(); } catch(e) { console.warn('[Emoji Drops] bestDrop render:',e); }
      const emoji = $('bestDropEmoji'), rarity = $('bestDropRarity');
      if (!emoji || !rarity) return;
      const current = emoji.textContent.trim();
      const currentRarity = rarity.textContent.trim();
      if (current && current !== '🏆' && currentRarity && currentRarity !== 'НЕТ ДРОПА') {
        localStorage.setItem(key, JSON.stringify({emoji:current,rarity:currentRarity}));
        return;
      }
      try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved?.emoji) { emoji.textContent=saved.emoji; rarity.textContent=saved.rarity; }
      } catch {}
    }
    wrapped.__edV9 = true;
    window.updateBestDrop = wrapped;
  }

  function diagnostics(){
    const required=['openPage','multiRouletteContainer','liveContainer','profilePage'];
    const missing=required.filter(id=>!$(id));
    if(missing.length) console.warn('[Emoji Drops] Missing UI:',missing.join(', '));
  }

  function boot(){
    css();
    mountProfileSurfaces();
    liveAnimation();
    laneAnimation();
    openingAnimation();
    bestDropPersistence();
    diagnostics();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
