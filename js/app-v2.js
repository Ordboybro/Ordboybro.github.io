(()=>{'use strict';
const current=document.currentScript;
const addScript=(src)=>{const s=document.createElement('script');s.src=src;s.async=false;if(current?.parentNode)current.parentNode.insertBefore(s,current.nextSibling);else document.body.appendChild(s);return s};
const addStyle=(href)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
addStyle('css/final-polish.css');
addScript('js/final-content-polish.js');
addScript('js/app-v2-core.js');
/* Load the repair layer only after the core has finished initializing. */
setTimeout(()=>addScript('js/emoji-drops-repair.js'),0);
})();