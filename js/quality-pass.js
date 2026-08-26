(() => {
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const normalize = p => (p || location.pathname).replace(/\/+$/,'') || '/';
  const go = path => {
    const target = path.startsWith('/') ? path : `/${path}`;
    if (window.EmojiDropsRouter?.navigate) return window.EmojiDropsRouter.navigate(target);
    history.pushState({},'',target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  function caseId(card){
    return card.dataset.case || card.querySelector('.case-name')?.textContent.trim().toLowerCase().replace(/\s+/g,'');
  }

  function repairCaseCards(){
    $$('.case').forEach(card=>{
      const id = caseId(card);
      if (id) card.dataset.case = id;
      card.removeAttribute('onclick');
      card.addEventListener('click', e=>{
        if (e.target.closest('button,input,a')) return;
        e.preventDefault();
        e.stopPropagation();
        if (id) go(`/case/${encodeURIComponent(id)}`);
      }, {capture:false});
    });
  }

  function repairProfileActions(){
    const actions = $('.ed-profile-actions');
    if (!actions) return;
    const wanted = ['/upgrade','/profile/statistics','/profile/history'];
    wanted.forEach(path=>{
      const el = $(`[data-route="${path}"]`,actions);
      if (el) actions.appendChild(el);
    });
    const exit = $('.danger',actions);
    if (exit) actions.appendChild(exit);
  }

  function repairSearch(){
    const input=$('#searchInput');
    if(!input) return;
    input.value='';
    ['autocomplete','autocorrect','autocapitalize','spellcheck'].forEach(a=>input.setAttribute(a,a==='spellcheck'?'false':'off'));
    input.name='emoji_case_search';
    input.type='search';
  }

  function enforceCaseScreen(){
    if(!normalize().startsWith('/case/')) return;
    const id=decodeURIComponent(normalize().split('/').pop()||'');
    const page=$('#openPage'), main=$('body > main'), grid=$('main > .cases');
    document.body.classList.add('case-route');
    if(main) main.style.display='block';
    if(grid) grid.style.display='none';
    if(page) page.style.display='flex';
    if(window.state?.selectedCase !== id && typeof window.openCasePage==='function') {
      try { window.openCasePage(id); } catch {}
    }
    if(page) page.style.display='flex';
  }

  function cleanHome(){
    if(normalize().startsWith('/case/')) return;
    if(normalize()==='/' || normalize()==='/cases'){
      document.body.classList.remove('case-route');
      const page=$('#openPage'),grid=$('main > .cases');
      if(page) page.style.display='none';
      if(grid) grid.style.display='';
    }
  }

  function init(){
    repairCaseCards();
    repairProfileActions();
    repairSearch();
    enforceCaseScreen();
    cleanHome();
    document.addEventListener('click', e=>{
      const card=e.target.closest('.case');
      if(!card||e.target.closest('button,input,a')) return;
      const id=caseId(card);
      if(!id) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      go(`/case/${encodeURIComponent(id)}`);
    }, true);
    window.addEventListener('popstate',()=>setTimeout(()=>{enforceCaseScreen();cleanHome();},0));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,300);
  setTimeout(init,900);
})();
