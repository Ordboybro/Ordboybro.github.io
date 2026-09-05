(()=>{'use strict';
/* Single runtime entrypoint. Functional runtime loads first; hardening loads after it. */
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