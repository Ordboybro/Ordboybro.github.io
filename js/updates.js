(()=>{
  const order={common:1,rare:2,epic:3,mythical:4,legendary:5};
  const colors={common:'#808080',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ffd000'};
  const num=v=>Number(String(v??'').replace(/[^0-9.]/g,''))||0;
  function bestFromInventory(){
    if(!window.state?.currentUser?.inventory?.length)return null;
    return [...state.currentUser.inventory].sort((a,b)=>(order[b.rarity]-order[a.rarity])||(num(b.price)-num(a.price)))[0];
  }
  function persistBest(){
    if(!window.state?.currentUser)return;
    const candidate=bestFromInventory();
    const saved=state.currentUser.bestDrop;
    if(candidate && (!saved || order[candidate.rarity]>order[saved.rarity] || (order[candidate.rarity]===order[saved.rarity]&&num(candidate.price)>num(saved.price)))){
      state.currentUser.bestDrop={emoji:candidate.emoji,rarity:candidate.rarity,price:candidate.price};
      if(typeof saveUsers==='function')saveUsers();
    }
    const best=state.currentUser.bestDrop;
    const e=document.getElementById('bestDropEmoji'),r=document.getElementById('bestDropRarity');
    if(!e||!r)return;
    if(!best){e.textContent='🏆';r.textContent='Нет дропа';e.style.borderColor='#ff7b00';r.style.color='#ff7b00';return}
    const c=colors[best.rarity]||'#ff7b00';e.textContent=best.emoji;r.textContent=String(best.rarity).toUpperCase();e.style.borderColor=c;r.style.color=c;
  }
  window.openSettings=()=>{const p=document.getElementById('settingsPage');if(p)p.style.display='flex'};
  window.closeSettings=()=>{const p=document.getElementById('settingsPage');if(p)p.style.display='none'};
  window.openStats=()=>{const p=document.getElementById('statsPage');if(!p)return;if(typeof updateStatsUI==='function')updateStatsUI();p.style.display='flex'};
  window.closeStats=()=>{const p=document.getElementById('statsPage');if(p)p.style.display='none'};
  document.addEventListener('DOMContentLoaded',()=>{
    const c=document.getElementById('liveContainer');
    if(c){const remove=c.removeChild.bind(c);c.removeChild=node=>{if(c.children.length>25)return remove(node);};}
    persistBest();setInterval(persistBest,500);
  });
})();
