(() => {
  'use strict';

  const RARITIES = {
    common: { chance: 55, color: '#9ca3af' },
    rare: { chance: 27, color: '#3b82f6' },
    epic: { chance: 12, color: '#a855f7' },
    mythical: { chance: 5, color: '#ef4444' },
    legendary: { chance: 1, color: '#ff8a00' }
  };

  const ECONOMY = {
    transport: 25,
    animals: 50,
    food: 75,
    nature: 100,
    moves: 125,
    smile: 175,
    sport: 300,
    games: 500
  };
  const TARGET_RTP = 0.88;
  const REWARD = 250;
  const REWARD_MS = 86400000;
  const rewardKey = 'emojiDrops.dailyReward.v3';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  function users() {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); }
    catch { return []; }
  }
  function saveUsers(list) { localStorage.setItem('users', JSON.stringify(list)); }
  function currentEmail() { return localStorage.getItem('currentUser'); }
  function getUser() { return users().find(u => u.email === currentEmail()) || null; }
  function saveUser(user) {
    const list = users();
    const i = list.findIndex(u => u.email === user.email);
    if (i >= 0) list[i] = user; else list.push(user);
    saveUsers(list);
  }

  function normalizeEconomy() {
    Object.entries(ECONOMY).forEach(([key, price]) => {
      if (typeof casePrices === 'object') casePrices[key] = price;
      const items = cases[key] || [];
      const byRarity = {};
      items.forEach(item => {
        const n = Number(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0;
        (byRarity[item.rarity] ||= []).push(n);
      });
      let expected = 0;
      Object.entries(RARITIES).forEach(([rarity, data]) => {
        const avg = (byRarity[rarity] || [0]).reduce((a,b) => a+b, 0) / (byRarity[rarity]?.length || 1);
        expected += avg * data.chance / 100;
      });
      const scale = expected > 0 ? (price * TARGET_RTP) / expected : 1;
      items.forEach(item => {
        const n = Number(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0;
        item.value = Math.max(1, Math.round(n * scale));
        item.price = `${item.value}₽`;
      });
    });
  }

  function weightedItem(items) {
    const roll = Math.random() * 100;
    let acc = 0;
    let rarity = 'common';
    for (const [name, data] of Object.entries(RARITIES)) {
      acc += data.chance;
      if (roll < acc) { rarity = name; break; }
    }
    const pool = items.filter(i => i.rarity === rarity);
    const fallback = pool.length ? pool : items;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  function formatTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function rewardLeft() {
    try {
      const d = JSON.parse(localStorage.getItem(rewardKey) || '{}');
      return Math.max(0, Number(d.nextAt || 0) - Date.now());
    } catch { return 0; }
  }

  function claimReward() {
    const user = getUser();
    if (!user) return openAuth();
    if (rewardLeft() > 0) return;
    user.balance = Number(user.balance || 0) + REWARD;
    saveUser(user);
    localStorage.setItem(rewardKey, JSON.stringify({ nextAt: Date.now() + REWARD_MS }));
    renderAll();
  }

  function renderReward() {
    const left = rewardLeft();
    $$('.reward-btn').forEach(btn => {
      btn.disabled = left > 0;
      btn.textContent = left > 0 ? `Получено · ${formatTime(left)}` : `Получить ${REWARD}₽`;
    });
  }

  function rarityStyle(el, rarity) {
    const c = RARITIES[rarity]?.color || '#9ca3af';
    el.style.setProperty('--rarity', c);
    el.dataset.rarity = rarity;
  }

  function renderCases() {
    const grid = $('#cases');
    grid.innerHTML = '';
    Object.entries(ECONOMY).forEach(([key, price]) => {
      const itemCount = (cases[key] || []).length;
      const card = document.createElement('button');
      card.className = 'case-card';
      card.type = 'button';
      card.innerHTML = `
        <div class="case-art">${({smile:'😀',moves:'🕺',nature:'🌿',food:'🍔',animals:'🐶',transport:'🚗',sport:'⚽',games:'🎮'})[key]}</div>
        <div class="case-name">${key[0].toUpperCase()+key.slice(1)}</div>
        <div class="case-meta">${itemCount} предметов</div>
        <div class="case-price"><span>${price}₽</span><small>открыть</small></div>`;
      card.onclick = () => openCasePage(key);
      grid.appendChild(card);
    });
  }

  function renderLiveDrop(username, item, initial = false) {
    const box = $('#liveContainer');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'live-drop';
    rarityStyle(el, item.rarity);
    el.innerHTML = `<div class="live-emoji">${item.emoji}</div><div><b>${username}</b><span>${item.rarity.toUpperCase()} · ${item.price}</span></div>`;
    if (item.rarity === 'legendary') el.classList.add('legendary-live');
    box.prepend(el);
    while (box.children.length > 10) box.lastElementChild.remove();
    if (initial) el.style.animation = 'none';
  }

  function randomLive() {
    const keys = Object.keys(cases);
    const key = keys[Math.floor(Math.random()*keys.length)];
    const item = weightedItem(cases[key]);
    const names = ['Shadow','Blaze','Ghost','Nova','Orion','Razor','Hunter','Pixel','Storm','Ordboy'];
    renderLiveDrop(names[Math.floor(Math.random()*names.length)], item);
  }

  function startLiveDrops() {
    $('#liveContainer').innerHTML = '';
    for (let i=0;i<6;i++) randomLive();
    setInterval(randomLive, 1400);
  }

  function openCasePage(key) {
    state.caseKey = key;
    state.amount = 1;
    $('#openModal').classList.add('show');
    $('#openTitle').textContent = `${key[0].toUpperCase()+key.slice(1)} · ${ECONOMY[key]}₽`;
    renderCasePreview();
    renderAmountButtons();
  }

  function renderAmountButtons() {
    const box = $('#amounts'); box.innerHTML='';
    for(let i=1;i<=Math.min(10, Math.floor((getUser()?.balance||0)/(ECONOMY[state.caseKey]||1)));i++){
      const b=document.createElement('button'); b.className='amount'; b.textContent=i; if(i===state.amount)b.classList.add('active');
      b.onclick=()=>{state.amount=i; renderAmountButtons();}; box.appendChild(b);
    }
    if(!box.children.length) box.innerHTML='<span class="muted">Недостаточно средств</span>';
    $('#openCost').textContent = `${(ECONOMY[state.caseKey]||0)*state.amount}₽`;
  }

  function renderCasePreview() {
    const box=$('#caseItems'); box.innerHTML='';
    (cases[state.caseKey]||[]).forEach(item=>{
      const el=document.createElement('div'); el.className='preview-item'; rarityStyle(el,item.rarity);
      el.innerHTML=`<strong>${item.emoji}</strong><span>${item.rarity.toUpperCase()}</span><small>${item.price}</small>`; box.appendChild(el);
    });
  }

  function openCase() {
    const user=getUser();
    if(!user) return openAuth();
    const cost=ECONOMY[state.caseKey]*state.amount;
    if((user.balance||0)<cost) return alert('Недостаточно средств');
    user.balance-=cost;
    user.inventory ||= [];
    const wins=[];
    for(let i=0;i<state.amount;i++){
      const item={...weightedItem(cases[state.caseKey])};
      wins.push(item); user.inventory.push(item); renderLiveDrop(user.nickname || 'User', item);
    }
    user.stats ||= {opened:0,upgrades:0,deposited:0,withdrawn:0,withdrawnItems:0};
    user.stats.opened += state.amount;
    saveUser(user);
    state.lastWin=wins[wins.length-1];
    closeModal('#openModal');
    showWin(state.lastWin);
    renderAll();
  }

  function showWin(item) {
    $('#winEmoji').textContent=item.emoji; $('#winRarity').textContent=item.rarity.toUpperCase(); $('#winPrice').textContent=item.price;
    rarityStyle($('#winCard'),item.rarity); $('#winModal').classList.add('show');
  }

  function renderProfile() {
    const user=getUser();
    if(!user) return;
    $('#profileName').textContent=user.nickname || 'User';
    $('#profileBalanceValue').textContent=`${user.balance||0}₽`;
    $('#inventory').innerHTML='';
    (user.inventory||[]).forEach((item,i)=>{
      const el=document.createElement('div'); el.className='inventory-item'; rarityStyle(el,item.rarity);
      el.innerHTML=`<div class="inv-emoji">${item.emoji}</div><b>${item.price}</b><small>${item.rarity.toUpperCase()}</small><button type="button">Продать</button>`;
      el.querySelector('button').onclick=()=>{ const u=getUser(); const v=Number(String(item.price).replace(/[^0-9]/g,'')); u.balance=(u.balance||0)+v; u.inventory.splice(i,1); saveUser(u); renderAll(); };
      $('#inventory').appendChild(el);
    });
    renderBestDrop(user);
  }

  function renderBestDrop(user) {
    const order={common:1,rare:2,epic:3,mythical:4,legendary:5};
    const best=(user.inventory||[]).slice().sort((a,b)=> (order[b.rarity]-order[a.rarity]) || ((b.value||0)-(a.value||0)))[0];
    $('#bestDrop').innerHTML=best ? `<strong>${best.emoji}</strong><span>${best.rarity.toUpperCase()}</span><small>${best.price}</small>` : '<strong>🏆</strong><span>Нет дропа</span>';
    if(best) rarityStyle($('#bestDrop'),best.rarity);
  }

  function openProfile(){
    if(!getUser()) return openAuth();
    $('#profileModal').classList.add('show'); renderProfile();
  }
  function logout(){ localStorage.removeItem('currentUser'); closeModal('#profileModal'); renderAll(); }
  function openAuth(){ $('#authModal').classList.add('show'); $('#authEmail').focus(); }
  function closeAuth(){ closeModal('#authModal'); }
  function submitAuth(){
    const email=$('#authEmail').value.trim().toLowerCase(), password=$('#authPassword').value;
    if(!email||password.length<6) return alert('Введите почту и пароль минимум из 6 символов');
    const list=users(); const existing=list.find(u=>u.email===email);
    if(existing){ if(existing.password!==password)return alert('Неверный пароль'); localStorage.setItem('currentUser',email); }
    else { const user={email,password,nickname:'user'+Math.floor(Math.random()*9000+1000),balance:1000,inventory:[],stats:{opened:0,upgrades:0,deposited:0,withdrawn:0,withdrawnItems:0}}; list.push(user); saveUsers(list); localStorage.setItem('currentUser',email); }
    closeAuth(); renderAll();
  }

  function openSettings(){ closeModal('#statsModal'); $('#settingsModal').classList.add('show'); document.body.classList.add('modal-lock'); }
  function closeSettings(){ closeModal('#settingsModal'); document.body.classList.remove('modal-lock'); }
  function openStats(){ closeSettings(); $('#statsModal').classList.add('show'); const u=getUser(); $('#statsOpened').textContent=u?.stats?.opened||0; $('#statsUpgrades').textContent=u?.stats?.upgrades||0; }
  function closeStats(){ closeModal('#statsModal'); document.body.classList.remove('modal-lock'); }
  function openUpgrade(){ closeModal('#profileModal'); $('#upgradeModal').classList.add('show'); renderUpgrade(); }
  function closeUpgrade(){ closeModal('#upgradeModal'); }

  function renderUpgrade(){
    const u=getUser(); const inv=u?.inventory||[]; const box=$('#upgradeInventory'); box.innerHTML='';
    inv.forEach((item,i)=>{ const b=document.createElement('button'); b.className='upgrade-item'; b.innerHTML=`${item.emoji} <span>${item.price}</span>`; b.onclick=()=>{ state.upgradeIndex=i; $$('.upgrade-item').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); }; box.appendChild(b); });
  }
  function doUpgrade(){
    const u=getUser(); if(!u)return openAuth(); if(state.upgradeIndex==null)return alert('Выберите предмет');
    const item=u.inventory[state.upgradeIndex]; if(!item)return;
    const success=Math.random()<0.5; u.stats ||= {opened:0,upgrades:0}; u.stats.upgrades++;
    if(success){ const target=Object.values(cases).flat().filter(x=>(x.value||0)>(item.value||0)).sort((a,b)=>(a.value||0)-(b.value||0))[0]; if(target){u.inventory[state.upgradeIndex]={...target};} }
    saveUser(u); alert(success?'Апгрейд успешен!':'Апгрейд не удался'); state.upgradeIndex=null; renderUpgrade(); renderAll();
  }

  function closeModal(sel){ const el=$(sel); if(el)el.classList.remove('show'); }
  function renderAll(){
    const u=getUser(); $('#nickname').textContent=u?.nickname||'Гость'; $('#balance').textContent=u?.balance??1000; renderReward(); renderCases(); if($('#profileModal').classList.contains('show'))renderProfile();
  }

  const state={caseKey:'smile',amount:1,lastWin:null,upgradeIndex:null};
  window.openProfile=openProfile; window.logout=logout; window.openAuth=openAuth; window.closeAuth=closeAuth; window.submitAuth=submitAuth;
  window.openSettings=openSettings; window.closeSettings=closeSettings; window.openStats=openStats; window.closeStats=closeStats; window.openUpgrade=openUpgrade; window.closeUpgrade=closeUpgrade;
  window.claimReward=claimReward; window.openCase=openCase; window.closeOpen=()=>closeModal('#openModal'); window.closeWin=()=>closeModal('#winModal'); window.doUpgrade=doUpgrade;

  normalizeEconomy();
  document.addEventListener('DOMContentLoaded',()=>{
    $('#rewardHeader').addEventListener('click',claimReward); $('#rewardProfile').addEventListener('click',claimReward);
    $('#profileBtn').addEventListener('click',openProfile); $('#logoutBtn').addEventListener('click',logout);
    $('#settingsBtn').addEventListener('click',openSettings); $('#statsBtn').addEventListener('click',openStats); $('#upgradeBtn').addEventListener('click',openUpgrade);
    $('#openBtn').addEventListener('click',openCase); $('#upgradeDo').addEventListener('click',doUpgrade);
    $$('.close-any').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
    renderAll(); startLiveDrops();
    setInterval(renderReward,1000);
  });
})();
