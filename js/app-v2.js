(()=>{'use strict';
const current=document.currentScript;
const addScript=(src)=>{const s=document.createElement('script');s.src=src;s.async=false;if(current?.parentNode)current.parentNode.insertBefore(s,current.nextSibling);else document.body.appendChild(s);return s};
const addStyle=(href)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
addStyle('css/final-polish.css');
addScript('js/final-content-polish.js');
addScript('js/app-v2-core.js');
/* Data bridge -> functional repair -> legacy-economy reconciliation. */
setTimeout(()=>addScript('js/emoji-drops-bridge.js'),0);
setTimeout(()=>addScript('js/emoji-drops-repair.js'),60);
setTimeout(()=>addScript('js/emoji-drops-post-repair.js'),180);
})();