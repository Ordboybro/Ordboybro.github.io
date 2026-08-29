(() => {
  'use strict';

  const ACCENT = '#ff7b00';
  const RARITY = Object.freeze({ common:'#8b949e', rare:'#3b82f6', epic:'#a855f7', mythical:'#ef4444', legendary:'#ff9f43' });
  const REWARD = 250;
  const DAY = 86400000;
  // Keep the same storage key as the existing recovery layer so both click paths
  // see exactly the same 24-hour cooldown.
  const rewardKey = () => 'emojiDrops.dailyReward.v2';
  const bestKey = () => `emojiDrops.best:${String(window.state?.currentUser?.email || 'guest').toLowerCase()}`;
  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g,'')) || 0;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  function styles(){
    if($('#emojiDropsFinalFixStyles')) return;
    const s=document.createElement('style'); s.id='emojiDropsFinalFixStyles';
    s.textContent=`
      .cases .case{border:2px solid #292929!important;background:linear-gradient(145deg,#171717,#111)!important;border-radius:22px!important;box-shadow:0 10px 30px rgba(0,0,0,.22)!important;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease!important}
      .cases .case:hover{transform:translateY(-5px)!important;border-color:${ACCENT}!important;box-shadow:0 0 0 1px rgba(255,123,0,.16),0 16px 38px rgba(255,123,0,.12)!important}
      .cases .case-price{left:14px!important;bottom:14px!important;padding:7px 12px!important;border:1px solid rgba(255,123,0,.55)!important;border-radius:12px!important;background:linear-gradient(135deg,rgba(255,123,0,.16),rgba(20,20,20,.95))!important;box-shadow:0 5px 18px rgba(0,0,0,.3)!important;backdrop-filter:blur(8px)!important}
      .cases .case-price .new-price{font-size:18px!important;color:#fff!important;font-weight:800!important}.cases .case-price .old-price{font-size:11px!important;color:#777!important}
      .search-wrap,#searchInput,.search-container,.case-search{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important}
      .live-drops-bar.live-drops-floating,.live-drops-bar.ed-moved-live{position:relative!important;right:auto!important;bottom:auto!important;left:auto!important;top:auto!important;z-index:20!important;width:min(1160px,calc(100% - 32px))!important;margin:26px auto 36px!important;padding:0!important;background:transparent!important}
      .live-drops-bar .live-title{font-size:18px!important;line-height:1.2!important;margin:0 0 10px!important;padding-left:2px!important;color:#fff!important;text-shadow:0 0 12px rgba(255,123,0,.24)!important;letter-spacing:.8px!important}
      #liveContainer{display:flex!important;flex-direction:row!important;align-items:stretch!important;gap:9px!important;width:100%!important;height:76px!important;max-height:76px!important;overflow:hidden!important;padding:2px!important;scrollbar-width:none!important}
      #liveContainer::-webkit-scrollbar{display:none!important}
      #liveContainer .live-drop,#liveContainer .drop-item{position:relative!important;box-sizing:border-box!important;flex:0 0 142px!important;width:142px!important;min-width:142px!important;height:70px!important;margin:0!important;padding:9px 10px!important;border:1px solid var(--ed-rarity,#555)!important;border-radius:14px!important;background:linear-gradient(145deg,#191a1d,#111214)!important;box-shadow:0 7px 20px rgba(0,0,0,.22)!important;overflow:hidden!important;animation:edLiveIn .38s cubic-bezier(.22,.8,.24,1) both!important;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}
      #liveContainer .live-drop:hover,#liveContainer .drop-item:hover{transform:translateY(-3px)!important;box-shadow:0 10px 24px rgba(0,0,0,.3)!important}
      #liveContainer .live-drop.common,#liveContainer .common-drop{--ed-rarity:${RARITY.common}!important;border-color:${RARITY.common}!important}#liveContainer .live-drop.rare,#liveContainer .rare-drop{--ed-rarity:${RARITY.rare}!important;border-color:${RARITY.rare}!important}#liveContainer .live-drop.epic,#liveContainer .epic-drop{--ed-rarity:${RARITY.epic}!important;border-color:${RARITY.epic}!important}#liveContainer .live-drop.mythical,#liveContainer .mythical-drop{--ed-rarity:${RARITY.mythical}!important;border-color:${RARITY.mythical}!important}
      #liveContainer .live-drop.legendary,#liveContainer .legendary-drop{--ed-rarity:${RARITY.legendary}!important;border-color:${RARITY.legendary}!important;background:radial-gradient(circle at 30% 20%,rgba(255,159,67,.12),transparent 45%),linear-gradient(145deg,#1b1714,#111214)!important;box-shadow:0 0 16px rgba(255,159,67,.12),inset 0 0 20px rgba(255,159,67,.035)!important}
      #liveContainer .legendary-drop::after,#liveContainer .live-drop.legendary::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 34%,rgba(255,200,130,.18) 50%,transparent 66%);transform:translateX(-130%);animation:edLegendaryShine 2.8s ease-in-out infinite;pointer-events:none}
      #liveContainer .live-emoji,#liveContainer .drop-emoji{font-size:30px!important;line-height:1!important}#liveContainer .live-user,#liveContainer .drop-user{font-size:12px!important;font-weight:800!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#liveContainer .live-rarity,#liveContainer .drop-rarity{font-size:10px!important;font-weight:800!important;letter-spacing:.8px!important;color:var(--ed-rarity,#999)!important;margin-top:3px}
      @keyframes edLiveIn{from{opacity:0;transform:translateX(-26px) scale(.98)}to{opacity:1;transform:translateX(0) scale(1)}}@keyframes edLegendaryShine{0%,22%{transform:translateX(-130%)}68%,100%{transform:translateX(130%)}}
      .balance-dropdown{min-width:170px!important}.balance-dropdown button,.ed-profile-reward{border:1px solid ${ACCENT}!important;background:linear-gradient(135deg,#ff7b00,#ff4d00)!important;color:#fff!important;border-radius:14px!important;padding:12px 18px!important;min-height:44px!important;font-weight:800!important;box-shadow:0 8px 24px rgba(255,123,0,.14)!important}.balance-dropdown button:disabled{opacity:.8!important;background:#242424!important;border-color:#444!important}
      #profilePage .profile-mini-btn,#profilePage .ed-profile-logout{min-height:46px!important;padding:0 19px!important;border:1px solid ${ACCENT}!important;border-radius:13px!important;background:linear-gradient(135deg,#171717,#111)!important;color:#fff!important;box-shadow:0 7px 20px rgba(255,123,0,.07)!important;font-weight:800!important;transition:transform .18s ease,box-shadow .18s ease!important}#profilePage .profile-mini-btn:hover,#profilePage .ed-profile-logout:hover{transform:translateY(-2px)!important;box-shadow:0 10px 25px rgba(255,123,0,.15)!important}
      #profilePage{overflow-y:auto!important;overflow-x:hidden!important}#profilePage .profile-content{overflow:visible!important;max-height:none!important}#settingsPage,#statsPage{overflow:hidden!important}#settingsPage>.settings-box,#statsPage>.settings-box{max-height:calc(100vh - 32px)!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important}#settingsPage .settings-list,#statsPage .stats-list{overflow:visible!important;max-height:none!important}
      #profilePage .best-drop-card{border-color:${ACCENT}!important;background:linear-gradient(145deg,#181818,#111)!important;box-shadow:0 12px 30px rgba(255,123,0,.08)!important}#profilePage .best-drop-emoji{border-color:var(--best-rarity,${ACCENT})!important}
      @media(max-width:700px){.live-drops-bar.live-drops-floating,.live-drops-bar.ed-moved-live{width:calc(100% - 24px)!important}#liveContainer .live-drop,#liveContainer .drop-item{flex-basis:124px!important;width:124px!important;min-width:124px!important;height:62px!important}#liveContainer{height:68px!important;max-height:68px!important}}
      @media(prefers-reduced-motion:reduce){#liveContainer .live-drop,#liveContainer .drop-item,#liveContainer .legendary-drop::after{animation:none!important;transition:none!important}}
    `; document.head.appendChild(s);
  }

  function hideSearch(){ $$('.search-wrap,#searchInput,.search-container,.case-search').forEach(n=>{n.hidden=true;n.setAttribute('aria-hidden','true');n.style.setProperty('display','none','important')}); }
  const CASE_PRICES=Object.freeze({transport:15,animals:25,food:40,nature:65,moves:90,smile:130,sport:250,games:500});
  function syncPrices(){ $$('.case').forEach(card=>{const m=(card.getAttribute('onclick')||'').match(/openCasePage\(['"]([^'"]+)['"]\)/i);const p=CASE_PRICES[m?.[1]?.toLowerCase()];if(!p)return;let n=card.querySelector('.new-price');if(!n){n=document.createElement('div');n.className='new-price';card.querySelector('.case-price')?.appendChild(n)}n.textContent=`${p}₽`}) }

  function decorateLive(node){
    if(!(node instanceof HTMLElement))return;
    const raw=`${node.dataset.rarity||''} ${node.className} ${node.querySelector('.live-rarity,.drop-rarity')?.textContent||''}`.toLowerCase();
    const rarity=Object.keys(RARITY).find(k=>raw.includes(k))||'common';
    node.classList.add(`ed-live-${rarity}`);node.style.setProperty('--ed-rarity',RARITY[rarity]);
    const label=node.querySelector('.live-rarity,.drop-rarity');if(label){label.textContent=rarity.toUpperCase();label.style.color=RARITY[rarity]}
  }
  function moveLive(){
    const bar=$('.live-drops-bar'),cases=$('.cases');if(!bar||!cases)return;
    if(bar.parentNode!==cases.parentNode||bar.previousElementSibling!==cases)cases.parentNode.insertBefore(bar,cases.nextSibling);
    bar.classList.add('ed-moved-live');bar.classList.remove('live-drops-floating');
    const root=$('#liveContainer');if(!root)return;root.style.display='flex';root.style.flexDirection='row';root.style.overflow='hidden';
    [...root.children].forEach(decorateLive);while(root.children.length>10)root.lastElementChild?.remove();
    if(root.dataset.edObserver==='1')return;root.dataset.edObserver='1';
    new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes){if(!(node instanceof HTMLElement))continue;decorateLive(node);if(node.parentNode===root&&root.firstElementChild!==node)root.insertBefore(node,root.firstElementChild)}while(root.children.length>10)root.lastElementChild?.remove()}).observe(root,{childList:true});
  }

  function reward(){try{return JSON.parse(localStorage.getItem(rewardKey())||'{}')}catch{return {}}}
  function left(){return Math.max(0,Number(reward().nextAt||0)-Date.now()) || Math.max(0,Number(reward().claimedAt||0)+DAY-Date.now())}
  function timer(ms){const t=Math.ceil(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
  function claim(){if(left()>0)return;const st=window.state,u=st?.currentUser;if(!st||!u){window.openAuth?.('login');return}st.balance=(Number(st.balance)||0)+REWARD;u.balance=st.balance;try{window.saveUsers?.()}catch{};localStorage.setItem(rewardKey(),JSON.stringify({claimedAt:Date.now(),nextAt:Date.now()+DAY}));renderReward();window.updateBalanceUI?.()}
  function renderReward(){const l=left();$$('.balance-dropdown button,#profilePage .profile-mini-btn').forEach(b=>{const v=(b.textContent||'').toLowerCase(),top=!!b.closest('.balance-dropdown'),deposit=/пополн/.test(v);if(!top&&!deposit)return;b.dataset.edReward='1';b.classList.add(top?'ed-reward-top':'ed-profile-reward');b.disabled=l>0;b.textContent=l?`Получено · ${timer(l)}`:`Получить ${REWARD}₽`;b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();claim()}})}

  function openOverlay(id){const node=document.getElementById(id);if(!node)return false;['settingsPage','statsPage'].forEach(other=>{if(other!==id)closeOverlay(other)});node.hidden=false;node.style.display='flex';node.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');return true}
  function closeOverlay(id){const node=document.getElementById(id);if(!node)return;node.hidden=true;node.style.display='none';node.setAttribute('aria-hidden','true');if(!document.querySelector('#settingsPage:not([hidden]),#statsPage:not([hidden])'))document.body.classList.remove('modal-open')}
  window.openSettings=()=>openOverlay('settingsPage');window.closeSettings=()=>closeOverlay('settingsPage');window.openStats=()=>openOverlay('statsPage');window.closeStats=()=>closeOverlay('statsPage');

  function profile(){const page=$('#profilePage');if(!page)return;let logout=page.querySelector('.ed-profile-logout');const dep=[...page.querySelectorAll('.profile-mini-btn')].find(b=>/пополн/.test((b.textContent||'').toLowerCase()));if(dep){dep.textContent='Получить 250₽';dep.classList.add('ed-profile-reward')}if(!logout){logout=document.createElement('button');logout.type='button';logout.className='ed-profile-logout';logout.textContent='Выйти';(page.querySelector('.profile-side:last-of-type')||page.querySelector('.profile-main')||page).appendChild(logout);logout.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();window.logout?.();window.EmojiDropsRouter?.navigate('/')||location.assign('/')};}logout.style.display='inline-flex';logout.style.alignItems='center';logout.style.justifyContent='center'}

  function best(){try{return JSON.parse(localStorage.getItem(bestKey())||'null')}catch{return null}}
  function saveBest(item){if(!item)return;const rank={common:1,rare:2,epic:3,mythical:4,legendary:5},cur=best();if(cur&&((rank[cur.rarity]||0)>(rank[item.rarity]||0)||((rank[cur.rarity]||0)===(rank[item.rarity]||0)&&money(cur.price)>=money(item.price))))return;try{localStorage.setItem(bestKey(),JSON.stringify({emoji:item.emoji,rarity:item.rarity,price:item.price,updatedAt:Date.now()}))}catch{};renderBest()}
  function renderBest(){const b=best();if(!b)return;const c=RARITY[b.rarity]||ACCENT;$$('.best-drop-emoji,#bestDropEmoji').forEach(n=>{n.textContent=b.emoji||'🏆';n.style.setProperty('--best-rarity',c)});$$('.best-drop-rarity,#bestDropRarity').forEach(n=>{n.textContent=String(b.rarity||'DROP').toUpperCase();n.style.color=c})}
  function patchBest(){if(typeof window.showWin!=='function'||window.showWin.__edBest)return;const original=window.showWin;const wrapped=function(item){saveBest(item);return original.apply(this,arguments)};wrapped.__edBest=true;window.showWin=wrapped}

  function closeGuards(){['settingsPage','statsPage'].forEach(id=>{const n=$(`#${id}`);if(!n||n.dataset.edClose)return;n.dataset.edClose='1';n.addEventListener('click',e=>{if(e.target===n)closeOverlay(id)})});if(!document.body.dataset.edEscape){document.body.dataset.edEscape='1';document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeOverlay('settingsPage');closeOverlay('statsPage')}})}}
  function tick(){styles();hideSearch();syncPrices();moveLive();renderReward();profile();renderBest();patchBest();closeGuards()}
  function install(){tick();let last=0;new MutationObserver(()=>{const n=Date.now();if(n-last<150)return;last=n;tick()}).observe(document.body,{childList:true,subtree:true});setInterval(()=>{renderReward();renderBest();moveLive();profile()},1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
