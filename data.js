/* Emoji Drops — synchronous dataset bootstrap. */
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
  /* Load the canonical dataset exactly once while the HTML parser is active. */
  document.write('<scr'+'ipt src="js/data.js?v=data-sync-4"><\/scr'+'ipt>');
})();
