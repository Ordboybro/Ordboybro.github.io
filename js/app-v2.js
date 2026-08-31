(()=>{'use strict';
/* One functional layer only. Visual design stays in index.html. */
const current=document.currentScript;
const addScript=(src)=>{const s=document.createElement('script');s.src=src;s.async=false;if(current?.parentNode)current.parentNode.insertBefore(s,current.nextSibling);else document.body.appendChild(s);return s};
const core=addScript('js/app-v2-core.js');
if(core)core.addEventListener('load',()=>{const final=addScript('js/emoji-drops-final.js');if(final)final.addEventListener('load',()=>addScript('js/economy-content.js'),{once:true})},{once:true});
else {const final=addScript('js/emoji-drops-final.js');if(final)final.addEventListener('load',()=>addScript('js/economy-content.js'),{once:true})}
})();