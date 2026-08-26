(() => {
  'use strict';
  const prices={smile:120,moves:85,nature:60,food:40,animals:25,transport:15,sport:250,games:500};
  function sync(){
    if(window.casePrices) Object.assign(window.casePrices,prices);
    document.querySelectorAll('.case').forEach(card=>{
      const id=card.dataset.case||card.querySelector('.case-name')?.textContent.trim().toLowerCase();
      const value=prices[id];
      if(value==null)return;
      const old=card.querySelector('.old-price');
      if(old)old.style.display='none';
      const current=card.querySelector('.new-price');
      if(current)current.textContent=`${value}₽`;
    });
    const id=window.state?.selectedCase;
    const sub=document.querySelector('.open-buttons .main-btn .btn-subtext');
    if(sub&&prices[id]!=null)sub.textContent=`${prices[id]*(window.state?.openAmount||1)}₽`;
  }
  sync();setTimeout(sync,200);setTimeout(sync,800);
})();
