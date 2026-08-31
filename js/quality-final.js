(()=>{'use strict';
/* Emoji Drops — final QA layer. Non-invasive: fixes accessibility, mobile edge cases and UI consistency after all existing layers. */
if(window.__edQualityFinal)return;window.__edQualityFinal=true;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();

function css(){
 if($('#ed-quality-style'))return;
 const s=document.createElement('style');s.id='ed-quality-style';s.textContent=`
 html,body{max-width:100%;overflow-x:hidden}
 button,input{touch-action:manipulation}
 button:focus-visible,input:focus-visible{outline:2px solid #ff9a2e;outline-offset:2px}
 input::placeholder{color:#777}
 .modal.show{overscroll-behavior:contain}
 .panel{overscroll-behavior:contain;scrollbar-gutter:stable}
 .case-card,.live-drop,.inventory-item,.upgrade-item,.stat,.profile-stat{contain:layout paint}
 @media(max-width:700px){button,.profile-btn,.primary,.secondary,.reward-btn{min-height:44px}.case-card{touch-action:manipulation}.panel{max-height:calc(100dvh - 20px)}}
 @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
 `;document.head.appendChild(s);
}

function removeSearch(){
 // Search was intentionally removed from the product UI. Clean up any stale control
 // left by an older runtime layer without touching legitimate text inputs in auth/settings.
 $$('input[type="search"],#searchInput,.search,.search-box,.case-search').forEach(el=>{
   if(el.matches('input[type="search"],#searchInput')||el.querySelector('input[type="search"]'))el.remove();
   else if(el.classList.contains('search')||el.classList.contains('search-box')||el.classList.contains('case-search'))el.remove();
 });
}

function accessibility(){
 $$('button').forEach((b,i)=>{
   if(!b.getAttribute('type'))b.type='button';
   if(!b.getAttribute('aria-label')&&!b.textContent.trim())b.setAttribute('aria-label','Кнопка');
 });
 $$('input').forEach(i=>{
   if(!i.getAttribute('autocomplete')){
     const type=(i.getAttribute('type')||'text').toLowerCase();
     i.setAttribute('autocomplete',type==='email'?'email':type==='password'?'current-password':'off');
   }
 });
 const main=$('main');if(main&&!main.getAttribute('aria-label'))main.setAttribute('aria-label','Emoji Drops');
}

function modalUX(){
 const lock=()=>document.body.classList.toggle('modal-lock',!!$('.modal.show'));
 const observer=new MutationObserver(lock);
 observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('keydown',e=>{
   if(e.key!=='Escape')return;
   const opened=$$('.modal.show');
   const modal=opened[opened.length-1];
   if(!modal)return;
   const close=modal.querySelector('.close,.close-any,[data-close]');
   if(close)close.click();
   else modal.classList.remove('show');
 });
 $$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m){const c=m.querySelector('.close,.close-any,[data-close]');if(c)c.click();}}));
 lock();
}

function staleUI(){
 // Prevent impossible duplicate reward buttons and stale labels introduced by old layers.
 const seen=new Set();
 $$('[id]').forEach(el=>{const id=el.id;if(!id)return;if(seen.has(id))el.remove();else seen.add(id)});
 const balance=$('#balance');if(balance)balance.setAttribute('aria-live','polite');
 const online=$('#onlineCount');if(online)online.setAttribute('aria-live','polite');
}

function safeImage(){
 $$('img').forEach(img=>{if(!img.hasAttribute('decoding'))img.decoding='async';if(!img.hasAttribute('draggable'))img.draggable=false;});
}

ready(()=>{css();removeSearch();accessibility();modalUX();staleUI();safeImage();
 // Re-apply harmless UI QA after existing runtime layers finish their first render.
 setTimeout(()=>{removeSearch();accessibility();safeImage();},50);
});
})();
