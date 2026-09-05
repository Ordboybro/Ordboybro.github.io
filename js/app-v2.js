(()=>{'use strict';
/* Single runtime entrypoint. The legacy file name is kept so index.html stays stable. */
const s=document.createElement('script');
s.src='js/functional-final.js?v=stable-functional';
s.async=false;
s.onerror=()=>console.error('Emoji Drops runtime failed to load');
document.body.appendChild(s);
})();