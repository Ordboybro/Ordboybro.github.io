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
  document.write('<scr'+'ipt src="js/data.js?v=data-sync-5"><\/scr'+'ipt>');
  /* Export its classic-script lexical bindings into the explicit runtime namespace. */
  document.write('<scr'+'ipt src="js/emoji-drops-data-export.js?v=data-export-1"><\/scr'+'ipt>');
})();
