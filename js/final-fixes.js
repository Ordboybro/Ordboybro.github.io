(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const normalize=p=>(p||location.pathname).replace(/\/+$/,'')||'/';
  const casePath=id=>`/case/${encodeURIComponent(String(id).toLowerCase())}`;

  // Keep persisted best drop even after selling the item.
  const rarityOrder=Object.freeze({common:1,rare:2,epic:3,mythical:4,legendary:5});
  const rarityColors=Object.freeze({common:'#808080',rare:'#3b82f6',epic:'#a855f7',mythical:'#ef4444',legendary:'#ffd000'});
  window.renderPersistedBestDrop=()=>{const user=window.state?.currentUser;if(!user)return;let best=user.bestDrop||null;for(const item of user.inventory||[]){if(!item||!rarityOrder[item.rarity])continue;if(!best||rarityOrder[item.rarity]>rarityOrder[best.rarity]||(rarityOrder[item.rarity]===rarityOrder[best.rarity]&&Number(item.price)>Number(best.price)))best={...item};}if(best)user.bestDrop={...best};};

  function forceCaseRoute(id){
    if(!id)return;
    const path=casePath(id);
    if(normalize()!==path){
      if(window.EmojiDropsRouter?.navigate){window.EmojiDropsRouter.navigate(path);return;}
      history.pushState({},'',path);
    }
    const main=document.querySelector('body > main');
    const grid=main?.querySelector(':scope > .cases');
    const page=byId('openPage');
    if(main)main.style.display='block';
    if(grid)grid.style.display='none';
    document.body.classList.add('case-route');
    if(page)page.style.display='flex';
    if(typeof window.__edNativeCaseOpen==='function')window.__edNativeCaseOpen(id);
  }

  function patchCaseOpen(){
    if(!window.__edNativeCaseOpen&&typeof window.openCasePage==='function')window.__edNativeCaseOpen=window.openCasePage;
    if(!window.__edNativeCaseOpen)return false;
    window.openCasePage=function(id){
      if(!normalize().startsWith('/case/')){forceCaseRoute(id);return;}
      const grid=document.querySelector('main > .cases'),page=byId('openPage');
      if(grid)grid.style.display='none';
      if(page)page.style.display='flex';
      document.body.classList.add('case-route');
      return window.__edNativeCaseOpen.call(this,id);
    };
    return true;
  }

  function patchStats(){
    const original=window.openStats;
    if(typeof original!=='function'||original.__edPatched)return false;
    const wrapped=function(){const result=original.apply(this,arguments);const target=byId('statsBestDrop');const best=window.state?.currentUser?.bestDrop||window.state?.bestDrop;if(target)target.textContent=best?`${best.emoji||'🏆'} ${String(best.rarity||'drop').toUpperCase()} · ${best.price||''}`:'🏆 Нет дропа';return result;};
    wrapped.__edPatched=true;window.openStats=wrapped;return true;
  }

  // Intercept case cards before old inline onclick can open the panel below the home page.
  document.addEventListener('click',event=>{const card=event.target.closest('.case');if(!card||event.target.closest('button,input,a'))return;const id=card.getAttribute('data-case')||card.querySelector('.case-name')?.textContent?.trim().toLowerCase();if(!id)return;event.preventDefault();event.stopImmediatePropagation();forceCaseRoute(id);},true);
  document.addEventListener('click',event=>{const profile=event.target.closest('#profileBtn,.profile-box');if(!profile||!window.state?.currentUser)return;event.preventDefault();event.stopImmediatePropagation();window.EmojiDropsRouter?.navigate?.('/profile');},true);

  const timer=setInterval(()=>{const a=patchCaseOpen(),b=patchStats();if(a&&b)clearInterval(timer);},50);setTimeout(()=>clearInterval(timer),5000);
  window.addEventListener('popstate',()=>{if(normalize().startsWith('/case/'))setTimeout(()=>forceCaseRoute(normalize().split('/').pop()),0);});
})();