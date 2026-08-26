(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const money=v=>Math.round(Number(String(v??0).replace(/[^0-9.,-]/g,'').replace(',','.'))||0);
  const rarityColor=i=>window.rarities?.[i?.rarity]?.color||'#ff7b00';

  function hideSearch(){const el=$('.search-wrap');if(el)el.remove();}

  function syncOpenBalance(){const e=$('#openBalance');if(e)e.textContent=String(money(window.state?.balance));}

  function caseHeader(){
    const h=$('#openPage .open-header'); if(!h)return;
    let b=$('#openBalance');
    if(!b){const x=document.createElement('div');x.className='open-balance';x.innerHTML='💰 <span id="openBalance">0</span>₽';h.insertBefore(x,h.querySelector('.back-btn'));b=x.querySelector('#openBalance')}
    syncOpenBalance();
  }

  function forceRoulettes(){
    const c=$('#multiRouletteContainer');if(!c)return;
    const amount=Math.max(1,Math.min(10,Number(window.state?.openAmount)||1));
    const lanes=[...c.children];
    if(lanes.length===amount)return;
    c.innerHTML='';
    const pool=window.state?.currentCase||[];
    for(let n=0;n<amount;n++){
      const lane=document.createElement('div');lane.className='multi-roulette';lane.dataset.lane=n;
      const pointer=document.createElement('div');pointer.className='new-pointer';pointer.setAttribute('aria-hidden','true');
      const track=document.createElement('div');track.className='multi-track';
      for(let k=0;k<50;k++){const item=window.getRandomByChance?.(pool)||pool[k%Math.max(pool.length,1)]||{};const el=document.createElement('div');el.className='item';el.textContent=item.emoji||'❔';el.style.borderColor=rarityColor(item);track.appendChild(el)}
      lane.append(pointer,track);c.appendChild(lane);
    }
  }

  function renderCaseItemsFallback(){
    const box=$('#caseItemsList'),items=window.state?.currentCase||[];if(!box||!items.length)return;
    if(box.children.length===items.length)return;
    box.innerHTML='';
    items.forEach(item=>{const d=document.createElement('div');d.className='case-item-card';d.innerHTML=`<div class="case-item-emoji" style="border-color:${rarityColor(item)}">${item.emoji||'❔'}</div><div class="case-item-rarity" style="color:${rarityColor(item)}">${String(item.rarity||'common').toUpperCase()}</div><div class="case-item-price">${item.price||'0₽'}</div>`;box.appendChild(d)});
  }

  function ensureLive(){
    const c=$('#liveContainer');if(!c)return;
    if(c.children.length>=8)return;
    const pool=Object.values(window.cases||{}).flatMap(x=>Array.isArray(x)?x:[]);if(!pool.length)return;
    const names=['Shadow','Blaze','Ghost','Nova','Orion','Razor','Hunter','Pixel','Cyber','Storm'];
    for(let i=0;i<12;i++){
      const item=pool[Math.floor(Math.random()*pool.length)];
      const d=document.createElement('div');d.className=`live-drop ${item.rarity||''}`;d.style.borderColor=rarityColor(item);d.innerHTML=`<div class="live-emoji">${item.emoji||'❔'}</div><div class="live-info"><div class="live-user">${names[Math.floor(Math.random()*names.length)]}</div><div class="live-rarity" style="color:${rarityColor(item)}">${String(item.rarity||'common').toUpperCase()}</div></div>`;c.appendChild(d);
    }
  }

  function bind(){
    hideSearch();caseHeader();syncOpenBalance();forceRoulettes();renderCaseItemsFallback();ensureLive();
    const c=$('#liveContainer');if(c&&!c.dataset.edTimer){c.dataset.edTimer='1';setInterval(()=>{const pool=Object.values(window.cases||{}).flatMap(x=>Array.isArray(x)?x:[]);if(!pool.length)return;const item=pool[Math.floor(Math.random()*pool.length)],d=document.createElement('div');d.className=`live-drop ${item.rarity||''}`;d.style.borderColor=rarityColor(item);d.innerHTML=`<div class="live-emoji">${item.emoji||'❔'}</div><div class="live-info"><div class="live-user">Live Player</div><div class="live-rarity">${String(item.rarity||'common').toUpperCase()}</div></div>`;c.prepend(d);while(c.children.length>24)c.lastElementChild.remove()},1800)}
    const obs=new MutationObserver(()=>{hideSearch();caseHeader();syncOpenBalance()});obs.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,100));else setTimeout(bind,100);
})();