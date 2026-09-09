/* Emoji Drops compatibility bootstrap.
   index.html historically loads /data.js while the canonical dataset lives in /js/data.js.
   Keep this tiny shim so a missing path can never prevent the game dataset from booting. */
(function(){
  'use strict';
  if(typeof window.getUsers!=='function'){
    window.getUsers=function(){
      try{
        const raw=localStorage.getItem('users');
        const parsed=raw?JSON.parse(raw):[];
        return Array.isArray(parsed)?parsed:[];
      }catch(_){return []}
    };
  }
  const s=document.createElement('script');
  s.src='js/data.js?v=data-compat-1';
  s.async=false;
  s.onerror=function(){
    console.warn('Emoji Drops: canonical dataset failed to load; runtime fallback will be used.');
  };
  document.head.appendChild(s);
})();
