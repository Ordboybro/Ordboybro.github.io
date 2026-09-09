/* Emoji Drops compatibility bootstrap.
   The page loads /data.js; the canonical dataset lives in /js/data.js.
   This shim defines the tiny legacy dependency first, then uses document.write
   so the dataset is available before the main runtime starts. */
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
  document.write('<script src="js/data.js?v=data-compat-2"><\\/script>');
})();
