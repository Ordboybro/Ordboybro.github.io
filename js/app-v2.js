(()=>{'use strict';
/* Single runtime entrypoint. Visual polish loads first; functional runtime loads next; hardening loads last. */
const polish=document.createElement('link');
polish.rel='stylesheet';
polish.href='css/visual-polish.css?v=1';
document.head.appendChild(polish);

const runtime=document.createElement('script');
runtime.src='js/functional-final.js?v=stable-functional-2';
runtime.async=false;
runtime.onload=()=>{
  const hardening=document.createElement('script');
  hardening.src='js/runtime-hardening.js?v=1';
  hardening.async=false;
  hardening.onerror=()=>console.error('Emoji Drops hardening failed to load');
  document.body.appendChild(hardening);
};
runtime.onerror=()=>console.error('Emoji Drops runtime failed to load');
document.body.appendChild(runtime);
})();