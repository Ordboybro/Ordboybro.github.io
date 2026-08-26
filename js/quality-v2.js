(() => {
  'use strict';
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const reduced=()=>matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const money=v=>Number(String(v??0).replace(/[^0-9.]/g,''))||0;
  let opening=false;

  function clearSearch(){const input=document.getElementById('searchInput');if(input){input.value='';input.setAttribute('value','');input.autocomplete='off';}}
  addEventListener('pageshow',clearSearch);addEventListener('load',clearSearch);document.addEventListener('DOMContentLoaded',clearSearch,{once:true});

  function itemWidth(track){return track?.firstElementChild?.getBoundingClientRect().width||160}
  function centerTrack(roulette,track,winIndex){
    const width=itemWidth(track), viewport=roulette.getBoundingClientRect().width||960;
    return -(winIndex*width)+(viewport-width)/2;
  }
  function pick(items){return typeof window.getRandomByChance==='function'?window.getRandomByChance(items):items[Math.floor(Math.random()*items.length)]}
  function build(track,items,winner,seed){
    const winIndex=36+(seed%4);track.replaceChildren();
    for(let i=0;i<58;i++){
      const it=i===winIndex?winner:pick(items);const el=document.createElement('div');
      el.className='item';el.dataset.rarity=it?.rarity||'';el.textContent=it?.emoji||'❔';
      if(i===winIndex)el.classList.add('winning-slot');track.appendChild(el);
    }
    return winIndex;
  }
  async function spin(roulette,winner,index){
    const track=roulette?.querySelector('.multi-track');const items=window.state?.currentCase;
    if(!track||!roulette||!items?.length)return;
    const winIndex=build(track,items,winner,index);track.style.transition='none';track.style.transform='translate3d(0,0,0)';track.getBoundingClientRect();
    const distance=centerTrack(roulette,track,winIndex);
    if(reduced()){track.style.transform=`translate3d(${distance}px,0,0)`;return;}
    const duration=3100+index*90;track.style.willChange='transform';
    track.style.transition=`transform ${duration}ms cubic-bezier(.07,.86,.16,1)`;
    requestAnimationFrame(()=>track.style.transform=`translate3d(${distance}px,0,0)`);
    await sleep(duration+90);track.style.willChange='auto';
  }
  async function openCaseV2(count=window.state?.openAmount||1){
    const s=window.state;if(opening||s?.isSpinning||!s?.selectedCase||!s?.currentCase?.length)return;
    if(!s.currentUser)return window.openAuth?.('login');
    const price=(window.casePrices?.[s.selectedCase]||0)*count;if((s.balance||0)<price)return alert('Недостаточно средств');
    opening=true;s.isSpinning=true;document.body.classList.add('ed-opening');
    const btn=document.querySelector('.open-buttons .main-btn');if(btn){btn.disabled=true;btn.classList.add('is-opening');}
    const wins=Array.from({length:count},()=>pick(s.currentCase)).filter(Boolean);
    const roulettes=[...document.querySelectorAll('.multi-roulette')];
    try{
      await Promise.all(wins.map((win,i)=>spin(roulettes[i],win,i)));
      s.currentUser.balance=Math.max(0,money(s.currentUser.balance)-price);s.balance=s.currentUser.balance;s.currentUser.inventory||=[];
      wins.forEach(it=>s.currentUser.inventory.push({...it}));s.stats.opened=(s.stats.opened||0)+wins.length;
      if(typeof window.saveUsers==='function')window.saveUsers();if(typeof window.saveStats==='function')window.saveStats();window.updateBalanceUI?.();window.renderInventory?.();
      wins.forEach(it=>window.addLiveDrop?.(s.currentUser.nickname||'Player',it));
      s.winQueue=wins.slice();await sleep(reduced()?0:180);window.showNextWin?.();
    }catch(err){console.error('EmojiDrops opening failed',err);alert('Не удалось открыть кейс. Попробуйте ещё раз.');}
    finally{s.isSpinning=false;opening=false;document.body.classList.remove('ed-opening');if(btn){btn.disabled=false;btn.classList.remove('is-opening');}}
  }

  function improveLiveDrops(){
    const original=window.createLiveDrop;if(typeof original!=='function'||original.__v2)return;
    window.createLiveDrop=function(){
      const c=document.getElementById('liveContainer');const before=c?new Map([...c.children].map(el=>[el,el.getBoundingClientRect()])):null;
      const out=original.apply(this,arguments);if(!c)return out;
      const newest=c.firstElementChild;if(newest){newest.classList.remove('ed-live-enter');void newest.offsetWidth;newest.classList.add('ed-live-enter');}
      requestAnimationFrame(()=>[...c.children].forEach(el=>{const old=before?.get(el);if(!old||!el.animate)return;const now=el.getBoundingClientRect(),dx=old.left-now.left,dy=old.top-now.top;if(dx||dy)el.animate([{transform:`translate3d(${dx}px,${dy}px,0)`},{transform:'translate3d(0,0,0)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});}));return out;
    };window.createLiveDrop.__v2=true;
  }
  function routeSafety(){
    document.addEventListener('click',e=>{const c=e.target.closest('.case');if(!c)return;const id=c.dataset.case||c.querySelector('.case-name')?.textContent?.trim().toLowerCase();if(id&&window.cases?.[id]){e.preventDefault();e.stopImmediatePropagation();window.EmojiDropsRouter?.navigate(`/case/${encodeURIComponent(id)}`);}},true);
  }
  function upgradeFeedback(){
    const observer=new MutationObserver(()=>{const result=document.getElementById('edUResult');if(!result||result.dataset.fx==='1'||!result.classList.contains('success')&&!result.classList.contains('fail'))return;result.dataset.fx='1';result.animate([{opacity:0,transform:'translateY(10px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)'});});
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  }
  function install(){improveLiveDrops();window.openCase=openCaseV2;routeSafety();upgradeFeedback();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
