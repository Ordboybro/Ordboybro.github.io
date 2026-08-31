(()=>{'use strict';
/* Final repair layer: loaded after app-v2-core. It fixes economy, flags, auth, selling, and upgrade UX without replacing the existing case reel. */
const R={common:'#9ca3af',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ff8a00'};
const LABEL={common:'COMMON',rare:'RARE',epic:'EPIC',mythical:'MYTHICAL',legendary:'LEGENDARY'};
const rarityOrder=['common','rare','epic','mythical','legendary'];
const CASE_PRICES={transport:25,animals:40,food:60,nature:85,moves:110,smile:145,sport:190,games:250,space:225,flags:275};
const ITEM_MULT={common:.40,rare:.78,epic:1.35,mythical:3.0,legendary:7.0};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clone=x=>x?JSON.parse(JSON.stringify(x)):x;
const num=x=>Number(x?.value)||Number(String(x?.price??0).replace(/[^0-9.]/g,''))||0;
const money=n=>`${Math.round(Number(n)||0)}₽`;
const users=()=>{try{return JSON.parse(localStorage.getItem('users')||'[]')}catch{return[]}};
const saveUsers=a=>localStorage.setItem('users',JSON.stringify(a));
const currentEmail=()=>localStorage.getItem('currentUser');
const getUser=()=>users().find(u=>u.email===currentEmail())||null;
const saveUser=u=>{const a=users(),i=a.findIndex(x=>x.email===u.email);if(i>=0)a[i]=u;else a.push(u);saveUsers(a)};
function ensure(u){u.stats||={opened:0,upgrades:0,spent:0,received:0};u.inventory=Array.isArray(u.inventory)?u.inventory:[];u.balance=Number.isFinite(Number(u.balance))?Number(u.balance):250;u.bestDrop??=null;return u}
function normalizeEmail(v){return String(v||'').trim().toLowerCase()}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v)}
function calibrateEconomy(){
  const C=window.cases||{};const P=window.casePrices||{};
  /* Replace Ocean with Flags and keep the catalogue deterministic. */
  delete C.ocean;delete P.ocean;
  C.flags=[
    ['🇷🇺','common'],['🇺🇸','common'],['🇬🇧','common'],['🇩🇪','common'],['🇫🇷','common'],['🇮🇹','common'],['🇪🇸','common'],['🇯🇵','common'],
    ['🇨🇦','rare'],['🇦🇺','rare'],['🇧🇷','rare'],['🇰🇷','rare'],['🇮🇳','rare'],
    ['🇳🇴','epic'],['🇨🇭','epic'],['🇸🇪','epic'],['🇦🇷','epic'],
    ['🇮🇸','mythical'],['🇳🇿','mythical'],['🇬🇷','mythical'],
    ['🏳️‍🌈','legendary'],['🏴‍☠️','legendary'],['🏳️','legendary']
  ].map(([emoji,rarity])=>({emoji,rarity,price:'1₽'}));
  Object.assign(P,CASE_PRICES);
  Object.keys(C).forEach(id=>{
    if(!P[id])P[id]=CASE_PRICES[id]||100;
    const items=C[id];if(!Array.isArray(items)||!items.length)return;
    const groups={common:[],rare:[],epic:[],mythical:[],legendary:[]};
    items.forEach((it,i)=>{it.rarity=groups[it.rarity]?it.rarity:'common';groups[it.rarity].push({it,i})});
    rarityOrder.forEach(r=>{
      const g=groups[r];if(!g.length)return;
      const base=P[id]*ITEM_MULT[r];
      g.forEach((x,j)=>{
        const spread=g.length===1?1:(.78+.44*j/(g.length-1));
        x.it.price=money(Math.max(1,base*spread));
        x.it.value=Number(String(x.it.price).replace(/[^0-9.]/g,''));
        x.it.caseId=id;
      });
    });
  });
  /* A legendary drop must never be worth less than its own case. */
  Object.keys(C).forEach(id=>{const p=P[id]||0;(C[id]||[]).forEach(it=>{if(it.rarity==='legendary'&&num(it)<=p){it.price=money(Math.ceil(p*5.5));it.value=num(it)}})});
  window.ED_CASE_META=Object.assign(window.ED_CASE_META||{},{flags:{name:'Флаги',icon:'🌍'}});
}
function caseIcon(id){return id==='flags'?'🌍':({transport:'🚗',animals:'🐶',food:'🍔',nature:'🌿',moves:'🕺',smile:'😀',sport:'⚽',games:'🎮',space:'🌌'}[id]||'📦')}
function decorateCases(){
  $$('#cases .case-tile').forEach(tile=>{const b=$('.case-card',tile);if(!b)return;const id=b.dataset.case;if(id==='flags'){$('.case-art',b).textContent='🌍';$('.case-name',b).textContent='Флаги'}else if(id==='space'){$('.case-name',b).textContent='Космос'};$('.case-art',b).textContent=caseIcon(id)});
}
function syncBest(){
  const u=getUser();if(!u)return;ensure(u);
  const best=u.inventory.slice().sort((a,b)=>(rarityOrder.indexOf(b.rarity)-rarityOrder.indexOf(a.rarity))||(num(b)-num(a)))[0]||null;
  u.bestDrop=clone(best);saveUser(u);window.profileSync?.();
}
function fixSell(){
  if(document.body.dataset.edRepairSell)return;document.body.dataset.edRepairSell='1';
  document.addEventListener('click',e=>{const btn=e.target.closest('[data-sell]');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();
    const u=getUser();if(!u)return;ensure(u);const i=Number(btn.dataset.sell),it=u.inventory[i];if(!it)return;
    u.balance+=num(it);u.inventory.splice(i,1);/* Selling is a cash recovery, not a second drop/win. */
    u.bestDrop=u.inventory.slice().sort((a,b)=>(rarityOrder.indexOf(b.rarity)-rarityOrder.indexOf(a.rarity))||(num(b)-num(a)))[0]||null;
    saveUser(u);window.renderAll?.();window.profileSync?.();
  },true);
}
function fixAuth(){
  const old=window.submitAuth;
  window.submitAuth=function(){
    const e=normalizeEmail($('#authEmail')?.value),p=$('#authPassword')?.value||'';
    if(!validEmail(e))return alert('Введите корректную почту. Яндекс: @yandex.ru и @ya.ru тоже поддерживаются.');
    if(p.length<6)return alert('Пароль должен быть не короче 6 символов.');
    const a=users(),existing=a.find(u=>normalizeEmail(u.email)===e);
    if(existing){if(existing.password!==p)return alert('Неверный пароль.');localStorage.setItem('currentUser',existing.email);}
    else{const u={email:e,password:p,nickname:'Ord_'+Math.floor(Math.random()*9000+1000),balance:250,inventory:[],stats:{opened:0,upgrades:0,spent:0,received:0},bestDrop:null,rewardState:{uses:0,resetAt:0}};a.push(u);saveUsers(a);localStorage.setItem('currentUser',e)}
    $('#authModal')?.classList.remove('show');document.body.classList.remove('modal-lock');window.renderAll?.();window.profileSync?.();
  };
  /* Avoid old inline handlers winning over the fixed function. */
  const f=$('#authModal .primary');if(f)f.onclick=e=>{e.preventDefault();window.submitAuth()};
  if(!old)window.submitAuth=window.submitAuth;
}
function closeUpgrade(){const m=$('#upgradeModal');m?.classList.remove('show');m?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-lock')}
function openUpgrade(){
  const u=getUser();if(!u){window.openAuth?.();return}ensure(u);let m=$('#upgradeModal');if(!m)return;renderUpgrade();m.classList.add('show');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-lock')
}
function renderUpgrade(){
  const u=getUser();if(!u)return;ensure(u);const body=$('#upgradeModal .panel-body');if(!body)return;
  const src=u.inventory[window.__edUpSrc??-1],target=window.__edUpTarget||null,mult=Number(window.__edUpMult||2);
  const targets=src?Object.values(window.cases||{}).flat().filter(x=>num(x)>=num(src)*mult).sort((a,b)=>num(a)-num(b)).slice(0,60):[];
  const chance=src&&target?Math.round(100/mult):0,deg=Math.max(18,chance*3.6);
  body.innerHTML=`<div class="upgrade-repair"><div class="ur-panel"><h3>ВАШ ПРЕДМЕТ</h3><div class="ur-slot">${src?`<div class="ur-emoji">${src.emoji}</div><b style="color:${R[src.rarity]}">${LABEL[src.rarity]}</b><strong>${money(num(src))}</strong>`:'<div class="ur-empty">📦<span>Выберите предмет</span></div>'}</div><div class="ur-items">${u.inventory.map((x,i)=>`<button class="ur-item ${i===(window.__edUpSrc??-1)?'active':''}" data-ursrc="${i}"><span>${x.emoji}</span><small>${money(num(x))}</small></button>`).join('')}</div></div><div class="ur-wheel-col"><div class="ur-pointer">▼</div><div class="ur-wheel-wrap"><div id="urWheel" class="ur-wheel" style="background:conic-gradient(from -90deg,#ff8a00 0deg ${deg}deg,#232323 ${deg}deg 360deg)"><div class="ur-center"><strong>${src?chance+'%':'?'}</strong><small>ШАНС</small></div></div></div><div class="ur-mults">${[1.5,2,3,5].map(x=>`<button data-urmult="${x}" class="${x===mult?'active':''}">×${x}</button>`).join('')}</div><div class="ur-hint">${src&&target?`${chance}% шанс`:'Выберите предмет и цель'}</div></div><div class="ur-panel"><h3>ЦЕЛЬ</h3><div class="ur-slot">${target?`<div class="ur-emoji">${target.emoji}</div><b style="color:${R[target.rarity]}">${LABEL[target.rarity]}</b><strong>${money(num(target))}</strong>`:'<div class="ur-empty">🎯<span>Выберите цель</span></div>'}</div><div class="ur-items">${targets.map((x)=>`<button class="ur-item ${target===x?'active':''}" data-urtarget="${Object.values(window.cases||{}).flat().indexOf(x)}"><span>${x.emoji}</span><small>${money(num(x))}</small></button>`).join('')}</div></div><button id="urGo" class="primary" ${src&&target?'':'disabled'}>🚀 Апгрейд</button></div>`;
  $$('[data-ursrc]',body).forEach(b=>b.onclick=()=>{window.__edUpSrc=Number(b.dataset.ursrc);window.__edUpTarget=null;renderUpgrade()});
  $$('[data-urmult]',body).forEach(b=>b.onclick=()=>{window.__edUpMult=Number(b.dataset.urmult);window.__edUpTarget=null;renderUpgrade()});
  $$('[data-urtarget]',body).forEach(b=>b.onclick=()=>{const all=Object.values(window.cases||{}).flat();window.__edUpTarget=all[Number(b.dataset.urtarget)]||null;renderUpgrade()});
  $('#urGo')?.addEventListener('click',runUpgrade);
}
function runUpgrade(){
  const u=getUser();if(!u)return;ensure(u);const i=Number(window.__edUpSrc),src=u.inventory[i],target=window.__edUpTarget,mult=Number(window.__edUpMult||2);if(!src||!target)return;if(num(target)<num(src)*mult)return alert('Цель слишком дешёвая.');
  const chance=Math.min(.95,1/mult),win=Math.random()<chance,wheel=$('#urWheel');if(!wheel)return;
  const deg=chance*360,center=deg/2,targetAngle=win?center:deg+(360-deg)/2,rotation=360*8-targetAngle;
  const go=$('#urGo');if(go)go.disabled=true;wheel.style.setProperty('--ur-rot',rotation+'deg');wheel.classList.add('spinning');wheel.style.transform=`rotate(${rotation}deg)`;
  setTimeout(()=>{const fresh=getUser();if(!fresh)return;ensure(fresh);const current=fresh.inventory[i];if(!current||num(current)!==num(src))return renderUpgrade();fresh.stats.upgrades++;
    if(win){fresh.inventory[i]=clone(target)}else{fresh.inventory.splice(i,1)}
    fresh.bestDrop=fresh.inventory.slice().sort((a,b)=>(rarityOrder.indexOf(b.rarity)-rarityOrder.indexOf(a.rarity))||(num(b)-num(a)))[0]||null;saveUser(fresh);window.__edUpSrc=null;window.__edUpTarget=null;window.profileSync?.();renderUpgrade();alert(win?`Успех! ${target.emoji} ${money(num(target))}`:'Неудача — предмет потерян.');},6200);
}
function fixUpgrade(){
  window.__edUpSrc=null;window.__edUpTarget=null;window.__edUpMult=2;
  const oldOpen=window.openUpgrade;window.openUpgrade=openUpgrade;window.doUpgrade=runUpgrade;
  document.addEventListener('click',e=>{if(e.target.closest('#upgradeBtn')){e.preventDefault();e.stopImmediatePropagation();closeProfile();openUpgrade();return}if(e.target.closest('#upgradeSubmit')){e.preventDefault();e.stopImmediatePropagation();runUpgrade()}},true);
  function closeProfile(){const m=$('#profileModal');m?.classList.remove('show');document.body.classList.remove('modal-lock')}
  const style=document.createElement('style');style.id='ed-repair-style';style.textContent=`
  .upgrade-repair{display:grid;grid-template-columns:minmax(0,1fr) 250px minmax(0,1fr);gap:22px;align-items:start}.ur-panel h3{margin:0 0 10px;font-size:15px;letter-spacing:.08em}.ur-slot{min-height:190px;border:1px solid #303030;border-radius:20px;background:linear-gradient(180deg,#181818,#101010);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}.ur-emoji{font-size:72px;line-height:1}.ur-slot strong{color:#ff9a2e;font-size:20px}.ur-empty{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:56px}.ur-empty span{font-size:13px;color:#777}.ur-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:8px;margin-top:10px;max-height:220px;overflow:auto}.ur-item{border:1px solid #333;background:#171717;border-radius:12px;padding:8px;text-align:center;transition:transform .28s cubic-bezier(.22,1,.36,1),border-color .28s,box-shadow .28s}.ur-item:hover{transform:translateY(-2px)}.ur-item.active{border-color:#ff7b00;box-shadow:0 0 0 2px #ff7b0022;background:#24170c}.ur-item span{display:block;font-size:28px}.ur-item small{color:#aaa;font-weight:800}.ur-wheel-col{display:flex;flex-direction:column;align-items:center;padding-top:24px}.ur-pointer{font-size:28px;color:#ffad4d;text-shadow:0 0 14px #ff7b00;line-height:1;margin-bottom:-5px;z-index:3}.ur-wheel-wrap{width:220px;height:220px;display:grid;place-items:center}.ur-wheel{width:210px;height:210px;border-radius:50%;border:7px solid #292929;box-shadow:0 0 0 2px #ff7b0030,0 0 38px #ff7b0030,inset 0 0 30px #000;position:relative;will-change:transform;transform:rotate(0deg);transition:transform 5.9s cubic-bezier(.08,.72,.06,1)}.ur-wheel:after{content:'';position:absolute;inset:14px;border-radius:50%;border:1px dashed #ffffff28}.ur-center{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:82px;height:82px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#101010;border:2px solid #ff9a2e;box-shadow:0 0 24px #ff7b0044;z-index:5}.ur-center strong{font-size:24px;color:#fff}.ur-center small{font-size:9px;color:#ff9a2e;letter-spacing:.14em;font-weight:900}.ur-mults{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:14px 0 8px}.ur-mults button{border:1px solid #333;background:#171717;border-radius:10px;padding:8px 12px;font-weight:900}.ur-mults button.active{border-color:#ff7b00;background:#26170c;color:#ff9d3d}.ur-hint{min-height:22px;color:#ff9d3d;font-weight:900}.upgrade-repair>.primary{grid-column:1/-1;width:min(100%,360px);justify-self:center;min-height:50px}@media(max-width:900px){.upgrade-repair{grid-template-columns:1fr}.ur-wheel-col{order:2}.ur-panel:last-of-type{order:3}.upgrade-repair>.primary{order:4}}@media(max-width:600px){.ur-wheel-wrap{width:190px;height:190px}.ur-wheel{width:180px;height:180px}.ur-slot{min-height:165px}.ur-emoji{font-size:62px}.upgrade-repair{gap:14px}}
  `;document.head.appendChild(style);void oldOpen;
}
function fixAnimations(){
  const style=document.createElement('style');style.id='ed-motion-repair';style.textContent=`
  .case-card,.primary,.secondary,.reel-fast,.amount,.profile-btn,.profile-top,.inventory-item,.upgrade-item,.ur-item{transition:transform .28s cubic-bezier(.22,1,.36,1),border-color .28s,box-shadow .28s,background-color .28s,opacity .28s!important}.primary:hover,.secondary:hover,.reel-fast:hover{transform:translateY(-2px)}.case-card:active,.primary:active,.secondary:active,.amount:active,.profile-btn:active{transform:scale(.985)}
  `;document.head.appendChild(style);
}
function install(){
  calibrateEconomy();
  if(window.renderAll){const old=window.renderAll;window.renderAll=function(){old();setTimeout(decorateCases,0)}}
  window.renderAll?.();decorateCases();fixSell();fixAuth();fixUpgrade();fixAnimations();
  /* Make the existing reel animation the single source of truth; only extend normal speed slightly. */
  const s=document.createElement('style');s.id='ed-reel-speed';s.textContent=`.case-reel-track{transition-timing-function:cubic-bezier(.06,.76,.05,1)!important}.case-reel{contain:layout paint}`;document.head.appendChild(s);
  /* Reconcile best drop after every opening, including older accounts created by previous versions. */
  setTimeout(syncBest,6500);setInterval(()=>{decorateCases()},2000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else setTimeout(install,0);
})();