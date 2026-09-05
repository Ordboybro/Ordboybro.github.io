(()=>{'use strict';
/* Single runtime entrypoint. Functional runtime loads first; hardening and focused case/upgrade polish load after it. */
const runtime=document.createElement('script');
runtime.src='js/functional-final.js?v=stable-functional-2';
runtime.async=false;
runtime.onload=()=>{
  const hardening=document.createElement('script');
  hardening.src='js/runtime-hardening.js?v=2';
  hardening.async=false;
  hardening.onload=()=>{
    const polish=document.createElement('script');
    polish.src='js/case-upgrade-polish.js?v=1';
    polish.async=false;
    polish.onerror=()=>console.error('Emoji Drops case/upgrade polish failed to load');
    document.body.appendChild(polish);
  };
  hardening.onerror=()=>console.error('Emoji Drops hardening failed to load');
  document.body.appendChild(hardening);
};
runtime.onerror=()=>console.error('Emoji Drops runtime failed to load');
document.body.appendChild(runtime);
})();