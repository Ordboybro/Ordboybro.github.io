(() => {
  'use strict';

  const money = value => Number(String(value ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const currentUser = () => window.state?.currentUser || null;
  const rarityColor = item => window.rarities?.[item?.rarity]?.color || '#ff7b00';
  const allItems = () => Object.values(window.cases || {}).flatMap(items => Array.isArray(items) ? items : []);
  const inventory = () => Array.isArray(currentUser()?.inventory) ? currentUser().inventory : [];

  const state = {
    selected: [],
    target: null,
    preset: null,
    busy: false,
    opened: false
  };

  function ensureStyles() {
    if (document.getElementById('emojiDropsUpgradeStyles')) return;
    const style = document.createElement('style');
    style.id = 'emojiDropsUpgradeStyles';
    style.textContent = `
      #edUpgrade2{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(7,7,7,.82);}
      #edUpgrade2.open{display:flex;animation:edUIn .18s ease-out both}
      #edUpgrade2.closing{animation:edUOut .16s ease-in both}
      @keyframes edUIn{from{opacity:0}to{opacity:1}}
      @keyframes edUOut{from{opacity:1}to{opacity:0}}
      .ed-u-box{width:min(1120px,96vw);max-height:min(820px,94vh);overflow:auto;box-sizing:border-box;border:1px solid rgba(255,123,0,.28);border-radius:18px;background:#111214;color:#fff;box-shadow:0 24px 70px rgba(0,0,0,.55);padding:18px;scrollbar-width:thin;scrollbar-color:#3a3a3a transparent}
      .ed-u-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:2px 2px 16px;border-bottom:1px solid #242527}
      .ed-u-title{font-size:22px;font-weight:800;letter-spacing:.02em}.ed-u-sub{margin-top:4px;color:#85878b;font-size:12px}
      .ed-u-close{width:38px;height:38px;border:1px solid #303236;border-radius:10px;background:#18191b;color:#bfc1c5;font-size:21px;cursor:pointer;transition:transform .16s,border-color .16s,color .16s}
      .ed-u-close:hover{transform:translateY(-1px);border-color:#ff7b00;color:#fff}.ed-u-close:active{transform:scale(.96)}
      .ed-u-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(270px,.8fr) minmax(0,1.15fr);gap:12px;margin-top:14px}
      .ed-u-panel{min-width:0;border:1px solid #282a2d;border-radius:14px;background:#151618;padding:13px}
      .ed-u-panel h3{display:flex;justify-content:space-between;margin:0 0 10px;font-size:13px;font-weight:700;color:#ddd}
      .ed-u-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:7px;max-height:355px;overflow:auto;padding-right:2px;scrollbar-width:thin;scrollbar-color:#34363a transparent}
      .ed-u-item{position:relative;min-width:0;min-height:78px;padding:7px 4px 6px;border:1px solid #292b2f;border-radius:10px;background:#101113;color:#fff;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease}
      .ed-u-item:hover{transform:translateY(-2px);border-color:#b85a00;background:#151719}.ed-u-item:active{transform:scale(.98)}
      .ed-u-item.selected{border-color:#ff7b00;box-shadow:inset 0 0 0 1px rgba(255,123,0,.25),0 0 14px rgba(255,123,0,.08);background:#171719}
      .ed-u-emoji{font-size:31px;line-height:34px;text-align:center}.ed-u-price{text-align:center;margin-top:5px;font-size:10px;color:#9b9da1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ed-u-check{position:absolute;top:5px;right:6px;color:#ff7b00;font-size:11px}
      .ed-u-empty{grid-column:1/-1;padding:30px 10px;text-align:center;color:#777;font-size:12px;border:1px dashed #303236;border-radius:10px}
      .ed-u-wheel{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:380px}
      .ed-u-wheel-stage{position:relative;width:210px;height:210px;display:grid;place-items:center;margin:3px 0 10px}
      .ed-u-wheel-ring{width:178px;height:178px;border-radius:50%;border:5px solid #ff7b00;background:radial-gradient(circle,#1b1c1f 0%,#111214 67%,#17191b 100%);box-shadow:0 0 0 1px rgba(255,123,0,.08),0 0 28px rgba(255,123,0,.13),inset 0 0 25px rgba(255,123,0,.06);display:grid;place-items:center;position:relative;will-change:transform}
      .ed-u-wheel-ring.spinning{transition:transform 1.85s cubic-bezier(.12,.7,.12,1)}
      .ed-u-arrow{position:absolute;z-index:2;left:50%;top:-1px;width:0;height:0;transform:translateX(-50%);border-left:8px solid transparent;border-right:8px solid transparent;border-top:15px solid #ff7b00;filter:drop-shadow(0 0 5px rgba(255,123,0,.55))}
      .ed-u-center{text-align:center;pointer-events:none}.ed-u-mult{font-size:25px;font-weight:800}.ed-u-chance{margin-top:5px;font-size:12px;color:#85878b}
      .ed-u-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;margin:4px 0}.ed-u-presets button,.ed-u-upgrade{min-height:38px;border:1px solid #303236;border-radius:9px;background:#191a1c;color:#ddd;font-weight:700;cursor:pointer;transition:transform .16s,border-color .16s,background .16s,color .16s}
      .ed-u-presets button:hover{transform:translateY(-1px);border-color:#ff7b00;color:#fff}.ed-u-presets button.active{border-color:#ff7b00;background:rgba(255,123,0,.11);color:#ff9a43}
      .ed-u-upgrade{width:100%;margin-top:5px;background:#ff7b00;border-color:#ff7b00;color:#101112;font-size:14px}.ed-u-upgrade:hover{background:#ff8b21;border-color:#ff8b21;transform:translateY(-1px)}.ed-u-upgrade:disabled{opacity:.42;cursor:not-allowed;transform:none}
      .ed-u-selected{min-height:62px;display:flex;align-items:center;gap:9px;padding:8px;border:1px dashed #303236;border-radius:10px;margin-bottom:10px;color:#777;font-size:12px}
      .ed-u-selected-chip{width:48px;height:48px;flex:0 0 48px;border:1px solid #303236;border-radius:9px;background:#101113;display:grid;place-items:center;font-size:26px}
      .ed-u-info{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid #242528;color:#85878b;font-size:12px}.ed-u-info strong{color:#eee}.ed-u-result{display:none;width:100%;box-sizing:border-box;margin-top:8px;padding:9px;border-radius:9px;text-align:center;font-size:12px}.ed-u-result.success{display:block;border:1px solid rgba(255,123,0,.45);background:rgba(255,123,0,.06)}.ed-u-result.fail{display:block;border:1px solid #493033;background:#181214;color:#c7aeb0}
      @media(max-width:900px){#edUpgrade2{padding:8px}.ed-u-box{padding:13px}.ed-u-grid{grid-template-columns:1fr}.ed-u-wheel{min-height:0}.ed-u-items{max-height:230px}.ed-u-target{order:2}.ed-u-wheel{order:3}}
      @media(prefers-reduced-motion:reduce){#edUpgrade2.open,#edUpgrade2.closing,.ed-u-item,.ed-u-close,.ed-u-presets button,.ed-u-upgrade{animation:none!important;transition:none!important}.ed-u-wheel-ring.spinning{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function inject() {
    if (document.getElementById('edUpgrade2')) return;
    ensureStyles();
    const overlay=document.createElement('div'); overlay.id='edUpgrade2';
    overlay.innerHTML=`
      <div class="ed-u-box">
        <div class="ed-u-head"><div><div class="ed-u-title">UPGRADE 2.0</div><div class="ed-u-sub">Соберите ставку и выберите предмет, к которому хотите перейти</div></div><button class="ed-u-close" id="edUClose" aria-label="Закрыть">×</button></div>
        <div class="ed-u-grid">
          <section class="ed-u-panel"><h3><span>Ваши предметы</span><span id="edUCount">0/6</span></h3><div class="ed-u-items" id="edUInventory"></div></section>
          <section class="ed-u-panel ed-u-wheel">
            <div class="ed-u-wheel-stage"><div class="ed-u-arrow"></div><div class="ed-u-wheel-ring" id="edUWheel"><div class="ed-u-center"><div id="edUMult" class="ed-u-mult">1.00x</div><div id="edUChance" class="ed-u-chance">Выберите цель</div></div></div></div>
            <div class="ed-u-presets" id="edUMults"><button data-mult="2">X2</button><button data-mult="5">X5</button><button data-mult="10">X10</button></div>
            <div class="ed-u-presets" id="edUChances"><button data-chance="30">30%</button><button data-chance="50">50%</button><button data-chance="75">75%</button></div>
            <button class="ed-u-upgrade" id="edUStart" disabled>АПГРЕЙД</button><div class="ed-u-result" id="edUResult"></div>
          </section>
          <section class="ed-u-panel ed-u-target"><h3><span>Цель</span></h3><div class="ed-u-selected" id="edUSelected">Выберите предмет из списка</div><div class="ed-u-items" id="edUTargets"></div></section>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('edUClose').onclick=close;
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    document.getElementById('edUStart').onclick=run;
    overlay.querySelectorAll('[data-mult]').forEach(button=>button.onclick=()=>{state.preset={type:'mult',value:Number(button.dataset.mult)};render()});
    overlay.querySelectorAll('[data-chance]').forEach(button=>button.onclick=()=>{state.preset={type:'chance',value:Number(button.dataset.chance)};render()});
  }

  function uniqueTargets(){
    const seen=new Set();
    return allItems().filter(item=>{
      const key=`${item?.emoji}|${money(item?.price)}|${item?.rarity}`;
      if(seen.has(key))return false; seen.add(key); return true;
    });
  }
  const sourceValue=()=>state.selected.reduce((sum,item)=>sum+money(item?.price),0);
  const targetValue=()=>money(state.target?.price);
  function chance(){
    const total=sourceValue(),target=targetValue(); if(!total||!target)return 0;
    if(state.preset?.type==='chance')return Math.min(95,state.preset.value);
    const desired=state.preset?.type==='mult'?total*state.preset.value:target;
    return Math.min(95,Math.max(1,(total/Math.max(desired,1))*100));
  }

  function card(item,selected,handler){
    const button=document.createElement('button'); button.type='button'; button.className=`ed-u-item${selected?' selected':''}`;
    button.innerHTML=`<div class="ed-u-emoji" style="color:${rarityColor(item)}">${item?.emoji||'❔'}</div><div class="ed-u-price">${money(item?.price).toLocaleString('ru-RU')}₽</div>${selected?'<span class="ed-u-check">✓</span>':''}`;
    button.onclick=handler; return button;
  }

  function render(){
    const invEl=document.getElementById('edUInventory'),targetsEl=document.getElementById('edUTargets'); if(!invEl||!targetsEl)return;
    invEl.replaceChildren(); const inv=inventory();
    if(!inv.length){const empty=document.createElement('div');empty.className='ed-u-empty';empty.innerHTML='Инвентарь пуст<br><small>Откройте кейс, чтобы получить предметы</small>';invEl.appendChild(empty)}
    else inv.forEach((item,index)=>invEl.appendChild(card(item,state.selected.includes(item),()=>{
      if(state.busy)return; const pos=state.selected.indexOf(item); if(pos>=0)state.selected.splice(pos,1); else if(state.selected.length<6)state.selected.push(item); render();
    })));
    targetsEl.replaceChildren(); uniqueTargets().forEach(item=>targetsEl.appendChild(card(item,state.target===item,()=>{if(!state.busy){state.target=item;state.preset=null;render()}})));
    const total=sourceValue(),target=targetValue(),ch=chance();
    document.getElementById('edUCount').textContent=`${state.selected.length}/6`;
    document.getElementById('edUMult').textContent=total&&target?`${(target/Math.max(total,1)).toFixed(2)}x`:'1.00x';
    document.getElementById('edUChance').textContent=ch?`Шанс ${ch.toFixed(1)}%`:'Выберите цель';
    const selected=document.getElementById('edUSelected');
    selected.innerHTML=state.target?`<div class="ed-u-selected-chip" style="color:${rarityColor(state.target)}">${state.target.emoji}</div><div><strong>${money(state.target.price).toLocaleString('ru-RU')}₽</strong><br><small>${state.target.rarity||'Предмет'}</small></div>`:'Выберите предмет из списка';
    document.querySelectorAll('#edUMults [data-mult],#edUChances [data-chance]').forEach(button=>button.classList.toggle('active',state.preset&&Number(button.dataset.mult||button.dataset.chance)===state.preset.value));
    document.getElementById('edUStart').disabled=state.busy||!state.selected.length||!state.target||!ch||target<=total;
  }

  function open(){
    if(!currentUser()){if(typeof openAuth==='function')openAuth('login');return}
    inject(); Object.assign(state,{selected:[],target:null,preset:null,busy:false,opened:true});
    const overlay=document.getElementById('edUpgrade2'); overlay.classList.remove('closing'); overlay.classList.add('open'); render();
  }
  function close(){
    if(state.busy)return;
    const overlay=document.getElementById('edUpgrade2'); if(!overlay)return; overlay.classList.add('closing'); setTimeout(()=>{overlay.classList.remove('open','closing');state.opened=false},160);
  }

  async function run(){
    if(state.busy||!state.selected.length||!state.target||!currentUser())return;
    const total=sourceValue(),target=targetValue(),ch=chance();
    if(target<=total){showResult(false,'Целевой предмет должен быть дороже выбранных предметов');return}
    state.busy=true; render();
    const wheel=document.getElementById('edUWheel'); wheel.classList.add('spinning');
    const turns=1080+Math.random()*360; wheel.style.transform=`rotate(${turns}deg)`;
    await new Promise(resolve=>setTimeout(resolve,1900));
    const success=Math.random()*100<ch; wheel.classList.remove('spinning'); wheel.style.transform='rotate(0deg)';
    const u=currentUser(),inv=Array.isArray(u.inventory)?u.inventory:[],selectedSet=new Set(state.selected);
    u.inventory=inv.filter(item=>!selectedSet.has(item));
    if(success){u.inventory.push({...state.target}); if(window.state?.stats)window.state.stats.upgrades=(window.state.stats.upgrades||0)+1; showResult(true,`Получен ${state.target.emoji} · ${money(state.target.price).toLocaleString('ru-RU')}₽`)}
    else showResult(false,'Апгрейд не удался');
    if(typeof saveStats==='function')saveStats(); if(typeof saveUsers==='function')saveUsers(); if(typeof renderInventory==='function')renderInventory();
    state.selected=[]; state.busy=false; render();
  }
  function showResult(success,text){const el=document.getElementById('edUResult');if(!el)return;el.className=`ed-u-result ${success?'success':'fail'}`;el.innerHTML=`<strong>${success?'✓ УСПЕШНЫЙ АПГРЕЙД':'✕ НЕ УДАЛОСЬ'}</strong><br>${text}`}

  window.openUpgradeMenu=open; window.closeUpgradeMenu=close; window.startUpgrade=run; window.closeUpgradeResult=close;
})();
