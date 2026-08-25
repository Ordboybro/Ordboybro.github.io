(() => {
  'use strict';
  const all = [];
  if (window.cases) Object.values(window.cases).forEach(items => items.forEach(item => all.push(item)));
  const names = ['Shadow','Blaze','Ghost','Orion','Nova','Razor','Pixel','Vortex','Flame','Cyber','Hunter','Matrix'];
  const live = document.getElementById('mLive');
  function add(){
    if (!live || !all.length) return;
    const item = all[Math.floor(Math.random()*all.length)];
    const el = document.createElement('div');
    el.className='m-drop';
    el.innerHTML=`<div class="emoji">${item.emoji}</div><div class="rarity" style="color:${window.rarities?.[item.rarity]?.color || '#ff8a2b'}">${item.rarity.toUpperCase()}</div>`;
    live.prepend(el);
    while(live.children.length>7) live.lastElementChild.remove();
  }
  for(let i=0;i<7;i++) add();
  setInterval(add, 1800);
  const balance = document.getElementById('mBalance');
  try { const users=JSON.parse(localStorage.getItem('users')||'[]'); const current=localStorage.getItem('currentUser'); const user=users.find(u=>u.email===current); if(user&&balance) balance.textContent=Number(user.balance||1000).toLocaleString('ru-RU'); } catch {}
})();
