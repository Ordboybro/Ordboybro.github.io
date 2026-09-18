(()=>{'use strict';
/* Emoji Drops — compatibility bridge. Canonical case API is version 5; visual shells must not replace it. */
let installed=false;
function stabilizeTextWrites(){
  try{
    const d=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
    if(!d?.set||window.__emojiDropsTextContentStable)return;
    window.__emojiDropsTextContentStable=true;
    Object.defineProperty(Node.prototype,'textContent',{configurable:d.configurable,enumerable:d.enumerable,get:d.get,set(v){if(this.textContent===String(v??''))return;d.set.call(this,v)}});
  }catch{}
}
function install(){
  if(installed)return;
  installed=true;
  stabilizeTextWrites();
  let canonical=window.EmojiDropsCaseShowcaseExact;
  if(canonical&&typeof canonical.open==='function'&&canonical.version===5){
    window.__emojiDropsExactAuthoritativeApi=canonical;
    try{Object.defineProperty(window,'EmojiDropsCaseShowcaseExact',{configurable:true,enumerable:true,get:()=>canonical,set:value=>{if(value&&value.version===5)canonical=value}})}catch{}
  }
  /* Card activation is owned exclusively by emoji-drops-case-open-bridge. */
}
install();
})();
