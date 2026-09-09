/* Emoji Drops — synchronous dataset bootstrap.
   index.html loads this file before the main runtime. Define the legacy
   dependency first, then synchronously include the canonical dataset so
   app-v2.js can never race it on a cold load or slow mobile connection. */
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
  /* document.write is intentional here: this script executes while the HTML
     parser is processing index.html, so the canonical dataset is evaluated
     before the following app-v2 script. */
  document.write('<script src="js/data.js?v=data-sync-3"><\\/script>');
})();
