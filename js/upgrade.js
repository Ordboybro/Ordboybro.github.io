(() => {
  'use strict';

  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const user = () => window.state?.currentUser || null;
  const rarityColor = item => (window.rarities?.[item?.rarity]?.color) || '#ff7b00';

  const allItems = () => {
    const source = window.cases || {};
    return Object.values(source).flatMap(items => Array.isArray(items) ? items : []);
  };

  const ensureStyles = () => {
    if (document.getElementById('emojiDropsUpgradeStyles')) return;
    const style = document.createElement('style');
    style.id = 'emojiDropsUpgradeStyles';
    style.textContent = `
      #edUpgrade2 { position:fixed; inset:0; z-index:10000; display:none; align-items:center; justify-content:center; padding:24px; background:rgba(0,0,0,.76); backdrop-filter:blur(8px); }
      #edUpgrade2.open { display:flex; animation:edUFade .2s ease both; }
      @keyframes edUFade { from{opacity:0} to{opacity:1} }
      .ed-u-box { width:min(1180px,96vw); max-height:min(820px,94vh); overflow:auto; border:1px solid rgba(255,123,0,.42); border-radius:22px; background:#111; box-shadow:0 24px 80px rgba(0,0,0,.55),0 0 34px rgba(255,123,0,.08); padding:22px; color:#fff; }
      .ed-u-head { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
      .ed-u-title { font-size:25px; font-weight:800; letter-spacing:.04em; }
      .ed-u-sub { color:#999; font-size:13px; margin-top:4px; }
      .ed-u-close { width:42px; height:42px; border:1px solid rgba(255,123,0,.5); border-radius:12px; background:#191919; color:#fff; font-size:22px; cursor:pointer; }
      .ed-u-grid { display:grid; grid-template-columns:1.1fr .8fr 1.1fr; gap:16px; }
      .ed-u-panel { min-width:0; border:1px solid #292929; border-radius:17px; background:#151515; padding:15px; }
      .ed-u-panel h3 { margin:0 0 12px; font-size:14px; color:#ddd; }
      .ed-u-items { display:grid; grid-template-columns:repeat(auto-fill,minmax(82px,1fr)); gap:9px; max-height:340px; overflow:auto; }
      .ed-u-item { position:relative; min-height:82px; border:1px solid #292929; border-radius:12px; background:#101010; color:#fff; cursor:pointer; transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease; }
      .ed-u-item:hover { transform:translateY(-2px); border-color:#ff7b00; }
      .ed-u-item.selected { border-color:#ff7b00; box-shadow:0 0 0 2px rgba(255,123,0,.18); }
      .ed-u-emoji { font-size:34px; line-height:1; padding-top:10px; }
      .ed-u-price { font-size:11px; color:#aaa; margin-top:8px; }
      .ed-u-check { position:absolute; top:5px; right:6px; font-size:12px; color:#ff7b00; }
      .ed-u-wheel { min-height:270px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
      .ed-u-wheel-ring { width:190px; height:190px; border-radius:50%; border:7px solid #ff7b00; box-shadow:0 0 26px rgba(255,123,0,.2), inset 0 0 24px rgba(255,123,0,.08); display:flex; align-items:center; justify-content:center; position:relative; transition:transform 1.5s cubic-bezier(.08,.72,.12,1); }
      .ed-u-arrow { position:absolute; width:0; height:0; border-left:9px solid transparent; border-right:9px solid transparent; border-top:16px solid #ff7b00; top:-16px; left:50%; transform:translateX(-50%); filter:drop-shadow(0 0 6px rgba(255,123,0,.65)); }
      .ed-u-center { text-align:center; padding:15px; }
      .ed-u-mult { font-size:26px; font-weight:800; }
      .ed-u-chance { font-size:13px; color:#aaa; margin-top:5px; }
      .ed-u-presets { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin:12px 0; }
      .ed-u-presets button,.ed-u-upgrade { border:1px solid rgba(255,123,0,.45); background:#1b1b1b; color:#fff; border-radius:10px; min-height:40px; cursor:pointer; transition:.18s ease; }
      .ed-u-presets button:hover,.ed-u-upgrade:hover { border-color:#ff7b00; background:#202020; transform:translateY(-1px); }
      .ed-u-upgrade { width:100%; background:#ff7b00; color:#111; font-weight:800; font-size:15px; margin-top:10px; }
      .ed-u-upgrade:disabled { opacity:.45; cursor:not-allowed; transform:none; }
      .ed-u-target { min-height:340px; }
      .ed-u-selected { min-height:72px; border:1px dashed #333; border-radius:12px; padding:9px; margin-bottom:12px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
      .ed-u-selected-chip { width:58px; height:58px; border-radius:10px; border:1px solid #333; display:flex; align-items:center; justify-content:center; font-size:28px; background:#101010; }
      .ed-u-info { display:flex; justify-content:space-between; gap:10px; color:#aaa; font-size:13px; margin:7px 0; }
      .ed-u-info strong { color:#fff; }
      .ed-u-result { margin-top:12px; padding:12px; border-radius:12px; text-align:center; display:none; border:1px solid #333; }
      .ed-u-result.success { display:block; border-color:#ff7b00; box-shadow:0 0 20px rgba(255,123,0,.12); }
      .ed-u-result.fail { display:block; border-color:#653333; }
      @media(max-width:900px){ .ed-u-grid{grid-template-columns:1fr;} .ed-u-items{max-height:240px;} .ed-u-target{min-height:0;} }
    `;
    document.head.appendChild(style);
  };

  const inject = () => {
    if (document.getElementById('edUpgrade2')) return;
    ensureStyles();
    const overlay = document.createElement('div');
    overlay.id = 'edUpgrade2';
    overlay.innerHTML = `
      <div class="ed-u-box">
        <div class="ed-u-head"><div><div class="ed-u-title">UPGRADE 2.0</div><div class="ed-u-sub">Выберите до 6 предметов и цель для апгрейда</div></div><button class="ed-u-close" id="edUClose">×</button></div>
        <div class="ed-u-grid">
          <section class="ed-u-panel"><h3>Ваши предметы <span id="edUCount">0/6</span></h3><div class="ed-u-items" id="edUInventory"></div></section>
          <section class="ed-u-panel ed-u-wheel"><div class="ed-u-wheel-ring" id="edUWheel"><div class="ed-u-arrow"></div><div class="ed-u-center"><div id="edUMult" class="ed-u-mult">1.00x</div><div id="edUChance" class="ed-u-chance">Выберите цель</div></div></div><div class="ed-u-presets"><button data-mult="2">X2</button><button data-mult="5">X5</button><button data-mult="10">X10</button></div><div class="ed-u-presets"><button data-chance="30">30%</button><button data-chance="50">50%</button><button data-chance="75">75%</button></div><button class="ed-u-upgrade" id="edUStart" disabled>АПГРЕЙД</button><div class="ed-u-result" id="edUResult"></div></section>
          <section class="ed-u-panel ed-u-target"><h3>Цель</h3><div class="ed-u-selected" id="edUSelected">Выберите предмет из списка</div><div class="ed-u-items" id="edUTargets"></div></section>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById('edUClose').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.getElementById('edUStart').onclick = run;
    overlay.querySelectorAll('[data-mult]').forEach(b => b.onclick = () => { state.upgradeMultiplier = Number(b.dataset.mult); render(); });
    overlay.querySelectorAll('[data-chance]').forEach(b => b.onclick = () => { state.upgradeChance = Number(b.dataset.chance); render(); });
  };

  const state = { selected: [], target: null, upgradeMultiplier: 2, upgradeChance: null, busy: false };

  const inventory = () => Array.isArray(user()?.inventory) ? user().inventory : [];
  const uniqueTargets = () => {
    const seen = new Set();
    return allItems().filter(item => {
      const key = `${item.emoji}|${item.price}|${item.rarity}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  };

  const sourceValue = () => state.selected.reduce((sum, item) => sum + money(item.price), 0);
  const targetValue = () => money(state.target?.price);
  const computedChance = () => {
    if (!state.target || !sourceValue() || !targetValue()) return 0;
    if (state.upgradeChance != null) return Math.min(95, state.upgradeChance);
    return Math.min(95, Math.max(1, (sourceValue() / targetValue()) * 100));
  };

  const itemCard = (item, selected, handler) => {
    const b = document.createElement('button'); b.className = `ed-u-item${selected ? ' selected' : ''}`;
    b.innerHTML = `<div class="ed-u-emoji" style="color:${rarityColor(item)}">${item.emoji}</div><div class="ed-u-price">${money(item.price)}₽</div>${selected ? '<span class="ed-u-check">✓</span>' : ''}`;
    b.onclick = handler; return b;
  };

  const render = () => {
    const inv = document.getElementById('edUInventory'); const targets = document.getElementById('edUTargets');
    if (!inv || !targets) return;
    inv.innerHTML = '';
    inventory().forEach((item, index) => inv.appendChild(itemCard(item, state.selected.includes(item), () => {
      if (state.busy) return;
      const pos = state.selected.indexOf(item);
      if (pos >= 0) state.selected.splice(pos, 1); else if (state.selected.length < 6) state.selected.push(item);
      render();
    })));
    if (!inventory().length) inv.innerHTML = '<div class="ui-empty-state">Инвентарь пуст<br><small>Откройте кейс, чтобы получить предметы</small></div>';
    targets.innerHTML = '';
    uniqueTargets().forEach(item => targets.appendChild(itemCard(item, state.target === item, () => { if (!state.busy) { state.target = item; state.upgradeChance = null; render(); } })));
    document.getElementById('edUCount').textContent = `${state.selected.length}/6`;
    const total = sourceValue(), target = targetValue(), chance = computedChance();
    document.getElementById('edUMult').textContent = total && target ? `${(target/Math.max(total,1)).toFixed(2)}x` : '1.00x';
    document.getElementById('edUChance').textContent = chance ? `Шанс ${chance.toFixed(1)}%` : 'Выберите цель';
    const selected = document.getElementById('edUSelected');
    selected.innerHTML = state.target ? `<div class="ed-u-selected-chip" style="color:${rarityColor(state.target)}">${state.target.emoji}</div><div><strong>${money(state.target.price)}₽</strong><br><small>${state.target.rarity.toUpperCase()}</small></div>` : 'Выберите предмет из списка';
    document.getElementById('edUStart').disabled = state.busy || !state.selected.length || !state.target || !chance;
  };

  function open() {
    if (!user()) { if (typeof openAuth === 'function') openAuth('login'); return; }
    inject(); state.selected=[]; state.target=null; state.upgradeChance=null; state.busy=false;
    const overlay=document.getElementById('edUpgrade2'); overlay.classList.add('open'); render();
  }

  function close() { const overlay=document.getElementById('edUpgrade2'); if (overlay) overlay.classList.remove('open'); }

  async function run() {
    if (state.busy || !state.selected.length || !state.target || !user()) return;
    const total=sourceValue(), target=targetValue(), chance=computedChance();
    if (!total || !target || target <= total) { showResult(false, 'Выберите цель дороже суммы предметов'); return; }
    state.busy=true; render();
    const wheel=document.getElementById('edUWheel');
    wheel.style.transform=`rotate(${1080 + Math.random()*360}deg)`;
    await new Promise(r=>setTimeout(r,1500));
    const success=Math.random()*100 < chance;
    wheel.style.transform='rotate(0deg)';
    if (success) {
      const inv=user().inventory || [];
      const selectedSet=new Set(state.selected);
      user().inventory=inv.filter(item => !selectedSet.has(item));
      user().inventory.push(state.target);
      state.upgradeChance=null;
      if (window.state) window.state.stats.upgrades=(window.state.stats.upgrades||0)+1;
      if (typeof saveStats==='function') saveStats();
      if (typeof saveUsers==='function') saveUsers();
      if (typeof renderInventory==='function') renderInventory();
      showResult(true, `Получен ${state.target.emoji} · ${money(state.target.price)}₽`);
    } else {
      const inv=user().inventory || [];
      const selectedSet=new Set(state.selected);
      user().inventory=inv.filter(item => !selectedSet.has(item));
      if (typeof saveUsers==='function') saveUsers();
      if (typeof renderInventory==='function') renderInventory();
      showResult(false, 'Апгрейд не удался');
    }
    state.selected=[]; state.busy=false; render();
  }

  function showResult(success,text) {
    const result=document.getElementById('edUResult'); if(!result)return;
    result.className=`ed-u-result ${success?'success':'fail'}`; result.innerHTML=`<strong>${success?'✓ УСПЕШНЫЙ АПГРЕЙД':'✕ НЕ УДАЛОСЬ'}</strong><br><span>${text}</span>`;
  }

  window.openUpgradeMenu = open;
  window.closeUpgradeMenu = close;
  window.startUpgrade = run;
  window.closeUpgradeResult = close;
})();
